# C# 枚举底层类型与协议字段宽度

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Type System
            └── Enum Underlying Types
```

## 相关知识

- [位运算与位掩码](../../DataRepresentation/Bitwise-Operations-and-Bit-Masks.md)
- [C# 字符串拆分与 Flags 位标志选项](CSharp-String-Split-and-Flags-Enum-Options.md)

---

## enum : byte 不是继承

```csharp
internal enum EpgHpObjectState : byte
{
    Moving = 0,
    StoppedWhileOpening = 1,
    StoppedWhileClosing = 2,
    AtTargetOrObjectLost = 3
}
```

这里的 `: byte`不是面向对象中的类继承，而是指定该枚举使用 `byte`作为底层整数类型。

枚举在类型体系中仍然派生自 `System.Enum`，并不是 `byte`的子类型。C#复用了冒号语法来声明枚举的底层存储类型。

## 枚举本质上带有整数值

枚举成员都有对应的整数值：

```csharp
EpgHpObjectState state = EpgHpObjectState.StoppedWhileClosing;

byte rawValue = (byte)state; // 2
```

从协议原始值转换回枚举：

```csharp
byte rawValue = 2;
EpgHpObjectState state = (EpgHpObjectState)rawValue;
```

强制转换只负责把整数按枚举类型解释，不会自动验证该整数是否真的定义了对应枚举成员。处理外部输入时，仍应根据协议范围进行校验。

## 默认底层类型是 int

没有显式指定时，枚举默认使用 `int`：

```csharp
enum State
{
    A = 0,
    B = 1
}
```

基本等价于：

```csharp
enum State : int
{
    A = 0,
    B = 1
}
```

C#枚举可以选择以下整数类型作为底层类型：

```text
byte   sbyte
short  ushort
int    uint
long   ulong
```

不能使用 `float`、`double`、`decimal`、`bool`或 `string`作为枚举底层类型。

## 为什么协议枚举选择 byte

EPG-HP 的 `gSTA`和 `gOBJ`都位于一个8位状态字节中，每个字段只占2 bit，原始值范围为0～3。

```text
gSTA：0、1、2、3
gOBJ：0、1、2、3
```

使用 `byte`可以明确表达：

```text
这个枚举来自一个字节协议字段
不会出现负数
值范围不需要32位int
与报文解析结果可以直接对应
```

即使不写 `: byte`，程序通常也能工作；选择 `byte`主要是为了让类型宽度和协议语义更明确。

## 为什么要在数字和枚举之间转换

硬件协议只能传输数字，不认识C#中的枚举名称。例如夹爪只会返回：

```text
gOBJ = 2
```

如果程序一直使用数字，业务判断会写成：

```csharp
if (gObj == 2)
{
    // 2到底表示什么，需要重新查说明书。
}
```

在协议解析边界把数字转换成枚举：

```csharp
var objectState = (EpgHpObjectState)gObj;
```

业务代码就可以写成：

```csharp
if (objectState == EpgHpObjectState.StoppedWhileClosing)
{
    // 闭合过程中接触物体，说明夹爪检测到了物体。
}
```

转换前后底层数值仍然是2，没有重新计算，也没有改变bit：

```text
byte 2：                    协议原始数字
EpgHpObjectState成员：      对数字2赋予可读名称
```

典型数据流为：

```text
设备返回byte
→ 位运算提取原始字段0～3
→ 转成枚举
→ 程序使用有名称的状态进行判断
```

发送命令时方向相反：

```text
程序选择枚举成员
→ 转成byte
→ 放入报文发送给设备
```

枚举主要存在于程序内部，负责可读性和类型约束；byte主要存在于协议边界，负责与设备实际报文对应。不需要在程序每一层反复转换，通常只在报文编码和解析处转换一次。

### 转换并不会自动校验

```csharp
var state = (EpgHpObjectState)99;
```

C#允许这种转换，即使99没有对应成员。因此外部数据必须先通过掩码、范围判断或`switch`默认分支处理。

EPG-HP的`gOBJ`只占2 bit，使用`& 0b11`后结果必然为0～3，而枚举正好定义了这四个值，因此这一处转换是完整覆盖的。

## Flags 枚举为什么也常用 byte

如果一个协议字段是8位故障字节，可以定义：

```csharp
[Flags]
enum FaultFlags : byte
{
    None = 0,
    CommunicationLost = 1 << 2,
    OverCurrent = 1 << 3,
    InternalFault = 1 << 7
}
```

每一个枚举值对应故障字节中的一个bit，多个值可以按位或组合。底层使用 `byte`正好与设备返回的8位故障字段对齐。

## byte、ushort 与协议宽度

C#中的常见无符号整数：

| C#类型 | .NET类型 | 宽度 | 数值范围 |
| --- | --- | ---: | ---: |
| `byte` | `System.Byte` | 8 bit | 0～255 |
| `ushort` | `System.UInt16` | 16 bit | 0～65535 |
| `uint` | `System.UInt32` | 32 bit | 0～4294967295 |

选择协议字段类型时，通常考虑：

1. 线上字段实际占多少bit。
2. 字段是否允许负数。
3. 取值范围是否能装进该类型。

## 为什么Modbus寄存器地址使用ushort

Modbus请求中的起始寄存器地址占两个字节：

```text
03 E8
```

两个字节是16 bit，而且地址不可能是负数，因此使用：

```csharp
ushort address = 0x03E8;
```

`ushort`正好是16位无符号整数，范围0～65535，与Modbus地址字段宽度一致。

不能使用 `byte`保存 `0x03E8`：

```text
byte最大值：255
0x03E8：   1000
```

使用 `int`也能保存该值，但它是32 bit，不能像 `ushort`一样直接表达“这是一个16位无符号协议字段”的意图。

## 地址宽度与寄存器数据宽度

Modbus中两者恰好都是16 bit，但含义不同：

```text
ushort address：要访问哪个寄存器
ushort value：  寄存器中保存的数据
```

类型相同只说明它们在线上都占两个字节，不代表业务含义相同。方法参数和变量名称仍然需要区分地址与数据。

## 为什么bit掩码使用byte

EPG-HP 的控制位和状态位位于单个低字节中：

```csharp
public const byte ActivateControlMask = 1 << 0;
public const byte GoToControlMask = 1 << 3;
```

这些掩码只操作8位控制字节，因此使用 `byte`足够，也能防止调用者误以为它需要操作整个16位寄存器。

完整寄存器值仍可能使用 `ushort`，然后先提取低字节：

```csharp
ushort registerValue = 0x00F1;
byte statusByte = (byte)(registerValue & 0xFF);
```

再使用 `byte`掩码解析其中的状态位。

## 当前示例的类型对应

```text
寄存器地址      → ushort，Modbus字段为16 bit
完整寄存器数据  → ushort，寄存器为16 bit
高字节/低字节   → byte，每个字节为8 bit
状态bit掩码     → byte，作用于单个状态字节
协议枚举        → byte，原始状态来自8位字段
```

## 相关知识

```text
值类型
→ 整数宽度
→ 枚举底层类型
→ 位掩码
→ 协议字段建模
```
