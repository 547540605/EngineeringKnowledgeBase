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
is not pattern
```
