# CORS、同源策略与 Preflight 预检请求

## 所属领域

```text
Computer Science
└── Networking
    └── HTTP
        ├── Browser Security Model
        ├── Same-Origin Policy
        └── CORS
```

## 相关知识

- [HTTP/HTTPS 报文格式](HTTP-Message-Format.md)
- HTTP Request Headers、HTTP Response Headers
- Browser Security Model
- [ASP.NET Core Middleware、Request Pipeline 与 HttpContext](../../../Engineering/DotNet/ASPNETCore/ASP.NET-Core-Middleware-Request-Pipeline-and-HttpContext.md)（框架实现示例）

---

## 1. Origin 与同源策略

浏览器用 **Origin（源）** 标识网页所在的位置：

```text
Origin = scheme（协议） + host（主机） + port（端口）
```

以下地址即使都在同一台电脑上，也不是同源：

```text
http://localhost:5173
http://localhost:5188
```

浏览器的 **Same-Origin Policy（同源策略）** 默认不允许网页中的 JavaScript 自由读取其他 Origin 的响应。该限制用于避免恶意网页借用用户已登录的网站身份，读取该网站的数据。

同源策略是浏览器安全规则，不是服务器、网络或 .NET 的限制。因此后端服务之间、命令行工具、Postman 等直接发 HTTP 请求时，不受 CORS 限制。

## 2. CORS：服务器明确授权浏览器跨域读取

**CORS（Cross-Origin Resource Sharing，跨源资源共享）** 是 HTTP Header 约定。服务器通过响应 Header 告诉浏览器：某个外部 Origin 可以读取本响应。

```text
浏览器页面：Origin = http://localhost:5173
        ↓ 请求 API
服务器响应：Access-Control-Allow-Origin: http://localhost:5173
        ↓
浏览器允许页面 JavaScript 读取响应
```

常见 Header：

| Header | 含义 |
|---|---|
| `Access-Control-Allow-Origin` | 哪个 Origin 可以读取响应 |
| `Access-Control-Allow-Methods` | 跨域请求允许使用哪些 HTTP 方法 |
| `Access-Control-Allow-Headers` | 跨域请求允许携带哪些请求 Header |
| `Access-Control-Allow-Credentials` | 是否允许浏览器携带并暴露凭据相关请求/响应 |

CORS 不是认证或授权机制。即使服务器设置了 CORS，也仍应由认证、授权、网络隔离等机制决定谁真正可以执行设备操作。

## 3. Preflight：浏览器先询问是否允许

某些跨域请求在发送实际请求前，浏览器会先发送一个 `OPTIONS` 请求，这称为 **preflight（预检）**。例如跨域 `POST` 使用 `Content-Type: application/json` 时，浏览器通常会预检。

```text
浏览器
  ↓ OPTIONS /api/device/run
    Origin: http://localhost:5173
    Access-Control-Request-Method: POST
    Access-Control-Request-Headers: content-type

服务器
  ↓
    Access-Control-Allow-Origin: http://localhost:5173
    Access-Control-Allow-Methods: POST
    Access-Control-Allow-Headers: content-type

浏览器确认允许后
  ↓ POST /api/device/run
```

如果预检响应不满足浏览器要求，浏览器不会发送实际请求，页面会看到 CORS 错误。

## 4. `AllowAnyHeader` 的准确含义

`AllowAnyHeader` 是某些服务器框架提供的配置写法，其协议含义是：对于已允许的跨域 Origin，服务器同意浏览器发送任意名称的**请求 Header**。

它不表示：

- 服务端会信任 Header 内容；
- 服务端自动完成认证；
- 前端可以读取任意**响应 Header**；
- 非浏览器客户端需要 CORS 授权。

浏览器是否能读取某些非简单响应 Header，属于 `Access-Control-Expose-Headers` 的另一项规则。

## 5. 何时需要 CORS

| 场景 | 是否需要 CORS |
|---|---|
| 网页与 API 同协议、同主机、同端口 | 不需要 |
| 浏览器开发服务器调用另一端口的 API | 需要服务器配置 CORS |
| React/Vue 页面调用另一域名 API | 需要服务器配置 CORS |
| 客户端程序、服务器程序、Postman 直接调用 API | 不需要；浏览器同源策略不参与 |

## 结论

- 同源策略是浏览器默认安全边界；
- CORS 是服务器通过 HTTP Header 对浏览器授予跨域读取许可；
- Origin 由协议、主机和端口共同决定；
- Preflight 是浏览器在部分跨域请求前发送的 `OPTIONS` 询问；
- CORS 属于 Web/HTTP 基础，框架只是在此基础上提供配置方式。
