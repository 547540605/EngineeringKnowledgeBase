# C# Null-Coalescing Operators

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Nullability
            └── Null-Coalescing Operators
```

## What Is `??`

`??` 是空合并运算符（null-coalescing operator）。它在左侧值不为 `null` 时返回左侧值；左侧为 `null` 时返回右侧的备用值。

```csharp
var content = result ?? string.Empty;
```

等价于：

```csharp
var content = result != null ? result : string.Empty;
```

`string.Empty` 等同于空字符串 `""`。因此上例保证 `content` 始终是非空字符串：`result` 有值时保留原内容，没有值时使用空字符串。

## Typical Usage

保存文本时可以为可空内容提供默认值：

```csharp
File.WriteAllText(
    Path.Combine(path, prefix + ".result"),
    result ?? string.Empty);
```

读取可选配置时也可以提供默认值：

```csharp
var timeout = settings.TimeoutSeconds ?? 30;
var displayName = user.DisplayName ?? "Unnamed";
```

右侧表达式只会在左侧为 `null` 时执行，因此可以安全地放置默认值计算或备用调用：

```csharp
var configuration = cachedConfiguration ?? LoadConfiguration();
```

## Chaining

可以连续使用 `??`，按从左到右依次选择第一个非空值：

```csharp
var name = request.Name ?? user.DisplayName ?? "Unnamed";
```

上例优先使用请求中的名称，其次使用用户显示名，两者都为空时使用 `"Unnamed"`。

## `??=` Assign-if-Null

`??=` 是空合并赋值运算符。它只在左侧为 `null` 时才赋值：

```csharp
result ??= string.Empty;
```

等价于：

```csharp
if (result == null)
{
    result = string.Empty;
}
```

`??` 只计算并返回一个值，不修改左侧变量；`??=` 会修改左侧变量或属性。两者不能混用。

| 写法 | 结果 | 是否修改左侧 |
| --- | --- | --- |
| `result ?? string.Empty` | 生成一个非空结果 | 否 |
| `result ??= string.Empty` | 左侧为空时赋予默认值 | 是 |

## Nullable Reference Types

如果参数声明为 `string result`，启用 Nullable Reference Types 时，编译器会认为调用方不应传入 `null`。但这只是编译期约定，不会在运行时阻止 `null` 通过旧代码、反射或被忽略的警告传入。

因此 `result ?? string.Empty` 是一种防御式处理。不过它不应代替明确的业务约束：如果 `result` 为 `null` 代表调用错误，应该优先校验参数并抛出适当异常，而不是悄悄替换成默认值。

## `?? throw` Throw Expressions（空值校验与快速抛错）

从 C# 7.0 开始，`throw` 可以作为表达式（Throw Expression）使用。将 `??` 与 `throw` 结合，可以在单行中实现“获取数据，如果为 null 则立即抛出异常中断”：

```csharp
var template = ActionUtil.ReadTemplateImage(imageName) 
    ?? throw new FailException("读取投屏断连检测模板图失败");
```

等价于传统的条件语句：

```csharp
var template = ActionUtil.ReadTemplateImage(imageName);
if (template == null)
{
    throw new FailException("读取投屏断连检测模板图失败");
}
```

### 核心优势

1. **类型自动收窄（Type Narrowing）**：
   如果方法返回的是可空类型（如 `Image?`），经过 `?? throw` 后，编译器能断定下一行代码中的 `template` 变量**绝不可能为 null**，因此类型自动收窄为不可空类型（`Image`），后续调用无需再做非空检查。
2. **适用于表达式上下文（构造函数防御性校验）**：
   非常适合在类构造函数或属性中做入参非空防御：
   ```csharp
   public class ScreenDetector
   {
       private readonly ILogger _logger;

       public ScreenDetector(ILogger logger)
       {
           _logger = logger ?? throw new ArgumentNullException(nameof(logger));
       }
   }
   ```

## Applicable Types

`??` 可用于可能为 `null` 的引用类型和可空值类型：

```csharp
string? name = null;
var displayName = name ?? "Unnamed";

int? retryCount = null;
var retries = retryCount ?? 3;
```

普通不可空值类型，例如 `int` 和 `bool`，本身不能为 `null`，不需要使用 `??`。

## 相关知识

- [C# Value, Reference, and Nullable Types](CSharp-Value-Reference-and-Nullable-Types.md)
- [C# Default Values](CSharp-Default-Values.md)
- [C# init Properties and Null-Forgiving Operator](CSharp-Init-Properties-and-Null-Forgiving-Operator.md)
- [C# 字符串拆分与 Flags 位标志选项](CSharp-String-Split-and-Flags-Enum-Options.md)
- C# Conditional Operator
- Parameter Validation
