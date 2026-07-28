# HTTP Cache-Control

## 所属领域

```text
Computer Science
└── Networking
    └── HTTP
        ├── Response Headers
        └── Caching
```

## 相关知识

- [HTTP/HTTPS 报文格式](HTTP-Message-Format.md)
- 浏览器缓存
- Proxy Cache
- CDN
- [ASP.NET Core Action Results and File Responses](../../../Engineering/DotNet/ASPNETCore/ASP.NET-Core-Action-Results-and-File-Responses.md)

## HTTP 缓存解决什么问题

客户端或中间代理可以保存之前的 HTTP 响应。再次请求相同资源时，复用缓存能够减少网络传输和服务端计算。

静态图片、CSS、JavaScript 等资源通常适合缓存；实时手机画面等每次都可能变化的响应通常不应复用旧内容。

## Cache-Control 是响应 Header

服务端可以通过响应头描述缓存规则：

```http
HTTP/1.1 200 OK
Content-Type: image/jpeg
Cache-Control: no-store

<JPEG 数据>
```

ASP.NET Core 中可以通过当前 `HttpResponse` 设置：

```csharp
Response.Headers["Cache-Control"] = "no-store";
```

`Response` 表示当前 HTTP 请求对应的响应；`Headers` 是要随响应发送的键值对集合。

## no-store 与 no-cache 的区别

二者名称容易产生误解。

### no-store

```http
Cache-Control: no-store
```

表示缓存不应存储该响应。适合敏感数据和必须每次重新获取的实时内容。

### no-cache

```http
Cache-Control: no-cache
```

它并不是“完全不缓存”。缓存可以保存响应，但每次复用前必须先向服务器重新验证该响应是否仍有效。

因此：

```text
no-store → 不要保存
no-cache → 可以保存，但使用前必须验证
```

如果目标是确保实时画面不被保存和复用，单独使用 `no-store` 通常已经足够。写成：

```http
Cache-Control: no-store, no-cache
```

也能表达严格限制，但两个指令的语义并不相同，不能简单地都解释为“不缓存”。

## 为什么相同 URL 可能出现旧画面

前端可能持续访问同一个地址：

```text
GET /api/GetPhoneFrame
GET /api/GetPhoneFrame
GET /api/GetPhoneFrame
```

虽然每次 URL 相同，但手机画面已经变化。如果客户端或中间缓存复用旧响应，界面就可能显示旧帧。

因此实时画面接口应明确缓存规则：

```csharp
Response.Headers["Cache-Control"] = "no-store";
return File(imageBytes, "image/jpeg");
```

也可以在 URL 中增加时间戳作为额外的缓存规避手段：

```text
/api/GetPhoneFrame?t=1710000000000
```

但随机查询参数只是改变缓存键，正确的服务端 `Cache-Control` 仍然更能准确表达接口语义。

## Cache-Control 不改变 Body 格式

`Cache-Control` 只描述缓存策略，不会修改 JPEG、JSON 等响应体内容。

下面三个部分职责不同：

```text
Content-Type: image/jpeg  → Body 是什么格式
Cache-Control: no-store   → 响应能否被缓存
Body                      → 实际 JPEG 字节
```

## 调试方法

在浏览器开发者工具 Network 面板中选择请求，可以查看：

- Status Code
- Response Headers
- `Content-Type`
- `Cache-Control`
- Response Body

这比只看页面是否更新更容易判断缓存规则是否真正由服务端返回。
