# ASP.NET Core Middleware、Request Pipeline 与 HttpContext

## 所属领域

```text
Engineering
└── .NET
    └── ASP.NET Core
        ├── Middleware
        ├── Request Pipeline
        └── HttpContext
```

## 相关知识

- [HTTP/HTTPS 报文格式](../../../ComputerScience/Networking/HTTP/HTTP-Message-Format.md)
- [CORS、同源策略与 Preflight 预检请求](../../../ComputerScience/Networking/HTTP/CORS-Same-Origin-Policy-and-Preflight.md)
- [ASP.NET Core WebAPI 项目模板与结构](ASP.NET-Core-WebAPI-Project-Template-and-Structure.md)
- [ASP.NET Core Controller 路由与参数绑定](ASP.NET-Core-Controller-Routing-and-Parameter-Binding.md)
- Routing、Endpoint、Static Files、Exception Handling

---

## 1. 一次请求如何到达业务代码

客户端发送一条 HTTP 或 HTTPS 请求后，ASP.NET Core 不会直接调用 Controller。请求会依次经过应用启动时配置好的处理管道：

```text
HTTP/HTTPS 请求
    ↓
服务器接收并解析请求
    ↓
创建本次请求的 HttpContext
    ↓
Middleware 1 → Middleware 2 → ... → Endpoint / Controller
    ↓
业务代码写入响应
    ↓
响应沿管道返回给客户端
```

这个按顺序处理请求的结构称为 **request handling pipeline（请求处理管道）**。管道中的每个处理环节称为 **middleware（中间件）**。

## 2. Middleware：请求处理的关卡

中间件会取得当前请求的 `HttpContext`，并做两类事情之一：

1. 做完处理后调用下一个中间件；
2. 直接写入响应并结束请求，不再继续向后。

典型的“直接结束”情况：

- 静态文件中间件找到了 `wwwroot/index.html`，直接返回该文件；
- 授权中间件发现无权限，直接返回 `401` 或 `403`；
- 自定义中间件主动返回限流、维护或参数错误响应。

中间件通常在调用下一个环节前后都可以执行逻辑：

```csharp
app.Use(async (context, next) =>
{
    // 请求向下游流动前执行
    await next();
    // 下游生成响应后、返回客户端前执行
});
```

如果有 A、B 两个中间件，执行顺序是：

```text
A 前置逻辑 → B 前置逻辑 → Endpoint / Controller → B 后置逻辑 → A 后置逻辑
```

因此中间件的注册顺序就是请求处理顺序，不能随意交换。

## 3. `Use...` 的含义：启动时登记，不是立即处理

`Program.cs` 在应用启动时执行一次：

```csharp
app.UseCors("DebugUiDev");
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapControllers();
```

这些语句是在配置“以后每一条请求要经过哪些处理环节”，不是在执行 CORS 检查、读取静态文件或调用 Controller。

其中：

- `UseCors`：加入 CORS 策略处理；
- `UseDefaultFiles`：请求目录地址时补出默认文件名，例如 `/` 变为 `/index.html`；
- `UseStaticFiles`：从 `wwwroot` 返回静态 HTML、JavaScript、CSS 等文件；
- `MapControllers`：将匹配 `/api/...` 等路由的请求映射到 Controller Action。它是 Endpoint 映射，不是名为 `Use...` 的中间件，但同样决定请求最终交给谁处理。

以设备服务的调试页和 API 为例：

```text
GET /          → UseDefaultFiles → UseStaticFiles → 返回 wwwroot/index.html
POST /api/...  → UseCors → MapControllers → Controller → 设备业务服务
```

## 4. `HttpContext` 与 HTTP/HTTPS 报文不是同一个东西

**HTTP 报文**是客户端和服务器在网络上传输的协议数据，包含请求行/状态行、Header、Body 等。HTTPS 仍使用 HTTP 语义和报文结构，只是在网络传输时由 TLS 加密。

**`HttpContext`**是 ASP.NET Core 在服务端内存中，为“当前这一条请求”创建的对象模型。它把收到的请求、准备发送的响应以及服务器侧附加信息组织到一起：

```text
HTTP/HTTPS 网络数据
    ↓ 服务器解析（HTTPS 已在 TLS 层解密）
HttpContext
├── Request   ：请求方法、Path、Query、Headers、Body
├── Response  ：状态码、Headers、Body
├── User      ：当前用户/身份信息（若配置认证）
├── Connection：客户端连接信息
└── Items     ：本次请求期间由中间件共享的临时数据
```

因此，正确关系是：

```text
HTTP/HTTPS 报文：网络协议层的数据
HttpContext     ：ASP.NET Core 对当前请求/响应的服务端对象表示
```

它们有关，但不能互相替代。中间件和 Controller 通常操作 `HttpContext`，框架再将 `Response` 转换为 HTTP 响应并发送出去。

## 5. 运行环境如何影响管道

ASP.NET Core 常用运行环境为：

- `Development`：本地开发和调试；
- `Staging`：上线前的部署验证环境；
- `Production`：面向真实用户或现场的运行环境。

环境名通常由主机上的 `ASPNETCORE_ENVIRONMENT` 决定，应用启动时读取。代码可据此决定是否加入某些中间件：

```csharp
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}
```

这段代码的含义是：非开发环境使用统一异常处理和 HSTS 安全策略；本地开发时保留更适合排查问题的行为。`UseHttpsRedirection()` 则用于把 HTTP 请求重定向到 HTTPS。

是否启用 HTTPS、HSTS 和开发异常页，取决于部署方式、证书和安全要求；不能只因为模板出现了这些调用就照搬。

## 6. 当前设备服务的阅读重点

阅读本项目 `Program.cs` 时，先区分两段：

```text
builder.Services....  → 注册 DI 服务，决定对象如何被创建
app.Use.../Map...     → 配置 HTTP 请求如何被处理
```

对于当前设备服务，优先理解以下链路即可：

```text
React 调试页 / 客户端
    ↓ HTTP JSON
UseCors
    ↓
MapControllers
    ↓
Controller
    ↓
设备 ApplicationService
    ↓
HTTP JSON 响应
```

静态调试页面请求则在 `UseDefaultFiles` 和 `UseStaticFiles` 处完成，不会进入 Controller。

## 结论

- Middleware 是请求处理管道中的有序处理环节；
- `Use...` 是启动时配置处理环节；
- `HttpContext` 是服务端当前请求/响应的对象模型，不是网络报文本身；
- HTTP/HTTPS 报文属于网络协议层，HTTPS 只是在 HTTP 传输外加入 TLS 加密；
- 中间件顺序会影响结果，理解顺序比记住所有内置中间件更重要。
