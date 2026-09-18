# HTTP/HTTPS 报文格式

## 所属领域

```text
Computer Science
└── Networking
    └── HTTP
```

## 相关知识

- TCP/IP
- TLS/SSL
- [API Authentication Patterns](Authentication/API-Authentication-Patterns.md)
- REST API
- URL 编码
- [HTTP Cache-Control](HTTP-Cache-Control.md)
- [CORS、同源策略与 Preflight 预检请求](CORS-Same-Origin-Policy-and-Preflight.md)

---

## Problem

HTTP 是 Web 通信的基础协议。理解报文格式是理解所有 HTTP 相关技术（认证、API 调用、文件上传等）的前提。

---

## HTTP 报文总览

HTTP 通信由**请求（Request）**和**响应（Response）**组成，都遵循相同的基本结构：

```text
起始行（Start Line）
头部（Headers）
空行
主体（Body）（可选）
```

---

## 请求报文（Request）

### 结构

```text
┌─────────────────────────────────────────────────┐
│  请求行（Request Line）                           │
│  POST /api/fleet/orders/create HTTP/1.1          │
├─────────────────────────────────────────────────┤
│  请求头（Request Headers）                        │
│  Host: 192.168.1.100:8088                        │
│  Content-Type: application/json                  │
│  xyy-app-id: your-app-id                         │
│  xyy-app-key: your-app-key                       │
├─────────────────────────────────────────────────┤
│  空行（CRLF）                                     │
├─────────────────────────────────────────────────┤
│  请求体（Request Body）                           │
│  {"sceneId":"xxx","steps":[...]}                 │
└─────────────────────────────────────────────────┘
```

### 请求行

```text
方法  路径  协议版本
POST /api/fleet/orders/create HTTP/1.1
```

**常见方法**：

| 方法 | 用途 | 有 Body 吗 | 幂等性 |
|---|---|---|---|
| GET | 获取资源 | 通常没有 | 是 |
| POST | 创建/提交数据 | 有 | 否 |
| PUT | 全量更新资源 | 有 | 是 |
| PATCH | 部分更新资源 | 有 | 否 |
| DELETE | 删除资源 | 通常没有 | 是 |

> **幂等性**：同一个请求发多次，效果和发一次相同。GET 获取同一个资源，结果一样；POST 创建订单，发两次会创建两个。

### 请求头（Headers）

Headers 是**键值对**，每行一个，用冒号分隔：

```text
Key: Value
```

**常见请求头**：

| Header | 含义 | 示例 |
|---|---|---|
| `Host` | 目标服务器地址 | `192.168.1.100:8088` |
| `Content-Type` | 请求体的数据格式 | `application/json` |
| `Content-Length` | 请求体的字节长度 | `128` |
| `Authorization` | 认证凭证 | `Bearer eyJhbG...` |
| `Accept` | 客户端期望的响应格式 | `application/json` |
| `User-Agent` | 客户端标识 | `Mozilla/5.0...` |
| **自定义 Header** | 业务自定义 | `xyy-app-id: xxx` |

> **重点**：API 认证信息通常就放在 Header 里。比如 M4 的 `xyy-app-id` 和 `xyy-app-key` 就是两个自定义 Header。

### 请求体（Body）

- GET 请求**通常没有** Body，参数放在 URL 的 Query String 里
- POST/PUT 请求**通常有** Body

**常见 Body 格式**：

| Content-Type | 格式 | 使用场景 |
|---|---|---|
| `application/json` | JSON | 现代 API 最常用 |
| `application/x-www-form-urlencoded` | key=value&key2=value2 | HTML 表单提交 |
| `multipart/form-data` | 分段编码 | 文件上传 |
| `text/xml` | XML | 老式 SOAP 接口 |

---

## 响应报文（Response）

### 结构

```text
┌─────────────────────────────────────────────────┐
│  状态行（Status Line）                            │
│  HTTP/1.1 200 OK                                 │
├─────────────────────────────────────────────────┤
│  响应头（Response Headers）                       │
│  Content-Type: application/json                  │
│  Content-Length: 256                              │
├─────────────────────────────────────────────────┤
│  空行（CRLF）                                     │
├─────────────────────────────────────────────────┤
│  响应体（Response Body）                          │
│  {"code":0,"msg":"success","data":{...}}         │
└─────────────────────────────────────────────────┘
```

### 状态行

```text
协议版本  状态码  原因短语
HTTP/1.1 200 OK
```

### 常见状态码

| 范围 | 类别 | 常见状态码 |
|---|---|---|
| 1xx | 信息性 | 100 Continue |
| **2xx** | **成功** | **200 OK**, 201 Created, 204 No Content |
| 3xx | 重定向 | 301 Moved, 302 Found, 304 Not Modified |
| **4xx** | **客户端错误** | **400 Bad Request**, **401 Unauthorized**, **403 Forbidden**, **404 Not Found** |
| **5xx** | **服务端错误** | **500 Internal Server Error**, 502 Bad Gateway, 503 Service Unavailable |

> **认证相关状态码**：
> - `401 Unauthorized`：未认证（没带凭证或凭证错误）
> - `403 Forbidden`：已认证但没权限

---

## GET vs POST 的报文区别

### GET 请求

参数在 URL 里，没有 Body：

```text
GET /api/fleet/robots/all-all?sceneId=xxx&robotNames=SW500 HTTP/1.1
Host: 192.168.1.100:8088
xyy-app-id: your-app-id
xyy-app-key: your-app-key

（无 Body）
```

### POST 请求

参数在 Body 里：

```text
POST /api/fleet/orders/create HTTP/1.1
Host: 192.168.1.100:8088
Content-Type: application/json
xyy-app-id: your-app-id
xyy-app-key: your-app-key

{"sceneId":"xxx","steps":[{"location":"LM762"}]}
```

### 关键区别

| 对比项 | GET | POST |
|---|---|---|
| 参数位置 | URL Query String | Request Body |
| 参数可见性 | URL 中可见（浏览器地址栏、日志） | Body 中，不在 URL 里 |
| 长度限制 | URL 有长度限制（约 2048 字符） | Body 无实际限制 |
| 缓存 | 浏览器可缓存 | 不缓存 |
| 用途 | 查询/获取数据 | 提交/修改数据 |

---

## HTTP vs HTTPS

### HTTP（明文传输）

```text
客户端  ──── HTTP 明文报文 ────>  服务端
        <─── HTTP 明文报文 ────
```

报文在网络上以**明文**传输，任何中间节点都可以看到完整内容（包括 Header 里的认证信息）。

### HTTPS（加密传输）

```text
客户端  ──── TLS 加密报文 ────>  服务端
        <─── TLS 加密报文 ────
```

HTTPS = HTTP + TLS，在 HTTP 报文外面包了一层加密。报文格式本身不变，但传输过程是加密的。

### TLS 握手简化流程

```text
1. 客户端 → 服务端: ClientHello（支持的加密算法列表）
2. 服务端 → 客户端: ServerHello + 证书（含公钥）
3. 客户端验证证书，生成对称密钥，用公钥加密发送
4. 双方用对称密钥加密后续所有通信
```

### 关键理解

- HTTPS 加密的是**传输层**，不是报文格式本身
- URL 的路径和 Query String **在 HTTPS 下也是加密的**（只有域名通过 SNI 可见）
- 内网系统（如 AGV 调度）常使用 HTTP，因为已经在可信网络内
- 公网 API 必须使用 HTTPS

---

## 实际抓包示例

用 Fiddler 或 Wireshark 抓到的 M4 请求实际报文：

```text
GET /api/fleet/robots/all-all?sceneId=scene001&robotNames=SW500&rawAll=true HTTP/1.1
Host: 192.168.1.100:8088
Connection: keep-alive
xyy-app-id: demo-app-id
xyy-app-key: demo-app-key

```

对应的 C# 代码：

```csharp
string url = GetUrl($"/api/fleet/robots/all-all?sceneId={sceneId}&robotNames={robotName}&rawAll=true");
string response = HttpRequestHelper.Get(url, GetM4Headers());
```

> 理解了报文格式，就理解了代码在做什么：拼 URL → 加 Header → 发出去 → 读响应 Body。

---

## Notes

- HTTP/1.1 是文本协议，报文是人类可读的文本
- HTTP/2 和 HTTP/3 使用二进制帧，但逻辑结构相同
- `Content-Type` 和 `Content-Length` 是最重要的两个 Header，搞错了对方就解析不了
- 调试 API 时，推荐用 Postman、Fiddler 或浏览器 F12 的 Network 面板查看原始报文

