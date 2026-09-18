# C# sealed 类与继承边界

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Object-Oriented Programming
            └── Inheritance Boundaries
```

## 基本语法

```csharp
public sealed class EpgHpClampConfig : ConfigBase
{
}
```

三个关键字分别表达不同含义：

```text
public：其他程序集可以访问这个类型
sealed：不允许其他类继续继承这个类型
class：声明一个类
```

## sealed 不妨碍它继承父类

`sealed`限制的是“别人能否继续继承当前类”，不是“当前类能否继承已有父类”。

```text
ConfigBase
    ↑ 允许
EpgHpClampConfig（sealed）
    ↑ 禁止
SpecialEpgHpClampConfig
```

因此下面合法：

```csharp
public sealed class EpgHpClampConfig : ConfigBase
{
}
```

但下面无法编译：

```csharp
public class SpecialEpgHpClampConfig : EpgHpClampConfig
{
}
```

编译器会报告不能从密封类型派生。

## public 与 sealed 是两个维度

`public`是访问修饰符，回答：

```text
谁能看到并使用这个类？
```

`sealed`是继承修饰符，回答：

```text
谁能把这个类当成父类继续扩展？
```

所以“任何程序集都能创建它”和“任何类都能继承它”不是一回事：

```csharp
public sealed class Example
{
}
```

表示其他程序集可以创建和使用 `Example`，但不能声明它的子类。

## 为什么具体配置类适合 sealed

设备配置类通常描述一种已经确定的配置结构：

```text
串口名称
波特率
从站地址
目标位置
速度
夹持力
超时时间
```

它不是供其他配置类继承的框架扩展点。使用 `sealed`可以：

1. 明确表达“这是最终具体配置类型”。
2. 防止子类添加或重定义字段后，加载和校验逻辑却仍按原类型处理。
3. 让维护者知道扩展配置时应修改当前模型或设计新的类型，而不是随意继承。

这属于设计意图，不是配置反序列化的硬性要求。去掉 `sealed`以后，普通加载和使用通常仍然可以正常工作。

## 为什么配置类使用 public

配置模型可能被以下代码访问：

```text
硬件实现项目
配置加载框架
配置编辑或诊断工具
测试项目
其他需要读取设备配置的程序集
```

声明为 `public`可以避免程序集边界阻止这些调用。

如果一个配置类型确认只在当前程序集内部使用，也可以考虑 `internal`。是否使用 `public`应由真实访问范围决定，而不是因为序列化类一律必须公开。

## normal、abstract 与 sealed

| 类声明 | 能否直接创建对象 | 能否被继承 |
| --- | --- | --- |
| 普通 `class` | 可以 | 可以 |
| `abstract class` | 不可以 | 可以 |
| `sealed class` | 可以 | 不可以 |

例如：

```csharp
public abstract class ConfigBase
{
}

public sealed class EpgHpClampConfig : ConfigBase
{
}
```

表达的是：

```text
ConfigBase：提供配置基类能力，不能直接作为最终配置使用
EpgHpClampConfig：可以创建和加载，是最终具体配置类型
```

## 什么时候不适合 sealed

当类型本身就是有意提供的扩展点时，不应密封：

```text
框架基类
插件基类
模板方法模式中的父类
明确要求项目方通过继承定制的类型
```

不要因为“sealed看起来更严格”就对所有类使用它，也不要为了假想中的继承需求而默认让所有类都可继承。应根据类型是否承担扩展点职责决定。

## sealed override

`sealed`还可以与 `override`一起使用，阻止更下层子类继续重写某个虚方法：

```csharp
public class Base
{
    public virtual void Execute()
    {
    }
}

public class Middle : Base
{
    public sealed override void Execute()
    {
    }
}
```

`Middle`仍然可以被继承，但它的 `Execute()`不能再被下一层重写。这与密封整个类是不同粒度的控制。

## 当前示例的结论

```csharp
public sealed class EpgHpClampConfig : ConfigBase
```

表示：

```text
它继承ConfigBase提供的配置加载基础能力
其他程序集可以访问这个配置类型
它是EPG-HP的最终具体配置，不作为新的继承扩展点
```

`sealed`在这里合理但不是必需。如果团队认为配置模型应保持普通类风格，改成`public class`也不会破坏当前功能。

## 相关知识

```text
访问修饰符
→ 类继承
→ abstract class
→ sealed class
→ 组合优于继承
```
