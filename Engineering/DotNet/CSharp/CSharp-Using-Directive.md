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

## using Alias: 类型别名指令

当不同命名空间包含同名类型（例如不同模块中都有 `MatchType`），或者类型名称过于冗长时，可以使用 `using 别名 = 完整类型`：

```csharp
using VisionMatchType = DONGZHOU.Core.Vision.Model.MatchType;
```

之后在当前代码中可以直接使用：

```csharp
var mode = VisionMatchType.MATCH_WITH_NO_CHECK;
```

### 核心作用：
1. **彻底消除歧义**：避免两个命名空间同时被 `using` 导入时引发的 `CS0104`“模糊的引用”编译错误。
2. **提高语义清晰度**：为通用类型赋予当前上下文特有的业务语义别名。
