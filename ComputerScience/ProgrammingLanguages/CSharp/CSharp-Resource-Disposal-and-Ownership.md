# C# Resource Disposal and Ownership

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Resource Management
            ├── IDisposable
            └── Object Ownership
```

## 相关知识

- `IDisposable` 与 `Dispose()`
- `try` / `finally`
- 托管内存与非托管资源
- 垃圾回收 GC
- `IAsyncDisposable` 与 `await using`
- 依赖注入容器管理服务生命周期
- [C# using Directive](CSharp-Using-Directive.md)

---

实现了 `IDisposable` 的对象通常占有需要及时归还的资源。C# 的 `using` 语句和 `using var` 声明用于限定这些对象的生命周期，并保证离开作用域时释放资源。

## using 语句：限定资源生命周期

```csharp
using (var bitmap = camera.GrabOne())
{
    // 使用 bitmap
}
```

```csharp
using var bitmap = camera.GrabOne();
```

此类对象通常占有：

- 文件句柄
- 网络连接
- 数据库连接
- 图像使用的非托管内存
- 操作系统句柄

经典写法是：

```csharp
using (var bitmap = camera.GrabOne())
{
    Process(bitmap);
}
```

离开大括号时，运行时会调用：

```csharp
bitmap.Dispose();
```

即使代码中途抛出异常，资源仍会被释放。

其核心效果近似于：

```csharp
var bitmap = camera.GrabOne();
try
{
    Process(bitmap);
}
finally
{
    bitmap?.Dispose();
}
```

因此，`using` 的关键价值不是少写一行 `Dispose()`，而是通过 `finally` 保证异常情况下也能释放资源。

## using 声明：using var

C# 8 引入了更紧凑的 `using` 声明：

```csharp
using var bitmap = camera.GrabOne();
```

它没有单独的大括号。变量会在当前作用域结束时自动释放，通常就是当前方法结束时。

例如：

```csharp
public byte[] CaptureFrame()
{
    using var bitmap = camera.GrabOne();
    using var imageData = bitmap.Encode(SKEncodedImageFormat.Jpeg, 85);

    return imageData.ToArray();
}
```

释放顺序与创建顺序相反：

```text
创建 bitmap
创建 imageData
使用 imageData
释放 imageData
释放 bitmap
```

这里需要两个 `using var`，因为 `SKBitmap` 和 `SKData` 是两个相互独立、都实现了 `IDisposable` 的对象：

- `SKBitmap` 持有原始图像数据。
- `SKData` 持有编码后的 JPEG 数据。
- `ToArray()` 创建普通的托管 `byte[]`，它由 GC 管理，不需要 `using`。

## 为什么不能只依赖 GC

垃圾回收器 GC 主要管理托管内存，它不保证某个对象会在何时被回收。

即使一个对象最终能够在回收时释放底层资源，如果不主动调用 `Dispose()`，文件句柄、图像内存或连接仍可能被占用很长时间。频繁取图时尤其容易造成非托管内存持续增长。

因此，对实现了 `IDisposable` 的短生命周期对象，应优先使用 `using` 明确资源生命周期。

## 如何判断是否需要 using

在 Visual Studio 中查看类型定义或智能提示：

```csharp
public class SomeResource : IDisposable
```

如果对象实现了 `IDisposable`，并且当前代码拥有这个对象的生命周期，通常应该使用 `using` 或显式调用 `Dispose()`。

注意“谁创建，谁释放”的所有权原则。如果对象由依赖注入容器创建并长期共享，例如注册为单例的服务，通常不应在一次业务调用中手动释放它，而由容器在应用退出时统一释放。

## using var 与 return

即使方法直接 `return`：

```csharp
using var imageData = bitmap.Encode(SKEncodedImageFormat.Jpeg, 85);
return imageData.ToArray();
```

也会先完成 `ToArray()`，然后在真正离开方法前调用 `Dispose()`。返回的 `byte[]` 已经复制出独立数据，不受 `imageData` 释放影响。

## 异步资源释放

如果类型实现的是 `IAsyncDisposable`，应使用：

```csharp
await using var resource = await CreateResourceAsync();
```

它会在作用域结束时异步调用 `DisposeAsync()`，常见于异步流、网络和数据库资源。

## 托管内存与非托管资源

### 托管内存

普通 C# 对象及其内存主要由 .NET 运行时跟踪，并由垃圾回收器 GC 自动回收，例如：

```csharp
string name = "手机";
byte[] bytes = new byte[1024];
var material = new MaterialInfo();
```

当这些对象不再被引用时，GC 会在之后合适的时间回收其托管内存。开发者通常不需要、也无法对普通对象调用 `Dispose()`。

### 非托管资源

.NET 程序也会使用不直接由 GC 管理的外部资源，例如：

- 原生库申请的图像内存
- 文件和操作系统句柄
- Socket 与网络连接
- 数据库连接
- 摄像头和其他硬件资源

一个 C# 对象可能只是外部资源的“托管包装器”：

```text
C# SKBitmap 包装对象（GC 能看到）
              │
              ▼
Skia 原生图像内存（GC 不能直接管理）
```

即使 GC 最终能够回收包装对象，也不能依赖它及时归还底层资源。因此此类对象通常实现 `IDisposable`，由 `Dispose()` 明确结束使用并立即释放资源。

`IDisposable` 并不表示该类型一定直接持有非托管资源。它也可能只是持有其他需要释放的对象。但对调用方而言，重要的是遵守其资源释放契约。

## 是否需要检查每一个类

不需要阅读每个类的多层源码才能正常使用。

是否实现 `IDisposable` 属于类型系统的一部分。一个类型即使没有直接写出 `IDisposable`，也可能通过父类继承它：

```csharp
class BaseResource : IDisposable
{
    public void Dispose() { }
}

class ImageResource : BaseResource
{
}
```

此时 `ImageResource` 同样是 `IDisposable`。这就是查看 `SKBitmap` 时可能需要跳转多层才能看到接口的原因，但日常开发不需要每次这样追查。

### 实际判断方法

优先按以下顺序判断：

1. 查看 API 文档、方法注释和官方示例，确认返回对象由谁释放。
2. 在 Visual Studio 中将鼠标悬停在类型或变量上，查看类型信息和说明。
3. 尝试使用 `using var`。普通类如果不满足资源释放模式，编译器会直接报错。
4. 使用 Visual Studio 或 .NET 分析器提供的资源释放警告。
5. 只有文档和提示仍不明确时，再跳转到定义或查看源码。

编译器可以确认“能不能使用 `using`”，但不能完全判断“当前代码应不应该负责释放”，后一个问题取决于对象所有权。

## 对象所有权比 IDisposable 更重要

即使对象实现了 `IDisposable`，也不是拿到它的每一处代码都应该调用 `Dispose()`。

核心原则是：

> 谁创建并拥有资源，通常由谁释放；只是借来使用的对象，不应擅自释放。

### 当前方法创建并拥有

工厂方法或操作方法返回一个新的短生命周期资源，并约定调用方负责时，通常应该使用 `using`：

```csharp
using var bitmap = camera.GrabOne();
using var imageData = bitmap.Encode(SKEncodedImageFormat.Jpeg, 85);
```

当前方法取得新图片和编码结果，使用结束后负责释放。

### 依赖注入提供的共享对象

通过构造函数注入的单例服务即使实现了 `IDisposable`，业务方法通常也不应释放：

```csharp
public PhoneDebugService(PhoneHardwareDevices hardwareDevices)
{
    _hardwareDevices = hardwareDevices;
}
```

`PhoneHardwareDevices` 及其中的硬件控制器由 DI 容器和应用生命周期管理。一次取图结束时不能把共享相机释放掉，否则后续请求无法继续使用。

### 从属性借用的对象

从其他对象的属性或集合中拿到的共享实例通常只是借用，除非文档明确把所有权转移给调用方，否则不要释放。

## 编译器能帮助到什么程度

下面的类型没有实现资源释放模式：

```csharp
class MaterialInfo
{
}
```

因此：

```csharp
using var material = new MaterialInfo();
```

编译器会报错。

而 `SKBitmap` 通过继承链满足 `IDisposable`：

```csharp
using var bitmap = camera.GrabOne();
```

编译器允许这种写法，并在作用域结束时生成资源释放逻辑。

但编译器不知道 `PhoneCamera` 是当前方法创建的，还是全局共享的。因此“谁拥有对象”仍需要通过 API 契约、DI 生命周期和业务结构判断。

## 当前取图代码的完整资源关系

```text
PhoneCamera（共享硬件，由应用管理）
    │
    └── GrabOne()
          │
          ▼
       SKBitmap（本次调用拥有，需要 Dispose）
          │
          └── Encode()
                │
                ▼
             SKData（本次调用拥有，需要 Dispose）
                │
                └── ToArray()
                      │
                      ▼
                   byte[]（托管内存，由 GC 管理）
```

因此当前代码中：

- 不释放共享的 `PhoneCamera`。
- 使用 `using var` 释放本次取得的 `SKBitmap`。
- 使用 `using var` 释放本次编码产生的 `SKData`。
- 返回的 `byte[]` 交给 GC 管理。
