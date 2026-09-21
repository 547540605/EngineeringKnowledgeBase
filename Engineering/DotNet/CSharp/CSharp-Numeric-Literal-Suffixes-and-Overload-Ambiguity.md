# C# 数值字面量后缀、隐式转换与重载二义性

## 所属领域

`Engineering / DotNet / CSharp / 类型系统与重载解析`

## 问题

调用数值类型的重载方法时，混用 `int` 常量和 `ushort` 等窄整数类型，可能出现编译错误：

```text
CS0121: 以下方法或属性之间的调用具有二义性
```

例如：

```csharp
ushort registerCount = 2;
var count = Math.Max(2, registerCount);
```

`System.Math` 同时包含：

```csharp
Math.Max(int, int)
Math.Max(ushort, ushort)
```

## 根因

未带后缀的整数常量 `2` 的默认类型是 `int`，而 `registerCount` 的类型是 `ushort`。

上述两个候选重载都可以适用：

- 对 `Math.Max(int, int)`：`ushort` 可隐式转换为 `int`。
- 对 `Math.Max(ushort, ushort)`：常量 `2` 在 `ushort` 的取值范围内，可作为 `ushort` 使用。

第一个重载在第一个参数上更贴近原类型，第二个重载在第二个参数上更贴近原类型；编译器无法选出唯一的更优重载，因而报 CS0121。

## 数值字面量后缀

字面量后缀指定的是 C# 编译期的**数值类型**，不是一次运行时转换。

```csharp
var a = 2;    // int
var b = 2m;   // decimal（m/M 后缀）
var c = 2d;   // double（d/D 后缀）
var e = 2f;   // float（f/F 后缀）
var l = 2L;   // long（l/L 后缀，推荐使用大写 L）
```

`2m` 表示这个字面量本身就是 `System.Decimal`。`decimal` 是适合十进制小数精确表示的数值类型；“`m`”不是“把值转成十进制”的通用转换操作。

## 解决方案

原则是：在调用重载方法前，明确把两个参数统一为同一种数值类型。

### 按 int 比较

对数量、索引、循环次数等普通计算，通常选择 `int`：

```csharp
ushort registerCount = 2;
var count = Math.Max(2, (int)registerCount);
```

### 按 decimal 比较

当结果将用于 `NumericUpDown.Value`、金额或其他需要 `decimal` 的场景时，可直接统一为 `decimal`：

```csharp
ushort registerCount = 2;
decimal count = Math.Max(2m, (decimal)registerCount);
```

这里 `2m` 选择 `Math.Max(decimal, decimal)` 重载，`(decimal)registerCount` 则让另一个参数也明确为 `decimal`，因此没有歧义。

### 保持 ushort

只有结果确实应继续表示 16 位无符号协议字段时，才统一为 `ushort`：

```csharp
ushort registerCount = 2;
ushort count = Math.Max((ushort)2, registerCount);
```

应先确认常量或计算结果不会超出 `ushort` 的范围（`0` 至 `65535`）。

## 与 NumericUpDown 的关系

`NumericUpDown.Value` 的类型是 `decimal`。以下写法也正确：

```csharp
numericUpDown.Value = Math.Max(2, (int)registerCount);
```

因为先明确调用 `Math.Max(int, int)`，再将返回的 `int` 赋给 `decimal` 属性。是否在 `Math.Max` 内部使用 `decimal`，取决于业务计算本身是否需要小数精度，而不只是最终控件属性的类型。

## 结论

当数值重载调用出现 CS0121 时，不要依赖编译器猜测目标重载。明确指定数字后缀或显式转换，令每个实参统一到期望的类型。

## 相关知识

- `Engineering/DotNet/CSharp/CSharp-Type-Testing-and-Conversion.md`
- `Engineering/DotNet/CSharp/CSharp-Enum-Underlying-Types-and-Protocol-Fields.md`
- `ComputerScience/DataRepresentation/Binary-Hexadecimal-Bytes-and-Registers.md`
