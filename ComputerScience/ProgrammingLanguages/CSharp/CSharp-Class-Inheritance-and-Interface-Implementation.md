# C# Class Inheritance and Interface Implementation

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Object-Oriented Programming
            ├── Class Inheritance
            └── Interface Implementation
```

## 相关知识

- Is-A Relationship
- Interface Contract
- Composition
- Multiple Interface Implementation
- [C# Interface Segregation and Read-Only Contracts](CSharp-Interface-Segregation-and-Read-Only-Contracts.md)
- [C# Access Modifiers and Scope](CSharp-Access-Modifiers-and-Scope.md)

---

在 C# 中，类继承和接口实现有明确的语义区分：

- **继承基类 (`: BaseClass`)** 表达“是什么（Is-A）”的关系。
- **实现接口 (`: IInterface`)** 表达“具备什么能力或遵守什么契约（Can-Do）”的关系。

## 单继承与多接口实现

C# 仅允许一个类继承一个基类，以避免多重继承带来的成员冲突和菱形继承问题；一个类则可以实现多个接口，从不同维度声明其能力。

```csharp
public class WorkingConditionDataCollection : HardwareDataBase, ISpeedData
{
    // ...
}
```

这段声明可以读成：

```text
WorkingConditionDataCollection 本质上是 HardwareDataBase，
同时承诺具备 ISpeedData 定义的数据读取能力。
```

这种设计可以在不破坏原有类层次结构的前提下，为类型增加横向能力。
