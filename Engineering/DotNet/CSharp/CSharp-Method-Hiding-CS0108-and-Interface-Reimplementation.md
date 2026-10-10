# C# 方法隐藏（CS0108）与接口重新实现

## 所属领域

```text
Engineering
└── DotNet
    └── CSharp
        └── 继承、方法分派与接口实现
```

## 问题

父类实现 `IRobot.Click`，子类为了在点击后追加避位动作，声明一个同名同参数的 `Click`。若父类方法不是 `virtual`，子类方法不会覆盖它；未写 `new` 时，编译器给出 `CS0108`：派生类成员隐藏了继承的成员。

同一个子类实例，分别经子类、父类和接口类型调用，可能执行不同的实现。硬件动作不能仅凭“子类调用正常”就认为所有调用入口都正常。

## 方法隐藏与静态类型

```csharp
interface IRobot
{
    void Click();
}

class RobotController : IRobot
{
    public void Click() => Console.WriteLine("父类点击");
}

class HiddenController : RobotController
{
    public new void Click() => Console.WriteLine("子类点击并避位");
}

static class MethodHidingDemo
{
    public static void Run()
    {
        var robot = new HiddenController();
        robot.Click();                         // 子类方法
        ((RobotController)robot).Click();      // 父类方法
        ((IRobot)robot).Click();               // 父类方法：沿用父类的接口映射
    }
}
```

`new` 仅明确表示有意隐藏并消除 `CS0108` 警告，不会让父类方法变成虚方法，也不会改变继承来的接口映射。省略 `new` 时仍然是隐藏，只是有警告。这里父类引用的调用结果由非虚方法的静态类型决定；接口调用沿用父类已建立的映射。

## 接口重新实现

派生类可以在基列表中再次列出已经由父类实现的接口。若列出的是派生接口，其基接口也会一并重新实现。编译器会按接口映射规则，针对该派生类重新查找各接口成员的实现：匹配的显式接口实现优先，其次查找匹配的公开成员；没有被子类重新提供的成员仍可能映射到继承的实现。因此，**重新声明接口不等于所有成员无条件改绑到子类**。

```csharp
interface IJointRobot : IRobot
{
    void QuicklyLeave();
}

class JointRobotController : RobotController, IJointRobot
{
    public new void Click()
    {
        Console.WriteLine("子类点击");
        QuicklyLeave();
    }

    public void QuicklyLeave() => Console.WriteLine("快速避位");
}

static class InterfaceReimplementationDemo
{
    public static void Run()
    {
        var robot = new JointRobotController();
        robot.Click();                         // 子类点击、快速避位
        ((RobotController)robot).Click();      // 父类点击；不会避位
        ((IRobot)robot).Click();               // 子类点击、快速避位
        ((IJointRobot)robot).Click();          // 同上：Click 继承自 IRobot
    }
}
```

此例中，`IJointRobot : IRobot` 使 `JointRobotController` 重新实现 `IRobot`，而子类的 `public Click()` 恰好匹配 `IRobot.Click()`。接口入口因此执行子类方法；父类类型入口仍执行非虚的父类方法。若方法签名不匹配，或者映射选择了另一个显式实现，不能套用此例的结果。

## 调用结果对照

以下结果针对上述签名完全匹配、父类以公开非虚方法隐式实现 `IRobot.Click` 的示例：

| 派生类写法 | `IRobot` 引用 | `RobotController` 引用 | 派生类引用 |
| --- | --- | --- | --- |
| 只隐藏 `Click`，不重新声明接口 | 父类 | 父类 | 派生类 |
| 隐藏 `Click`，重新声明 `IRobot` 或其派生接口 | 派生类 | 父类 | 派生类 |
| 父类 `virtual`，派生类 `override` | 派生类 | 派生类 | 派生类 |

前两行若不写 `new` 会产生 `CS0108`；写 `new` 可以消除警告，但不会改变表中的分派结果。最后一行要求能够修改父类，且父类方法确实作为可重写的虚方法实现接口。

## 如何选择

- 可以修改父类，且希望所有调用入口都执行子类扩展时：将父类方法设计为 `virtual`，子类使用 `override`。如果父类的接口实现是显式实现，应让它委托给可重写的受保护方法。
- 必须保留非虚父类方法时：显式重新声明接口可以改变匹配接口成员的调用路径，但父类类型的调用仍会绕开子类逻辑。应逐一核对实际接口、方法签名和调用方的静态类型。
- 避位等安全相关动作不要依赖消除 `CS0108` 警告来保证执行；`new` 只表达隐藏意图。对接口、父类和子类三种入口分别验证。

## 相关知识与来源

- [C# 类继承与接口实现](CSharp-Class-Inheritance-and-Interface-Implementation.md)
- [C# sealed 类与继承边界](CSharp-Sealed-Classes-and-Inheritance-Boundaries.md)
- [C# 接口隔离与只读契约](CSharp-Interface-Segregation-and-Read-Only-Contracts.md)
- [C# 语言规范：接口映射、继承与重新实现](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces#196-interface-implementations)
- [微软文档：编译器警告 CS0108](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-messages/cs0108)

注：ECMA-334 对应 C# 语言规范；上面描述的是语言层面的接口映射规则，不应把特定运行时内部实现（例如某一种接口表布局）当成跨运行时保证。
