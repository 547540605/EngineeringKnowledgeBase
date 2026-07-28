# ASP.NET Core Action Results and File Responses

## 所属领域

```text
Engineering
└── .NET
    └── ASP.NET Core
        ├── Controller
        ├── IActionResult
        └── HTTP Response
```

## 相关知识

- [ASP.NET Core Controller Routing and Parameter Binding](ASP.NET-Core-Controller-Routing-and-Parameter-Binding.md)
- [HTTP/HTTPS 报文格式](../../../ComputerScience/Networking/HTTP/HTTP-Message-Format.md)
- [HTTP Cache-Control](../../../ComputerScience/Networking/HTTP/HTTP-Cache-Control.md)
- [ASP.NET Core API Response Wrapper ApiResult](ASP.NET-Core-API-Response-Wrapper-ApiResult.md)

## IActionResult 是什么

Controller Action 不只是在返回一个普通 C# 值，它最终需要产生完整的 HTTP 响应，包括：

- HTTP 状态码
- Response Headers
- Response Body

`IActionResult` 是 ASP.NET Core 对“Action 执行结果”的抽象。不同的具体结果类型都可以实现它，例如：

```text
FileContentResult  → 返回文件字节
ObjectResult       → 返回对象，通常序列化为 JSON
OkObjectResult     → 200 + 对象
NotFoundResult     → 404
```

当一个接口可能返回不同形式的响应时，可以统一声明：

```csharp
public IActionResult GetPhoneFrame()
```

示例中的两个分支实际类型不同：

```csharp
return File(imageBytes, "image/jpeg"); // FileContentResult
return StatusCode(500, error);         // ObjectResult
```

但它们都实现了 `IActionResult`。

## IActionResult 如何变成 HTTP 响应

Action 返回结果对象后，并不是 Controller 自己直接向网络写数据。ASP.NET Core MVC 会执行这个结果对象，再生成 HTTP 响应：

```text
Controller 方法返回 IActionResult
              ↓
MVC 判断具体结果类型
              ↓
设置状态码、Headers 和 Body
              ↓
Web Server 将 HTTP 响应发送给客户端
```

## ControllerBase.File

下面的 `File` 不是 `System.IO.File`，而是 `ControllerBase` 提供的辅助方法：

```csharp
return File(imageBytes, "image/jpeg");
```

它会创建 `FileContentResult`。MVC 执行结果时生成类似响应：

```http
HTTP/1.1 200 OK
Content-Type: image/jpeg

<JPEG 二进制数据>
```

未传下载文件名时，浏览器通常直接显示可识别的内容：

```csharp
return File(imageBytes, "image/jpeg");
```

传入下载文件名时，会产生下载文件相关的响应头：

```csharp
return File(imageBytes, "image/jpeg", "phone.jpg");
```

## 为什么图片不应放进 ApiResult

`ApiResult<T>` 适合 JSON 业务响应：

```json
{
  "success": true,
  "code": "OK",
  "data": {}
}
```

图片接口成功时需要让 Response Body 直接包含 JPEG 字节，并设置：

```http
Content-Type: image/jpeg
```

如果把图片字节包进 `ApiResult<byte[]>`，JSON 序列化会把字节转换成文本形式，增加体积，浏览器也不能把整个响应直接当图片显示。

## 成功返回图片，失败返回 JSON

一个接口可以根据执行结果返回不同的状态码和 Content-Type：

```csharp
[HttpGet("GetPhoneFrame")]
public IActionResult GetPhoneFrame()
{
    try
    {
        byte[] imageBytes = phoneDebugService.CaptureFrame();
        Response.Headers["Cache-Control"] = "no-store";
        return File(imageBytes, "image/jpeg");
    }
    catch (Exception ex)
    {
        return StatusCode(
            StatusCodes.Status500InternalServerError,
            ApiResult<object>.Fail(
                "CapturePhoneFrameFailed",
                $"获取手机画面失败：{ex.Message}"));
    }
}
```

成功响应：

```http
HTTP/1.1 200 OK
Content-Type: image/jpeg
Cache-Control: no-store

<JPEG 二进制数据>
```

失败响应：

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json
```

```json
{
  "success": false,
  "code": "CapturePhoneFrameFailed",
  "message": "获取手机画面失败：设备连接异常",
  "data": null
}
```

## StatusCode 辅助方法

`StatusCode(int, object)` 是 `ControllerBase` 提供的辅助方法。它同时指定：

- HTTP 状态码
- 要写入响应体的对象

```csharp
return StatusCode(
    StatusCodes.Status500InternalServerError,
    ApiResult<object>.Fail("CaptureFailed", "取图失败"));
```

`StatusCodes.Status500InternalServerError` 是可读性更好的常量，其值为 `500`。

`ApiResult<object>` 中的 `object` 是泛型占位。失败响应没有具体业务数据，`Data` 最终为 `null`。

## 为什么在 Controller 捕获异常

硬件服务可能因为设备离线、超时或图像编码失败而抛出异常。Controller 是 HTTP 边界，可以把内部异常转换成客户端能够理解的 HTTP 响应。

如果完全不捕获，异常会继续交给 ASP.NET Core 异常处理中间件。项目没有统一异常处理时，客户端可能只收到不稳定或不易理解的错误响应。

实际项目还应注意：

- 使用 `ILogger` 记录完整异常和堆栈。
- 面向公网时不要直接把敏感的 `ex.Message` 返回给客户端。
- 普通程序错误可返回 500；明确的外部设备暂时不可用，也可以根据系统约定返回 503。
- 当多个 Controller 都有相同的 `try/catch` 时，应考虑统一异常处理中间件，而不是复制代码。

## Produces 特性与真实响应类型

```csharp
[Produces("application/json")]
```

表示该 Controller 或 Action 声明自己产生 JSON，主要用于内容协商和 API 文档元数据。

如果接口成功时返回 `image/jpeg`，类级别只声明 `application/json` 就与真实行为不一致。可以：

- 删除不准确的类级别 `[Produces("application/json")]`。
- 或针对具体 Action 正确描述可能的响应类型。

无论是否声明 `[Produces]`，下面的代码仍会把实际响应类型设置为 JPEG：

```csharp
return File(imageBytes, "image/jpeg");
```

但准确的元数据有助于 Swagger 和维护者正确理解接口。
