# 机器人工程体系 (Robotics)

欢迎查阅机器人学与工业机器人运控知识体系。本板块整合了空间几何变换、正逆运动学、速度与雅可比分析、多连杆动力学建模、非线性前馈控制、环境接触顺应性（力/阻抗控制）以及现代 ROS 2 工业级工程实践。

---

## 🗺️ 机器人学知识版图

```text
Robotics
├── Kinematics/                            # 空间变换、齐次矩阵、DH 建模与解析/微分逆解（16 篇核心知识专题）
├── Dynamics/                              # 牛顿-欧拉递推 (RNEA)、动力学方程 (M/C/G) 与参数辨识
├── Control/                               # 轨迹规划、PID 位置闭环、计算力矩控制 (CTC) 与级联伺服
├── Force-Control-and-Compliant-Assembly/  # 机器人力控制、阻抗与柔顺装配（NISTIR 7901 标准）
├── ROS2/                                  # URDF 建模、TF2 坐标链、MoveIt 2 与 ros2_control 控制器栈
└── LearningLab/                           # 交互实验区：01~39 理论仿真台与 ROS 2 教学实战演练（74 篇交互课程）
```

---

## 📚 核心专题入口

### 1. 空间变换与机器人运动学 (Kinematics)
* [📐 机器人运动学知识体系 (Kinematics)](Kinematics/index.md)：系统涵盖三维空间位姿与旋转矩阵 $SO(3)$、齐次变换矩阵 $SE(3)$、Denavit-Hartenberg (DH) 连杆建系法则、平面 2R 解析正逆解、几何雅可比矩阵推导、运动学奇异性分析、速度可操作度椭球与阻尼最小二乘 (DLS) 闭环运动控制等 16 篇单概念权威条目。

### 2. 多连杆刚体动力学建模 (Dynamics)
* [⚙️ 机器人动力学体系 (Dynamics)](Dynamics/index.md)：涵盖单关节惯量与摩擦模型、隔离体牛顿-欧拉方程、递推牛顿-欧拉动力学算法 (RNEA) 前向几何与后向力平衡外推、两连杆拉格朗日闭式方程（$M(q)\ddot{q} + C(q,\dot{q})\dot{q} + G(q) = \tau$）以及最小动力学惯性参数集线性回归辨识。

### 3. 运动轨迹规划与先进控制理论 (Control)
* [🕹️ 机器人控制理论 (Control)](Control/index.md)：涵盖三次/五次多项式与抛物线过渡时间轨迹律（LSPB）、单关节 PID 位置闭环与抗积分饱和、计算力矩控制 (CTC) 非线性前馈解耦以及伺服驱动电流/速度/位置三环级联控制。

### 4. 接触作业与柔顺控制 (Force Control)
* [🤝 机器人力控制与柔顺装配 (NISTIR 7901 标准)](Force-Control-and-Compliant-Assembly/index.md)：涵盖显式力控制（Explicit Force Control）、PI 力闭环控制、阻抗控制（Impedance Control）与导纳控制（Admittance Control）、恒力表面跟踪与精密装配路线。

### 5. ROS 2 工业级机器人工程架构 (ROS 2)
* [🤖 ROS 2 现代机器人工程实战 (ROS2)](ROS2/index.md)：涵盖机械臂 URDF 连杆/关节建模、TF2 空间动态坐标树广播、MoveIt 2 路径规划与轨迹平滑、ros2_control 硬件资源接口抽象与实时控制环路设计。

### 6. 理论与仿真实验室 (LearningLab)
* [🔬 机器人学交互实验区 (LearningLab)](LearningLab/index.md)：全套 74 篇交互学习页面与 11 门独立物理仿真引擎。包含两连杆 RNEA 空间力矩仿真台、CTC 计算力矩控制对比台、3R 逆运动学求解器与智能题库考核中心。

---

## 📌 知识规范与准则
1. **单一职责**：每篇知识文档聚焦单一概念或工业标准，清晰说明物理量定义、坐标系方向、单位与上下游关系；
2. **拒绝空中楼阁**：凡涉及算法均提供可核对的数学推导或解析公式，并与 `LearningLab` 交互实验台双向链接；
3. **区分证据等级**：严格区分数学理论推导、仿真验证结果、待实施 ROS 2 软件包规格与物理真机实验结论。
