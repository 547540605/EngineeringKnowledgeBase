# Logging Passthrough Pattern

## 所属领域

```text
Engineering Practice
└── Software Engineering
    ├── Logging
    ├── Cross-Cutting Concerns
    └── Maintainability
```

## 相关知识

- Business Event Log
- Audit Log
- Cross-Cutting Concern
- Guard Clause
- Result Object

---

## Problem

复杂业务流经常要求：

```text
每一个出口，无论成功还是失败，都必须记录业务事件日志。
```

例如硬件动作编排、锁定流程、物料取放流程等。

朴素写法会导致每个分支都写一遍日志：

```csharp
if (material == null)
{
    var result = MaterialActionResultInfo.Failed(
        MaterialActionResultCode.MaterialNotFound,
        "没有对应物料");

    _eventLogService.Append(new MaterialTableEventInfo
    {
        EventType = "PickMaterial",
        Success = false,
        Code = result.Code.ToString(),
        Message = result.Message
    });

    return result;
}
```

如果有很多异常分支，主业务逻辑会被日志代码淹没。

---

## Solution

封装一个私有辅助方法，把“记录日志”和“返回结果”合并为一步。

```csharp
private MaterialActionResultInfo LogActionResult(
    string eventType,
    MaterialActionResultInfo result,
    string? agvName,
    string? materialId)
{
    _eventLogService.Append(new MaterialTableEventInfo
    {
        EventType = eventType,
        Success = result.Success,
        Code = result.Code.ToString(),
        Message = result.Message,
        AgvName = agvName,
        MaterialId = materialId,
        Source = nameof(MaterialActionService)
    });

    return result;
}
```

主流程中只需要：

```csharp
if (material == null)
{
    return LogActionResult(
        "PickMaterial",
        MaterialActionResultInfo.Failed(
            MaterialActionResultCode.MaterialNotFound,
            "没有对应物料。"),
        agvName,
        materialId);
}
```

---

## Why It Works

这个模式可以理解为：

```text
业务结果 -> 日志记录 -> 原样返回业务结果
```

它不改变结果，只是在返回前做一次统一的横切处理。

---

## Benefits

- 主业务流程更短。
- 日志字段集中维护。
- 新增失败分支时更不容易漏记日志。
- 测试可以围绕结果和事件日志同时断言。
- 业务日志格式更一致。

---

## When to Use

适合：

- 一个方法有多个成功 / 失败出口。
- 每个出口都需要记录审计日志或业务事件。
- 返回值是统一 Result Object。

不适合：

- 日志逻辑很简单，只有一个出口。
- 日志本身会改变业务结果。
- 需要复杂事务一致性，日志写入失败也必须影响主流程。

---

## Related Pattern

这个模式属于横切关注点处理的一种轻量写法。

更复杂的系统可能使用：

- Middleware
- Filter
- Decorator
- AOP
- Message Outbox

但在普通业务服务内部，私有 `LogResult` / `LogActionResult` 方法通常足够简单、直接、可维护。
