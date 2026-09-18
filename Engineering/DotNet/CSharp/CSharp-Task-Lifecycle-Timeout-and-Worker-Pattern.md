# C# Task 生命周期、超时控制与后台工作线程模式

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Concurrency & Multithreading
            └── Asynchronous Programming
                └── Task Lifecycle & Worker Pattern
```

## 相关知识

- [C# lock 互斥锁与线程同步](CSharp-Lock-and-Thread-Synchronization.md)
- [C# 协作式取消模式 (CancellationToken)](CSharp-Cancellation-Token-Pattern.md)
- [C# 异常筛选器与防御式编程](CSharp-Exception-Filters-and-Defensive-Patterns.md)
- [C# 资源释放与对象所有权](CSharp-Resource-Disposal-and-Ownership.md)

---

## 典型场景与架构目标

在硬件集成、屏幕监控、设备通信和工业控制中，常需要启动一个常驻的后台任务进行周期性轮询（Worker Loop），并提供外部随时“安全启动”和“安全停止”的能力：

```text
UI / 控制器线程                 后台工作线程 (Task.Run)
       │                                   │
       ├──── 1. Start() ──────────────────>│ (启动循环取图/比对)
       │                                   │
       ├──── 2. Stop() (发出 Cancel) ────>│ (响应取消，清理非托管资源)
       │                                   │
       ├──── 3. Wait(5秒超时等待) <────────┤ (退出循环，结束任务)
       ▼                                   ▼
[获取最终状态结果]                   [任务结束]
```

---

## 关键技术点与模式剖析

### 1. `Task.Run` 派发后台工作线程

```csharp
detectionTask = Task.Run(() => MonitorAsync(
    cameraNo,
    roi,
    template,
    similarityThreshold,
    intervalMs,
    cancellation.Token,
    state));
```

* 将长耗时的 IO 密集或计算密集型循环调度到线程池（ThreadPool）中运行，避免阻塞主调用线程或 UI 线程。

---

### 2. `Task.Wait(TimeSpan)` 超时熔断保护

停止后台任务时，绝不能无限制无限期等待：

```csharp
currentCancellation.Cancel();

// 带有 5 秒超时保护的同步等待
if (!currentTask.Wait(TimeSpan.FromSeconds(5)))
{
    return ScreenChangeDetectionStopResult.Timeout();
}
```

* **为什么必须加超时？**
  如果后台循环中调用的某些原生第三方库（如相机驱动、图像算法）发生死锁或内部阻塞，无限期 `Wait()` 会导致主线程也被永久挂起。设置 5 秒超时可以保证系统**永远具有故障自愈与超时熔断能力**。

---

### 3. `ReferenceEquals` 安全并发状态清理（CAS 思想）

在多线程高频调用 `Start()` 和 `Stop()` 的边界场景下，可能出现线程 A 刚触发停止，线程 B 又立即启动了新任务：

```csharp
lock (syncRoot)
{
    // 只有当全局 detectionTask 仍然是当前停止的这个 task 时，才将其置 null
    if (ReferenceEquals(detectionTask, currentTask))
    {
        detectionTask = null;
        cancellation = null;
        state = null;
    }
}
```

* **核心价值**：通过对象引用的一致性检查，防止“当前 Stop 操作把刚刚由另一个线程启动的崭新 Task 引用给错误清空”，保证状态机在并发下的自洽性。

---

### 4. 状态对象与结果对象模式（Result Object Pattern）

使用专门的不可变/结构化对象返回运行结果，避免使用裸 `bool` 或散落的多个 `out` 参数：

```csharp
internal sealed class ScreenChangeDetectionStopResult
{
    public string Message { get; private init; } = string.Empty;

    // 静态工厂方法自解释状态
    public static ScreenChangeDetectionStopResult NotStarted() => new()
    {
        Message = "投屏断连检测结束：当前没有运行中的检测任务"
    };

    public static ScreenChangeDetectionStopResult Timeout() => new()
    {
        Message = "投屏断连检测结束：等待后台检测线程退出超时"
    };

    public static ScreenChangeDetectionStopResult FromState(DetectionState state) => ...;
}
```
