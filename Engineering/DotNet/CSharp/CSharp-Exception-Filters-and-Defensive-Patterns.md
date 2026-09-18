# C# 异常筛选器与防御式编程模式

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Exception Handling & Robustness
            ├── Exception Filters (when)
            ├── Parameter Guards (ThrowIfNull)
            └── Exception Safety & Re-throw
```

## 相关知识

- [C# Null-Coalescing Operators (?? throw)](CSharp-Null-Coalescing-Operators.md)
- [C# 协作式取消模式 (CancellationToken)](CSharp-Cancellation-Token-Pattern.md)
- [C# 资源释放与对象所有权](CSharp-Resource-Disposal-and-Ownership.md)

---

## 1. 异常筛选器（Exception Filter / `catch ... when`）

C# 6.0 引入了 `when` 关键字作为异常筛选器，允许在捕获异常时附加布尔条件：

```csharp
try
{
    while (!cancellationToken.IsCancellationRequested)
    {
        await Task.Delay(intervalMs, cancellationToken);
    }
}
catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
{
    // 只有当取消是由当前 token 发起时，才当作正常退出捕获
}
catch (Exception ex)
{
    // 其他非预期的异常统一记录错误日志
    LogUtil.WriteError(ex);
}
```

### 为什么 `when` 优于在 `catch` 块内写 `if`？

```csharp
// 传统不推荐写法
catch (OperationCanceledException ex)
{
    if (cancellationToken.IsCancellationRequested)
    {
        // 正常退出
    }
    else
    {
        throw; // 破坏了异常处理流程，发生了无意义的栈展开
    }
}
```

* **栈不展开（Stack Unwinding 优化）**：
  `when` 条件是在**异常发生点直接求值**的。如果 `when` 条件为 `false`，CLR 不会进入该 `catch` 块，也不会解开调用栈，后续的 `catch` 块或上层调用方能保留**最原始、未被污染的完整调用栈现场（Call Stack）**，极大方便线上崩溃排查与转储（Dump）分析。

---

## 2. 参数防御守卫：`ArgumentNullException.ThrowIfNull`

从 .NET 6 起，C# 推荐使用静态守卫方法替代繁琐的手动判断：

```csharp
// 现代推荐写法（.NET 6+）
ArgumentNullException.ThrowIfNull(printAction);

// 旧版写法
if (printAction == null)
{
    throw new ArgumentNullException(nameof(printAction));
}
```

* **底层优势**：利用了 C# 的 `[CallerArgumentExpression]` 特性，不仅代码简洁，而且在生成的 IL 代码中减少了分支跳转，有利于 JIT 编译器的内联优化。

---

## 3. 所有权交接期的异常安全补偿与 `throw;`

当方法创建或接收了一个需要释放的资源（如 `SKTBitmap template`），并尝试将其所有权移交给后台异步任务时，如果在移交前（如加锁或配置校验阶段）发生异常，必须进行补偿释放：

```csharp
var template = ActionUtil.ReadTemplateImage(imageName)
    ?? throw new FailException("读取模板图失败");

try
{
    lock (syncRoot)
    {
        if (detectionTask is { IsCompleted: false })
        {
            throw new FailException("已有任务正在执行");
        }

        // 成功将 template 所有权移交给 MonitorAsync
        detectionTask = Task.Run(() => MonitorAsync(..., template, ...));
    }
}
catch
{
    // 异常补偿：如果未成功移交给后台任务，当前方法必须负责销毁它
    template.Dispose();
    throw; // 保留原始堆栈重新抛出
}
```

### `throw;` vs `throw ex;` 的本质区别

| 写法 | 行为 | 堆栈影响 | 推荐度 |
| :--- | :--- | :--- | :--- |
| `throw;` | 重新抛出当前捕获的原生异常 | **保留完整的原始调用栈**（从最底层出错行开始） | **推荐** |
| `throw ex;` | 将 `ex` 当作全新异常抛出 | **重置调用栈**（调用栈被截断，丢失底层真正报错行） | **禁止使用** |
