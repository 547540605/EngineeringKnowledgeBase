# ASP.NET Core Service Registration Extension Methods

## 所属领域

```text
Engineering Practice
└── .NET
    └── ASP.NET Core
        └── Service Registration
            └── Extension Methods
```

## 相关知识

- C# Extension Methods
- `IServiceCollection`
- Application Composition Root
- [ASP.NET Core Dependency Injection](ASP.NET-Core-Dependency-Injection.md)
- [ASP.NET Core Options Pattern](ASP.NET-Core-Options-Pattern.md)

---

ASP.NET Core 官方注册方式常见如下：

```csharp
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();
```

自己的代码也可以写成类似风格：

```csharp
builder.Services.AddHardwareServices(builder.Configuration);
```

这依赖 C# 扩展方法。扩展方法需要满足：

1. 类必须是 `static class`。
2. 方法必须是 `static method`。
3. 第一个参数前加 `this`，指定扩展目标类型。

示例：

```csharp
public static class HardwareServiceRegistration
{
    public static IServiceCollection AddHardwareServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ...
        return services;
    }
}
```

## 为什么用于服务注册

把一长串依赖注册代码封装为扩展方法，可以保持 `Program.cs` 清爽。

```text
Program.cs
├── AddControllers
├── Configure Options
├── Add Repository
├── Add Domain Services
└── AddHardwareServices
```

这样可以获得：

- 模块化。
- 高内聚。
- 与 ASP.NET Core 官方风格一致。
- 真实硬件与 Mock 注册逻辑集中管理。
