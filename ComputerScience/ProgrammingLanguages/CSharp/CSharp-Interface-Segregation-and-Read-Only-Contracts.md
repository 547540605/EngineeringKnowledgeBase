# C# Interface Segregation and Read-Only Contracts

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Interface Design
            └── Interface Segregation
```

## 相关知识

- Interface Segregation Principle
- Least Privilege
- Read-Only Properties
- Consumer-Oriented API Design
- [C# Class Inheritance and Interface Implementation](CSharp-Class-Inheritance-and-Interface-Implementation.md)

---

在设计接口时，接口中的属性可以只有 `get` 访问器，而实现类的属性同时具有 `get` 和 `set`。

```csharp
public interface ISpeedData
{
    double Time { get; }
    double Speed { get; }
    double TagSpeed { get; }
}
```

## 为什么接口只有 get

这是接口隔离原则和最小权限原则的应用：

1. **面向调用者设计**：如果统计算法只需要读取数据，就不应该同时获得修改原始数据的权限。
2. **只读契约**：接口中的 `get` 向调用方承诺可读取，但不暴露写入能力。
3. **保留实现自由**：实现类仍可使用 `{ get; set; }`，在其他调用路径或内部逻辑中维护数据。

C# 允许具有 `{ get; set; }` 属性的类实现只要求 `{ get; }` 的接口。接口只定义调用方能够依赖的最小能力，不必暴露实现类的全部操作。
