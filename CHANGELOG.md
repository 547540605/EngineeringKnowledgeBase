# 更新说明

本页记录对读者有影响的知识新增、内容更新和结构调整，便于快速了解近期变化。它不是完整的 Git 提交历史；具体改动仍以链接的知识条目和仓库提交记录为准。

## 2026-09-24

### 更新

- [显式力控制与闭环控制系统框图](Engineering/Robotics/Explicit-Force-Control-Closed-Loop.md)：将 PI 公式改为 LaTeX，并启用 MathJax 以正确显示上下标和积分表达式。
- [显式力控制与闭环控制系统框图](Engineering/Robotics/Explicit-Force-Control-Closed-Loop.md)：补齐 NIST A 节的 Figure 2 PI 框图，与 Figure 1 的通用闭环结构配套说明。
- [显式力控制与闭环控制系统框图](Engineering/Robotics/Explicit-Force-Control-Closed-Loop.md)：移除误写为 Figure 1 信号的 $u(t)$，统一用原文命令力符号 $F_C$。
- [显式力控制与闭环控制系统框图](Engineering/Robotics/Explicit-Force-Control-Closed-Loop.md)：将静态 2 N 算例替换为可启动、停止和继续的 PI 仿真，展示目标力、实际力与 P/I 项变化。
- [显式力控制与闭环控制系统框图](Engineering/Robotics/Explicit-Force-Control-Closed-Loop.md)：补充 NISTIR 7901 Section V-B–F 的刚度、阻抗、导纳、隐式力与自然导纳控制，并说明其与恒力 Demo、USB 插拔任务的区别和联系。

### 维护

- 文档同步脚本现在会复制 Engineering 与 ComputerScience 目录下的独立 HTML 仿真页面，使其能在知识库站点内嵌加载。
- 文档站点现已全局支持 MathJax；知识库插件同步加入公式书写规范，其他项目添加的数学内容发布后也能正确呈现。

## 2026-09-23

### 更新

- [显式力控制与闭环控制系统框图](Engineering/Robotics/Explicit-Force-Control-Closed-Loop.md)：将自绘图收敛为 NIST Figure 1 的核心结构与信号，移除额外系统方块和扩展说明。

### 维护

- 知识库文档同步脚本现在会复制 Engineering 与 ComputerScience 目录下的 SVG 图表资源，保证 Markdown 中的本地矢量图在站点构建后仍可显示。

### 新增

- [显式力控制与闭环控制系统框图](Engineering/Robotics/Explicit-Force-Control-Closed-Loop.md)：展开说明期望力、测量力、控制误差与控制输入的反馈关系，并区分 Demo 的速度输出与直接力命令。
- [机器人恒力控制与柔顺装配学习路线](Engineering/Robotics/Robot-Force-Control-and-Compliant-Assembly-Learning-Path.md)：将恒力保持、柔顺控制与 USB/连接器插拔串成可复用的学习路径，并区分各任务的控制目标与传感需求。

## 2026-09-21

### 新增

- [C# 数值字面量后缀、隐式转换与重载二义性](Engineering/DotNet/CSharp/CSharp-Numeric-Literal-Suffixes-and-Overload-Ambiguity.md)：说明 `int` 常量与 `ushort` 等窄整数混用时产生 `CS0121` 的原因，以及统一数值类型的解决方式。

### 维护

- 新增本更新说明页面；今后新增或明确更新知识条目时，会同步记录简短摘要。
- 将工程知识库插件纳入 GitHub Marketplace，并提供 [跨电脑安装指南](PLUGIN-INSTALL.md)。
