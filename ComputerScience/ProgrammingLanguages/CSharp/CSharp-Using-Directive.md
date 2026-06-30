# C# using Directive

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Namespaces
            └── using Directive
```

## 相关知识

- Namespace
- Type Name Resolution
- Global using Directive
- using Alias
- [C# Resource Disposal and Ownership](CSharp-Resource-Disposal-and-Ownership.md)

---

文件顶部的写法：

```csharp
using SkiaSharp;
```

称为 `using` 指令。它让当前文件可以直接使用该命名空间中的类型短名称。

没有该指令时：

```csharp
SkiaSharp.SKEncodedImageFormat.Jpeg
```

加入该指令后：

```csharp
SKEncodedImageFormat.Jpeg
```

`using` 指令只影响名称查找和代码书写，不会创建对象，也不会释放资源。

它与资源管理中的 `using` 语句虽然使用同一个关键字，但属于不同的语言机制。
