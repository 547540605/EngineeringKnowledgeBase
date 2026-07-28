# Domain Models, Service Interfaces, and HTTP APIs

## 所属领域

```text
Engineering
└── Software Engineering
    ├── Domain Modeling
    ├── Service Boundary
    └── API Design
```

## 相关知识

- Domain Model
- DTO
- Interface
- Controller
- Clean Architecture
- Dependency Injection
- [ASP.NET Core Controller Routing and Parameter Binding](../DotNet/ASPNETCore/ASP.NET-Core-Controller-Routing-and-Parameter-Binding.md)

---

## Problem

新手写 WebAPI 时容易直接从 URL 开始设计：

```text
POST /api/Lock
POST /api/PickMaterial
```

但对于业务系统，更稳的顺序通常是：

```text
先定义业务里的东西
再定义系统内部能力边界
最后接 HTTP Controller
```

---

## Domain Models

领域模型回答：

```text
系统里有哪些东西？
```

示例：

| 模型 | 含义 |
|---|---|
| `MaterialTableInfo` | 物料台 |
| `MaterialSlotInfo` | 槽位 |
| `MaterialInfo` | 手机 / 物料 |
| `LockRequest` | AGV 发起的锁定请求 |
| `MaterialActionRequest` | AGV 到位后发起的取料或放料请求 |

领域模型用于表达业务名词，而不是直接表达 HTTP 细节。

---

## Service Interfaces

服务接口回答：

```text
系统里有哪些能力？
这些能力由谁负责？
```

示例：

| 接口 | 职责 |
|---|---|
| `IMaterialTableService` | 当前物料台信息、槽位和物料维护 |
| `IMaterialLockService` | 当前物料台锁定、心跳和释放 |
| `IMaterialActionService` | 当前物料台取料和放料动作 |

这些 `interface` 是代码内部边界，不是外部客户端直接调用的 WebAPI。

---

## HTTP APIs

HTTP 接口回答：

```text
外部客户端通过哪个 URL 调用系统能力？
```

例如：

```text
POST /api/Lock
```

Controller 可以把这个 HTTP 请求映射到内部服务：

```csharp
_materialLockService.Lock(request)
```

---

## Layer Relationship

推荐关系：

```text
HTTP Client
    ↓
Controller
    ↓
Service Interface
    ↓
Service Implementation
    ↓
Repository / Hardware / External System
```

Controller 不应该承载大量业务逻辑。它主要负责：

- 接收 HTTP 入参。
- 调用服务层。
- 返回统一响应。
- 处理 HTTP 相关行为。

业务规则应放在服务层。

---

## Why This Order?

先模型、再接口、再 HTTP 的好处：

- 不会一开始就被 URL 和 HTTP 参数形式绑死。
- 业务名词更清楚。
- 代码不容易变成散乱字符串和布尔值。
- 真实硬件、模拟实现、JSON 文件、数据库可以替换。
- Controller 不需要知道太多底层细节。
- 新需求变化时，可以先判断模型和服务边界是否变化，再决定 HTTP 接口是否变化。

---

## Example

```text
LockRequest
    ├── AgvName
    └── MaterialId?
```

`LockRequest` 是领域动作的输入模型。

```csharp
public interface IMaterialLockService
{
    LockResultInfo Lock(LockRequest request);
}
```

`IMaterialLockService` 定义系统内部能力。

```csharp
[HttpPost("Lock")]
public ApiResult<LockResultInfo> Lock([FromBody] LockRequest request)
{
    var result = _lockService.Lock(request);
    return ApiResult<LockResultInfo>.Ok(result);
}
```

Controller 把 HTTP 请求接到服务能力上。
