# CRC16-Modbus 原理与实现

## 所属领域

```text
Computer Science
└─ Networking
   └─ Industrial Protocols
      └─ Modbus
         └─ RTU
            └─ CRC16-Modbus
```

CRC16-Modbus 为 RTU 报文生成 16 位校验值，用于检测报文在传输过程中是否发生比特错误。开发时通常使用成熟库，但理解计算输入、字节顺序和验证方式有助于排查通信问题。

## CRC 检查什么

发送方对 CRC 字段之前的全部报文字节进行计算：

```text
从站地址 + 功能码 + 数据
              ↓
          CRC16-Modbus
              ↓
          16 位 CRC
```

接收方对收到的正文重新计算并比较：

```text
相同：报文在传输途中大概率未损坏
不同：报文损坏、缺失、多出字节或边界识别错误
```

CRC 不判断设备地址、功能码、寄存器地址和业务参数是否合理。

## Modbus CRC 的固定规则

CRC16-Modbus 常用参数包括：

```text
初始值：0xFFFF
反向多项式：0xA001
结果宽度：16 bit
报文排列：CRC 低字节在前，高字节在后
```

这些常量属于算法定义，不能自行替换。不同 CRC16 变体可能使用不同初始值、多项式和输入输出规则，即使都叫 CRC16，结果也可能不同。

## 机械计算步骤

对每个正文 byte 执行：

1. 当前 CRC 与该 byte 进行异或。
2. 重复处理 8 次，对应该 byte 的 8 个 bit。
3. 若 CRC 当前最低位为 0，只右移一位。
4. 若 CRC 当前最低位为 1，先右移一位，再与 `0xA001` 异或。
5. 全部字节处理完成后得到 16 位 CRC。

伪代码：

```text
crc = 0xFFFF

对每个 byte：
    crc = crc XOR byte

    重复 8 次：
        如果 crc 最低位是 1：
            crc = (crc 右移 1) XOR 0xA001
        否则：
            crc = crc 右移 1
```

## 为什么每个字节循环 8 次

一个 byte 有 8 bit。CRC 算法需要让每一位都参与多项式余数计算，因此每输入一个 byte 就执行 8 轮位处理。

这里查看最低位使用：

```csharp
(crc & 0x0001) != 0
```

`0x0001` 只有最低位为 1，所以按位与以后可以判断 CRC 的最低位是否为 1。

## 处理第一个字节的示例

正文第一个字节为 `0x09`，CRC 初始值为 `0xFFFF`：

```text
0xFFFF XOR 0x09 = 0xFFF6
```

接着处理 8 个 bit：

| 轮次 | 处理前最低位 | 处理后 CRC |
| ---: | ---: | --- |
| 1 | 0 | `0x7FFB` |
| 2 | 1 | `0x9FFC` |
| 3 | 0 | `0x4FFE` |
| 4 | 0 | `0x27FF` |
| 5 | 1 | `0xB3FE` |
| 6 | 0 | `0x59FF` |
| 7 | 1 | `0x8CFE` |
| 8 | 0 | `0x467F` |

此时只处理完第一个字节，`0x467F` 不是整条报文的最终 CRC。还要继续处理后续字节。

## 完整请求的已知结果

读取请求正文：

```text
09 03 03 E8 00 01
```

按照 CRC16-Modbus 计算后：

```text
CRC 数值：0x3205
低字节：  0x05
高字节：  0x32
```

因此完整 RTU 报文为：

```text
09 03 03 E8 00 01 05 32
```

注意 `0x3205` 是 CRC 数值的常规写法，而 `05 32` 是它在 Modbus RTU 报文中的发送顺序。

## C# 实现

```csharp
public static ushort ComputeModbusCrc(ReadOnlySpan<byte> data)
{
    ushort crc = 0xFFFF;

    foreach (var value in data)
    {
        crc ^= value;

        for (var i = 0; i < 8; i++)
        {
            var lowestBitIsOne = (crc & 0x0001) != 0;
            crc >>= 1;

            if (lowestBitIsOne)
            {
                crc ^= 0xA001;
            }
        }
    }

    return crc;
}
```

### 方法声明

```csharp
public static ushort ComputeModbusCrc(ReadOnlySpan<byte> data)
```

逐项解释：

```text
public              其他类可以调用
static              不需要先创建对象即可调用
ushort              返回一个 16 位无符号整数，正好容纳 CRC16
ComputeModbusCrc     方法名称
ReadOnlySpan<byte>   一段只供读取的连续字节数据
data                参数名称
```

初学时可以先把 `ReadOnlySpan<byte>` 理解成“传进来的一串 byte”。它可以接收数组或数组的一部分，并且方法只能读取，不能通过该参数修改其中的字节。

### 初始化 CRC

```csharp
ushort crc = 0xFFFF;
```

创建 16 位无符号变量 `crc`，并按照 CRC16-Modbus 规则设为固定初始值 `0xFFFF`。这不是根据报文计算出来的值，而是算法规定的起点。

### 逐个处理正文中的字节

```csharp
foreach (var value in data)
```

若 `data` 为：

```text
09 03 03 E8 00 01
```

`value` 会依次等于：

```text
第一次 0x09
第二次 0x03
第三次 0x03
第四次 0xE8
第五次 0x00
第六次 0x01
```

### 当前字节进入 CRC

```csharp
crc ^= value;
```

`^=` 是复合赋值，基本含义是：

```csharp
crc = crc ^ value;
```

第一次循环中：

```text
crc   = 0xFFFF
value = 0x09，也可以补成 0x0009

0xFFFF XOR 0x0009 = 0xFFF6
```

### 一个字节需要处理 8 轮

```csharp
for (var i = 0; i < 8; i++)
```

`i` 从 0 到 7，共执行 8 次，对应该字节的 8 个 bit。外层 `foreach` 负责逐字节，内层 `for` 负责逐 bit。

### 记录移动前的最低位

```csharp
var lowestBitIsOne = (crc & 0x0001) != 0;
```

`crc & 0x0001` 会清除其他 15 位，只保留最低位。结果不是 0，就表示最低位为 1。

这里必须在右移之前保存判断结果，因为右移后原来的最低位会被丢弃。

### CRC 右移一位

```csharp
crc >>= 1;
```

`>>=` 是复合赋值，等价于：

```csharp
crc = crc >> 1;
```

所有 bit 向右移动一位，最右边的原最低位被丢弃，左边补 0。

### 根据原最低位决定是否异或多项式

```csharp
if (lowestBitIsOne)
{
    crc ^= 0xA001;
}
```

如果移动前最低位是 1，右移后的结果还要与 CRC16-Modbus 固定常量 `0xA001` 异或；最低位是 0 时则不执行这一步。

### 返回最终结果

```csharp
return crc;
```

只有外层循环处理完所有正文 byte 后，`crc` 才是整条正文的最终 CRC。

## 更直白的等价写法

下面的写法把两种分支直接展开，结果与前面的实现相同：

```csharp
public static ushort ComputeModbusCrc(byte[] data)
{
    ushort crc = 0xFFFF;

    foreach (byte value in data)
    {
        crc = (ushort)(crc ^ value);

        for (int i = 0; i < 8; i++)
        {
            if ((crc & 0x0001) == 0)
            {
                crc = (ushort)(crc >> 1);
            }
            else
            {
                crc = (ushort)((crc >> 1) ^ 0xA001);
            }
        }
    }

    return crc;
}
```

可以把核心分支读成：

```text
最低位为 0：只右移
最低位为 1：右移，然后异或 0xA001
```

## 第一个字节的前两轮

输入第一个 byte `0x09` 后：

```text
初始：0xFFFF
异或：0xFFFF XOR 0x0009 = 0xFFF6
```

第 1 轮：

```text
0xFFF6 最低位为 0
所以只右移：0xFFF6 >> 1 = 0x7FFB
```

第 2 轮：

```text
0x7FFB 最低位为 1
先右移：0x7FFB >> 1 = 0x3FFD
再异或：0x3FFD XOR 0xA001 = 0x9FFC
```

还要继续完成剩余 6 轮，才算处理完 `0x09`；然后再处理正文中的下一个 byte `0x03`。

将计算结果追加到报文：

```csharp
var crc = ComputeModbusCrc(payload);

var crcLow = (byte)(crc & 0xFF);
var crcHigh = (byte)(crc >> 8);
```

发送顺序：

```text
正文 → crcLow → crcHigh
```

## 接收时怎样验证

假设收到的最后两个字节依次为 CRC 低字节和高字节：

```csharp
var receivedCrc = (ushort)(crcLow | (crcHigh << 8));
var calculatedCrc = ComputeModbusCrc(messageBody);

var isValid = receivedCrc == calculatedCrc;
```

解析前必须确认报文长度足够，不能在缺少 CRC 字节时直接访问末尾索引。

## 为什么实际开发优先使用库

正确的 Modbus 通信不只有 CRC，还包括：

```text
串口收发方向
帧间静默时间
读取长度
超时与重试
异常响应
并发访问
设备断线
```

成熟 Modbus 库通常已经处理这些通用细节。自行实现时至少应使用说明书示例或已知测试向量验证 CRC，避免多项式、初始值和高低字节顺序混用。

## 当前阶段应掌握

1. CRC 的计算输入不包含 CRC 字段自身。
2. CRC16-Modbus 初始值为 `0xFFFF`，使用反向多项式 `0xA001`。
3. 每个字节需要执行 8 轮位处理。
4. 最低位为 1 时，右移后还要异或 `0xA001`。
5. 最终 CRC 在 RTU 报文中按低字节、高字节发送。
6. CRC 通过只说明传输完整性，不说明业务命令正确。

## 相关知识

```text
位运算与位掩码
→ CRC16-Modbus
→ Modbus RTU 报文验证
→ 超时、重试与异常响应
```
