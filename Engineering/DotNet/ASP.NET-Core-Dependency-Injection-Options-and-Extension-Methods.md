# ASP.NET Core Dependency Injection, Options, and Extension Methods

## 所属领域

```text
Engineering Practice
└── .NET
    └── ASP.NET Core
        ├── Dependency Injection
        ├── Options Pattern
        └── Extension Methods
```

## 相关知识

- Inversion of Control
- Interface
- Mock / Real Implementation
- `IServiceCollection`
- `IOptions<T>`
- Configuration Binding

---

## Problem

ASP.NET Core 项目中经常出现：

```csharp
builder.Services.AddControllers();
builder.Services.Configure<SimulationOptions>(builder.Configuration.GetSection("Simulation"));
builder.Services.AddSingleton<IMaterialTableService, MaterialTableService>();
builder.Services.AddHardwareServices(builder.Configuration);
```

理解这些代码，需要理解依赖注入、Options 配置绑定和扩展方法。

---

## Dependency Injection

依赖注入（Dependency Injection, DI）的核心思想：

```text
让框架帮你把需要的对象塞进来，而不是你自己到处 new。
```

示例：

```csharp
public class MaterialActionService
{
    private readonly IRobotActionService _robotActionService;

    public MaterialActionService(IRobotActionService robotActionService)
    {
        _robotActionService = robotActionService;
    }
}
```

调用方只依赖接口 `IRobotActionService`，不关心拿到的是 Mock 还是真实硬件实现。

---

## Interface Injection

最常见用法是注入接口：

```csharp
services.AddSingleton<ICameraVisionService, MockCameraVisionService>();
```

或者：

```csharp
services.AddSingleton<ICameraVisionService, RealCameraVisionService>();
```

业务代码只写：

```csharp
public MyService(ICameraVisionService cameraVisionService)
```

优点：

- 解耦调用方和具体实现。
- 可以按配置切换 Mock / Real。
- 更容易做单元测试。

### `AddSingleton<TService, TImplementation>` 的两个泛型类型参数

下面这句是 ASP.NET Core 中最常见的服务注册写法之一：

```csharp
services.AddSingleton<IPhoneOperationOptionService, PhoneOperationOptionService>();
```

它不是把“接口对象和类对象塞进泛型对象”。`AddSingleton` 是一个**泛型方法**，尖括号中的两个内容是编译期传入的类型参数：

```csharp
AddSingleton<服务类型, 实现类型>()
```

放到例子里就是：

```text
IPhoneOperationOptionService  -> 服务类型：其他代码依赖和请求的能力
PhoneOperationOptionService   -> 实现类型：真正完成该能力的类
```

注册后，DI 容器内部记住一条映射关系：

```text
有人需要 IPhoneOperationOptionService
             ↓
提供 PhoneOperationOptionService 的实例
```

例如 Controller 构造函数只依赖接口：

```csharp
public MaterialTablesController(
    IPhoneOperationOptionService phoneOperationOptionService)
{
    _phoneOperationOptionService = phoneOperationOptionService;
}
```

ASP.NET Core 创建 `MaterialTablesController` 时，会查看构造函数参数。发现需要 `IPhoneOperationOptionService` 后，便在注册表中找到上面的映射，创建或取得 `PhoneOperationOptionService`，并把它传给构造函数。

这类泛型注册还带有编译期约束：第二个类型必须能当作第一个类型使用。换句话说，`PhoneOperationOptionService` 必须实现 `IPhoneOperationOptionService`；否则这句注册代码不能通过编译。

`Singleton` 描述生命周期，而不是接口和实现类之间的关系：

```text
第一次需要 IPhoneOperationOptionService 时
    ↓
DI 容器创建 PhoneOperationOptionService
    ↓
在当前应用进程中保存该对象
    ↓
后续任何地方再需要该接口时，都返回同一个对象
```

因此，这一句可以完整地读成：

```text
把 IPhoneOperationOptionService 注册为单例服务。
它的具体实现是 PhoneOperationOptionService。
后续代码应通过接口取得这项能力，而不是自行 new 实现类。
```

这种写法的价值在于调用方只依赖“能力契约”。后续要替换真实实现、模拟实现，或在测试中提供测试替身时，通常只需替换注册：

```csharp
services.AddSingleton<IPhoneOperationOptionService, MockPhoneOperationOptionService>();
```

使用接口的 Controller 和其他服务不需要修改。

---

## 注入接口后，为什么看不到实现类新增的成员

假设路径服务的注册是：

```csharp
services.AddSingleton<IDataPathService, DataPathService>();
```

业务服务使用构造函数接收接口：

```csharp
private readonly IDataPathService _dataPathService;

public PhoneHardwarePreparationService(IDataPathService dataPathService)
{
    _dataPathService = dataPathService;
}
```

运行时，DI 容器实际提供的对象确实是 `DataPathService`。但 `_dataPathService` 变量的**编译期类型**是 `IDataPathService`，因此 C# 编译器只允许代码访问接口已经声明的成员。

```text
实际对象类型：DataPathService
变量声明类型：IDataPathService
当前代码可访问：IDataPathService 中声明的成员
```

接口规定的是“实现类至少必须提供哪些能力”，不是“实现类只能拥有这些能力”。因此，下面的实现完全合法：

```csharp
public interface IDataPathService
{
    string DataDirectory { get; }
}

public class DataPathService : IDataPathService
{
    public string DataDirectory { get; } = "";

    // 实现类可以有接口之外的额外公开成员。
    public string ConfigDirectory { get; } = "";
}
```

它不会报错，因为 `DataPathService` 已经满足了接口要求。只有当调用方把变量声明为接口类型时，额外成员才不可见：

```csharp
IDataPathService pathService = new DataPathService();

// 可以：DataDirectory 在接口契约中。
var dataDirectory = pathService.DataDirectory;

// 不可以：ConfigDirectory 只属于实现类，接口没有承诺这项能力。
// var configDirectory = pathService.ConfigDirectory;
```

`public` 表示“在访问权限允许时，外部代码可以访问该成员”；它不意味着每一种变量声明类型都会自动暴露此成员。若变量改为具体类型，则可以调用额外成员：

```csharp
DataPathService pathService = new DataPathService();
var configDirectory = pathService.ConfigDirectory;
```

所以，即使在 `DataPathService` 中新增了：

```csharp
public string ConfigDirectory { get; }
```

下面这句仍然不能编译，除非接口也声明该属性：

```csharp
_dataPathService.ConfigDirectory
```

正确做法是把这项能力写进接口契约：

```csharp
public interface IDataPathService
{
    string DataDirectory { get; }
    string ConfigDirectory { get; }
}
```

然后所有 `IDataPathService` 的实现类都必须提供 `ConfigDirectory`。这是接口的价值：调用方只依赖明确公开的能力；替换成 Mock、测试实现或另一种路径实现时，编译器会保证这些实现仍具备同样的能力。

不推荐这样绕过接口：

```csharp
((DataPathService)_dataPathService).ConfigDirectory
```

它会让调用方重新依赖具体类，破坏原本的接口边界；未来替换实现或测试 Mock 时，转换可能失败。

这体现了 C# 的两个相关概念：

```text
编译期类型：决定当前代码能调用哪些成员。
运行时类型：决定实际执行哪个实现。
```

---

## AddSingleton with Factory Lambda

除了这种“接口到实现类”的注册：

```csharp
services.AddSingleton<ICameraVisionService, RealCameraVisionService>();
```

ASP.NET Core DI 还支持用工厂函数注册：

```csharp
services.AddSingleton(sp =>
{
    var devices = sp.GetRequiredService<MaterialTableHardwareDevices>();
    return devices.TransportCamera;
});
```

这里的：

```csharp
sp => { ... }
```

是 C# lambda 表达式，可以理解成“传给框架的一小段函数”。

`sp` 通常表示 `IServiceProvider`，也就是 DI 容器本身。通过它可以拿到已经注册过的其他服务：

```csharp
sp.GetRequiredService<MaterialTableHardwareDevices>()
```

`sp` 不是 C# 关键字，也不是 ASP.NET Core 强制要求的名字。它只是 lambda 表达式的参数名。

下面三种写法含义一样：

```csharp
services.AddSingleton(sp =>
    sp.GetRequiredService<MaterialTableHardwareDevices>().TransportJointRobot);

services.AddSingleton(serviceProvider =>
    serviceProvider.GetRequiredService<MaterialTableHardwareDevices>().TransportJointRobot);

services.AddSingleton(container =>
    container.GetRequiredService<MaterialTableHardwareDevices>().TransportJointRobot);
```

之所以这里可以写 `sp`，是因为 `AddSingleton` 有一个重载方法，接收类似这样的工厂函数：

```csharp
Func<IServiceProvider, TService>
```

可以读成：

```text
你给我一个函数。
这个函数接收 IServiceProvider。
这个函数返回要注册的服务对象。
```

所以：

```csharp
services.AddSingleton(sp =>
    sp.GetRequiredService<MaterialTableHardwareDevices>().TransportJointRobot);
```

可以理解为：

```text
注册一个单例。
当 DI 容器需要创建这个单例时，它会把自己作为参数传进 lambda。
lambda 里的 sp 就是这个 DI 容器。
然后代码从容器里拿 MaterialTableHardwareDevices，
再返回里面的 TransportJointRobot。
```

这类 lambda 只有在框架调用它时才会执行，不是在程序启动读到这一行时立刻执行。

完整含义是：

```text
注册一个单例对象。
第一次有人需要这个对象时，DI 容器会执行这段 lambda。
lambda 里可以使用 IServiceProvider 拿其他服务，也可以写校验逻辑、选择逻辑、初始化逻辑。
lambda 的 return 值就是最终放进 DI 容器的那个单例对象。
```

例如硬件初始化里常见这种写法：

```csharp
services.AddSingleton(sp =>
{
    var robotControllers = Manager.Instance.GetHardwares<IRobotController>();

    if (robotControllers == null || robotControllers.Count < 2)
    {
        throw new InvalidOperationException("Hardware.config 需要配置 2 个 IRobotController。");
    }

    return new MaterialTableHardwareDevices
    {
        TransportRobot = robotControllers[0],
        PhoneRobot = robotControllers[1]
    };
});
```

这个注册不是马上 new 一个对象塞进去，而是告诉 DI：

```text
当你需要 MaterialTableHardwareDevices 时，执行这段代码来创建它。
创建出来以后按 Singleton 保存，同一个进程里后续都复用同一个实例。
```

如果 lambda 返回类型可以被编译器推断出来，`AddSingleton(sp => { ... })` 会注册这个返回类型。

有时为了让代码更清楚，也可以显式写注册类型：

```csharp
services.AddSingleton<MaterialTableHardwareDevices>(sp =>
{
    ...
});
```

在工程代码里，显式写泛型类型通常更容易读，也更不容易因为返回类型变化导致注册类型变得不明显。

---

## Concrete Class Injection

注入具体类也属于依赖注入。

例如：

```csharp
services.AddSingleton<MaterialTableCalibrationHelper>();
```

对于纯工具类、配置辅助类、稳定且不会替换的服务，直接注入具体类是合理的。不需要为了接口而强行创建接口。

---

## Options Pattern

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

---

## Extension Methods

ASP.NET Core 官方注册方式常见如下：

```csharp
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();
```

自己的代码也可以写成类似风格：

```csharp
builder.Services.AddHardwareServices(builder.Configuration);
```

这依赖 C# 扩展方法。

扩展方法条件：

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

---

## Why Extension Methods for Service Registration?

把一长串依赖注册代码封装为扩展方法，可以保持 `Program.cs` 清爽。

```text
Program.cs
├── AddControllers
├── Configure Options
├── Add Repository
├── Add Domain Services
└── AddHardwareServices
```

优点：

- 模块化。
- 高内聚。
- 与 ASP.NET Core 官方风格一致。
- 真实硬件 / Mock 注册逻辑可以集中管理。

---

## Example: Mock / Real Switch

```csharp
if (simulation.Enabled)
{
    services.AddSingleton<ICameraVisionService, MockCameraVisionService>();
}
else
{
    services.AddSingleton<ICameraVisionService, RealCameraVisionService>();
}
```

调用方不需要知道当前模式：

```csharp
public RobotActionService(ICameraVisionService visionService)
{
    _visionService = visionService;
}
```

这就是 DI 对工程复杂度的核心价值。
