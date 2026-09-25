# 更新说明

本页记录对读者有影响的知识新增、内容更新和结构调整，便于快速了解近期变化。它不是完整的 Git 提交历史；具体改动仍以链接的知识条目和仓库提交记录为准。

## 2026-09-25

### 新增 (阶段 3：可复用内容纳入知识图谱)

- [空间变换与机器人运动学](Engineering/Robotics/Kinematics/index.md)：构建涵盖空间坐标系映射、SO(3) 单轴旋转矩阵、齐次变换矩阵 SE(3)、运动学变换链、空间建系准则、平面两连杆正解、DH 建系法则与单节变换推导、DH 表到正运动学流水线、平面 2R 解析逆解双解法、雅可比矩阵几何推导、运动学奇异性与腕部解耦、速度与力椭球对偶分析、逆速度求解与零空间投影、速度分解运动控制 (CLIK) 以及连杆间速度/加速度外推等 16 篇核心知识图谱条目。
- [多连杆刚体动力学建模](Engineering/Robotics/Dynamics/index.md)：构建涵盖单关节惯量/摩擦/重力模型、隔离体空间牛顿-欧拉方程、递归牛顿-欧拉动力学算法 (RNEA) 双向递推、驱动力矩四项物理分解解耦、两连杆拉格朗日标准型 ($M/C/G$) 闭式解析与斜对称性证明、动力学最小基参数集线性回归辨识等 6 篇核心动力学专题。
- [机器人运动规划与先进控制理论](Engineering/Robotics/Control/index.md)：构建涵盖三次/五次多项式与梯形速度 (LSPB) 轨迹时间律、单关节 PD/PID 闭环与重力前馈、计算力矩控制 (CTC) 非线性反馈线性化多轴解耦、工业伺服驱动电流/速度/位置三环级联控制等 4 篇核心控制算法专题。
- [ROS 2 工业级机器人工程架构](Engineering/Robotics/ROS2/index.md)：构建涵盖工业工作站坐标系拓扑规范与 TF2 动态变换树、MoveIt 2 运动规划与场景感知流水线、ros2_control 硬件接口抽象与可配置 `update_rate` 实时内核安全规范、机器人工具端 TCP 标定四点法与精度评测、机器人手眼标定算法（眼在手上与眼在手外）等 5 篇独立专题（严格收紧“一主题一知识点”）。
- **落实全量双向导航**：通过自动化注入与人工核对，为 LearningLab 全部 74 篇 HTML 页面嵌入直达对应核心知识图谱条目的回链导航条，并在实验看板 (`00-progress.html` 与 `ros2/00-progress.html`) 建立完整的分类跳转矩阵。
- **强化技术推导与工程边界**：
  - 修正逆速度运动学关于欧氏范数极小化的表述，明确其与惯量加权动能极小化的物理界限；
  - 纠正雅可比速度椭球物理直观，澄清一阶速度传递增益与二阶动力学加速度的本质区别；
  - 完善 MoveIt 2 执行边界，补全 `execute()` 返回错误码的工业级校验；
  - 厘清 `ros2_control` 控制主频的可配置机制 (`update_rate`) 与硬实时内核安全铁律，指出普通日志宏不具备硬实时确定性，准确区分非阻塞尝试机制（如 `RealtimePublisher` 基于 `std::mutex::try_lock()`）与跨线程无锁数据结构；
  - 完善手眼标定算法文档：严格推导 Eye-to-Hand 闭环方程 $\boldsymbol{A}_{eth}\boldsymbol{X}=\boldsymbol{X}\boldsymbol{B}_{eth}$，补齐基于 OpenCV 契约的 Base-to-Gripper 输入坐标逆转换代码，并在合成数据自闭环测试中直接调用 `perform_hand_eye_calibration()` 实测断言旋转和平移误差（机器精度级 $< 10^{-10}$）；
  - 修正 ROS 2 实战 04 逆解实验页回链定位，准确标示平面 2R 为“相关前置知识”。

### 维护

- 升级 `scripts/sync_docs.py`，支持 `.js`、`.css` 及静态媒体资源同步，同时设立 `EXCLUDED_DIR_NAMES` 排除边界，严格隔离未授权第三方教材扫描页与私有归档文件。
- 初始化机器人学板块体系骨架：建立 `Engineering/Robotics/` 领域总览，创建 `Kinematics/`、`Dynamics/`、`Control/`、`ROS2/` 体系与 `LearningLab/` 交互实验区入口，全站通过 MkDocs 严格构建校验（`mkdocs build --strict`）。
- 完成阶段 2 交互资产全量迁入：将 75 篇原生 HTML 学习页、11 个独立 JS 物理仿真台与题库引擎完整迁入 [LearningLab](Engineering/Robotics/LearningLab/index.md)。
- 响应阶段 1–2 验收反馈完成整改：
  - 修复已生成网站中的全部 23 处未解析引用（解除 `archive/` 过度排除，修正 22 处指向 `.md` 源码的链接至编译后页面，修复历史大单页 31 的相对跳转）；
  - 修复 `34-pid-position-control.js` 中 `disturb` 变量未定义的运行时脚本 Bug；
  - 彻底撤回误加入的简历文件及其公开构建，源项目原件严格保持不变；
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
