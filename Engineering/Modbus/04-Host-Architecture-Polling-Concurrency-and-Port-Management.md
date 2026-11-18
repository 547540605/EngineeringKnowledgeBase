# 上位机串口架构：并发串行化、轮询规划与多通道端口绑定

## 所属领域

```text
Engineering
└─ Modbus
   └─ Host Software Architecture, Polling & Serial Port Identity
```

## 前置与关联知识

- [串口通信与 115200 8N1](../../ComputerScience/Networking/SerialCommunication/Serial-Communication-and-8N1.md)
- [RS485 差分信号、半双工与总线连接](../../ComputerScience/Networking/SerialCommunication/RS485-Differential-Half-Duplex-Bus.md)
- [Modbus 超时、重试与异常响应](../../ComputerScience/Networking/IndustrialProtocols/Modbus/RTU/Modbus-Timeout-Retry-and-Exception-Handling.md)
- [寄存器断电保存边界、触发语义与动作状态轮询握手](03-Register-Persistence-Control-Modes-and-Motion-Handshake.md)

---

理解了单条报文的编解码与设备握手规则后，要在 PC 工控机上写出长期运行不卡死、不串包、重插拔 USB 线不误控其他工位的工业上位机软件，还需要处理好**线程并发模型、寄存器轮询规划与物理端口身份管理**。

## 一、看穿常见硬件厂商自带调试软件的本质

很多工业驱动器、传感器或模块会随附一个界面庞杂的“官方配置/组态软件”（常见形态是左侧一棵几百个节点的寄存器树，未连上时满屏 `???` 或通信报警，右侧是分标签的参数表甚至简易脚本区）。

从软件架构角度拆解，这类工具其实只做三件事：

```text
1. 后台周期轮询器：按 XML/INI 点位表循环发送 0x03/0x04，把读回的整数按倍率换算显示在界面“当前读取值”栏
2. 单项即时写入器：点击某参数旁的【设置】按钮，立即发一条 0x06 或 0x10 修改设备 RAM 寄存器
3. 固化与内置脚本：点击【断电保存】向保存寄存器发触发值；若带“内置编程区”，则是把简单动作序列写进设备高地址区脱机自运行
```

**工程协作建议**：
* 首次拿到陌生硬件时，可先用厂商工具连上单台设备，验证接线、查看固件版本、设置固定参数（如额定电流、滤波参数）并断电保存；如果厂商工具支持显示原始收发十六进制报文日志，更是核对字节序和 CRC 的最佳参照物。
* **切勿同时打开两个程序占用同一个 `COM` 口**，用厂商工具调完参数后必须关闭它（或断开串口连接），自己的上位机才能打开该端口。

---

## 二、单串口半双工的并发禁忌与请求串行化

### 1. 为什么绝不能多线程直接共享写入同一个串口

两线 RS485 是半双工链路。Modbus 串行规范要求同一总线一次只进行一个事务，RTU 报文也没有事务 ID。如果 UI 刷新定时器线程正在读状态寄存器（`0x03`），与此同时用户点击按钮在主线程直接调用 `serial.write()` 发送写速度命令（`0x06`），可能出现两类故障：

1. **发送帧字节交织或总线冲突**：两帧字节混在一起发出，CRC 全部失效；或从站正在回包时主站强行抢占 A/B 线发送新请求，导致差分信号碰撞损坏。
2. **响应张冠李戴**：线程 A 读走了本属于线程 B 的响应字节，两边同时报长度不对或 CRC 校验失败。

### 2. 上位机实现事务串行化的两种方式

工作线程和互斥锁都是用来满足总线事务串行化要求的软件设计。应用可按命令来源和线程模型选择。

#### 模式一：单通道专属工作线程（Worker Thread + 消息/状态队列）

最适合像“往复疲劳测试”“自动化工序流程”这类需要连续编排动作的场景：
* **串口生命周期完全归属后台 Worker 线程独享**，UI 主线程绝不直接碰串口对象；
* Worker 线程在一个顺序循环里自己完成“下发动作 $\to$ 轮询状态字 $\to$ 计算进度”，通过线程安全信号（如 Qt `Signal`、C# `IProgress<T>` 或不可变快照）单向推给 UI 刷新界面；
* UI 的“暂停 / 停止”操作仅修改原子标志位（或投递命令队列），由 Worker 在轮询间隙安全响应。

#### 模式二：用互斥锁保护完整的请求和响应

如果后台监控和界面操作通过同一个网关访问串口，可以用互斥锁（如 Python 的 `threading.Lock` 或 C# 的 `SemaphoreSlim(1, 1)`）保证请求和响应由同一个调用处理，并确保下一次发送前满足帧间静默间隔：

```python
import time
import threading


class ThreadSafeModbusPort:
    def __init__(self, serial_port, min_silent_interval_s=0.005):
        self._ser = serial_port
        self._lock = threading.Lock()
        self._min_interval = min_silent_interval_s
        self._last_io_end = 0.0

    def transact(self, request_frame: bytes, expected_resp_len: int) -> bytes:
        with self._lock:
            # 1. 保证两帧之间满足最小静默间隔（115200 波特率下 3.5 字符约 0.35ms，工程常留 2~5ms 余量）
            elapsed = time.monotonic() - self._last_io_end
            if elapsed < self._min_interval:
                time.sleep(self._min_interval - elapsed)

            # 2. 发送前清空上一次超时可能迟到残留的脏字节，防止错位解析
            self._ser.reset_input_buffer()
            self._ser.write(request_frame)

            # 3. 先读前 2 字节判断是正常响应还是 Modbus 异常响应 (功能码最高位为 1，固定 5 字节)
            header = self._ser.read(2)
            if len(header) < 2:
                self._last_io_end = time.monotonic()
                raise TimeoutError("设备通信无响应")

            if header[1] & 0x80:
                rest = self._ser.read(3)  # 异常码 1B + CRC 2B
                self._last_io_end = time.monotonic()
                resp = header + rest
                # 校验 CRC 后抛出明确的 Modbus 协议异常码...
                raise RuntimeError(f"Modbus 异常响应: func=0x{header[1]:02X}, code=0x{rest[0]:02X}")

            rest = self._ser.read(expected_resp_len - 2)
            self._last_io_end = time.monotonic()
            resp = header + rest
            if len(resp) < expected_resp_len:
                raise TimeoutError(f"响应字节不完整: 期望 {expected_resp_len}B, 实收 {len(resp)}B")
            return resp
```

> **实战细节：为什么发送前要 `reset_input_buffer()`？**
> 假设上一拍请求因偶发延迟刚好在 `300 ms` 超时后第 `305 ms` 才到达串口驱动接收缓冲区。如果下一拍发新请求前不清空输入缓冲，`read()` 立刻读到的其实是**上一拍迟到的旧响应**，从此以后每一拍请求与响应全部错位一拍！在严格一问一答的独占主站模式下，发新请求前清空残留接收缓冲能确保迅速自愈恢复同步。

---

## 三、轮询规划：连续寄存器批量读取（Block Read）

每次独立的 Modbus RTU 请求往返，除了线路比特传输耗时（在 `115200 8N1` 下每字节约 $0.087\text{ ms}$），还要加上 **USB 帧调度延迟（FTDI/CH340 等 USB 转串口常见 $1 \sim 16\text{ ms}$ 往返延迟）+ 从站 MCU 解析耗时 + 帧间静默间隔**。

* 如果监控界面需要刷新“实时位置（`0x0004~0x0005`）”和“运行状态（`0x0006~0x0007`）”，分两次发送 `0x03` 往返耗时约 $10 \sim 30\text{ ms}$；
* 合并为一条请求 `01 03 00 04 00 04 [CRC]` **一次性连续读取 4 个寄存器（8 字节数据）**，在线路上只多传 4 个字节（约 $0.35\text{ ms}$），却省掉了一整次往返延迟，通信效率直接提升近一倍。

**合并读取的两个边界注意**：
1. 标准 Modbus 单次 `0x03` 最多读取 `125` 个寄存器（250 字节），部分轻量级嵌入式从站限制更窄（如单帧不超过 200 字节），不可超限。
2. **不要盲目跨越未定义的地址空洞**：若 `0x0004~0x0007` 有定义、`0x0098~0x009A` 有定义，但中间存在未公开地址，某些严格校验地址表的从站会对跨越中间空洞的连续读直接返回 `Illegal Data Address (0x02)` 异常。此时应按连续区间分成两次批量读。

---

## 四、多设备拓扑选择与 USB 串口身份防漂移

当一台上位机需要同时控制多台相同的 RS485-Modbus 设备（如多工位测试台）时，物理上有两种接法：

| 对比维度 | 单路 RS485 总线串联多从站（菊花链） | 多路独立 USB 转 RS485 一对一连接 |
| --- | --- | --- |
| 从站地址要求 | 每台设备必须预先改设为不同站号（`1, 2, ..., N`） | 所有设备均可保持出厂默认站号 `1`，备件更换免配置 |
| 并发与实时性 | 所有工位共享一条半双工总线，必须排队分时轮询 | 各工位物理隔离，多线程 100% 真正并行通信 |
| 故障隔离能力 | 任一设备 A/B 短路或死机占线可能导致整条总线瘫痪 | 单工位断电、断线或报警完全不影响其余工位 |
| 串口管理痛点 | 只需绑定 1 个 `COM` 口 | 多个 USB 转换器同时接入，操作系统分配的 `COM` 号可能漂移 |

### 按 USB 转换器身份绑定工位

在多路独立 USB 转 RS485 拓扑中，Windows 的 `COM3`、Linux 的 `/dev/ttyUSB0` 只是当前会话的临时设备节点名。重新插拔 USB、更换插口或扩展 Hub 掉电重连后，`COM` 号顺序很容易重新洗牌。

为避免“工位 1 的控制参数发给了工位 4 的物理硬件”，上位机应采用**硬件序列号绑定机制**：

1. **选型带唯一序列号的转换器芯片**：选用每个转换器拥有全局唯一、断电不变 `serial_number` 的工业级 USB 转 RS485 模块（需注意部分廉价转换芯片不带独立序列号，或一拖多转换卡多口共用同一父序列号，选型阶段先用枚举脚本实测确认）。
2. **配置存储序列号而非信任历史 `COM` 口**：
   * 首次部署时人工核对转换器物理标签与工位接线，将每个工位与对应转换器的 `serial_number` 绑定存入配置文件；
   * 每次打开串口前动态枚举系统端口，精确匹配 `serial_number` 解析出当前分配的 `COM` 号；
   * 若匹配不到、匹配到多个端口或多个工位重复绑定同一序列号，直接报错阻断该工位启动（**Fail-Closed，绝不回退使用旧 `COM` 号或按端口号排序瞎猜**）。
3. **运行中断线锁存（Latched Disconnect）与硬件掉线看门狗**：
   * 运行期间若定时巡检发现某工位转换器掉线或映射的 `COM` 口突变，立即锁存该工位的连接失效状态并终止当前工作线程；即使随后转换器被重新插回，也不得自动重连继续未完动作，必须由操作员确认安全并重新初始化/回零后再启动。
   * 同时利用设备自身的**通信超时保护寄存器（掉线看门狗）**：由于物理拔线瞬间上位机的停止指令已发不出去，若硬件动作存在失控风险，可在设备端启用通信超时自动停机保护。
