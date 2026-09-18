# C# 访问修饰符与作用域可见性规则

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Type Accessibility
            └── Access Modifiers
```

## 相关知识

- Declaration Space
- Namespace-Level Types
- Encapsulation
- Assembly Boundary
- [C# Class Inheritance and Interface Implementation](CSharp-Class-Inheritance-and-Interface-Implementation.md)
- [C# Singleton Pattern](CSharp-Singleton-Pattern.md)

---

本文档总结 C# 访问修饰符的使用原则，以及声明位置如何限制可用的访问级别。

## 1. 访问修饰符最佳实践：`public` vs `internal`

在实际开发中（尤其是借助 IDE 自动生成代码时），常常会遇到 `public` 和 `internal` 的选择问题。

### 核心区别
* **`public` (公开)**：没有任何访问限制。如果你开发的是一个类库（例如 `Core.dll`），并且你希望**其他引用了此 DLL 的项目**能直接调用该类或接口，就使用 `public`。
* **`internal` (程序集内部可见)**：表示“仅在当前项目（程序集/DLL）内部可见流通”。这是 C# 顶层元素的默认安全边界。

### 什么时候用 `internal`？
当一个接口或类**仅仅是为了解决项目内部的代码复用或重构**，而不需要暴露给外部调用者时。
例如：为了在 Controller 层中统一处理统计逻辑而抽离出的 `ISpeedData`，它属于项目的“重构细节”。外部引用这个 Controller 的系统并不需要知道 `ISpeedData` 的存在。

### 架构经验法则
永远优先使用能满足需求的**最小访问权限**：
`private` -> `protected` -> `internal` -> `public`

严格控制 `public` API 的暴露范围，可以有效减少模块间的耦合度，这是评估代码质量架构成熟度的重要标准之一。

### 构造函数的访问权限：谁可以创建对象

构造函数同样是成员；其访问修饰符决定谁可以写 `new 类型(...)`。日常开发中优先掌握以下三种：

| 修饰符 | 在类型本身可访问的前提下，谁可调用构造函数 | 常见用途 |
|---|---|---|
| `public` | 任何调用方 | 普通公开对象和服务 |
| `internal` | 同一程序集内的代码 | 仅供项目内部创建的实现 |
| `private` | 只有声明该构造函数的类型自身 | 静态工厂、限制创建方式、单例 |

```csharp
public sealed class Device
{
    public Device() { } // 外部可 new Device()
}

public sealed class DeviceFactory
{
    private DeviceFactory() { } // 只有 DeviceFactory 自己可 new

    public static DeviceFactory Create() => new DeviceFactory();
}
```

`private` 构造函数并不只服务于单例；它的通用含义是“外部不能直接创建对象”。单例模式正是利用它配合静态实例来保证创建入口唯一，具体实现见 [C# Singleton Pattern](CSharp-Singleton-Pattern.md)。

## 2. 顶层类型的可访问性规则 (Top-level Type Accessibility)

在使用“最小权限原则”时，可能会遇到编译错误：`CS1527: 命名空间中定义的元素无法显式声明为 private...`。这涉及到 C# 中非常基础但容易被忽略的“声明空间”规则。

### 顶层元素的限制
直接定义在命名空间（`namespace`）下方的元素（如 `class`、`interface`、`struct`、`enum` 等）被称为**顶层元素 (Top-level Elements)**。
对于顶层元素，C# 只允许两种访问修饰符：
1. **`internal`**（如果不写任何修饰符，这是默认值）。
2. **`public`**。

**不允许使用 `private` 或 `protected`。**

### 为什么不能是 private？
`private` 的语义是“仅在声明它的代码块（大括号内）可见”。
如果一个接口定义在命名空间的最外层，且是 `private` 的，那就意味着连同处于同一个命名空间的其他类都无法看见它。这会导致该接口没有任何调用者可以使用，成为无意义的死代码。

### 什么时候才能用 private？
`private` 只能用于修饰**嵌套在其他类型内部的成员**：
* 类的字段、属性、方法。
* 类的构造函数。
* **嵌套类 / 嵌套接口**（定义在另一个类的内部）。

```csharp
namespace DONGZHOU.Project.DZ225019.Model
{
    // 顶层元素，只能是 public 或 internal
    internal class SomeClass
    {
        // 嵌套元素，可以是 private
        private interface ISpeedData
        {
            double Time { get; }
        }
    }
}
```

**总结**：对定义在命名空间下的顶层接口和类来说，`internal` 就已经是它所能拥有的“最小权限”了。
