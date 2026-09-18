# C# Lambda Expressions with LINQ

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── LINQ
            └── Lambda Expression
```

## 相关知识

- C# Delegate
- LINQ
- Generic Collection
- Nullable Reference Types
- [C# HashSet and Membership Checks](CSharp-HashSet-and-Membership-Checks.md)
- [C# Collection Expressions](CSharp-Collection-Expressions.md)
- [C# Expression-Bodied Members](CSharp-Expression-Bodied-Members.md)

---

本文记录 C# Lambda 表达式与 LINQ 查询方法配合使用时的常见写法。

例如：

```csharp
var removedUsedMaterial = current.Materials.FirstOrDefault(m =>
    !string.IsNullOrWhiteSpace(m.SlotId) &&
    !slotIds.Contains(m.SlotId.Trim()));
```

## Lambda Expression

在 Lambda 表达式中，`=>` 用于分隔参数和函数体。

`=>` 也可以用于表达式体成员，例如只读属性或单表达式方法；此时它不是 Lambda 表达式。参见 [C# Expression-Bodied Members](CSharp-Expression-Bodied-Members.md)。

可以先理解成：

```text
临时写一个小函数，并把这个小函数传给别的方法使用。
```

例如：

```csharp
m => !string.IsNullOrWhiteSpace(m.SlotId)
```

意思是：

```text
给我一个 m，我返回一个 bool，表示 m 是否满足条件。
```

它大致相当于：

```csharp
bool HasSlotId(MaterialInfo m)
{
    return !string.IsNullOrWhiteSpace(m.SlotId);
}
```

区别是：

```text
Lambda 通常不单独命名，而是直接写在调用处。
```

---

## Lambda 用作筛选条件

LINQ 的 `FirstOrDefault` 会遍历集合，找到第一个满足条件的元素。

例如：

```csharp
var removedUsedMaterial = current.Materials.FirstOrDefault(m =>
    !string.IsNullOrWhiteSpace(m.SlotId) &&
    !slotIds.Contains(m.SlotId.Trim()));
```

可以拆成：

```text
从 current.Materials 里逐个取出物料。
每个物料临时叫 m。
判断 m 是否满足 lambda 后面的条件。
找到第一个满足条件的物料就返回。
如果一个都找不到，就返回 null。
```

这里的条件是：

```csharp
!string.IsNullOrWhiteSpace(m.SlotId) &&
!slotIds.Contains(m.SlotId.Trim())
```

含义是：

```text
这个物料绑定了 SlotId，
但这个 SlotId 不在本次提交的新槽位集合 slotIds 里。
```

这可以用来发现：

```text
某个槽位已经被物料占用，但这次保存槽位配置时被删除了。
```

示例：

```text
已有物料：
手机 A -> slot_1
手机 B -> slot_2

本次提交的新槽位：
slot_1
slot_3
```

此时 `slotIds` 包含：

```text
slot_1
slot_3
```

遍历物料时：

```text
手机 A 使用 slot_1，slot_1 仍然存在，没问题。
手机 B 使用 slot_2，slot_2 不在新槽位集合里，说明 slot_2 被删除了，但仍有物料占用。
```

所以 `removedUsedMaterial` 会得到手机 B。

---

## Lambda 用作映射转换

LINQ 的 `Select` 用来把集合中的每一项转换成另一种结果。

例如：

```csharp
slots.Select(slot => new MaterialSlotInfo
{
    SlotId = slot.SlotId.Trim(),
    SlotNo = slot.SlotNo,
    IoChannel = slot.IoChannel,
    Enabled = slot.Enabled,
    Remark = slot.Remark?.Trim()
})
```

可以理解成：

```text
遍历 slots 里的每一个 slot。
每拿到一个 slot，就创建一个新的 MaterialSlotInfo。
新对象里的 SlotId 和 Remark 会去掉前后空格。
其他字段原样保留。
```

也就是把：

```text
原始槽位列表
```

转换为：

```text
清洗后的槽位列表
```

这类方法常用于保存前的数据规整，例如：

```csharp
private static List<MaterialSlotInfo> NormalizeSlots(List<MaterialSlotInfo> slots)
{
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
}
```

---

## FirstOrDefault

`FirstOrDefault` 的作用是：

```text
返回集合中第一个满足条件的元素。
如果没有找到，返回默认值。
```

对于引用类型，例如 class，默认值是 `null`。

例如：

```csharp
var material = materials.FirstOrDefault(m => m.MaterialId == "material_1");
```

含义是：

```text
找到第一个 MaterialId 等于 material_1 的物料。
如果找不到，material 为 null。
```

所以后面通常要判断：

```csharp
if (material == null)
{
    return ...;
}
```

---

## Select

`Select` 的作用是：

```text
把集合里的每一项，映射成一个新的结果。
```

示例：

```csharp
var names = materials.Select(m => m.MaterialName).ToList();
```

含义是：

```text
从每个 material 中取出 MaterialName，组成一个新的列表。
```

`Select` 不一定改变对象类型。

它既可以：

```text
MaterialInfo -> string
```

也可以：

```text
MaterialSlotInfo -> MaterialSlotInfo
```

后一种常用于复制对象、清洗字段、避免直接保存前端传入的原始对象。

---

## 依赖知识

```text
方法
参数
返回值
泛型集合 List<T>
引用类型 null
```
