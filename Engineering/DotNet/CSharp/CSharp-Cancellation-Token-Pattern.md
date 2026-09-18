# C# 协作式取消模式 (CancellationToken)

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Concurrency & Multithreading
            └── Asynchronous Programming
                └── Cooperative Cancellation
```

## 相关知识

- [C# lock 互斥锁与线程同步](CSharp-Lock-and-Thread-Synchronization.md)
- [C# Task 后台工作任务与超时控制](CSharp-Task-Lifecycle-Timeout-and-Worker-Pattern.md)
- [C# 异常筛选器与防御式编程](CSharp-Exception-Filters-and-Defensive-Patterns.md)
- [C# 资源释放与对象所有权](CSharp-Resource-Disposal-and-Ownership.md)

---

## 协作式取消哲学

在早期多线程编程中，强行中止线程（如 `Thread.Abort()`）会导致线程在任意未知指令处被强行杀死，导致互斥锁未释放、文件句柄损坏或非托管内存泄漏，因此在现代 .NET 中已被完全废弃。

现代 .NET 采用**协作式取消（Cooperative Cancellation）**：

```text
调用方发起取消请求（发送信号），后台工作线程定期检查信号并在安全的代码边界主动退出。
```

---

## CTS 与 CT 的职责分离

.NET 将取消机制划分为发送端与接收端两个核心类型：

```text
CancellationTokenSource (CTS)    ──[ 发送端：发出取消信号、管理生命周期 ]
        │
        ▼ (.Token)
CancellationToken (CT)           ──[ 接收端：只读检查状态、响应取消请求 ]
```

* **`CancellationTokenSource`**：拥有取消权限的源头。调用 `cts.Cancel()` 广播取消指令，实现 `IDisposable`，需要由持有者负责释放。
* **`CancellationToken`**：轻量级值类型（`struct`）。作为参数传递给后台任务，只允许读取 `IsCancellationRequested` 或传递给异步 API，无法主动触发取消。

---

## 标准工作流与代码实现

### 1. 启动并传递 Token

```csharp
private CancellationTokenSource? cancellation;

public void Start()
{
    lock (syncRoot)
    {
        cancellation?.Dispose();
        cancellation = new CancellationTokenSource();

        // 将只读 Token 传入后台任务
        detectionTask = Task.Run(() => MonitorAsync(cancellation.Token));
    }
}
```

### 2. 工作循环检查与异步等待响应

```csharp
private async Task MonitorAsync(CancellationToken cancellationToken)
{
    try
    {
        // 1. 循环条件主动检查
        while (!cancellationToken.IsCancellationRequested)
        {
            DoOneDetection();

            // 2. 异步延时传入 token，一旦收到取消信号立即唤醒并抛出 OperationCanceledException
            await Task.Delay(100, cancellationToken);
        }
    }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
    {
        // 捕获由当前 token 主动发起的取消，作为正常退出处理
    }
}
```

### 3. 外部停止与资源释放

```csharp
public void Stop()
{
    CancellationTokenSource? currentCancellation;
    lock (syncRoot)
    {
        currentCancellation = cancellation;
    }

    if (currentCancellation == null) return;

    // 1. 发送取消信号
    currentCancellation.Cancel();

    // 2. 等待后台任务完全退出后，再释放 CTS
    currentTask.Wait(TimeSpan.FromSeconds(5));
    currentCancellation.Dispose();
}
```

---

## 核心机制与要点

### 1. `Task.Delay` 传入 Token 的即时响应性
如果后台循环写成 `Thread.Sleep(1000)` 或不带 token 的 `await Task.Delay(1000)`，当外部调用 `Cancel()` 时，后台线程必须死等到 1000ms 倒计时结束才能退出。
而传入 `await Task.Delay(intervalMs, cancellationToken)` 后，一旦 `Cancel()` 被调用，延时内部会通过注册回调立即中断等待并抛出 `OperationCanceledException`，实现**毫秒级即时响应退出**。

### 2. 生命周期管理与 CTS 释放顺序
* **不要在后台线程还在使用 token 时提前调用 `cts.Dispose()`**。
* 正确顺序：先 `cts.Cancel()` ➔ 等待任务结束（`task.Wait()`） ➔ 最后调用 `cts.Dispose()`。
