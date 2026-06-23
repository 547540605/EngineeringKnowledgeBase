# C# Type System, Generics, and Nullable Reference Types

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        ├── Type System
        ├── Generics
        └── Nullable Reference Types
```

## 相关知识

- Value Type / Reference Type
- Generic Type Parameter
- `default`
- Null Safety
- [C# Attributes, Reflection, and Assemblies](CSharp-Attributes-Reflection-and-Assemblies.md)
- [ASP.NET Core API Response Wrapper ApiResult](../../../Engineering/DotNet/ASP.NET-Core-API-Response-Wrapper-ApiResult.md)

---

## Problem

在 ASP.NET Core WebAPI 项目中，经常会看到这些写法：

```csharp
public class ApiResult<T>
{
    public bool Success { get; set; }
    public string Code { get; set; } = "OK";
    public string? Message { get; set; }
    public T? Data { get; set; }
}
```

理解这些语法，需要同时理解 C# 的类型系统、泛型、可空引用类型和 `default`。

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

## Generics

`T` 是泛型类型参数，表示“这里先不固定具体类型，等使用时再指定”。

例如：

```csharp
ApiResult<string>
ApiResult<MaterialInfo>
ApiResult<List<MaterialInfo>>
```

统一外壳 `ApiResult<T>` 不变，但 `Data` 的类型随具体接口变化。

---

## default

`default` 表示某个类型的默认值。

常见结果：

| 类型 | `default` |
|---|---|
| `int` | `0` |
| `bool` | `false` |
| `DateTime` | `0001-01-01 00:00:00` |
| `string` | `null` |
| `object` | `null` |
| `class` | `null` |

在统一返回结构中，失败时常见写法是：

```csharp
Data = default
```

表示失败时没有有效数据。对于大多数 DTO、`string`、`object` 来说，`default` 就是 `null`。

---

## Object Initializers, init, and default!

在 DTO、配置类、硬件归类类里，经常会看到这种属性写法：

```csharp
public IRobotController TransportRobot { get; init; } = default!;
```

它其实由三部分组成：

```csharp
public IRobotController TransportRobot
```

表示定义一个公开属性，类型是 `IRobotController`，属性名是 `TransportRobot`。

```csharp
{ get; init; }
```

表示这个属性可以读取，也可以在对象初始化时赋值，但对象初始化完成后就不能再改。

例如：

```csharp
var devices = new MaterialTableHardwareDevices
{
    TransportRobot = robotControllers[0],
    PhoneRobot = robotControllers[1]
};
```

这里可以给 `init` 属性赋值。

但是下面这种写法不允许：

```csharp
devices.TransportRobot = anotherRobot; // 编译错误
```

`init` 适合表达“对象创建时必须确定，创建后不希望随便被改”的数据，例如硬件实例归类、配置快照、接口返回 DTO。

最后的：

```csharp
= default!;
```

是为了配合 `<Nullable>enable</Nullable>`。

因为 `IRobotController` 是引用类型，按规则不允许为 `null`。但这个属性的真实值不是在构造函数里赋的，而是在对象初始化器里赋的。编译器不一定能理解这个业务约定，于是会警告“非空属性没有初始化”。

`default!` 的含义是：

```text
先用这个类型的默认值占位，并告诉编译器：我知道这里看起来可能是 null，但运行时我会负责把它赋好。
```

对于引用类型来说，`default` 实际上就是 `null`；后面的 `!` 是 null-forgiving operator，表示“请不要在这里报可空警告”。

所以：

```csharp
public IRobotController TransportRobot { get; init; } = default!;
```

不是说这个属性真的应该长期为 `null`，而是说：

- 这个属性设计上不应该为 `null`。
- 它会在对象初始化器里被赋值。
- 这里用 `default!` 消除编译器初始化警告。

如果忘了在对象初始化器里赋值，编译器可能不报错，但运行时用到它时仍然可能出问题。所以 `default!` 不是万能保险，只是告诉编译器“这里我自己负责”。

---

## as Operator

`as` 是 C# 的安全类型转换运算符，常用于把一个对象尝试转换成另一个引用类型或接口类型。

例如：

```csharp
var transportJointRobot = robotControllers[0] as IJointRobotController;
```

含义是：

```text
尝试把 robotControllers[0] 转成 IJointRobotController。
如果能转，返回转换后的对象。
如果不能转，返回 null，不抛异常。
```

这和强制转换不同。

```csharp
var robot = (IJointRobotController)robotControllers[0];
```

如果对象不能转换成 `IJointRobotController`，强制转换会直接抛异常。

而 `as` 可以配合空值判断写出更明确的错误：

```csharp
var transportJointRobot = robotControllers[0] as IJointRobotController;
if (transportJointRobot == null)
{
    throw new InvalidOperationException("第 1 个机器人必须实现 IJointRobotController。");
}
```

在硬件初始化场景里，这种写法更适合，因为配置文件、DLL、硬件适配器都有可能配错。用 `as` 可以把“类型不匹配”的问题转成清楚的业务错误提示。

---

## Pattern Matching: is / is not

C# 还支持模式匹配（pattern matching）。它可以在判断类型的同时，把转换后的对象声明成一个新变量。

例如：

```csharp
if (robotControllers[0] is IJointRobotController transportJointRobot)
{
    // 进入这里说明 robotControllers[0] 确实实现了 IJointRobotController。
    // transportJointRobot 就是转换后的 IJointRobotController 对象。
}
```

这句话可以拆成两层意思：

```text
判断 robotControllers[0] 是不是 IJointRobotController。
如果是，就把它当成 IJointRobotController，并命名为 transportJointRobot。
```

所以它大致等价于：

```csharp
var transportJointRobot = robotControllers[0] as IJointRobotController;
if (transportJointRobot != null)
{
    ...
}
```

也可以反过来写：

```csharp
if (robotControllers[0] is not IJointRobotController transportJointRobot)
{
    throw new InvalidOperationException("第 1 个机器人必须实现 IJointRobotController。");
}
```

这句话的意思是：

```text
如果 robotControllers[0] 不是 IJointRobotController，就进入 if。
如果 robotControllers[0] 是 IJointRobotController，就不会进入 if，并且 transportJointRobot 是转换后的对象。
```

因为 `if` 里面直接 `throw` 了，代码能继续往下走就说明类型判断已经成功。因此在后续代码里可以继续使用 `transportJointRobot`：

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

这种写法的名字通常叫：

```text
Pattern matching
Declaration pattern
is not pattern
```

和 `as` 相比，它的优点是判断和声明变量放在一句里，代码更紧凑，而且编译器能更好地理解后续变量已经可用。

---

## Example

```csharp
public static ApiResult<T> Fail(string code, string message)
{
    return new ApiResult<T>
    {
        Success = false,
        Code = code,
        Message = message,
        Data = default
    };
}
```

该写法的核心含义：

- `Success = false` 明确表示失败。
- `Code` 表示机器可读的错误码。
- `Message` 表示人类可读的错误说明。
- `Data = default` 表示失败时没有可信业务数据。

---

## Notes

C# 的 `?` 在不同场景含义略有差异：

- `int?` 是 `Nullable<int>`，属于真正的可空值类型。
- `string?` 是可空引用类型标注，主要用于编译器静态检查。

两者都表达“可能为空”，但底层机制不同。
