# 更新说明

本页记录对读者有影响的知识新增、内容更新和结构调整，便于快速了解近期变化。它不是完整的 Git 提交历史；具体改动仍以链接的知识条目和仓库提交记录为准。

## 2026-11-18

### 新增

- [Modbus 串口硬件通信工程专题](Engineering/Modbus/index.md)：建立统一的 Modbus 硬件通信复习与落地入口，串联散落的数据表示、串口/RS485 与 Modbus RTU 前置底座，并整理新硬件接入核对清单。
- [32 位多寄存器字序、有符号补码与定点数缩放](Engineering/Modbus/01-Multi-Register-Word-Order-Twos-Complement-and-Scaling.md)：详解双寄存器 `ABCD`/`CDAB` 字序差异、`INT16`/`INT32` 负数补码编解码及整数定点数倍率换算。
- [复合寄存器多比特位域拆装与读-改-写模式](Engineering/Modbus/02-Composite-Register-Bit-Fields-and-Read-Modify-Write.md)：总结任意位宽混合控制字/状态字的通用移位掩码公式与局部修改时的读-改-写流程。
- [寄存器断电保存边界、触发语义与动作状态轮询握手](Engineering/Modbus/03-Register-Persistence-Control-Modes-and-Motion-Handshake.md)：区分 RAM 工作寄存器与 Flash 断电保存寿命边界、四类写寄存器触发语义及异步物理动作轮询握手模板。
- [上位机串口架构：并发串行化、轮询规划与多通道端口绑定](Engineering/Modbus/04-Host-Architecture-Polling-Concurrency-and-Port-Management.md)：说明单串口半双工请求串行化、连续寄存器批量读取优化及多 USB 转 RS485 通道序列号防漂移方案。
- [Modbus RTU 实战 01：伺服振动台的 PLC 接入](Engineering/Modbus/Cases/Servo-Vibration-Table-Modbus-RTU.md)：对照源码、点位表和联调记录，说明标准功能码的互通范围、`8N1` 与规范的差异，以及 32 位数据和动作语义如何核实。

### 更新

- [Modbus RTU 实战 01：伺服振动台的 PLC 接入](Engineering/Modbus/Cases/Servo-Vibration-Table-Modbus-RTU.md)：补充点位到报文地址的映射、只读串口探测、状态采样以及触发写重试的边界。
- [Modbus 串口硬件通信工程专题](Engineering/Modbus/index.md)：新增协议标准、设备约定与上位机做法速查表，并澄清各篇中容易误读的字序、位域、动作握手和并发规则。

### 维护

- 更新 `README.md` 与知识库插件技能说明，明确禁止将特定供应商/设备型号私有协议或项目一次性资料写入知识库的反污染规则，并规范 `Engineering/` 工程专题聚合入口的组织方式。
- 移除具体供应商型号绑定的 `Engineering/HardwareIntegration/ElectricGripper/JODELL/EPG-HP` 夹爪寄存器映射文档，保持知识库聚焦跨项目复用的通用原理与工程实践。

## 2026-10-24

### 新增

- [共享控制器状态与用例隔离](Engineering/DotNet/Shared-Controller-State-and-Case-Isolation.md)：说明长生命周期控制器的可变状态为何会跨用例残留，以及何时应显式覆盖或恢复。

### 更新

- [C# 类型测试与转换](Engineering/DotNet/CSharp/CSharp-Type-Testing-and-Conversion.md)：补充接口变量访问实现类成员的 `CaseMark` 案例，说明父子类匹配和不匹配控制器的处理边界。

## 2026-10-10

### 新增

- [C# 方法隐藏（CS0108）与接口重新实现](Engineering/DotNet/CSharp/CSharp-Method-Hiding-CS0108-and-Interface-Reimplementation.md)：区分非虚方法隐藏、接口重新映射和虚方法重写，说明不同静态类型入口为何可能跳过子类动作。

## 2026-10-08

### 新增

- [Bash `~/.bashrc` 启动与 ROS 环境的防重复配置](Engineering/Linux/Bashrc-Startup-and-Idempotent-ROS-Environment-Setup.md)：用前后文件内容和预期输出说明新终端加载、当前终端生效，以及 `grep -qxF`、`||`、`printf`、`>>` 的作用。

### 更新

- [Bash `~/.bashrc` 启动与 ROS 环境的防重复配置](Engineering/Linux/Bashrc-Startup-and-Idempotent-ROS-Environment-Setup.md)：将长命令中的 `-q`、`-x`、`-F`、两处字符串、`%s`、`\n` 与 `>>` 各自拆开说明，并补充 `printf` 的实际输出示例。

## 2026-09-30

### 结构调整

- [机器人力控制与柔顺装配](https://547540605.github.io/robotics-notes-site/force-control-and-compliant-assembly/)已迁入机器人学站点，作为独立专题维护；第 36 课只链接到专题，不合并正文。知识库 `Engineering/Robotics` 仅保留[索引](Engineering/Robotics/index.md)与检索关键词。
- 知识库站点构建时为旧专题文章和 PI 仿真网址生成跳转页，避免已有网页链接失效；源仓库不再保留第二份正文与素材。

### 维护

- 旧力控专题的跳转页改为站点构建后生成，保留旧网址，同时让知识库 Robotics 导航只显示 Index。

## 2026-09-26

### 结构调整

- 撤销 9 月 25–26 日将独立机器人学课程并入知识库的改动。机器人学课程、交互页与 ROS 2 学习资料继续由原项目维护；知识库的[机器人学入口](Engineering/Robotics/index.md)直接跳转到[原版课程站点](https://547540605.github.io/robotics-notes-site/)。
- 保留知识库原有的[机器人力控制与柔顺装配](https://547540605.github.io/robotics-notes-site/force-control-and-compliant-assembly/)专题；先前误公开的简历仍保持移除。
- 课程站点只发布原版学习页及其交互脚本，不包含简历、教材扫描页或 PDF。

## 2026-09-24

### 更新

- [NISTIR 7901：机器人力控制算法与闭环控制](https://547540605.github.io/robotics-notes-site/force-control-and-compliant-assembly/nistir-7901.html)：为 Section V 的 A–F 按原文段落补充中文译文，并补上 Figure 1、2 的图注译文，方便与概述及工程补充对照。
- [NISTIR 7901：机器人力控制算法与闭环控制](https://547540605.github.io/robotics-notes-site/force-control-and-compliant-assembly/nistir-7901.html)：逐节对照报告修正 A、D、E、F 的信号与定义，补全 Figure 2 反馈回路，并将独立仿真和 Demo 推断与原文分开；同步更正[学习路线](https://547540605.github.io/robotics-notes-site/force-control-and-compliant-assembly/learning-path.html)对原文评价指标的表述。
- [NISTIR 7901：机器人力控制算法与闭环控制](https://547540605.github.io/robotics-notes-site/force-control-and-compliant-assembly/nistir-7901.html)：删除 A–F 对照表中的“阅读要点”列，仅保留各方法的控制关系。
- [NISTIR 7901：机器人力控制算法与闭环控制](https://547540605.github.io/robotics-notes-site/force-control-and-compliant-assembly/nistir-7901.html)：将 Section V 的 A–F 调整为并列章节，去除将 B–F 称作“其他方法”的误导性表述。
- [NISTIR 7901：机器人力控制算法与闭环控制](https://547540605.github.io/robotics-notes-site/force-control-and-compliant-assembly/nistir-7901.html)：将报告相关的 A–F 算法、显式力控框图、PI 仿真和 Demo/USB 联系合并到同一专题，并统一公式与符号。

### 维护

- 在 Robotics 下增加“机器人力控制与柔顺装配”分类目录，将 NIST 专题、学习路线和图/仿真资源集中归档。
- 修正 NIST 专题中的 PI 仿真链接：iframe 使用页面 URL 的相对路径，直达链接使用文档源目录的相对路径，以通过严格构建并正确打开仿真。
- 文档同步脚本现在会复制 Engineering 与 ComputerScience 目录下的独立 HTML 仿真页面，使其能在知识库站点内嵌加载。
- 文档站点现已全局支持 MathJax；知识库插件同步加入公式书写规范，其他项目添加的数学内容发布后也能正确呈现。

## 2026-09-23

### 更新

- [NISTIR 7901：机器人力控制算法与闭环控制](https://547540605.github.io/robotics-notes-site/force-control-and-compliant-assembly/nistir-7901.html)：将自绘图收敛为 NIST Figure 1 的核心结构与信号，移除额外系统方块和扩展说明。

### 维护

- 知识库文档同步脚本现在会复制 Engineering 与 ComputerScience 目录下的 SVG 图表资源，保证 Markdown 中的本地矢量图在站点构建后仍可显示。

### 新增

- [NISTIR 7901：机器人力控制算法与闭环控制](https://547540605.github.io/robotics-notes-site/force-control-and-compliant-assembly/nistir-7901.html)：展开说明期望力、测量力、控制误差与控制输入的反馈关系，并区分 Demo 的速度输出与直接力命令。
- [机器人恒力控制与柔顺装配学习路线](https://547540605.github.io/robotics-notes-site/force-control-and-compliant-assembly/learning-path.html)：将恒力保持、柔顺控制与 USB/连接器插拔串成可复用的学习路径，并区分各任务的控制目标与传感需求。

## 2026-09-21

### 新增

- [C# 数值字面量后缀、隐式转换与重载二义性](Engineering/DotNet/CSharp/CSharp-Numeric-Literal-Suffixes-and-Overload-Ambiguity.md)：说明 `int` 常量与 `ushort` 等窄整数混用时产生 `CS0121` 的原因，以及统一数值类型的解决方式。

### 维护

- 新增本更新说明页面；今后新增或明确更新知识条目时，会同步记录简短摘要。
- 将工程知识库插件纳入 GitHub Marketplace，并提供 [跨电脑安装指南](PLUGIN-INSTALL.md)。
