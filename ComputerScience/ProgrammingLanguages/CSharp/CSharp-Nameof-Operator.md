# C# nameof Operator

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Compile-time Operators
            └── nameof
```

## nameof 是什么

`nameof` 接收代码中的符号，并在编译期得到该符号的名称字符串：

```csharp
nameof(request)
```

结果是：

```text
request
```

```csharp
nameof(request.DurationMs)
```

结果是：

```text
DurationMs
```

它不是反射，也不会在运行时真正读取表达式的值。

## 为什么不直接写字符串

下面两种写法当前结果相同：

```csharp
throw new ArgumentNullException("request");
```

```csharp
throw new ArgumentNullException(nameof(request));
```

区别出现在重命名时。如果把参数 `request` 重命名为 `command`：

- 字符串 `"request"` 不会自动修改，可能变成错误信息中的旧名称。
- `nameof(request)` 是代码符号，Visual Studio 重构重命名时会同步更新。
- 如果符号不存在，编译器会报错。

因此 `nameof` 能减少代码名称和字符串名称不一致的问题。

## ArgumentException 中的典型用法

异常构造函数经常需要接收参数名称：

```csharp
if (request == null)
{
    throw new ArgumentNullException(nameof(request));
}
```

```csharp
if (request.DurationMs <= 0)
{
    throw new ArgumentOutOfRangeException(
        nameof(request.DurationMs),
        "滑动持续时间必须大于 0。");
}
```

这里两个字符串职责不同：

```text
nameof(request.DurationMs) → 哪个参数有问题
第二个字符串              → 为什么有问题
```

## nameof 不会访问对象

即使 `request` 在运行时可能为 `null`，下面的代码也不会读取 `request.DurationMs`：

```csharp
nameof(request.DurationMs)
```

因为编译器只取符号名称，编译后的结果相当于字符串常量：

```csharp
"DurationMs"
```

因此 `nameof` 不会因为对象为 `null` 而产生 `NullReferenceException`。

## 常见使用场景

### 参数异常

```csharp
throw new ArgumentNullException(nameof(options));
```

### 属性变化通知

```csharp
OnPropertyChanged(nameof(MaterialName));
```

### 日志或诊断中的成员名称

```csharp
logger.LogDebug("正在执行 {Method}", nameof(CaptureFrame));
```

### 建立与代码名称一致的映射

当字符串必须与类型、属性或方法名称保持一致时，可以考虑 `nameof`。

## 不适合使用 nameof 的情况

面向用户的显示文本和稳定业务标识不应机械地使用 `nameof`：

```csharp
const string errorCode = "CapturePhoneFrameFailed";
```

错误码属于接口契约，未必应该随着 C# 方法重命名而变化。

日志模板中的结构化字段名也有独立语义：

```csharp
logger.LogInformation("物料 {MaterialId} 准备完成", materialId);
```

这里的 `MaterialId` 是日志字段名称，不一定是在引用某个 C# 符号，因此不必强行使用 `nameof`。

## nameof 与其他机制的区别

```text
nameof   → 编译期获得代码符号名称
反射     → 运行时检查类型、属性和方法元数据
字符串   → 普通文本，编译器不检查是否对应真实符号
```

## 相关知识

- [C# Fields and Properties](CSharp-Fields-and-Properties.md)
- [C# Attributes, Reflection, and Assemblies](CSharp-Attributes-Reflection-and-Assemblies.md)
- Compile-time Checking
- Refactoring
- ArgumentException
