# ASP.NET Core WebAPI Project Template and Structure

## 所属领域

```text
Engineering Practice
└── .NET
    └── ASP.NET Core
        └── WebAPI Project Structure
```

## 相关知识

- .NET 8
- ASP.NET Core Web API
- OpenAPI / Swagger
- Visual Studio Solution
- `.csproj`
- [ASP.NET Core Controller Routing and Parameter Binding](ASP.NET-Core-Controller-Routing-and-Parameter-Binding.md)

---

## Problem

新建 .NET 服务端项目时，Visual Studio 会提供大量模板，例如 Web API、Blazor、Aspire、native AOT 等。需要根据项目本质选择合适模板。

---

## Recommended Template

面向前端、AGV、调度系统、仿真客户端等外部调用方提供 HTTP 接口时，优先选择：

```text
ASP.NET Core Web API
```

常见推荐配置：

| 配置项 | 建议 | 原因 |
|---|---|---|
| Framework | `.NET 8` | 当前长期支持和生态兼容较好 |
| Authentication | None | 内网第一阶段可先不启用认证 |
| HTTPS | 第一阶段可不勾 | 现场内网调试更简单；后续可补证书 |
| Container Support | 不勾 | 单机现场服务第一阶段不需要容器化 |
| OpenAPI | 勾选 | 生成 Swagger，方便调试接口 |
| Use Controllers | 勾选 | Controller 更适合多接口、清晰分层 |
| Aspire | 不登记 | Aspire 偏云原生/分布式编排，现场服务第一阶段偏重 |
| native AOT | 不选 | WebAPI、Swagger、配置绑定、序列化常用反射，AOT 约束更多 |

---

## HTTP vs HTTPS

HTTP 和 HTTPS 的报文结构见：

- [HTTP/HTTPS 报文格式](../../ComputerScience/Networking/HTTP/HTTP-Message-Format.md)

工程实践上：

- 内网现场服务第一阶段常用 HTTP，部署和客户端接入简单。
- HTTPS 提供传输加密，但需要证书，并要求客户端信任证书。
- 如果服务暴露到公网，必须使用 HTTPS。

---

## Solution and Project Directory

推荐目录结构：

```text
MaterialTable
├── MaterialTable.slnx
├── README.md
├── docs
└── MaterialTable
    ├── MaterialTable.csproj
    ├── Program.cs
    ├── Controllers
    └── ...
```

含义：

| 文件 / 目录 | 作用 |
|---|---|
| `.slnx` / `.sln` | 解决方案文件，Visual Studio 用它管理项目 |
| `.csproj` | 项目文件，声明目标框架、NuGet 包、编译配置 |
| `README.md` | 项目入口说明 |
| `docs/` | 项目文档 |
| `Program.cs` | 程序启动入口，注册服务、启用 Swagger、映射 Controller |
| `Controllers/` | WebAPI 控制器 |
| `appsettings.json` | 正式配置文件 |
| `appsettings.Development.json` | 开发环境配置覆盖 |
| `launchSettings.json` | Visual Studio 调试启动配置 |
| `bin/` | 编译输出 |
| `obj/` | 编译中间文件 |

模板自带的 `WeatherForecastController` 和 `WeatherForecast` 只是示例，可以删除。

---

## Startup Flow

一个最小 WebAPI 的启动链路通常是：

```text
Program.cs
├── builder.Services.AddControllers()
├── builder.Services.AddSwaggerGen()
├── app.UseSwagger()
├── app.UseSwaggerUI()
├── app.MapControllers()
└── app.Run()
```

`AddControllers()` 注册 Controller 能力。

`MapControllers()` 扫描 Controller 和 Attribute，建立路由表。

Swagger / OpenAPI 用于生成浏览器可查看的接口文档页面。

---

## csproj ItemGroup, Folder, and Content

`.csproj` 本质上是 MSBuild 项目文件，用 XML 描述项目如何编译、引用哪些包、哪些文件需要复制到输出目录。

常见结构：

```xml
<ItemGroup>
  <Folder Include="Data\" />
</ItemGroup>
```

这里要区分两个概念：

```text
ItemGroup 是“分组容器”。
Folder 是 ItemGroup 里面的一种项目项。
```

所以 `ItemGroup` 和 `Folder` 不是同一层级的东西。`Folder` 通常写在 `ItemGroup` 里面。

### Folder

`Folder` 主要用于告诉 Visual Studio：项目里有这样一个文件夹。

例如：

```xml
<ItemGroup>
  <Folder Include="Diagnostics\" />
  <Folder Include="Data\" />
</ItemGroup>
```

它常用于保留空目录，让空目录也能在 Visual Studio 项目视图里显示。

但它不会表示“把这个目录复制到运行目录”，也不会自动把里面的文件当成运行时配置文件。

也就是说：

```xml
<Folder Include="Configs\" />
```

只能表达“项目里有 Configs 这个文件夹”，不能保证：

```text
bin/Debug/net8.0/Configs/Hardware.config
```

运行时一定存在。

### Content

如果某些非代码文件是程序运行时需要读取的，例如硬件配置：

```text
Configs/Hardware.config
Configs/Camera1.config
Configs/SMC1.config
```

就应该把它们作为 `Content`，并设置复制规则：

```xml
<ItemGroup>
  <Content Include="Configs\**\*.*">
    <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
  </Content>
</ItemGroup>
```

含义：

```text
Configs\**\*.*       匹配 Configs 目录下所有文件，包括子目录。
Content              这些文件是项目内容文件，不是 C# 源码。
CopyToOutputDirectory 编译/运行时复制到输出目录。
PreserveNewest       只有源文件较新时才复制，避免每次都重复复制。
```

这样程序运行时才能在输出目录里找到配置文件。

### Folder vs Content

对比：

| 写法 | 作用 | 会复制到输出目录吗 |
|---|---|---|
| `<Folder Include="Configs\" />` | 让 VS 知道有这个文件夹，常用于空目录 | 不会 |
| `<Content Include="Configs\**\*.*">...` | 把目录下文件作为运行内容文件处理 | 会，取决于 `CopyToOutputDirectory` |

在 ASP.NET Core 服务里，`appsettings.json` 这类模板文件通常已经有默认规则处理。但自定义的硬件配置目录，例如 `Configs/Hardware.config`，建议显式写 `Content + CopyToOutputDirectory`，让运行目录稳定包含这些文件。

---

## Notes

项目结构应服务于长期维护。对于业务复杂的 WebAPI，不建议把所有逻辑都写在 Controller 里，而应逐步拆出：

```text
Controllers
Models
Services
Infrastructure
Options
```

这样 Controller 只负责 HTTP 入参、出参和状态码，业务逻辑放在服务层。
