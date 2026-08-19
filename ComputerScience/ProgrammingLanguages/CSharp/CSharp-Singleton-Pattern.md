# C# 单例模式（Singleton Pattern）

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Design Patterns
            └── Creational Patterns
                └── Singleton Pattern
```

## 相关知识

- [C# sealed 类与继承边界](CSharp-Sealed-Classes-and-Inheritance-Boundaries.md)
- [C# 访问修饰符与作用域](CSharp-Access-Modifiers-and-Scope.md)
- [C# 字段与属性](CSharp-Fields-and-Properties.md)
- [C# 资源释放与对象所有权](CSharp-Resource-Disposal-and-Ownership.md)
- [ASP.NET Core 依赖注入](../../../Engineering/DotNet/ASPNETCore/ASP.NET-Core-Dependency-Injection.md)
- CLR 类型初始化器（`.cctor`）与静态构造函数
- `Lazy<T>` 延迟初始化

---

## 核心定义与设计目标

单例模式（Singleton Pattern）属于创建型设计模式，其核心目标是：

```text
1. 保证一个类在整个应用程序生命周期中只有唯一一个实例（Instance）。
2. 提供一个全局受控的访问入口。
```

常见使用场景：
- 全局状态/硬件设备控制器（如屏幕检测、串口通信管理器、电动夹爪控制器）
- 共享缓存管理器
- 全局配置中心
- 耗费系统资源的单一服务（如日志记录器、连接池）

---

## 核心三要素

在 C# 中实现一个标准单例类，必须具备以下三个基本约束：

```csharp
internal sealed class ScreenChangeDetectionController
{
    // 1. 全局静态只读访问点（提供唯一实例）
    public static ScreenChangeDetectionController Instance { get; } = new ScreenChangeDetectionController();

    // 2. 私有构造函数（阻止外部通过 new 随意创建实例）
    private ScreenChangeDetectionController()
    {
    }
}
```

1. **私有构造函数（`private constructor`）**：阻止类外部调用 `new` 构造多个对象。
2. **密封类修饰符（`sealed`）**：防止派生类继承并破坏单例的唯一性约束。
3. **静态属性/字段（`public static ... Instance`）**：对外暴露全局唯一的实例引用。

---

## 常见实现方案与演进

### 方案 1：静态属性初始化（现代 C# 最推荐写法）

```csharp
internal sealed class ScreenChangeDetectionController
{
    public static ScreenChangeDetectionController Instance { get; } = new ScreenChangeDetectionController();

    private ScreenChangeDetectionController()
    {
    }

    public void StartDetection()
    {
        // 业务逻辑
    }
}
```

#### 为什么如此简洁却天然线程安全？
在 C# 中，静态属性或静态字段初始化器会被编译器编译进类型的**静态构造函数（`.cctor` / Type Initializer）**：
- **CLR 保证线程安全**：.NET 运行时规范（ECMA-335）严格保证，任何类型的静态初始化过程在整个进程中**必定且仅会被一个线程执行一次**。
- **按需延迟加载（Lazy）**：只有当代码第一次引用该类（如首次调用 `ScreenChangeDetectionController.Instance`）时，CLR 才会触发类型初始化。
- **零锁开销**：无需编写任何 `lock` 锁机制，运行时直接在元数据与类加载层面保障安全。

---

### 方案 2：`Lazy<T>` 显式延迟初始化

当单例对象的初始化开销非常大，或者希望精确控制异常传播与线程安全模式时，可以使用 .NET 提供的 `Lazy<T>`：

```csharp
public sealed class HeavyVisionService
{
    private static readonly Lazy<HeavyVisionService> _lazyInstance =
        new Lazy<HeavyVisionService>(() => new HeavyVisionService(), LazyThreadSafetyMode.ExecutionAndPublication);

    public static HeavyVisionService Instance => _lazyInstance.Value;

    private HeavyVisionService()
    {
        // 耗时的初始化逻辑
    }
}
```

* `LazyThreadSafetyMode.ExecutionAndPublication`：保证多线程并发访问时，只有一个线程能执行工厂委托，并且所有线程共享同一个创建成功的实例。

---

### 方案 3：传统双重检查锁定（DCL，历史方案）

早期 C#/Java 中常见的写法，现在通常**不建议**在日常业务代码中使用：

```csharp
public sealed class LegacySingleton
{
    private static volatile LegacySingleton? _instance;
    private static readonly object _lock = new object();

    private LegacySingleton() { }

    public static LegacySingleton Instance
    {
        get
        {
            if (_instance == null)
            {
                lock (_lock)
                {
                    if (_instance == null)
                    {
                        _instance = new LegacySingleton();
                    }
                }
            }
            return _instance;
        }
    }
}
```

* **缺点**：代码冗长，需要手动处理 `volatile` 与锁对象，容易误写导致并发隐患。在现代 C# 中已被**方案 1**和**方案 2**完全取代。

---

## 静态单例 vs 依赖注入单例（DI Singleton）

在现代 .NET / ASP.NET Core 应用中，管理“单一实例”通常有两种流派：

| 维度 | 静态单例（`Xxx.Instance`） | DI 容器单例（`services.AddSingleton<T>()`） |
| :--- | :--- | :--- |
| **访问方式** | 全局直接调用 `Xxx.Instance` | 通过构造函数依赖注入（Constructor Injection） |
| **耦合度** | 强耦合到具体类，难以替换 | 弱耦合，面向接口（`IMyService`）编程 |
| **可测试性** | 单元测试中难以 Mock / 隔离状态 | 非常容易 Mock 与替换测试桩 |
| **生命周期管理** | 随 AppDomain / 进程常驻 | 由 DI 容器统一负责初始化与 `Dispose()` 释放 |
| **适用场景** | 底层硬件驱动单例、自包含工具组件、轻量独立控制器 | 业务服务层、Web API 控制器、企业级应用 |

### 选型建议：
1. 如果是**无外部依赖的底层设备/控制器（如屏幕检测、全局钩子）**，使用**静态属性单例**简单直接、侵入性最低。
2. 如果是**业务逻辑层服务**，需要解耦接口和进行单元测试，优先使用 **DI 容器的 `AddSingleton`**。
