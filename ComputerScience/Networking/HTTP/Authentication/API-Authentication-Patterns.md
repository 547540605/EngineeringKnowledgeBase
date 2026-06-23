# API Authentication Patterns

## 所属领域

```text
Computer Science
└── Networking
    └── HTTP
        └── Authentication
```

## 相关知识

- [HTTP/HTTPS 报文格式](../HTTP-Message-Format.md)（前置知识）
- HTTP Headers
- TLS/HTTPS
- Session Management
- Token-based Authentication
- Cryptography (HMAC, RSA)

---

## Problem

集成第三方 API 时，首先要搞清楚它使用哪种认证方式。

不同认证方式在安全性、复杂度、适用场景上差异很大。

---

## 常见认证模式对比

### 1. API Key（固定密钥）

**机制**：客户端在每次请求中携带一个固定的密钥（Key），通常放在 HTTP Header 或 Query String 中。

**特点**：
- 无状态，不需要登录/换 Token 流程
- 密钥固定，不会过期（除非手动轮换）
- 实现最简单

**放置位置**：
```text
Header:  X-API-Key: your-key-here
Header:  xyy-app-id: xxx + xyy-app-key: yyy   （双 Key 模式）
Query:   ?apiKey=your-key-here
```

**适用场景**：
- 服务端对服务端（Server-to-Server）
- 内网系统集成
- 硬件设备 API（AGV 调度、IoT 平台等）

**安全注意**：
- 必须配合 HTTPS 使用，否则密钥在网络上明文传输
- 密钥泄露后需要手动轮换
- 不适合暴露在前端/客户端代码中

**实际案例**：
- 仙工 M4 调度系统：使用 `xyy-app-id` + `xyy-app-key` 双 Header
- 很多云服务的管理 API（阿里云、腾讯云的部分接口）

---

### 2. Basic Auth（基础认证）

**机制**：将 `username:password` 进行 Base64 编码后放在 `Authorization` Header 中。

**格式**：
```text
Authorization: Basic base64(username:password)
```

**特点**：
- 实现简单
- 每次请求都携带凭证
- Base64 不是加密，只是编码，必须配合 HTTPS

**适用场景**：
- 简单的内部 API
- 命令行工具认证
- Git HTTP 协议认证

---

### 3. Bearer Token / JWT

**机制**：客户端先通过登录接口获取 Token，后续请求在 `Authorization` Header 中携带 Token。

**格式**：
```text
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**流程**：
```text
1. POST /login  {username, password}  →  返回 Token
2. 后续请求携带 Token
3. Token 过期后需要刷新或重新登录
```

**特点**：
- Token 有过期时间，安全性更高
- 服务端可以在 Token 中编码用户信息（JWT）
- 需要处理 Token 过期和刷新逻辑

**适用场景**：
- Web 应用 / 移动端应用
- 需要用户身份识别的 API
- 微服务间认证

---

### 4. OAuth 2.0

**机制**：一种授权框架，允许第三方应用在用户授权下访问资源，而不需要获取用户密码。

**常见模式**：

| Grant Type | 适用场景 |
|---|---|
| Authorization Code | Web 应用（最安全） |
| Client Credentials | 服务端对服务端（无用户参与） |
| Implicit | 已废弃，不推荐 |
| PKCE | 移动端 / SPA |

**特点**：
- 最复杂但最灵活
- 支持细粒度的权限控制（Scope）
- 标准化程度高

**适用场景**：
- 开放平台（微信、GitHub、Google API）
- 需要第三方授权的场景

---

### 5. Session / Cookie

**机制**：客户端登录后服务端创建 Session，通过 Cookie 传递 Session ID。

**特点**：
- 有状态，服务端需要存储 Session
- 浏览器自动管理 Cookie
- 不适合跨域 / 移动端

**适用场景**：
- 传统 Web 应用
- 同域名下的前后端交互

---

## 快速判断指南

遇到新的 API 集成时，按以下顺序检查：

```text
1. 文档里有没有提到 "AppId" / "AppKey" / "API Key"？
   → API Key 模式

2. 有没有 /login 或 /token 接口？
   → Bearer Token 模式

3. 有没有 /authorize 或 /oauth 开头的接口？
   → OAuth 2.0 模式

4. 请求示例里有没有 Authorization: Basic xxx？
   → Basic Auth 模式

5. 是浏览器端应用且使用 Cookie？
   → Session 模式
```

---

## Notes

- 实际项目中经常会遇到"变种"，比如 API Key + 签名（HMAC）、Token + 刷新机制等
- 安全性排序（粗略）：OAuth 2.0 > JWT > API Key > Basic Auth > Session(HTTP)
- 无论哪种方式，**HTTPS 是基础**，HTTP 明文传输下任何认证方式都不安全
