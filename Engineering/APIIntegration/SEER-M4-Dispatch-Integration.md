# 仙工 M4 调度系统集成经验

## 所属领域

```text
Engineering Practice
└── API Integration
    └── Third-Party System Integration
        └── 仙工（SEER）AGV 调度系统
            └── M4 调度系统
```

## 相关知识

- [API Authentication Patterns](../../ComputerScience/Networking/HTTP/Authentication/API-Authentication-Patterns.md)
- 策略模式（Strategy Pattern）
- HTTP REST API 集成
- AGV（自动导引运输车）调度

---

## Background

仙工（SEER）提供两套 AGV 调度系统：

| 系统 | 通信方式 | 认证方式 | 特点 |
|---|---|---|---|
| 老版 RDS | HTTP REST | 无认证 | 简单直接，API 路径如 `setOrder`、`lock` |
| M4 调度系统 | HTTP REST | AppId + AppKey Header | 功能更全，API 路径如 `/api/fleet/...` |

两套系统面向同一类机器人，但 API 接口完全不同。

---

## M4 认证机制

### 认证类型

**Stateless API Key（无状态双 Key 认证）**

### 具体方式

每次 HTTP 请求需要在 Header 中携带两个字段：

```text
xyy-app-id: your-app-id
xyy-app-key: your-app-key
```

### 特点

- **无状态**：不需要登录、不需要换 Token、没有 Session
- **不过期**：AppId 和 AppKey 由 M4 后台生成后固定使用
- **每次请求都带**：GET 和 POST 请求都需要
- **无签名**：不像一些平台要求对请求体做 HMAC 签名

### 代码实现

```csharp
private Dictionary<string, string> GetM4Headers()
{
    return new Dictionary<string, string>
    {
        { "xyy-app-id", _config.M4Config.M4AppId },
        { "xyy-app-key", _config.M4Config.M4AppKey }
    };
}

// 使用
string retMsg = HttpRequestHelper.Get(url, GetM4Headers());
string retMsg = HttpRequestHelper.Post(url, body, GetM4Headers());
```

### 注意事项

- M4 文档中没有专门的"认证章节"说明这两个 Header。它们出现在 API 接口说明的请求头部分
- AppId 和 AppKey 需要在 M4 管理后台获取

---

## M4 核心概念

### Scene（场景）

M4 用"场景"来组织管理，几乎所有 API 都需要传 `sceneId` 参数。一个场景包含地图、机器人、站点等信息。

### 运单（TransportOrder）

M4 不是直接给机器人发"移动到某点"的命令，而是创建一个运单，由调度系统自动分配机器人执行。

### 软急停（Soft EMC）

M4 没有直接的"暂停任务"接口。实现暂停效果需要使用"软急停"（`set-soft-emc`），让机器人立即停住。恢复时取消软急停即可。

---

## M4 关键 API 映射

从业务操作到 M4 API 的映射关系：

| 业务操作 | 协议 | API/端口 | Method |
|---|---|---|---|
| 查询机器人全部状态 | HTTP | `/api/fleet/robots/all-all?sceneId=xxx&rawAll=true` | GET |
| 查询机器人当前点位 | HTTP | `/api/fleet/robots/query-point?sceneId=xxx&robotName=yyy` | GET |
| 查询场景站点列表 | TCP | `19204 端口 (MsgType=1301)` | Socket |
| 创建运单（导航到目标点） | HTTP | `/api/fleet/orders/create` | POST |
| 取消运单 | HTTP | `/api/fleet/orders/cancel` | POST |
| 软急停（暂停） | HTTP | `/api/fleet/robots/{sceneId}/set-soft-emc` (enable=true) | POST |
| 取消软急停（恢复） | HTTP | `/api/fleet/robots/{sceneId}/set-soft-emc` (enable=false) | POST |
| 获取/释放控制权 | HTTP | `/api/fleet/robots/master` | POST |
| 查询地图列表 | HTTP | `/api/fleet/robots/{sceneId}/maps/{robotName}` | GET |

> **特别说明 (站点列表)**：M4 HTTP `/scenes/schema` 接口返回的点位缺少 `type`、`desc`、`r` 属性。为解决此问题，使用了 Robokit 原生 TCP 协议 (端口 19204，包头 `0x5A 0x01` 大端序) 发送 `1301` 请求获取完整的 `stations` 数据。

### all-all 接口详解

`GET /api/fleet/robots/all-all` 是最重要的接口，一次调用返回机器人的全量状态：

```json
{
  "机器人名": {
    "online": true,        // 是否在线
    "x": -46.141,          // X 坐标
    "y": 55.947,           // Y 坐标
    "d": -3.14159,         // 朝向 (rad)
    "p": "LM762",          // 当前站点名称
    "battery": 1.0,        // 电量 0~1
    "charging": false,     // 是否充电
    "emc": false,          // 硬急停
    "sEmc": false,         // 软急停
    "blocked": false,      // 是否被阻挡
    "map": "xxx.smap",     // 当前地图
    "mapMd5": "1e43fb...", // 地图 MD5
    "c": 0.53955,          // 定位置信度
    "reloc": "Success",    // 定位状态
    "cff": true,           // 是否受调度控制
    "controller": "M4QuickFleet", // 控制者名称
    "cmdStatus": "Idle",   // Idle/Moving/Failed
    "cuOrderId": "",       // 当前运单 ID
    "raw": {               // 需要 rawAll=true 才返回
      "target_id": "",     // 目标站点
      "task_status": 0,    // 0=空闲, 2=运行中
      "current_station": "LM762",
      "current_map": "xxx.smap",
      "emergency": false,
      "soft_emc": false,
      "confidence": 0.5395
    }
  }
}
```

> **关键发现**：加上 `rawAll=true` 参数后，响应中会包含 `raw` 子对象，里面的字段（如 `target_id`、`task_status`）和老版直连机器人时拿到的字段格式完全一致。

---

## 适配器模式实践

### 架构设计

使用**策略模式**实现老版 RDS 和 M4 的运行时切换：

```text
IRDSController (接口)
├── SeerRDSController (老版实现)
└── M4RDSController   (M4 实现)
```

AgvRobot 通过配置决定使用哪个实现：

```csharp
switch (_config.RDSType)
{
    case RDSType.Old:
        _seerRDSController = new SeerRDSController(_config);
        break;
    case RDSType.M4:
        _seerRDSController = new M4RDSController(_config);
        break;
}
```

### M4 特有配置

```csharp
public class M4Config
{
    public string M4AppId { get; set; }
    public string M4AppKey { get; set; }
    public string M4SceneId { get; set; }
}
```

### 无法完全对齐的功能

| 功能 | 原因 | 处理方式 |
|---|---|---|
| `StationInfo.Type / Desc` | M4 点位没有类型/描述属性 | 返回空字符串 |
| `SetTaskCharge()` | M4 充电由调度系统自动管理 | 记日志返回成功 |
| `SwitchMap()` | M4 多楼层自动切换地图 | 记日志返回成功 |
| `GetTargetPath()` | M4 无"未完成路径"概念 | 返回空列表 |
| 暂停/恢复 | M4 无直接暂停运单接口 | 用软急停模拟 |

---

## Notes

- M4 的 `battery` 字段范围是 0~1，需要乘以 100 转成百分比
- M4 的急停分硬急停（`emc`）和软急停（`sEmc`），老版只有一个 `emergency`
- M4 创建运单时必须指定 `sceneId`，这是和老版最大的区别之一
- `all-all` 接口如果不加 `rawAll=true`，不会返回 `raw` 字段，拿不到 `target_id` 和 `task_status`
