# Modbus 串口硬件通信工程专题

## 所属领域

```text
Engineering
└─ Modbus
   ├─ End-to-End Hardware Communication Map
   ├─ Register Data Encoding & Bit Fields
   ├─ Device Persistence & Motion Handshake
   └─ Host Polling, Concurrency & Port Identity
```

本专题面向实际工程中的 **“PC 上位机 $\leftrightarrow$ USB 转 RS485 串口 $\leftrightarrow$ Modbus RTU 工业硬件（驱动器、执行器、仪表、IO 模块）”** 开发场景，将底层概念、协议帧、寄存器编码与上位机软件架构收拢到同一入口，方便每次接入新硬件前系统复习与按表核对。

## 速查：协议标准、设备约定和工程做法

Modbus RTU 规定串行链路上的报文格式和收发规则。Modbus 应用协议规定功能码和寄存器的访问方式。接入具体型号时，再按设备手册解释寄存器内容和写入后的行为。

| 协议标准 | 查设备手册 | 上位机工程做法 |
| --- | --- | --- |
| **串行链路**：RTU 帧包含站号、功能码、数据和 CRC16。CRC 低字节在前，帧间以静默间隔分隔。同一总线一次处理一个事务，站号 `0` 的广播写无响应。 | 设备的接线、实际站号、波特率、校验和停止位。图中的 `115200 8N1` 是配置示例。 | 用单通道队列或互斥锁串行化事务。多路 USB 转串口可用可验证的硬件身份绑定工位。 |
| **寄存器读写**：`0x03` 读保持寄存器，`0x04` 读输入寄存器，`0x06` 写单个保持寄存器，`0x10` 写多个连续保持寄存器。报文中的寄存器地址从 `0` 起算。 | 型号支持哪些功能码、哪些地址可读写，以及手册中的编号对应哪个报文地址。 | 按功能码和可读的连续地址规划批量轮询，按设备响应时间配置超时。 |
| **数据编码**：每个寄存器是 16 位，在线上高字节在前。 | 多寄存器字序、数据类型、符号、单位倍率和位域定义。 | 按设备定义组合或拆分寄存器，做单位换算和输入范围检查。 |
| **写入结果**：功能码规定正常响应和异常响应的格式。 | 写入是更新参数还是触发动作，什么时候生效，如何判断到位，是否需要另发保存命令。 | 按设备状态定义实现命令握手、完成判断和动作超时。 |

例如，数据区 `12 34 56 78` 按标准解出两个寄存器 `[0x1234, 0x5678]`。如果设备用它们表示同一个 32 位整数，高字在前时解析为 `0x12345678`，低字在前时解析为 `0x56781234`。单寄存器的解码规则可以复用，32 位字序需要核对手册。

规范：[Modbus 串行规范 §2](https://www.modbus.org/file/secure/modbusoverserial.pdf)、[Modbus 应用协议 §4、§6](https://www.modbus.org/file/secure/modbusprotocolspecification.pdf)。

## 一张图看懂端到端通信全链路

拿到一台串口 Modbus 硬件时，程序到物理机构之间实际跨越了五个独立层次。排查问题时必须先分清问题出在哪一层：

```text
【第 5 层：设备执行与存储层】
  RAM 工作寄存器 ──► 内部控制环路 / 物理动作执行（耗时 ms ~ s 级，需轮询状态位确认完成）
        │
  (显式保存指令) ──► EEPROM / Flash 非易失存储（掉电不丢，有擦写寿命上限）
        ▲
        │ 寄存器地址映射与业务语义（说明书寄存器表）
        ▼
【第 4 层：寄存器数据编码层】
  业务物理量 (如 -45.0°、1.80 A、多开关组合)
    ◄──► 定点数缩放 (×100) / 二进制补码 (INT16/INT32) / 复合位域 (Bit Fields) / 双字顺序 (ABCD vs CDAB)
        ▲
        │ 16-bit 寄存器数组 / 字节流
        ▼
【第 3 层：Modbus RTU 协议帧层】
  [从站地址 1B] + [功能码 1B (03/04/06/10)] + [起始地址/数量/数据 NB] + [CRC16 低字节在前 2B]
  单播请求等待响应，广播写无响应；帧间以静默时间分隔；区分正常响应、异常响应与通信超时
        ▲
        │ 原始字节数组 byte[]
        ▼
【第 2 层：异步串口帧层 (UART)】
  操作系统 COM 口按约定波特率与帧格式（如 115200, 8N1：1 起始位 + 8 数据位 + 无校验 + 1 停止位）收发比特流
        ▲
        │ USB ◄──► UART ◄──► RS485 电平转换
        ▼
【第 1 层：RS485 物理总线层】
  A / B 双绞线差分电压传输，两线半双工（同一时刻只能一方发送），支持单总线多从站或独立通道点对点连接
```

## 前置底座速查（基础概念回顾）

如果对底层进制、位运算、串口参数或 Modbus 基本帧结构生疏，可按自底向上顺序先回顾仓库中的基础词条：

### 1. 二进制、位运算与基础字节序

* [二进制、十六进制、字节与寄存器](../../ComputerScience/DataRepresentation/Binary-Hexadecimal-Bytes-and-Registers.md)：`bit` / `byte` / 16 位寄存器的宽度关系，以及寄存器地址与寄存器数据的区别。
* [位运算、位掩码与高低字节提取](../../ComputerScience/DataRepresentation/Bitwise-Operations-and-Bit-Masks.md)：`&`、`|`、`^`、`~`、`<<`、`>>` 运算规则，单比特开关检查与 16 位整数高低字节拆分。
* [字节序与 Modbus 数据排列](../../ComputerScience/DataRepresentation/Byte-Order-and-Modbus-Data-Layout.md)：大端序与小端序的本质，以及 Modbus 单寄存器高字节在前、CRC 低字节在前的规则。

### 2. 串口与 RS485 物理层

* [串口通信与 115200 8N1](../../ComputerScience/Networking/SerialCommunication/Serial-Communication-and-8N1.md)：波特率、数据位、奇偶校验（N/E/O）和停止位如何决定字节采样。
* [RS485 差分信号、半双工与总线连接](../../ComputerScience/Networking/SerialCommunication/RS485-Differential-Half-Duplex-Bus.md)：为什么差分信号抗共模干扰、两线半双工收发互斥、菊花链拓扑与 $120\ \Omega$ 终端电阻。

### 3. Modbus RTU 核心协议

* [Modbus 数据模型与寄存器类型](../../ComputerScience/Networking/IndustrialProtocols/Modbus/Modbus-Data-Model-and-Register-Types.md)：线圈、离散输入、输入寄存器、保持寄存器的权限划分与地址表示法。
* [Modbus 功能码 03、04、06 与 10](../../ComputerScience/Networking/IndustrialProtocols/Modbus/Modbus-Function-Codes-03-04-06-10.md)：读寄存器（`0x03`/`0x04`）、写单寄存器（`0x06`）与写多连续寄存器（`0x10`）的报文结构。
* [Modbus RTU 主从通信与报文结构](../../ComputerScience/Networking/IndustrialProtocols/Modbus/RTU/Modbus-RTU-Frame-Structure.md)：完整请求/响应拆解、请求寄存器个数与响应字节数的区别、异常功能码。
* [CRC16-Modbus 原理与实现](../../ComputerScience/Networking/IndustrialProtocols/Modbus/RTU/CRC16-Modbus-Principle-and-Implementation.md)：`0xFFFF` 初值与 `0xA001` 多项式的逐位计算及低字节在前校验。
* [Modbus 超时、重试与异常响应](../../ComputerScience/Networking/IndustrialProtocols/Modbus/RTU/Modbus-Timeout-Retry-and-Exception-Handling.md)：协议异常码、通信超时与机械动作超时的边界，以及读写重试的幂等性考量。

---

## 本专题进阶工程目录（面向真机落地）

掌握上述协议基础后，对接真实工业硬件仍会遇到四类高频工程问题，按以下四篇依次展开：

1. **[32 位多寄存器字序、有符号补码与定点数缩放](01-Multi-Register-Word-Order-Twos-Complement-and-Scaling.md)**
   * 解决两个 16 位寄存器拼成 32 位数值时的四种字序（特别是极易踩坑的“低字在前 `CDAB`”）、`INT16`/`INT32` 负数补码编解码，以及用整数表达小数的比例缩放（如 `0.01` 倍率）。
2. **[复合寄存器多比特位域拆装与读-改-写模式](02-Composite-Register-Bit-Fields-and-Read-Modify-Write.md)**
   * 解决一个寄存器内混合打包多个任意位宽字段（如方向 + 9 位速度 + 停止模式 + 5 位档位）的通用移位掩码算式、溢出防护与局部修改时的“读—改—写”流程。
3. **[寄存器断电保存边界、触发语义与动作状态轮询握手](03-Register-Persistence-Control-Modes-and-Motion-Handshake.md)**
   * 介绍设备常见的参数保存和命令触发方式，以及如何根据设备手册的运行、到位和报警状态设计轮询握手。
4. **[上位机串口架构：并发串行化、轮询规划与多通道端口绑定](04-Host-Architecture-Polling-Concurrency-and-Port-Management.md)**
   * 拆解硬件厂商自带调试软件的通用套路，总结上位机单串口线程安全串行化、连续寄存器批量读取优化，以及多 USB 转 RS485 通道下防止 `COM` 口漂移串台的硬件序列号绑定方案。

---

## 实战案例

1. [伺服振动台的 PLC 接入](Cases/Servo-Vibration-Table-Modbus-RTU.md)。用点位表、源码和实机联调记录核对标准功能码、`8N1` 兼容配置、32 位数据类型以及命令触发方式。
2. [五工位步进电机共用 RS485 总线](Cases/Multi-Station-Stepper-Drive-Modbus-RTU.md)。通过五站只读回包验证标准事务，并区分串口格式、设备动作与共用总线的软件实现。

## 接入任意新 Modbus 硬件的 10 分钟核对清单

接入新型号时，先从硬件通信手册核对以下 8 项，再据此配置通信和实现设备驱动。

| 序号 | 必查项 | 在说明书哪里找 | 常见易错点 |
| ---: | --- | --- | --- |
| 1 | **串口默认参数与站号** | 通信概述章节 | 波特率是 `9600`、`38400` 还是 `115200`？校验是 `8N1` 还是 `8E1`？站号由拨码决定还是寄存器决定？ |
| 2 | **支持的功能码限制** | 功能码列表 | 写单个 16 位寄存器支持 `0x06` 还是强制要求统一用 `0x10`？只读状态用 `0x03` 还是 `0x04`？ |
| 3 | **地址编号基准** | 报文示例字节 | 表格写十进制 `40001` 还是十六进制偏移 `0x0000`？直接核对示例报文的第 3、4 字节最可靠。 |
| 4 | **32 位双寄存器字序** | 32 位寄存器写入示例 | 高 16 位字在前（`ABCD`）还是**低 16 位字在前（`CDAB`）**？切勿不看示例直接按大端打包。 |
| 5 | **有符号性与单位倍率** | 寄存器属性列 | 类型是 `UINT16`、`INT16` 还是 `INT32`？单位是 `1 rpm` 还是 `0.01 rpm`（写 `6000` 才代表 `60.00`）？ |
| 6 | **复合位域与有效极性** | 位定义详情表 | 状态位与配置位从 `Bit 0` 起算；外部传感器输入位 `1` 代表物理高电压还是内部光耦导通？ |
| 7 | **断电保存方式** | 参数记忆说明 | 写寄存器是仅改 RAM 还是直写 EEPROM？若需单独发保存指令，注意 Flash 擦写次数上限。 |
| 8 | **动作生效条件与到位标志** | 运行指令与状态字章节 | 运动前是否需先切控制模式、清报警并使能？目标位置能否在运行中覆盖？读哪几个 bit 判断真正到位或报错？ |
