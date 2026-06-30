# C# init Properties and Null-Forgiving Operator

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Object Initialization
            ├── init Accessor
            └── Null-Forgiving Operator
```

## 相关知识

- Object Initializers
- Nullable Reference Types
- Required Members
- [C# Value, Reference, and Nullable Types](CSharp-Value-Reference-and-Nullable-Types.md)
- [C# Default Values](CSharp-Default-Values.md)

---

在 DTO、配置类、硬件归类类里，经常会看到这种属性写法：

```csharp
public IRobotController TransportRobot { get; init; } = default!;
```

它由三部分组成：

```csharp
public IRobotController TransportRobot
```

表示定义一个公开属性，类型是 `IRobotController`，属性名是 `TransportRobot`。

```csharp
{ get; init; }
```

表示这个属性可以读取，也可以在对象初始化时赋值，但对象初始化完成后就不能再改。

例如：

```csharp
var devices = new MaterialTableHardwareDevices
{
    TransportRobot = robotControllers[0],
    PhoneRobot = robotControllers[1]
};
```

这里可以给 `init` 属性赋值，但是下面这种写法不允许：

```csharp
devices.TransportRobot = anotherRobot; // 编译错误
```

`init` 适合表达“对象创建时必须确定，创建后不希望随便被改”的数据，例如硬件实例归类、配置快照、接口返回 DTO。

最后的：

```csharp
= default!;
```

是为了配合 `<Nullable>enable</Nullable>`。

因为 `IRobotController` 是引用类型，按规则不允许为 `null`。但这个属性的真实值不是在构造函数里赋的，而是在对象初始化器里赋的。编译器不一定能理解这个业务约定，于是会警告“非空属性没有初始化”。

`default!` 的含义是：

```text
先用这个类型的默认值占位，并告诉编译器：我知道这里看起来可能是 null，但运行时我会负责把它赋好。
```

对于引用类型来说，`default` 实际上就是 `null`；后面的 `!` 是 null-forgiving operator，表示“请不要在这里报可空警告”。

所以这段声明不是说属性应该长期为 `null`，而是说：

- 这个属性设计上不应该为 `null`。
- 它会在对象初始化器里被赋值。
- 这里用 `default!` 消除编译器初始化警告。

如果忘了在对象初始化器里赋值，编译器可能不报错，但运行时用到它时仍然可能出问题。`default!` 不是运行时保护，只是抑制编译器的可空警告。
