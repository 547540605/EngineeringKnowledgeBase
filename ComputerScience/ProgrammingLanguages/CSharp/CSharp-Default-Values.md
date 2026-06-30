# C# Default Values

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Type System
            └── Default Values
```

## 相关知识

- [C# Value, Reference, and Nullable Types](CSharp-Value-Reference-and-Nullable-Types.md)
- [C# Generics](CSharp-Generics.md)
- `default` Expression
- `default(T)` Operator

---

`default` 表示某个类型的默认值。

常见结果：

| 类型 | `default` |
|---|---|
| `int` | `0` |
| `bool` | `false` |
| `DateTime` | `0001-01-01 00:00:00` |
| `string` | `null` |
| `object` | `null` |
| `class` | `null` |

在统一返回结构中，失败时常见写法是：

```csharp
public static ApiResult<T> Fail(string code, string message)
{
    return new ApiResult<T>
    {
        Success = false,
        Code = code,
        Message = message,
        Data = default
    };
}
```

`Data = default` 表示失败时没有可信业务数据。对于大多数 DTO、`string`、`object` 来说，`default` 就是 `null`。
