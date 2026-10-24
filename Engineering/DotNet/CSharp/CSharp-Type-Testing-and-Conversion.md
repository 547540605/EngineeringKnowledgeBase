# C# Type Testing and Conversion

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Type System
            └── Type Testing and Conversion
```

## 相关知识

- `as` Operator
- Pattern Matching
- Declaration Pattern
- Interface Types
- Nullable Reference Types
- [C# 类继承与接口实现](CSharp-Class-Inheritance-and-Interface-Implementation.md)
- [ASP.NET Core 依赖注入中的接口类型与实现类型](../ASPNETCore/ASP.NET-Core-Dependency-Injection.md)
- [共享控制器状态与用例隔离](../Shared-Controller-State-and-Case-Isolation.md)

---

## as Operator

`as` 是 C# 的安全类型转换运算符，常用于把一个对象尝试转换成另一个引用类型或接口类型。

```csharp
var transportJointRobot = robotControllers[0] as IJointRobotController;
```

如果能转换，它返回转换后的对象；如果不能转换，则返回 `null`，不会像强制转换一样抛出异常。

强制转换写法是：

```csharp
var robot = (IJointRobotController)robotControllers[0];
```

如果对象不能转换成 `IJointRobotController`，强制转换会直接抛出异常；`as` 则允许调用方先检查 `null`，再给出更明确的错误。

```csharp
var transportJointRobot = robotControllers[0] as IJointRobotController;
if (transportJointRobot == null)
{
    throw new InvalidOperationException("第 1 个机器人必须实现 IJointRobotController。");
}
```

在硬件初始化场景里，这种写法可以把类型不匹配转成明确的业务错误提示。

## Pattern Matching: is / is not

模式匹配可以在判断类型的同时，把转换后的对象声明成一个新变量。

```csharp
if (robotControllers[0] is IJointRobotController transportJointRobot)
{
    // transportJointRobot 是转换后的对象。
}
```

这句话可以拆成两层意思：

```text
判断 robotControllers[0] 是否实现 IJointRobotController。
如果实现，就将转换后的对象命名为 transportJointRobot。
```

它大致等价于：

```csharp
var transportJointRobot = robotControllers[0] as IJointRobotController;
if (transportJointRobot != null)
{
    // 使用 transportJointRobot
}
```

也可以反过来写：

```csharp
if (robotControllers[0] is not IJointRobotController transportJointRobot)
{
    throw new InvalidOperationException("第 1 个机器人必须实现 IJointRobotController。");
}

// 能走到这里，说明 transportJointRobot 一定已经转换成功。
return new MaterialTableHardwareDevices
{
    TransportJointRobot = transportJointRobot
};
```

和 `as` 相比，模式匹配把判断和变量声明放在一起，代码更紧凑，编译器也能更好地理解后续变量是否可用。

这些写法通常称为：

```text
Pattern matching
Declaration pattern
```

## Property Pattern: 属性模式匹配

从 C# 8.0 开始，模式匹配支持直接检查对象的属性值（Property Pattern）：

```csharp
if (detectionTask is { IsCompleted: false })
{
    throw new FailException("已有投屏断连检测正在执行");
}
```

这句话在单行内完成了两层检查：
1. **隐式非空检查**：`detectionTask != null`。
2. **属性值比对**：`detectionTask.IsCompleted == false`。

如果 `detectionTask` 是 `null`，整个表达式安全返回 `false`，不会抛出空引用异常。这比传统的 `if (detectionTask != null && !detectionTask.IsCompleted)` 更加简洁与声明式。

```text
is not pattern
```

## 接口变量访问实现类成员

变量能直接访问哪些成员，取决于它的**编译期类型**。实际对象实现了更多公开成员，也不会让这些成员自动出现在接口变量上。接口与实现类型的区别也见[依赖注入中的示例](../ASPNETCore/ASP.NET-Core-Dependency-Injection.md)。

在 `CaseMark` 中，`Robots` 的元素类型是 `IRobotController`；`KeyStepAxisQuicklyLeave` 是 `RobotController` 的公开属性，却没有声明在 `IRobotController` 中。因此，直接写 `robot.KeyStepAxisQuicklyLeave` 无法通过编译。可以先确认实际对象的类型：

```csharp
IRobotController robot = Robots[i];

if (robot is RobotController rc)
{
    rc.KeyStepAxisQuicklyLeave = !noQuickLeave;
}
```

`is RobotController rc` 在匹配成功时，为**同一个对象**建立一个编译期类型为 `RobotController` 的局部引用；它不会复制对象，也不会改变对象的运行时类型。`JointRobotController : RobotController` 也能匹配这个判断；直接实现 `IRobotController`、但不继承 `RobotController` 的 `RemoteRobotController` 不能匹配。硬写 `(RobotController)robot` 则会在类型不匹配时抛出 `InvalidCastException`。

这种转型适用于明确只处理该实现类及其子类的能力。若业务要求每一种 `IRobotController` 都支持这个开关，就不能把未匹配的控制器静默略过；应明确处理不支持的类型，并在可协调升级所有实现和调用方时考虑完善接口或设计独立能力接口。类型转换本身也不会改变[方法隐藏与接口重新实现](CSharp-Method-Hiding-CS0108-and-Interface-Reimplementation.md)的调用分发规则。
