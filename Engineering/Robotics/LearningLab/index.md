# 机器人学交互实验区 (LearningLab)

欢迎来到机器人学交互实验区。本区域收录了基于现代 Web 标准构建的原生交互式仿真台、物理引擎、逆运动学计算器、3D 可视化面板与每日自测题库。

本实验区与机器人知识图谱（运动学、动力学、轨迹规划、机器人控制与 ROS 2）紧密关联，为理论知识条目提供可操作、可验证的“活体实验台”。

---

## 🧭 实验区全景收录入口

### 1. 理论主线与动力学交互实验室 (Craig Ch 01 ~ Ch 11)
* [🧭 全景学习进度总指挥看板](00-progress.html)：涵盖 01~39 篇理论学习路径、知识通关状态与自测指引。
* [📖 全景双栏学习阅读器](reader.html)：左侧全局目录树，右侧单页连贯阅读与实时演练。
* [🏆 智能题库与考核中心](quiz-center.html)：包含每日三题抽测、错题集与全套章节自测题库。
* [🔬 两连杆 RNEA 惯性力与关节力矩仿真台](31c-rnea-two-link-simulation-lab.html)：动态拖动姿态、速度与角加速度，实时观察空间外推与内推平衡。
* [⚡ 计算力矩控制 (CTC) 与纯 PID 轨迹跟踪对比实验台](35-computed-torque-control.html)：对比非线性模型前馈、负载失配与力矩饱和跟踪误差。
* [🤝 机器人力控制、阻抗与导纳顺应性实验台](36-force-impedance-admittance-control.html)：虚拟弹簧-阻尼模型，观察接触碰撞与受力顺应。
* [🔄 两连杆端到端闭环动力学积分仿真台](37-two-link-closed-loop-simulation.html)：轨迹给定 $\to$ 计算力矩控制 $\to$ 动力学数值积分全链路。

---

### 2. ROS 2 现代机器人工程实战演练区 (ROS2-00 ~ ROS2-20)
* [🗺️ ROS 2 工程实战看板与进阶路线](ros2/00-progress.html)：六大工程阶段（数字孪生 $\to$ 3R 逆解 $\to$ 轨迹规划 $\to$ MoveIt 2 $\to$ 在线闭环 $\to$ 工位工程化）。
* [📐 3R 机械臂几何与解析逆运动学求解器](ros2/04-3r-analytic-ik.html)：双分支解析逆解、正运动学回代误差与工作空间极限验证。
* [📈 笛卡尔直线插补与五次多项式时间律](ros2/06-cartesian-line-and-time-law.html)：$q(t), \dot{q}(t), \ddot{q}(t)$ 光滑连续性与直线路径采样。
* [🎛️ ros2_control、轨迹 Action 与 Fake Hardware](ros2/13-ros2-control-and-fake-hardware.html)：Controller Manager、Action 状态机与硬件接口契约。
* [🏭 任务状态机、I/O 交互与异常恢复策略](ros2/19-task-state-machine-and-io.html)：工位循环 Guard 保护条件、超时处理与安全恢复。

---

## 🔗 与知识图谱的联动

* [运动学体系 (Kinematics)](../Kinematics/index.md)
* [动力学体系 (Dynamics)](../Dynamics/index.md)
* [控制理论 (Control)](../Control/index.md)
* [力控制与柔顺装配 (Force-Control-and-Compliant-Assembly)](../Force-Control-and-Compliant-Assembly/index.md)
* [ROS 2 现代工业工程栈 (ROS2)](../ROS2/index.md)
