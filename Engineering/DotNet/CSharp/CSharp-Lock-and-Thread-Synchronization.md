# C# lock 互斥锁与线程同步

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Concurrency & Multithreading
            └── Thread Synchronization
                └── lock (Monitor)
```

## 相关知识

- [C# 单例模式](CSharp-Singleton-Pattern.md)
- [C# 协作式取消模式 (CancellationToken)](CSharp-Cancellation-Token-Pattern.md)
- [C# Task 后台工作任务与超时控制](CSharp-Task-Lifecycle-Timeout-and-Worker-Pattern.md)
- [C# 资源释放与对象所有权](CSharp-Resource-Disposal-and-Ownership.md)
- CLR `Monitor` 原理
- 内存屏障（Memory Barrier）与可见性

---

## 核心定义与目标

在多线程并发环境中，多个线程同时读写同一个共享变量或状态会导致数据竞争（Race Condition）和状态不一致。

`lock` 语句是 C# 中最常用的**互斥锁（Mutual Exclusion Lock）**机制：

```text
保证同一时刻只有一个线程能够进入被保护的代码块（临界区 Critical Section）。
其他线程必须排队等待，直到持有锁的线程退出临界区。
```

---

## 标准写法与专用锁对象

```csharp
internal sealed class ScreenChangeDetectionController
{
    // 1. 声明专用的私有只读锁对象
    private readonly object syncRoot = new();

    private Task? detectionTask;
    private DetectionState? state;

    public void Start(...)
    {
        // 2. 进入临界区
        lock (syncRoot)
        {
            if (detectionTask is { IsCompleted: false })
            {
                throw new FailException("已有任务正在执行");
            }

            // 安全修改共享状态
            state = new DetectionState();
            detectionTask = Task.Run(...);
        }
    }
}
```

### 为什么必须使用 `private readonly object` 锁对象？

| 锁对象选择 | 是否推荐 | 原因与隐患 |
| :--- | :--- | :--- |
| `private readonly object syncRoot = new();` | **强烈推荐（最佳实践）** | 锁对象完全封装在类内部，外部无法访问，杜绝死锁风险；`readonly` 防止锁引用被意外修改 |
| `lock (this)` | **禁止使用** | 当前实例会被外部调用方持有，若外部代码也对该实例 `lock(obj)`，极易引发不可预知的互相等待死锁 |
| `lock (typeof(MyClass))` | **禁止使用** | 锁定的是类型元数据对象，属于跨 AppDomain/全局对象，范围过大，严重破坏并发性能并容易引发死锁 |
| `lock ("string_literal")` | **禁止使用** | 字符串在 CLR 中具有驻留机制（String Interning），多个无关模块可能锁定同一个字符串常量 |

---

## lock 的底层原理

C# 编译器会将 `lock (syncRoot)` 编译为 `System.Threading.Monitor` 的 `Enter` 和 `Exit`，并用 `try-finally` 保证发生异常时锁必定释放：

```csharp
// 源代码
lock (syncRoot)
{
    DoWork();
}

// 编译器生成的等价 IL / C# 代码
bool lockTaken = false;
try
{
    Monitor.Enter(syncRoot, ref lockTaken);
    DoWork();
}
finally
{
    if (lockTaken)
    {
        Monitor.Exit(syncRoot);
    }
}
```

* `lockTaken` 标志位防止在 `Monitor.Enter` 过程中发生线程中止（ThreadAbort）导致锁状态泄露。
* 进入和离开锁会自动插入**内存屏障（Memory Barrier）**，保证临界区内的变量读写对其他 CPU 核心立即可见（保证内存可见性）。

---

## 核心禁忌：锁内严禁使用 `await`

在 C# 中，**`lock` 块内部无法使用 `await`**，编译器会直接报错 `CS1996`：

```csharp
lock (syncRoot)
{
    // 编译错误！Cannot await in the body of a lock statement
    await Task.Delay(1000);
}
```

### 为什么不能 await？
1. `Monitor`（`lock` 的底层）是**与具体操作系统线程强绑定（Thread Affinity）**的。进入锁的线程必须是释放锁的同一个线程。
2. `await` 在等待完成后，可能会由线程池中的另一个工作线程恢复执行。如果允许 await，会导致“线程 A 拿锁，线程 B 尝试放锁”，直接抛出 `SynchronizationLockException`。

### 异步场景的替代方案
如果必须在临界区执行异步等待，应使用 `SemaphoreSlim`：

```csharp
private readonly SemaphoreSlim _semaphore = new(1, 1);

public async Task DoWorkAsync()
{
    await _semaphore.WaitAsync();
    try
    {
        await Task.Delay(1000); // 允许异步等待
    }
    finally
    {
        _semaphore.Release();
    }
}
```
