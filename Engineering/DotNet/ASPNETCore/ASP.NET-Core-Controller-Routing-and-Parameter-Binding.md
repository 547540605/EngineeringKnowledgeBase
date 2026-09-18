# ASP.NET Core Controller Routing and Parameter Binding

## 所属领域

```text
Engineering
└── .NET
    └── ASP.NET Core
        ├── Controller
        ├── Routing
        └── Model Binding
```

## 相关知识

- HTTP Method
- URL Path
- JSON Request Body
- Attribute
- Reflection
- [C# Attributes, Reflection, and Assemblies](../CSharp/CSharp-Attributes-Reflection-and-Assemblies.md)
- [HTTP/HTTPS 报文格式](../../../ComputerScience/Networking/HTTP/HTTP-Message-Format.md)
- [ASP.NET Core Action Results and File Responses](ASP.NET-Core-Action-Results-and-File-Responses.md)

---

## Problem

在 ASP.NET Core WebAPI 中，一个普通 C# 方法为什么能变成 HTTP 接口？关键在于 Controller、Attribute、路由系统和参数绑定共同工作。

---

## Controller Example

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

最终接口：

```text
GET /api/Health
```

---

## Common Controller Attributes

### `[ApiController]`

表示这是一个 API 控制器，启用 WebAPI 友好的行为，例如参数绑定和模型校验。

### `[Route("api/")]`

定义控制器下接口的公共路径前缀。

```csharp
[Route("api/")]
```

配合：

```csharp
[HttpGet("Health")]
```

最终路径：

```text
GET /api/Health
```

### `[Produces("application/json")]`

说明接口默认返回 JSON，Swagger 也会显示返回类型为：

```text
application/json
```

### `[HttpGet("Health")]`

说明该方法响应 HTTP GET 请求，路径片段是 `Health`。

```csharp
[HttpPost("Lock")]
```

表示：

```text
POST /api/Lock
```

---

## ControllerBase

```csharp
public class HealthController : ControllerBase
```

`ControllerBase` 是 ASP.NET Core 提供的 API 控制器基类。

它提供：

- `HttpContext`
- `Request`
- `Response`
- `Ok(...)`
- `BadRequest(...)`
- `NotFound(...)`
- `ModelState`

注意：

- Attribute 不是 `ControllerBase` 提供的。
- `ControllerBase` 提供运行时能力。
- Attribute 提供元数据。
- ASP.NET Core 路由系统读取元数据，建立 URL 到方法的映射。

---

## Route Composition

示例：

```csharp
[Route("api/")]
public class HealthController : ControllerBase
{
    [HttpGet("Health")]
    public ApiResult<object> Health()
    {
        ...
    }
}
```

路由组合过程：

```text
类路径前缀：api/
方法路径：Health
HTTP 动词：GET
最终接口：GET /api/Health
```

浏览器地址栏默认发送 GET 请求，因此访问：

```text
http://localhost:5238/api/Health
```

会执行：

```csharp
HealthController.Health()
```

---

## FromBody and Parameter Binding

`[FromBody]` 是贴在方法参数上的 Attribute。

```csharp
[HttpPost("CreateMaterial")]
public ApiResult<MaterialMaintenanceResultInfo> CreateMaterial([FromBody] MaterialInfo material)
{
    ...
}
```

含义：

```text
material 参数从 HTTP 请求体 Body 里的 JSON 读取。
```

客户端请求示例：

```http
POST /api/CreateMaterial
Content-Type: application/json

{
  "slotId": "slot_01",
  "materialName": "测试手机",
  "sn": "SN001",
  "phoneType": "iPhone15"
}
```

ASP.NET Core 会把 Body 里的 JSON 反序列化成 `MaterialInfo` 对象，再传给方法参数。

在 `[ApiController]` 存在时，复杂类型参数通常默认也会从 Body 绑定，但显式写 `[FromBody]` 更清楚，Swagger 和后续维护者也更容易看懂。

---

## Common Binding Sources

| Attribute | 来源 | 示例 |
|---|---|---|
| `[FromBody]` | 请求体 JSON | POST 提交复杂对象 |
| `[FromQuery]` | URL 查询参数 | `?materialId=abc` |
| `[FromRoute]` | 路由路径 | `/api/GetMaterial/abc` |
| `[FromHeader]` | HTTP Header | 认证信息、客户端信息 |

简单字符串也可以使用 `[FromBody]`，但请求体会是裸 JSON 字符串：

```json
"abc"
```

这种格式不如对象直观。更推荐定义请求 DTO：

```csharp
public class DeleteMaterialRequest
{
    public string MaterialId { get; set; } = "";
}
```

请求体：

```json
{
  "materialId": "abc"
}
```

---

## Full Request Flow

从浏览器调用接口，到 C# 方法执行，中间大致是：

```text
浏览器发 GET /api/Health
ASP.NET Core 路由表匹配到 HealthController.Health
框架创建 Controller
调用 Health 方法
方法返回 ApiResult<object>
框架把对象序列化成 JSON
浏览器显示 JSON
```

这条链路同时涉及：

- HTTP：GET、POST、URL、Content-Type。
- C#：class、泛型、Attribute、值类型/引用类型、nullable。
- ASP.NET Core：Controller、路由、Swagger、依赖注入。
- .NET 底层：程序集、元数据、反射。

