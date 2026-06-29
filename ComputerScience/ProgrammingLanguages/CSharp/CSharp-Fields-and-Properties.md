# C# Fields and Properties

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Type Members
            ├── Field
            └── Property
```

## 字段是什么

字段是对象或类型内部直接保存数据的位置：

```csharp
private int _lastFrameWidth;
private readonly PhoneHardwareDevices _phoneHardwareDevices;
```

常见命名约定：

- 私有字段使用 `_camelCase`。
- 常量使用项目约定的命名方式。
- `readonly` 字段只能在声明处或构造函数中赋值。

字段适合表示类内部的实现状态，例如缓存、计数器、依赖对象和内部标志。

## 属性是什么

属性通过 `get`、`set` 或 `init` 访问器向调用方提供成员访问能力：

```csharp
public string MaterialName { get; set; } = "";
```

属性看起来像字段，但语义更接近方法：

```csharp
public int Width
{
    get
    {
        return _width;
    }
    set
    {
        if (value < 0)
            throw new ArgumentOutOfRangeException(nameof(value));

        _width = value;
    }
}
```

属性可以在读写时加入：

- 参数校验
- 值转换
- 延迟计算
- 只读或初始化限制
- 状态变化通知
- 对外封装

## 自动属性背后仍有字段

下面是自动属性：

```csharp
public int Width { get; set; }
```

编译器会为它生成一个不可直接访问的隐藏后备字段，并生成 `get`、`set` 方法。因此自动属性不是“没有字段”，而是由编译器代为管理字段。

下面这种代码可以编译：

```csharp
private int _lastFrameWidth { get; set; }
```

但它存在两个问题：

1. `_camelCase` 看起来像字段，语法却是属性，不符合常见命名习惯。
2. 当前没有封装、绑定、反射或访问器逻辑需求，使用私有自动属性没有实际收益。

因此内部简单状态更适合写成：

```csharp
private int _lastFrameWidth;
```

## 什么时候使用字段

优先使用字段的常见情况：

- 类内部的私有实现状态。
- 构造函数注入后保存的依赖。
- 不需要被外部读取或修改。
- 不需要序列化、数据绑定或接口声明。

```csharp
private readonly IPhoneDebugService _phoneDebugService;
private int _lastFrameWidth;
private bool _isRunning;
```

`readonly` 只表示字段引用在构造完成后不能重新赋值，不表示引用对象内部完全不可变。

## 什么时候使用属性

优先使用属性的常见情况：

- DTO、配置类和领域模型需要公开数据。
- JSON 序列化和 ASP.NET Core 模型绑定。
- 接口需要声明可读取或可设置的能力。
- 外部调用方需要访问数据。
- 需要在访问时校验、转换或计算。

```csharp
public string MaterialId { get; set; } = "";
public string ConfigDirectory { get; }
public ICameraController PhoneCamera { get; init; } = default!;
```

公开数据通常优先使用属性而不是公开字段。属性保留了以后调整访问逻辑的边界，也符合 .NET API、序列化器和数据绑定工具的常见约定。

## 字段与属性对比

| 对比项 | 字段 | 属性 |
|---|---|---|
| 本质 | 直接存储数据 | 通过访问器访问数据 |
| 常见用途 | 私有实现状态 | 对外公开的数据契约 |
| 是否可包含逻辑 | 不能在读写动作中插入逻辑 | 可以在 `get`/`set` 中加入逻辑 |
| 自动属性是否存储数据 | 不适用 | 编译器生成隐藏字段 |
| 常见私有命名 | `_camelCase` | `PascalCase` |
| DTO/JSON | 通常不使用公开字段 | 通常使用公开属性 |

## 当前项目示例

```csharp
public class PhoneDebugService
{
    // 依赖和内部状态：字段。
    private readonly PhoneHardwareDevices _phoneHardwareDevices;
    private int _lastFrameWidth;
    private int _lastFrameHeight;
}
```

```csharp
public class PhoneClickRequest
{
    // HTTP 请求数据：公开属性。
    public int X { get; set; }
    public int Y { get; set; }
}
```

这里的区别不是“字段性能更好”，而是职责不同：服务内部状态不需要形成公开契约；请求模型需要让模型绑定和外部代码访问。

## 相关知识

- [C# Type System, Generics, and Nullable](CSharp-Type-System-Generics-Nullable.md)
- [C# nameof Operator](CSharp-Nameof-Operator.md)
- Encapsulation
- DTO
- JSON Serialization
- ASP.NET Core Model Binding
