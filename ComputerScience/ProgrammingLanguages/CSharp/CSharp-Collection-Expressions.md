# C# Collection Expressions

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Collection Expressions
```

## 相关知识

- C# 12
- Generic Collections
- Spread Element
- [C# Lambda Expressions with LINQ](CSharp-Lambda-and-LINQ.md)

---

C# 12 支持集合表达式。

例如：

```csharp
return [.. slots.Select(slot => new MaterialSlotInfo
{
    SlotId = slot.SlotId.Trim(),
    SlotNo = slot.SlotNo,
    IoChannel = slot.IoChannel,
    Enabled = slot.Enabled,
    Remark = slot.Remark?.Trim()
})];
```

这里的：

```csharp
[.. something]
```

表示把 `something` 里的元素展开，生成一个新的集合。

如果方法返回类型是：

```csharp
List<MaterialSlotInfo>
```

编译器会根据目标类型推断这里要创建 `List<MaterialSlotInfo>`。

等价的传统写法是：

```csharp
return slots
    .Select(slot => new MaterialSlotInfo
    {
        SlotId = slot.SlotId.Trim(),
        SlotNo = slot.SlotNo,
        IoChannel = slot.IoChannel,
        Enabled = slot.Enabled,
        Remark = slot.Remark?.Trim()
    })
    .ToList();
```

学习阶段如果觉得 `[..]` 不够直观，可以优先使用 `.ToList()`。它更常见，也更容易读。
