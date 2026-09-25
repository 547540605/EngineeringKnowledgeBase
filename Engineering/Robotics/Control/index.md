# 机器人控制理论体系 (Robot Control)

## 领域总览

控制（Control）是赋予机械臂精确轨迹跟踪、高速响应与抗扰动能力的核心算法中枢，研究如何通过反馈与前馈控制律，将期望的运动轨迹转化为底层驱动器的力矩指令。

本专题严格按照“一主题一知识点”的规范，系统性地构建从机械臂轨迹规划时间律（多项式与梯形速度）、单关节 PD/PID 位置闭环与重力前馈、计算力矩控制 (CTC) 非线性反馈线性化多轴解耦，到工业伺服驱动电流/速度/位置三环级联控制的完整知识图谱。

关于机械臂与环境物理接触顺应性与力控装配，请移步 [机器人力控制与柔顺装配 (NISTIR 7901 标准)](../Force-Control-and-Compliant-Assembly/index.md)。

---

## 知识图谱结构

```text
Engineering/Robotics/Control/
├── 1. 轨迹规划与时间分配
│   └── 机械臂轨迹规划时间律 (Trajectory-Time-Laws-Cubic-Quintic-LSPB)
│
├── 2. 单关节与伺服底层控制
│   ├── 单关节 PD/PID 位置闭环控制与重力补偿 (Single-Joint-PD-PID-Position-Control)
│   └── 伺服驱动三环级联控制与带宽匹配 (Servo-Cascade-Loops-Current-Velocity-Position)
│
└── 3. 多轴耦合与先进非线性解耦
    └── 计算力矩控制 CTC 反馈线性化 (Computed-Torque-Control-CTC)
```

---

## 核心主题条目索引

### 第一模块 · 轨迹规划与时间分配

1. [机械臂轨迹规划时间律：三次/五次多项式与 LSPB (Trajectory-Time-Laws-Cubic-Quintic-LSPB)](Trajectory-Time-Laws-Cubic-Quintic-LSPB.md)  
   *路径与轨迹的本质差异、五次多项式边界加速度平滑消除冲击、梯形速度抛物线过渡 (LSPB) 巡航规划。*

### 第二模块 · 单关节伺服与底层闭环架构

2. [单关节 PD/PID 位置闭环控制与重力补偿 (Single-Joint-PD-PID-Position-Control)](Single-Joint-PD-PID-Position-Control.md)  
   *闭环二阶误差动态方程、临界阻尼设计 ($\zeta=1$)、重力前馈与积分抗饱和 (Anti-Windup) 保护。*
3. [伺服驱动三环级联控制与带宽匹配 (Servo-Cascade-Loops-Current-Velocity-Position)](Servo-Cascade-Loops-Current-Velocity-Position.md)  
   *电流/转矩环 (FOC)、速度环 (PI)、位置环 (P) 分层架构，10倍带宽递增分离准则与 100% 速度前馈消除动态滞后。*

### 第三模块 · 多轴耦合与非线性解耦

4. [计算力矩控制 CTC：反馈线性化与多轴解耦 (Computed-Torque-Control-CTC)](Computed-Torque-Control-CTC.md)  
   *非线性反馈线性化核心机理、MIMO 多刚体耦合系统解耦为 $n$ 个独立单位二阶系统、结合 RNEA 的高速实现。*

---

## 交互实验区联动

本控制体系内所有控制算法均在交互实验室配备了原生实时仿真台与自测题库：
- 📌 [LearningLab 33：时间轨迹律交互实验台 (LearningLab)](../LearningLab/33-trajectory-time-laws.html)
- 📌 [LearningLab 34：单关节 PID 闭环控制交互实验台](../LearningLab/34-pid-position-control.html)
- 📌 [LearningLab 35：计算力矩控制交互对比实验台](../LearningLab/35-computed-torque-control.html)
- 📌 [LearningLab 36：力与阻抗导纳控制交互演练](../LearningLab/36-force-impedance-admittance-control.html)
- 📌 [LearningLab 37：两连杆闭环动力学对比仿真台](../LearningLab/37-two-link-closed-loop-simulation.html)
- 📌 [LearningLab 39：伺服级联三环与力矩饱和交互实验台](../LearningLab/39-servo-cascade-and-limits.html)
