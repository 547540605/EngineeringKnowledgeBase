# 多通道 USB 转串口端口漂移与转换器序列号身份绑定

## 所属领域

```text
Engineering
└─ Hardware Integration
   └─ Serial Device Management
      └─ USB-to-RS485 Port Identity & Isolation
```

当一台工控机需要同时控制多套完全独立的 RS485 执行机构（例如 5 通道独立老化测试台、多工位夹具台）时，如何设计物理总线拓扑，以及如何防止 Windows 重分配 `COM` 端口号导致“张冠李戴”误控其他工位，是现场稳定性的关键问题。

## 两种多设备 RS485 拓扑对比

### 方案 A：单路 RS485 总线串联多从站（菊花链）

```text
工控机 (COM3) ──► [单路 USB-485] ═══╦══════╦══════╦═══► (A/B 总线手拉手)
                                 站号1  站号2  站号3
```

* **优点**：只占 1 个串口，硬件成本低、布线少。
* **局限**：
  1. 两线 RS485 是半双工，同一时刻只能一问一答，软件必须加锁排队分时轮询，设备越多单轴刷新越慢。
  2. 任一从站接线短路、A/B 接反或死机乱发数据，整条总线上所有工位可能一起瘫痪。
  3. 更换备件电机时，必须先人工拨码或刷写对应从站地址（`1..N`），不能即插即用。

### 方案 B：多路独立 RS485 通道一对一连接

```text
工控机 ──┬─► [USB-485 #1 (SN_A)] ──► 工位 1 电机 (站号 1)
         ├─► [USB-485 #2 (SN_B)] ──► 工位 2 电机 (站号 1)
         └─► [USB-485 #3 (SN_C)] ──► 工位 3 电机 (站号 1)
```

* **优点**：
  1. **真正并行与无锁通信**：每个工作线程独享一个物理串口句柄，无需跨工位总线仲裁。
  2. **单工位故障物理隔离**：某个工位断电、断线或驱动器报警，完全不影响其余工位继续长周期运行。
  3. **电机备件标准化**：所有电机均可保持出厂默认站号 `1`，减少现场改站号出错概率。
* **带来的新问题**：操作系统里同时出现多个同型号 USB 转串口设备，`COM` 口编号不再固定。

## Problem：为什么不能把 `COM1~COM5` 当作工位身份

在 Windows（或 Linux `/dev/ttyUSB*`）下，`COM3` 只是操作系统当前为某个串口驱动实例分配的**临时通信入口名**，并不代表物理工位身份。以下常见现场操作都可能导致 `COM` 号发生变化或互换：

1. 检修时将 5 个 USB 转 485 转换器拔出，再以不同顺序或插到不同 USB 插口。
2. 通过扩展 USB Hub 连接时，Hub 掉电重启或接触不良引起设备重新枚举。
3. 更换工控机、重装驱动或插入其他调试串口线。

若配置文件仅保存 `"station_1": "COM1"`，一旦转换器重枚举后物理工位 1 变成了 `COM4`、而工位 4 变成了 `COM1`，工位 1 的大摆角或高转速指令就会直接发给工位 4 的试样，造成试样损坏或机械碰撞。

## Root Cause：通信入口名与硬件身份未解耦

```text
错误绑定：工位 #1  ───────────────────────►  "COM1"（易变入口）
正确绑定：工位 #1  ──► 转换器唯一序列号 SN  ──(每次动态枚举解析)──► 当前 "COM4" ──► 物理接线固定的工位 #1 电机
```

## Solution：基于转换器唯一序列号（`serial_number`）的动态绑定

### 1. 选型前提与识别边界

* **硬件选型要求**：选用的工业 USB 转 RS485 转换器芯片（如正品 FTDI `FT232R`/`FT232H`、带独立 EEPROM 编程的 CP2102N 等）必须向操作系统报告**非空、全局唯一且断电重插不变的 USB 序列号（Serial Number）**。
  * 注意：部分廉价免晶振转换器（如普通版 CH340）没有独立 USB 序列号（系统读取为 `None` 或空字符串），也有部分一拖多转换卡的多个端口共用同一个父设备序列号，这类硬件无法仅靠 `serial_number` 唯一区分端口，选型时必须提前验证。
* **物理边界声明**：操作系统枚举到的是 **USB 转 485 转换器的序列号**，而不是转换器后面 RS485 双绞线另一端的电机。因此：
  * 每个转换器外壳需粘贴工位标签，并固定连接对应工位的电机；
  * 若人工拆换了转换器后端的 A/B 端子接线，软件无法仅凭转换器序列号感知，仍需人工核对。

### 2. 枚举与严格解析规则

以 Python `pyserial`（`serial.tools.list_ports.comports()`）为例，每个端口对象提供 `device`（如 `"COM4"`）、`description` 和 `serial_number`。动态解析一个工位的串口时，应同时满足以下校验：

```python
from serial.tools import list_ports


def enumerate_ports():
    return list(list_ports.comports())


def resolve_port(channel_id, channels, ports=None):
    serial_number = channels.get(str(channel_id), {}).get("adapter_serial_number")
    if not isinstance(serial_number, str) or not serial_number.strip():
        raise ValueError("尚未绑定转换器序列号，请在参数配置中确认物理工位并绑定设备。")

    if sum(c.get("adapter_serial_number") == serial_number for c in channels.values()) != 1:
        raise ValueError(f"转换器序列号 {serial_number} 被多个工位绑定。")

    ports = enumerate_ports() if ports is None else ports
    matches = [p for p in ports if p.serial_number == serial_number]
    if not matches:
        raise ValueError(f"绑定的转换器 {serial_number} 未连接。")
    if len(matches) != 1:
        raise ValueError(f"序列号 {serial_number} 对应多个串口，无法确认设备。")

    port = matches[0].device
    if sum(p.device == port for p in ports) != 1:
        raise ValueError(f"串口 {port} 的设备信息重复，无法确认设备。")
    return port
```

核心禁止项（Fail-Closed 原则）：
* **禁止回退到历史保存的 `COM` 号**：配置文件中保留的 `"port": "COM4"` 仅用于界面诊断展示，绝不能在序列号匹配失败时拿来兜底打开。
* **禁止按 `COM` 号排序自动分配**：不得把扫描到的前 5 个串口自动按 `COM` 大小分配给工位 1～5。
* **禁止静默覆盖原绑定**：更换新转换器导致序列号变化时，必须报错阻断该工位启动，由操作员确认物理接线后在停止状态下显式重新绑定。

### 3. 连接前复核与运行中断线锁存（Latch）

多工位长周期运行中，仅在配置界面解析一次是不够的，完整保护链路分为三道关口：

1. **启动前工作线程内二次解析**：点击“回零”或“启动”后，后台工作线程在真正构造 `serial.Serial(port=...)` 前再次调用 `resolve_port()`，防止界面刷新与点击启动之间发生插拔变化。
2. **周期巡检与异常锁存（Latched Invalidation）**：主界面定时器（如每 2 秒）重新枚举设备。若某个正在运行的工位出现转换器拔出、枚举失败或绑定的 `SN` 映射到了新的 `COM` 口，立即将该工作线程标记为连接失效锁存态（`_connection_error`）。
3. **底层发送守卫（Connection Guard）**：在驱动层每次向串口写入字节前先执行守卫回调检查 `_connection_error`。一旦断线锁存被触发，**即使转换器几秒后被重新插回原口，本次运动任务也必须终止报错，严禁自动重连继续运动**；必须人工确认机构安全、重新执行回零校准后再开始新测试。

> 注意：当 USB 转换器物理拔出或 RS485 断线时，上位机发送的“减速回零/停止”指令已无法送达电机。若希望通讯中断后电机自身自动停机，需配合驱动器内部的**串口通讯超时保护寄存器**（掉线超时自动停机）或外部硬件急停回路。

## 相关知识

- [串行通信与 8N1](../../../ComputerScience/Networking/SerialCommunication/Serial-Communication-and-8N1.md)
- [RS485 差分信号、半双工与总线连接](../../../ComputerScience/Networking/SerialCommunication/RS485-Differential-Half-Duplex-Bus.md)
- [Modbus 超时、重试与异常处理](../../../ComputerScience/Networking/IndustrialProtocols/Modbus/RTU/Modbus-Timeout-Retry-and-Exception-Handling.md)
- [步进电机、细分脉冲、开环/闭环与驱控一体基础](../MotionControl/Stepper-Motor-Microstepping-and-Integrated-Drive-Basics.md)
