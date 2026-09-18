# ASP.NET Core API Response Wrapper ApiResult

## 所属领域

```text
Engineering
└── .NET
    └── ASP.NET Core
        └── API Design
```

## 相关知识

- DTO
- JSON Serialization
- Generic Type
- Error Code
- [C# Generics](../CSharp/CSharp-Generics.md)
- [C# Default Values](../CSharp/CSharp-Default-Values.md)
- [C# Value, Reference, and Nullable Types](../CSharp/CSharp-Value-Reference-and-Nullable-Types.md)

---

## Problem

WebAPI 如果每个接口返回结构都不同，前端、AGV 客户端和测试代码都需要分别处理成功、失败、错误消息和业务数据。

统一响应包装可以让接口返回稳定、可预测。

---

## Solution

常见统一结构：

```csharp
public class ApiResult<T>
{
    public bool Success { get; set; }
    public string Code { get; set; } = "OK";
    public string? Message { get; set; }
    public T? Data { get; set; }
    public double? DurationMs { get; set; }
}
```

字段含义：

| 字段 | 含义 |
|---|---|
| `Success` | 本次调用是否成功 |
| `Code` | 机器可读的结果码或错误码 |
| `Message` | 人类可读的说明 |
| `Data` | 业务数据，类型由泛型 `T` 决定 |
| `DurationMs` | 可选耗时，用于诊断 |

---

## Generics

`T` 是泛型，表示这次接口返回的数据类型。

```csharp
ApiResult<string>
ApiResult<MaterialInfo>
ApiResult<List<MaterialInfo>>
```

统一外壳不变，但 `Data` 类型可以变化。

---

## Success Example

```csharp
return ApiResult<object>.Ok(new
{
    Service = "MaterialTable",
    Status = "OK"
});
```

返回 JSON 可能类似：

```json
{
  "success": true,
  "code": "OK",
  "message": "成功",
  "data": {
    "service": "MaterialTable",
    "status": "OK"
  }
}
```

---

## Failure Example

```csharp
return ApiResult<object>.Fail("TABLE_LOCKED", "物料台已被锁定");
```

失败时常见处理：

```csharp
Data = default
```

对于 `class`、`string`、`object` 来说，`default` 通常是 `null`。

---

## Why not only HTTP status code?

HTTP 状态码表达传输层或协议层结果，例如：

- `200 OK`
- `400 Bad Request`
- `404 Not Found`
- `500 Internal Server Error`

业务系统还需要表达业务失败原因，例如：

- 物料台已被锁定。
- AGV 不是持锁方。
- 物料不存在。
- 机械手动作失败。

这些业务结果适合放在 `Code` 和 `Message` 中。

---

## Notes

统一返回结构不是强制标准，但在内部工程系统中很常见，优点是：

- 前端处理简单。
- 自动化测试断言稳定。
- 日志和排查更容易。
- API 调用方可以根据 `Code` 做明确分支。

缺点是：

- 如果滥用 `200 OK + Success=false`，可能弱化 HTTP 状态码语义。
- 对公网 REST API，需要更谨慎地同时设计 HTTP status code 和业务 error code。
