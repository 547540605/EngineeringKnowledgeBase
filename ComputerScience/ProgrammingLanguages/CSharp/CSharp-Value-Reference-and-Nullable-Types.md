# C# Value, Reference, and Nullable Types

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        ├── Type System
        │   ├── Value Types
        │   └── Reference Types
        └── Nullability
```

## 相关知识

- Value Type / Reference Type
- Null Safety
- Nullable Value Types
- Nullable Reference Types
- [C# Default Values](CSharp-Default-Values.md)
- [C# init Properties and Null-Forgiving Operator](CSharp-Init-Properties-and-Null-Forgiving-Operator.md)
- [C# Null-Coalescing Operators](CSharp-Null-Coalescing-Operators.md)

---

## Problem

在 C# 项目中，经常会看到值类型、引用类型以及带 `?` 的可空类型：

```csharp
int count = 0;
int? optionalCount = null;
string name = "phone";
string? optionalName = null;
```

理解它们的存储语义和可空规则，是正确处理默认值、参数校验和空引用风险的基础。

---

## Value Types

值类型变量中直接保存值本身。

常见值类型：

```csharp
int
long
double
decimal
bool
char
DateTime
DateOnly
TimeOnly
Guid
enum
struct
```

值类型默认不能为 `null`：

```csharp
int age = null;      // 编译错误
bool success = null; // 编译错误
```

如果值类型需要允许为空，需要使用 nullable value type：

```csharp
int? age = null;
bool? success = null;
DateTime? createdAt = null;
```

`bool Success` 通常不需要写成 `bool?`，因为接口成功与否只需要 `true` / `false` 两种明确状态。

---

## Reference Types

引用类型变量保存的是对象引用。引用可能指向一个对象，也可能是 `null`。

常见引用类型：

```csharp
string
object
class
array
List<T>
Dictionary<TKey, TValue>
interface
record class
```

示例：

```csharp
string? name = null;
List<string>? names = null;
MaterialInfo? material = null;
```

---

## Nullable Reference Types

项目文件中可以开启可空引用类型检查：

```xml
<Nullable>enable</Nullable>
```

该配置通常位于 `.csproj` 文件中。

开启后，编译器会根据 `?` 判断引用类型是否允许为 `null`。

```csharp
public string Code { get; set; } = "OK";
```

表示 `Code` 不允许为 `null`，并且提供了默认值。

```csharp
public string? Message { get; set; }
```

表示 `Message` 可以为 `null`。

```csharp
public T? Data { get; set; }
```

表示接口失败时可能没有有效数据，所以 `Data` 可以为 `null`。

---

## Notes

C# 的 `?` 在不同场景含义略有差异：

- `int?` 是 `Nullable<int>`，属于真正的可空值类型。
- `string?` 是可空引用类型标注，主要用于编译器静态检查。

两者都表达“可能为空”，但底层机制不同。
