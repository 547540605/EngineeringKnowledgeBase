# ASP.NET Core Options Pattern

## 所属领域

```text
Engineering
└── .NET
    └── ASP.NET Core
        └── Configuration
            └── Options Pattern
```

## 相关知识

- Configuration Binding
- `IOptions<T>`
- `appsettings.json`
- [ASP.NET Core Dependency Injection](ASP.NET-Core-Dependency-Injection.md)

---

Options Pattern 用强类型对象承载配置，避免业务代码直接依赖字符串形式的配置键。

配置绑定常见写法：

```csharp
builder.Services.Configure<SimulationOptions>(
    builder.Configuration.GetSection("Simulation"));
```

它会把 `appsettings.json` 中的配置段绑定到强类型类。

```json
{
  "Simulation": {
    "Enabled": true,
    "DefaultTaskDurationMs": 3000
  }
}
```

对应：

```csharp
public class SimulationOptions
{
    public bool Enabled { get; set; }
    public int DefaultTaskDurationMs { get; set; }
}
```

使用时通过构造函数注入：

```csharp
public MyService(IOptions<SimulationOptions> options)
{
    var simulationOptions = options.Value;
}
```
