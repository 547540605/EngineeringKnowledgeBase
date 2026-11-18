# 32 位多寄存器字序、有符号补码与定点数缩放

## 所属领域

```text
Engineering
└─ Modbus
   └─ Multi-Register Layout, Signed Integers & Scaling
```

## 前置与关联知识

- [二进制、十六进制、字节与寄存器](../../ComputerScience/DataRepresentation/Binary-Hexadecimal-Bytes-and-Registers.md)
- [字节序与 Modbus 数据排列](../../ComputerScience/DataRepresentation/Byte-Order-and-Modbus-Data-Layout.md)
- [Modbus 功能码 03、04、06 与 10](../../ComputerScience/Networking/IndustrialProtocols/Modbus/Modbus-Function-Codes-03-04-06-10.md)
- [复合寄存器多比特位域拆装与读-改-写模式](02-Composite-Register-Bit-Fields-and-Read-Modify-Write.md)

---

Modbus 的单个寄存器固定只有 16 bit（2 字节），无符号表示范围仅为 $0 \sim 65535$。而实际工业硬件经常需要传递三类超出该基础模型的数据：

1. **超过 65535 的大整数**（例如目标脉冲位置 `150000`、累计运行次数 `1000000`）；
2. **有符号正负数**（例如反向目标位置 `-8000`、实时负向速度 `-120`、位置偏差 `-5`）；
3. **带小数位的物理量**（例如额定电流 `1.85 A`、母线电压 `24.21 V`、精细转速 `60.50 rpm`）。

理解这三类数据如何映射到 16 位寄存器序列，是编写任何 Modbus 硬件驱动的第一步。

## 一、32 位双寄存器的四种字序（Word Order vs Byte Order）

### 1. 为什么遵循 Modbus 标准仍会出现高低字颠倒

Modbus 协议规范只规定了**单个 16 位寄存器内部**采用大端字节序（高字节先发，低字节后发），但**没有强制规定当两个连续寄存器（共 4 字节）拼接成一个 32 位整数或浮点数时，哪一个寄存器放高 16 位、哪一个寄存器放低 16 位**。

以 32 位十六进制数 `0x12345678` 为例，它由 4 个字节、2 个 16 位字（Word）组成：

```text
32 位数值：0x1234_5678（十进制 305,419,896）
  ├─ 高 16 位字 (High Word) = 0x1234  （字节 A = 0x12, 字节 B = 0x34）
  └─ 低 16 位字 (Low Word)  = 0x5678  （字节 C = 0x56, 字节 D = 0x78）
```

在工业现场，不同芯片架构与固件习惯衍生出四种排列组合（假设起始寄存器地址为 `Addr`，下一个寄存器为 `Addr + 1`）：

| 常见代号 | 含义说明 | `Addr` 存放 | `Addr + 1` 存放 | 报文 4 字节顺序 | 常见程度 |
| --- | --- | --- | --- | --- | --- |
| **`AB CD`** | 大端字节序 + 高字在前（标准全大端） | `0x1234` | `0x5678` | `12 34 56 78` | 非常常见（PLC、标准仪表） |
| **`CD AB`** | **单字内大端 + 低字在前（字交换 / Word-Swapped）** | `0x5678` | `0x1234` | `56 78 12 34` | **非常常见（STM32/ARM 小端 MCU 开发的驱动器与控制器）** |
| **`DC BA`** | 单字内小端 + 低字在前（全小端） | `0x7856` | `0x3412` | `78 56 34 12` | 较少见（部分自定义串口变体） |
| **`BA DC`** | 单字内小端 + 高字在前（字节交换） | `0x3412` | `0x7856` | `34 12 78 56` | 罕见 |

**为什么 `CD AB` 在运动控制与传感器硬件中极度普遍？**
现代嵌入式控制器大多采用小端序（Little-Endian）32 位 MCU（如 ARM Cortex-M）。在 MCU 内存中，一个 `int32_t` 变量挂在 `uint16_t regs[]` 数组上时，`regs[0]` 天然对应低 16 位字，`regs[1]` 天然对应高 16 位字；当 Modbus 协议栈按标准把每个 `regs[i]` 以“高字节在前”发到串口上时，线上自然就形成了 **`CD AB`（低字大端在前、高字大端在后）**！

### 2. 实例推演：字序搞反会导致什么后果

假设某驱动器的 32 位目标位置寄存器位于 `0x00D0~0x00D1`，采用 **`CD AB`（低字在前）** 规则。现在希望让设备运动到正方向 `10000` 脉冲：

```text
十进制 10000 = 0x0000_2710
  ├─ 低 16 位字 = 0x2710
  └─ 高 16 位字 = 0x0000
```

使用功能码 `0x10`（写多个保持寄存器）向起始地址 `0x00D0` 写入 2 个寄存器（4 字节）：

```text
【正确的 CD AB 报文】
01  10  00 D0  00 02  04  27 10  00 00  [CRC_L CRC_H]
                          └低字┘ └高字┘
设备还原：(0x0000 << 16) | 0x2710 = 10,000 脉冲（正确）

【误按 AB CD 全大端打包的报文】
01  10  00 D0  00 02  04  00 00  27 10  [CRC_L CRC_H]
                          └被当低字┘ └被当高字┘
设备还原：(0x2710 << 16) | 0x0000 = 0x2710_0000 = 655,360,000 脉冲（放大 65536 倍！）
```

注意：**此时报文长度合法、CRC16 校验也 100% 正确**，设备不会报通信错误，而是直接收到一个高达 6.55 亿的错误目标值，导致参数越界拒绝执行或机构直接高速撞限位！

> **特殊迷惑现象**：如果测试时恰好只写了 `0`（`00 00 00 00`）或 `-1`（`FF FF FF FF`），`AB CD` 与 `CD AB` 发出的字节完全一模一样，bug 会潜伏到写入非对称数值时才爆发。

### 3. 如何一招确认设备 32 位字序

1. **先看说明书报文示例**：找任意一个写入 `10000`（`0x2710`）或 `4000`（`0x0FA0`）等小正数的 32 位寄存器示例。若数据区是 `00 00 27 10` 即为 `AB CD`；若是 `27 10 00 00` 即为 `CD AB`。
2. **真机回读验证**：连接设备后，先读取一个已知出厂默认值的 32 位参数（例如默认值为 `4000` 的寄存器），打印返回的 4 个原始字节：
   * 返回 `00 00 0F A0` $\implies$ `AB CD`（高字在前）；
   * 返回 `0F A0 00 00` $\implies$ `CD AB`（低字在前）。

---

## 二、有符号整数与二进制补码（`INT16` 与 `INT32`）

串口线路上只传输 `0x00 ~ 0xFF` 的无符号字节。当寄存器需要表达负数（如反向坐标 `-8000`）时，工业协议统一采用**二进制补码（Two's Complement）**编码。

### 1. 补码的核心规律

对于位宽为 $N$（$N = 16$ 或 $N = 32$）的有符号整数：

* **最高位（`Bit N-1`）为符号位**：`0` 表示非负数（$0$ 或正数），`1` 表示负数。
* **表示范围**：$-2^{N-1} \sim +2^{N-1} - 1$
  * `INT16`（1 个寄存器）：$-32768 \sim +32767$
  * `INT32`（2 个寄存器）：$-2147483648 \sim +2147483647$
* **负数 $-|x|$ 对应的无符号十六进制值**：

$$
U = 2^N - |x|
$$

例如：
* **16 位有符号数 `-5`（`INT16`）**：
  $$U_{16} = 65536 - 5 = 65531 = \text{0xFFFB}$$
  单寄存器大端发送为：`FF FB`。若接收端误用无符号 `ushort` 解析，就会把 `-5` 显示成 `65531`。
* **32 位有符号数 `-8000`（`INT32`）**：
  $$U_{32} = 2^{32} - 8000 = 4294959296 = \text{0xFFFF\_E0C0}$$
  拆分为两个 16 位字：高字为 `0xFFFF`，低字为 `0xE0C0`。
  * 若设备为 `AB CD`（高字在前），报文数据段为：`FF FF E0 C0`；
  * 若设备为 `CD AB`（低字在前），报文数据段为：`E0 C0 FF FF`。

### 2. Python 与 C# 的标准编解码实现

#### Python 实现（同时支持 `ABCD` 与 `CDAB`）

```python
import struct

# ---------- 16 位单寄存器 (标准大端 AB) ----------
def pack_uint16(val: int) -> bytes:
    return struct.pack(">H", val)

def pack_int16(val: int) -> bytes:
    return struct.pack(">h", val)

def unpack_int16(data2: bytes) -> int:
    return struct.unpack(">h", data2)[0]


# ---------- 32 位双寄存器：AB CD (高字在前，标准大端) ----------
def pack_int32_abcd(val: int) -> bytes:
    return struct.pack(">i", val)

def unpack_int32_abcd(data4: bytes) -> int:
    return struct.unpack(">i", data4)[0]


# ---------- 32 位双寄存器：CD AB (低字在前，单字内大端) ----------
def pack_uint32_cdab(val: int) -> bytes:
    lo_word = val & 0xFFFF
    hi_word = (val >> 16) & 0xFFFF
    return struct.pack(">HH", lo_word, hi_word)

def pack_int32_cdab(val: int) -> bytes:
    u32 = val & 0xFFFFFFFF  # 将负数转为 32 位无符号补码位模式
    return pack_uint32_cdab(u32)

def unpack_uint32_cdab(data4: bytes) -> int:
    lo_word, hi_word = struct.unpack(">HH", data4)
    return (hi_word << 16) | lo_word

def unpack_int32_cdab(data4: bytes) -> int:
    u32 = unpack_uint32_cdab(data4)
    return u32 - 0x100000000 if (u32 & 0x80000000) else u32
```

#### C# 实现（清晰位运算，不依赖机器 CPU 内存端序）

```csharp
// 32 位有符号整数打包为 CD AB（低字在前，单字内高字节在前）
public static byte[] PackInt32Cdab(int value)
{
    uint u32 = unchecked((uint)value);
    ushort loWord = (ushort)(u32 & 0xFFFF);
    ushort hiWord = (ushort)(u32 >> 16);

    return
    [
        (byte)(loWord >> 8),
        (byte)(loWord & 0xFF),
        (byte)(hiWord >> 8),
        (byte)(hiWord & 0xFF)
    ];
}

// 从 CD AB 4 字节还原 32 位有符号整数
public static int UnpackInt32Cdab(ReadOnlySpan<byte> bytes)
{
    uint loWord = (uint)((bytes[0] << 8) | bytes[1]);
    uint hiWord = (uint)((bytes[2] << 8) | bytes[3]);
    uint u32 = (hiWord << 16) | loWord;
    return unchecked((int)u32);
}
```

> **类型安全提示**：拼接多字节或多寄存器时，中间步骤一律先转为无符号整数（C# 的 `uint`/`ushort`，Python 中配合 `& 0xFFFF`），等完整拼出 32 位位模式后，最后一步再按补码解释为有符号 `int`。若直接对有符号 `sbyte` 或 `short` 做位移和按位或，负数左移/类型提升时的**符号位扩展（Sign Extension，高位自动补 `1`）**会污染高 16 位数据。

---

## 三、定点数比例缩放（Fixed-Point Scaling）

### 1. 为什么工业设备偏爱“整数 + 单位倍率”而非 `FLOAT32`

虽然 IEEE 754 单精度浮点数（`FLOAT32`，占 2 个寄存器）可以直接传小数，但在嵌入式控制器与工业驱动器中，更常见的是**定点数约定**——寄存器内只传整数，在说明书单位栏规定最小分辨率（Scale）：

| 参数示例 | 寄存器类型 | 说明书标注单位 | 缩放关系 | 示例 |
| --- | --- | --- | --- | --- |
| 额定电流 | `UINT16` | `0.01 A` | $\text{物理值} = \text{寄存器值} \times 0.01$ | 写 `180` 表示 $1.80\text{ A}$ |
| 母线电压 | `UINT16` | `0.01 V` | $\text{物理值} = \text{寄存器值} \times 0.01$ | 读出 `2421` 表示 $24.21\text{ V}$ |
| 精细转速 | `INT32` | `0.01 rpm` | $\text{物理值} = \text{寄存器值} \times 0.01$ | 写 `6000` 表示 $60.00\text{ rpm}$；读出 `-1525` 表示反向 $15.25\text{ rpm}$ |
| 温度反馈 | `INT16` | `0.1 °C` | $\text{物理值} = \text{寄存器值} \times 0.1$ | 读出 `-125` 表示 $-12.5\ ^\circ\text{C}$ |

这样做的好处是 MCU 无需浮点运算单元即可精确比较阈值，也没有 `FLOAT32` 精度尾数抖动问题。

### 2. 写入换算时必须 `round` 而不能直接 `int` 截断

在 IEEE 754 二进制浮点数中，很多十进制小数无法精确表示。例如在 Python 或 C# 中计算：

```python
>>> 1.15 * 100
114.99999999999999
>>> int(1.15 * 100)
114  # 错误！直接向零截断少了 1 个最小单位
>>> round(1.15 * 100)
115  # 正确！
```

因此，将界面输入的浮点物理量 $V_{\text{phys}}$ 按单位分辨率 $S$（如 $S = 0.01$）换算为寄存器整数 $R$ 时，统一遵循四舍五入取整：

$$
R = \operatorname{round}\!\left(\frac{V_{\text{phys}}}{S}\right), \qquad V_{\text{phys}} = R \times S
$$

## 小结

1. 读写任何 32 位寄存器前，必须确认双字顺序是 **`AB CD`（高字在前）** 还是 **`CD AB`（低字在前）**。
2. 读写可能出现负数的寄存器（位置、速度、偏差、温度）前，确认其为 `INT16` / `INT32` 二进制补码，拼接过程使用无符号位运算避免符号位扩展污染。
3. 读写带倍率单位的寄存器前，核对缩放系数（如 `1` vs `0.01`），下发时使用 `round()` 四舍五入而非直接强制截断。
