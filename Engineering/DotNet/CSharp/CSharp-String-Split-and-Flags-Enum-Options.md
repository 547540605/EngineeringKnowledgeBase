# C# 字符串拆分、清洗与 Flags 位标志选项

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Text Processing & Type System
            ├── string.Split & StringSplitOptions
            ├── [Flags] Enums
            └── Null-Conditional Operator
```

## 相关知识

- [位运算与位掩码](../../../ComputerScience/DataRepresentation/Bitwise-Operations-and-Bit-Masks.md)
- [C# 枚举底层类型与协议字段宽度](CSharp-Enum-Underlying-Types-and-Protocol-Fields.md)
- [C# Null-Coalescing Operators](CSharp-Null-Coalescing-Operators.md)
- [C# 值类型、引用类型与可空类型](CSharp-Value-Reference-and-Nullable-Types.md)

---

## 典型场景与问题

在处理外部输入、配置文件、通信数据或坐标参数（如矩形区域 `" 10, 20 , , 100, 200 "`）时，经常面临三个问题：

1. **输入可能为 null**：直接调用 `.Split()` 会抛出 `NullReferenceException`。
2. **数据带有冗余空格**：子串如 `" 10 "` 在后续 `int.Parse()` 时可能出错或需要额外循环 `Trim()`。
3. **存在连续分隔符导致的空项**：连续逗号 `,,` 切分后产生无意义的空字符串 `""`。

现代 C# 常用一行极简语法同时解决上述所有问题：

```csharp
var values = rectangle?.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
```

---

## 语法逐层拆解

### 1. `?.` 空条件运算符（Null-Conditional Operator）

`rectangle?.Split(...)` 提供安全的短路访问：

```text
rectangle 不为 null  ──>  正常执行 Split 并返回 string[]?
rectangle 为 null    ──>  直接返回 null，不抛出异常
```

等价于：

```csharp
string[]? values = rectangle != null 
    ? rectangle.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries) 
    : null;
```

---

### 2. `StringSplitOptions` 选项与清洗行为

`StringSplitOptions` 控制字符串切分时的过滤与清理规则：

| 枚举项 | 整数值 | 作用说明 | 引入版本 |
| :--- | :--- | :--- | :--- |
| `None` | `0` (`0b0000`) | 默认行为，不进行任何额外处理 | .NET Core 1.0 / .NET Framework 2.0 |
| `RemoveEmptyEntries` | `1` (`0b0001`) | **过滤空项**：结果中剔除长度为 0 的空字符串 `""` | .NET Core 1.0 / .NET Framework 2.0 |
| `TrimEntries` | `2` (`0b0010`) | **去除两端空格**：对切出来的每个子字符串自动执行 `Trim()` | .NET 5+ |

#### 清洗效果对比

假设输入为包含空格与多余逗号的字符串：
```csharp
string input = " 100 , 200 ,  , 300, 400 ";
```

1. **普通切分 `input.Split(',')`**：
   ```csharp
   [" 100 ", " 200 ", "  ", " 300", " 400 "]
   // 存在空格，中间有一项为纯空格 "  "
   ```

2. **组合切分 `input.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)`**：
   ```csharp
   ["100", "200", "300", "400"]
   // 先将每项 Trim 去空格，原 "  " 变为空项后被 RemoveEmptyEntries 自动过滤，得到干净的数据
   ```

---

### 3. 为什么能用 `|` 组合？（`[Flags]` 特性的本质）

`StringSplitOptions` 在 .NET 源码中定义为**位标志枚举（Flags Enum）**：

```csharp
[Flags]
public enum StringSplitOptions
{
    None = 0,
    RemoveEmptyEntries = 1,
    TrimEntries = 2
}
```

* `[Flags]` 特性表明该枚举的每个成员代表一个独立的二进制位开关（Bit Flag）。
* `|`（按位或）将多个开关合并为一个复合值：
  ```text
    RemoveEmptyEntries:  0000 0001 (1)
  | TrimEntries:         0000 0010 (2)
  ------------------------------------
    组合结果:             0000 0011 (3)
  ```
* 框架内部通过按位与 `&` 检查是否启用了某项功能：
  ```csharp
  bool shouldTrim = (options & StringSplitOptions.TrimEntries) != 0;
  bool removeEmpty = (options & StringSplitOptions.RemoveEmptyEntries) != 0;
  ```

---

## 工程实践：安全解析坐标/参数

切分清洗后，通常紧接着进行类型转换，结合 `int.TryParse` 可实现高鲁棒性的参数解析：

```csharp
public static bool TryParseRectangle(string? rawText, out int x, out int y, out int width, out int height)
{
    x = y = width = height = 0;

    var parts = rawText?.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
    if (parts == null || parts.Length != 4)
    {
        return false;
    }

    return int.TryParse(parts[0], out x)
        && int.TryParse(parts[1], out y)
        && int.TryParse(parts[2], out width)
        && int.TryParse(parts[3], out height);
}
```
