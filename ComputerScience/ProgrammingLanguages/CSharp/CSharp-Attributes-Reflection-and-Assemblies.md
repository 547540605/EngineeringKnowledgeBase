# C# Attributes, Reflection, and Assemblies

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        ├── Metadata
        ├── Attribute
        ├── Reflection
        └── Assembly
```

## 相关知识

- Metadata
- Runtime
- Reflection
- ASP.NET Core Routing
- OpenAPI / Swagger
- Native AOT
- [ASP.NET Core Controller Routing and Parameter Binding](../../../Engineering/DotNet/ASP.NET-Core-Controller-Routing-and-Parameter-Binding.md)

---

## Problem

ASP.NET Core WebAPI 中经常出现这样的代码：

```csharp
[ApiController]
[Route("api/")]
[Produces("application/json")]
public class HealthController : ControllerBase
{
    [HttpGet("Health")]
    public ApiResult<object> Health()
    {
        ...
    }
}
```

这些方括号里的写法是 C# Attribute。理解 Attribute 需要同时理解程序集元数据和反射。

---

## Attribute

Attribute 中文常称为“特性”。

特性本质上是继承自 `System.Attribute` 的类，用来给类、方法、属性、参数等代码元素附加元数据。

例如：

```csharp
[HttpGet("Health")]
```

完整类名是：

```csharp
HttpGetAttribute
```

C# 允许在使用 Attribute 时省略结尾的 `Attribute`。

可以把它理解成：

```csharp
new HttpGetAttribute("Health")
```

但它不是普通业务代码调用，而是在编译时被写入程序集元数据，供框架运行时读取。

---

## Assembly

C# 编译后会生成程序集，例如：

```text
MaterialTable.dll
```

程序集里不只有可执行代码，还包含元数据：

- 有哪些类。
- 有哪些方法。
- 方法参数是什么。
- 返回值是什么。
- 贴了哪些 Attribute。

---

## Reflection

反射是程序在运行时查看和使用元数据的能力。

框架可以在运行时检查：

```text
HealthController 有哪些方法？
Health 方法上有没有 HttpGetAttribute？
HttpGetAttribute 的路径是什么？
```

ASP.NET Core 启动时会做类似工作：

```text
扫描程序集
找到 Controller
读取 RouteAttribute
读取 HttpGetAttribute / HttpPostAttribute
建立路由表
```

于是框架知道：

```text
GET /api/Health -> HealthController.Health()
```

这就是 Attribute 能把普通 C# 方法变成 HTTP 接口的原因。

---

## Attribute vs Base Class

Attribute 不是 `ControllerBase` 提供的。

`ControllerBase` 提供的是控制器运行时能力，例如：

- `HttpContext`
- `Request`
- `Response`
- `Ok(...)`
- `BadRequest(...)`
- `NotFound(...)`
- `ModelState`

Attribute 提供的是元数据。

ASP.NET Core 路由系统把二者结合起来，才形成完整 WebAPI 行为。

---

## Native AOT Boundary

反射很适合框架动态扫描和自动发现能力。

但 native AOT 更偏向编译前确定所有内容。WebAPI、Swagger、配置绑定、JSON 序列化等常用能力经常依赖反射或元数据，因此启用 native AOT 会带来更多约束。

对于普通内部 WebAPI 服务，优先选择普通 ASP.NET Core WebAPI 可以降低复杂度。

---

## Related Knowledge

```text
Programming Languages
└── Runtime
    ├── Metadata
    ├── Reflection
    ├── JIT
    └── AOT
```
