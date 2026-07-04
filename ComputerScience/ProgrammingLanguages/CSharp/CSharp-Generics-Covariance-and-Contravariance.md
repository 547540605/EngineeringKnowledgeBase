# C# 泛型协变与逆变 (Covariance & Contravariance)

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Generics
            └── Covariance & Contravariance
```

## 相关知识

- [C# Generics](CSharp-Generics.md)
- [C# 接口隔离与只读契约](CSharp-Interface-Segregation-and-Read-Only-Contracts.md)
- [C# 类继承与接口实现](CSharp-Class-Inheritance-and-Interface-Implementation.md)

---

## 问题场景

`苹果` 实现了 `水果` 接口。你有一箱苹果（`List<苹果>`），有个方法要求传入一箱水果（`IList<水果>`）：

```csharp
void DoSomething(IList<水果> data);

List<苹果> list = ...;
DoSomething(list);  // ← 编译报错！
```

苹果明明是水果，为什么不让传？

---

## 前置概念：接口在赋值规则上等同于父类

单个对象的赋值中，实现了某个接口的类，可以直接赋值给该接口类型的变量——这和子类赋值给父类的规则**完全一样**：

```csharp
// 单个对象：实现类 → 接口，没问题（和子类→父类一样）
ISpeedData data = new WorkingConditionDataCollection();  // ✅ 完全OK
```

**但是套上 `List<>` 之后，规则变了**：

```csharp
// 套上 List 后：不行了！
List<ISpeedData> list = new List<WorkingConditionDataCollection>();  // ❌ 报错
```

单个苹果可以当水果用，但一箱苹果不能直接当一箱水果用。为什么？往下看。

---

## 核心概念：箱子 vs 展示柜

关键不在于苹果是不是水果，而在于**容器能不能被塞东西**。

### 箱子（`IList<T>`）—— 能读能写

`IList` 是一个"箱子"，你既能从里面取东西，也能往里面塞东西（`Add`、`Remove`）。

如果编译器允许把"苹果箱子"当作"水果箱子"传出去，那拿到箱子的人就可以：

```csharp
data.Add(一个橘子);  // IList 有 Add 方法！
```

你给出去的明明是一个苹果箱子，结果被塞了一个橘子进去。下次取出来当苹果用，程序就炸了。

**所以编译器直接禁止了这种转换。**

### 展示柜（`IEnumerable<T>`）—— 只能读

`IEnumerable` 是一个"带玻璃罩的展示柜"——只能看、只能往外取，**不能往里塞**。

既然没人能往里面塞橘子，那把"苹果展示柜"当成"水果展示柜"就是**绝对安全的**——从里面取出来的东西，怎么样都肯定是水果。

**所以编译器允许这种转换。**

---

## 对照表

| 类型 | 能读 | 能写 | 能否安全转换 |
|---|---|---|---|
| `List<T>` | ✅ | ✅ 有 `Add`、`Remove` | ❌ 不安全，禁止（且是具体类，非接口，根本不涉及协变机制） |
| `IList<T>` | ✅ | ✅ 有 `Add`、`Remove` | ❌ 不安全，禁止 |
| `IEnumerable<T>` | ✅ | ❌ 只能遍历 | ✅ 安全，允许 |

---

## 什么是协变（Covariance）

上面说的这个规则的学名就叫**协变**：

> "苹果展示柜"可以当作"水果展示柜"来用

翻译成代码：

> `IEnumerable<子类>` 可以当作 `IEnumerable<父类>` 来用

C# 用 `out` 关键字来标记一个泛型参数支持协变：

```csharp
public interface IEnumerable<out T>
//                           ^^^
// out = T 只能从接口中"出去"（作为返回值），不能"进来"（作为参数）
// 只出不进 = 只读 = 安全 = 允许协变
```

### 常见的支持协变的接口

- `IEnumerable<out T>` —— 只读遍历
- `IReadOnlyList<out T>` —— 只读索引访问
- `IReadOnlyCollection<out T>` —— 只读集合

### 不支持协变的接口

- `IList<T>` —— 可读可写
- `ICollection<T>` —— 可读可写
- `List<T>` —— 具体类，不是接口，不涉及协变

---

## 实际项目中的应用

```csharp
// ❌ 报错：IList 能写入，编译器认为不安全
public static Statistics CalculateStatistics(IList<ISpeedData> data)

// ✅ 正确：IEnumerable 只读，编译器认为安全
public static Statistics CalculateStatistics(IEnumerable<ISpeedData> data)
```

这样 `List<WorkingConditionDataCollection>` 和 `List<WorkingConditionControlModel>` 都能直接传进去，不需要任何额外转换。

---

## 什么是逆变（Contravariance）

协变的反面。用 `in` 关键字标记，表示泛型参数**只能作为输入（参数），不能作为输出（返回值）**。

> "能处理水果的机器"可以当作"能处理苹果的机器"来用

```csharp
public interface IComparer<in T>
//                         ^^
// in = T 只能"进来"（作为参数），不能"出去"
```

一个能比较任意水果大小的比较器，当然也能比较苹果。所以 `IComparer<水果>` 可以当作 `IComparer<苹果>` 来用。注意方向和协变是**反过来的**。

日常开发中协变比逆变常见得多，逆变了解即可。
