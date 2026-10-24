# 共享控制器状态与用例隔离

## 所属领域

```text
Engineering
└── DotNet
    └── 硬件控制器生命周期与跨用例状态管理
```

## 相关知识

- 上游：[C# 类型测试与转换](CSharp/CSharp-Type-Testing-and-Conversion.md)、[C# 类继承与接口实现](CSharp/CSharp-Class-Inheritance-and-Interface-Implementation.md)
- 下游：硬件控制器配置、用例执行与动作安全

## 问题

用例步骤把“动作后快速避位”作为选项。上一条用例开启避位后，下一条用例选择 `none`，如果代码只在开启时设置控制器，下一条仍可能沿用先前的 `true`。底层初始化时将 `KeyStepAxisQuicklyLeave` 设为 `true`，即使没有前一条用例，也不能把“不设置”理解为“关闭”。

## 原因：列表是新的，对象仍是共享的

`RobotControllers.GetRobots()` 从单例硬件管理器取得已注册的控制器。`GetHardwares<T>()` 每次构造一个新的 `List<T>`，但放入列表的是管理器持有的控制器引用；重新取列表不会重建控制器，也不会清除其可变属性。

因此应区分**管理器单例**、**新建的列表**和**被重复引用的控制器实例**。只要后续用例继续使用这些已注册实例，就可能读到之前留下的状态；无需假设每个控制器类自身都实现了单例模式。

## 做法：明确开关的作用范围

如果该开关表示“当前用例选择的避位行为”，每次进入用例时都要覆盖所处理控制器的状态，包括选 `none` 时写入 `false`：

```csharp
bool noQuickLeave = string.Equals(
    robotQuickLeaveDirection, "none", StringComparison.OrdinalIgnoreCase);

foreach (IRobotController robot in Robots)
{
    if (robot is RobotController rc)
    {
        rc.KeyStepAxisQuicklyLeave = !noQuickLeave;
    }

    if (!noQuickLeave)
    {
        // 按控制器类型设置本次快速避位的方向。
    }
}
```

这与 `CaseMark` 的处理相同：先显式覆盖开关，再在需要避位时配置方向。`KeyStepAxisQuicklyLeave` 是 `RobotController` 的属性，`JointRobotController` 继承它，因此都能命中类型判断；`RemoteRobotController` 直接实现接口，不会进入该分支。若远程控制器也必须遵守 `none`，需要单独核对其能力与行为，不能把类型不匹配视为已关闭避位。

如果开关只在一个临时操作期间有效，而后续用例应继续使用进入前的配置，应保存旧值并在 `finally` 中恢复。是否恢复取决于状态的所有权和作用范围；不能同时把“每次覆盖”和“结束时恢复”无条件套在所有控制器上。

## 检查点

1. 查明控制器由谁创建和持有，以及获取方法是否只返回已有实例的引用。
2. 查明属性的默认值、初始化赋值及实际读取位置，不能依赖“不赋值”来表达关闭。
3. 对每种控制器确认开关是否受支持；类型匹配失败时按业务要求显式处理。
4. 明确状态应持续到下一用例，还是应在本次操作结束后恢复；有并发执行时还需确认共享状态的同步和所有权。
