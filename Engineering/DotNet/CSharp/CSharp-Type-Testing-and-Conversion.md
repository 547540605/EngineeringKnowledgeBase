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
