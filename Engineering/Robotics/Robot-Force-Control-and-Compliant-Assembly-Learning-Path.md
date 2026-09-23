# 机器人恒力控制与柔顺装配学习路线

## 领域归属

- 主领域：Engineering / Robotics / Force Control and Compliant Manipulation。
- 上游知识：反馈控制、离散 PID、机器人运动接口、接触力学、传感器与信号处理。
- 相关知识：力调节（force regulation）、力跟踪（force tracking）、阻抗控制、导纳控制、混合力/位置控制、接触状态识别、插孔装配与卡滞分析。
- 下游应用：恒力压合、磨抛、USB/连接器插拔、Peg-in-Hole、柔性零件装配。

## 学习目标

从恒力保持出发，理解机器人如何在环境接触中稳定调节作用力，并扩展到需要定位、对准、搜索、插入和退出的柔顺装配任务。路线用于建立概念和比较方法，不要求某个 Demo 直接采用所有文献算法。

## 先区分两类任务

### 恒力保持

机器人已经建立接触后，持续调节法向运动，使测得的力接近设定值。重点通常是接触过渡、超调、稳定时间、稳态误差、保持期间波动，以及环境刚度或外部扰动变化时的恢复能力。

### 柔顺插拔与装配

这是接触任务，不只是恒力设定值跟踪。典型任务可能包括：

1. 靠近目标并初步对准。
2. 低速建立接触并判断接触状态。
3. 根据力、力矩或视觉反馈进行微调、搜索和消除偏差。
4. 插入并判断到位，出现卡滞时停止或退出。
5. 拔出或解除接触，并确认连接器未被损伤。

恒力调节可以成为插拔过程中的一个控制环节，但不能代替对准、接触状态识别和卡滞处理。

## 推荐学习顺序

### 1. 力控方法和评价指标总览

先读 NIST 的 [Best Practices and Performance Metrics Using Force Control for Robotic Assembly](https://www.govinfo.gov/content/pkg/GOVPUB-C13-d554356d2e6e8bcd33d4ebb8b45e370e/pdf/GOVPUB-C13-d554356d2e6e8bcd33d4ebb8b45e370e.pdf)。重点认识显式力控、刚度、阻抗和导纳等方法，以及稳定时间、超调、稳态误差、障碍响应等评价维度。

再读 Schumacher 等人的 [An Introductory Review of Active Compliant Control](https://www.sim.informatik.tu-darmstadt.de/publ/download/2019_An_Introductory_Review_of_Active_Compliant_Control_Preprint.pdf)，建立混合力/位置、并行力/位置、阻抗和导纳控制之间的分类与选型框架。

### 2. 恒力调节与力控理论

阅读 Villani 和 De Schutter 的 [Force Control](https://link.springer.com/book/10.1007/978-3-319-32552-1)，关注直接力控、间接力控、力调节闭环和实验验证。按需补读 NIST 的 [IR 8097: Survey of Solutions Using Force Control for Assembly](https://nvlpubs.nist.gov/nistpubs/ir/2015/NIST.IR.8097.pdf)，了解装配场景中的力控实现和比较方法。

阅读时区分控制器的目标量、反馈量和输出量：例如目标力与实测力形成误差，控制器可能输出力/扭矩、速度或位置修正。控制输出的物理意义取决于机器人可用的底层接口。

### 3. 柔顺控制：阻抗与导纳

先读 Hogan 的 [Contact and Physical Interaction](https://www.annualreviews.org/content/journals/10.1146/annurev-control-042920-010933)，理解接触动力学，以及机器人与环境耦合导致的稳定性问题。

再读 Keemink 等人的 [Admittance Control for Physical Human-Robot Interaction](https://journals.sagepub.com/doi/full/10.1177/0278364918768950)，重点看力信号滤波、内外环带宽、虚拟阻尼、延迟和柔顺稳定性。阻抗/导纳的核心不是单纯“把力调成一个数”，而是设计力与运动之间期望呈现的动态关系。

### 4. 力/位置分工

阅读 Raibert 和 Craig 的经典论文 [Hybrid Position/Force Control of Manipulators](https://doi.org/10.1115/1.3139652)，理解如何依据任务约束，把某些方向设为位置控制、另一些方向设为力控制。典型概念例子是沿表面切向控制位置，沿接触法向调节力。

### 5. 插孔、连接器和 USB 插拔

阅读 Whitney 的 [Quasi-Static Assembly of Compliantly Supported Rigid Parts](https://doi.org/10.1115/1.3149634)，了解插入过程中的几何误差、接触力、柔顺支撑和卡滞条件。

然后看 Suomalainen 等人的 [A Survey of Robot Manipulation in Contact](https://doi.org/10.1016/j.robot.2022.104224)，把插拔放在接触操作、工件对准、接触状态利用的更大背景下。最后读 Song 等人的 USB 案例 [USB Assembly Strategy Based on Visual Servoing and Impedance Control](https://doi.org/10.1109/URAI.2015.7358873)，观察视觉粗对准与力/扭矩反馈下柔顺接触如何配合。

## 阅读时建议记录的问题

对每种控制方案，至少回答：

- 控制器的输入、反馈和输出分别是什么？输出是力/扭矩、速度还是位置？
- 使用什么传感器，测了哪些力/力矩方向？采样和控制带宽是多少？
- 任务如何划分接近、接触、对准、插入、到位和退出等状态？状态转换依据是什么？
- 如何限制超力、超行程、卡滞和数据异常？
- 用哪些指标比较稳定性、精度、速度、成功率和对工件的损伤？
- 结论依赖什么前提：机器人控制接口、环境刚度、传感器布置、工装柔顺性或视觉精度？

## 与单轴恒力 Demo 的关系

当前 Demo 可作为单方向恒力调节的具体案例：压力板提供标量反馈，力误差由 PID 转成单轴运动指令。它适合帮助理解力反馈闭环，但不等同于完整的六维柔顺装配系统。

USB 插拔还需处理横向偏差、倾斜、接触边缘和卡滞。相关研究常使用视觉、多个方向的力/力矩测量或机械柔顺结构；单个标量力值不能单独分辨所有这些接触状态。此差异是传感和任务建模范围的区别，不代表单轴恒力方案本身不合理。

## 相关知识

- 上游：离散反馈控制、PID、积分饱和、采样周期与延迟、接触力学、机器人运动控制接口。
- 并列：阻抗控制、导纳控制、混合力/位置控制、接触状态估计、视觉伺服、Remote Center Compliance（RCC）。
- 下游：恒力压合与磨抛、Peg-in-Hole、连接器插拔、柔性零件装配、卡滞检测和安全退出策略。
