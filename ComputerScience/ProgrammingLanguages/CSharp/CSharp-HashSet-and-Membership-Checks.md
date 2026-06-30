# C# HashSet and Membership Checks

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Generic Collections
            └── HashSet<T>
```

## 相关知识

- Generic Collections
- Equality Comparers
- `Contains`
- Set Semantics

---

`HashSet<T>` 表示不重复集合，常用于快速判断某个值是否已经存在。

例如：

```csharp
var slotIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

if (!slotIds.Add(slotId))
{
    return Failed("槽位 ID 重复。");
}
```

`Add` 的返回值有特殊含义：

```text
true  ：添加成功，说明之前不存在。
false ：添加失败，说明之前已经存在。
```

`StringComparer.OrdinalIgnoreCase` 表示忽略大小写，所以：

```text
slot_1
SLOT_1
Slot_1
```

会被认为是同一个槽位 ID。

当只需要查询而不需要插入时，可以使用：

```csharp
if (slotIds.Contains(slotId))
{
    // slotId 已经存在
}
```
