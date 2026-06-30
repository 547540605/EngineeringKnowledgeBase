# C# Generics

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Generics
```

## 相关知识

- Generic Type Parameters
- Generic Collections
- Type Safety
- [C# Default Values](CSharp-Default-Values.md)
- [ASP.NET Core API Response Wrapper ApiResult](../../../Engineering/DotNet/ASP.NET-Core-API-Response-Wrapper-ApiResult.md)

---

`T` 是泛型类型参数，表示“这里先不固定具体类型，等使用时再指定”。

例如：

```csharp
public class ApiResult<T>
{
    public bool Success { get; set; }
    public string Code { get; set; } = "OK";
    public string? Message { get; set; }
    public T? Data { get; set; }
}
```

使用时可以指定不同的具体类型：

```csharp
ApiResult<string>
ApiResult<MaterialInfo>
ApiResult<List<MaterialInfo>>
```

统一外壳 `ApiResult<T>` 不变，但 `Data` 的类型随具体接口变化。泛型让同一套结构和算法在保持类型安全的前提下复用于不同类型。
