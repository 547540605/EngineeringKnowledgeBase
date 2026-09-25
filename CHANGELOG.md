# 更新说明

本页记录对读者有影响的知识新增、内容更新和结构调整，便于快速了解近期变化。它不是完整的 Git 提交历史；具体改动仍以链接的知识条目和仓库提交记录为准。

## 2026-09-25

### 维护

- 升级 `scripts/sync_docs.py`，支持 `.js`、`.css` 及静态媒体资源同步，同时设立 `EXCLUDED_DIR_NAMES` 排除边界，严格隔离未授权第三方教材扫描页与私有归档文件。
- 初始化机器人学板块体系骨架：建立 `Engineering/Robotics/` 领域总览，创建 `Kinematics/`、`Dynamics/`、`Control/`、`ROS2/` 体系与 `LearningLab/` 交互实验区入口，全站通过 MkDocs 严格构建校验（`mkdocs build --strict`）。
- 完成阶段 2 交互资产全量迁入：将 75 篇原生 HTML 学习页、11 个独立 JS 物理仿真台与题库引擎完整迁入 [LearningLab](Engineering/Robotics/LearningLab/index.md)，个人求职简历归入 `Engineering/Career/`。
- 响应阶段 1–2 验收反馈完成整改：
  - 修复已生成网站中的全部 23 处未解析引用（解除 `archive/` 过度排除，修正 22 处指向 `.md` 源码的链接至编译后页面，修复历史大单页 31 的相对跳转）；
  - 修复 `34-pid-position-control.js` 中 `disturb` 变量未定义的运行时脚本 Bug；
  - 升级门禁脚本至 `scripts/quality_gate_learning_lab.py` v2.0，将覆盖范围从 8 篇扩展至全库 74 篇 HTML、11 个仿真引擎、61 个 Canvas 画布与 1621 处网站编译链接，全量 6 关 100% 满分通过（GREEN）。

## 2026-09-24

### 更新

- [NISTIR 7901：机器人力控制算法与闭环控制](Engineering/Robotics/Force-Control-and-Compliant-Assembly/NISTIR-7901-Force-Control-Algorithms.md)：为 Section V 的 A–F 按原文段落补充中文译文，并补上 Figure 1、2 的图注译文，方便与概述及工程补充对照。
- [NISTIR 7901：机器人力控制算法与闭环控制](Engineering/Robotics/Force-Control-and-Compliant-Assembly/NISTIR-7901-Force-Control-Algorithms.md)：逐节对照报告修正 A、D、E、F 的信号与定义，补全 Figure 2 反馈回路，并将独立仿真和 Demo 推断与原文分开；同步更正[学习路线](Engineering/Robotics/Force-Control-and-Compliant-Assembly/Robot-Force-Control-and-Compliant-Assembly-Learning-Path.md)对原文评价指标的表述。
- [NISTIR 7901：机器人力控制算法与闭环控制](Engineering/Robotics/Force-Control-and-Compliant-Assembly/NISTIR-7901-Force-Control-Algorithms.md)：删除 A–F 对照表中的“阅读要点”列，仅保留各方法的控制关系。
- [NISTIR 7901：机器人力控制算法与闭环控制](Engineering/Robotics/Force-Control-and-Compliant-Assembly/NISTIR-7901-Force-Control-Algorithms.md)：将 Section V 的 A–F 调整为并列章节，去除将 B–F 称作“其他方法”的误导性表述。
- [NISTIR 7901：机器人力控制算法与闭环控制](Engineering/Robotics/Force-Control-and-Compliant-Assembly/NISTIR-7901-Force-Control-Algorithms.md)：将报告相关的 A–F 算法、显式力控框图、PI 仿真和 Demo/USB 联系合并到同一专题，并统一公式与符号。

### 维护

- 在 Robotics 下增加“机器人力控制与柔顺装配”分类目录，将 NIST 专题、学习路线和图/仿真资源集中归档。
- 修正 NIST 专题中的 PI 仿真链接：iframe 使用页面 URL 的相对路径，直达链接使用文档源目录的相对路径，以通过严格构建并正确打开仿真。
- 文档同步脚本现在会复制 Engineering 与 ComputerScience 目录下的独立 HTML 仿真页面，使其能在知识库站点内嵌加载。
- 文档站点现已全局支持 MathJax；知识库插件同步加入公式书写规范，其他项目添加的数学内容发布后也能正确呈现。

## 2026-09-23

### 更新

- [NISTIR 7901：机器人力控制算法与闭环控制](Engineering/Robotics/Force-Control-and-Compliant-Assembly/NISTIR-7901-Force-Control-Algorithms.md)：将自绘图收敛为 NIST Figure 1 的核心结构与信号，移除额外系统方块和扩展说明。

### 维护

- 知识库文档同步脚本现在会复制 Engineering 与 ComputerScience 目录下的 SVG 图表资源，保证 Markdown 中的本地矢量图在站点构建后仍可显示。

### 新增

- [NISTIR 7901：机器人力控制算法与闭环控制](Engineering/Robotics/Force-Control-and-Compliant-Assembly/NISTIR-7901-Force-Control-Algorithms.md)：展开说明期望力、测量力、控制误差与控制输入的反馈关系，并区分 Demo 的速度输出与直接力命令。
- [机器人恒力控制与柔顺装配学习路线](Engineering/Robotics/Force-Control-and-Compliant-Assembly/Robot-Force-Control-and-Compliant-Assembly-Learning-Path.md)：将恒力保持、柔顺控制与 USB/连接器插拔串成可复用的学习路径，并区分各任务的控制目标与传感需求。

## 2026-09-21

### 新增

- [C# 数值字面量后缀、隐式转换与重载二义性](Engineering/DotNet/CSharp/CSharp-Numeric-Literal-Suffixes-and-Overload-Ambiguity.md)：说明 `int` 常量与 `ushort` 等窄整数混用时产生 `CS0121` 的原因，以及统一数值类型的解决方式。

### 维护

- 新增本更新说明页面；今后新增或明确更新知识条目时，会同步记录简短摘要。
- 将工程知识库插件纳入 GitHub Marketplace，并提供 [跨电脑安装指南](PLUGIN-INSTALL.md)。
