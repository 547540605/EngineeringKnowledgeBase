# 机器人动力学体系 (Robot Dynamics)

## 领域总览

动力学（Dynamics）是机械臂运动控制与高精度力矩伺服的核心物理支柱，研究在**产生运动的力和力矩**作用下，机械臂机构的空间运动响应规律。

本专题严格遵循“一主题一知识点”的标准，系统性地构建从单关节摩擦/惯量特性、隔离体牛顿-欧拉空间力平衡、递归牛顿-欧拉算法 (RNEA)、四项驱动力矩解耦机理、两连杆拉格朗日标准型（$M/C/G$）到动力学最小基参数集线性回归辨识的完整知识图谱。

---

## 知识图谱结构

```text
Engineering/Robotics/Dynamics/
├── 1. 单关节与隔离体动力学基石
│   ├── 单关节动力学模型：惯量、重力与摩擦 (Single-Joint-Dynamics-Inertia-Gravity-Friction)
│   └── 隔离体牛顿-欧拉方程与欧拉转动方程 (Newton-Euler-Equations-Isolated-Body)
│
├── 2. 多刚体递归动力学算法
│   ├── 递归牛顿-欧拉算法 (RNEA) 双向递推流程 (RNEA-Outward-Inward-Two-Passes)
│   └── RNEA 驱动力矩四项物理分解 (RNEA-Four-Torque-Components-Deep-Dive)
│
└── 3. 标准型解析与工程辨识
    ├── 平面两连杆动力学标准型 M-C-G (Planar-Two-Link-Dynamics-Equation-M-C-G)
    └── 机器人动力学参数线性回归辨识 (Dynamics-Parameter-Identification-Regression)
```

---

## 核心主题条目索引

### 第一模块 · 动力学基石与单关节特性

1. [单关节动力学模型：惯量、重力与摩擦 (Single-Joint-Dynamics-Inertia-Gravity-Friction)](Single-Joint-Dynamics-Inertia-Gravity-Friction.md)  
   *有效转动惯量、粘性阻尼、库仑摩擦、Stribeck 非线性摩擦曲线与重力悬臂力矩。*
2. [隔离体牛顿-欧拉方程与欧拉转动方程 (Newton-Euler-Equations-Isolated-Body)](Newton-Euler-Equations-Isolated-Body.md)  
   *质心平动牛顿第二定律、三维动坐标系欧拉转动方程、陀螺交叉乘积力矩与惯量张量。*

### 第二模块 · 递归算法与物理机理剖析

3. [递归牛顿-欧拉算法 (RNEA) 双向递推流程 (RNEA-Outward-Inward-Two-Passes)](RNEA-Outward-Inward-Two-Passes.md)  
   *$\mathcal{O}(n)$ 复杂度革命、前向运动学外推、后向力/力矩内向平衡与电机轴向扭矩投影。*
4. [RNEA 驱动力矩四项物理分解 (RNEA-Four-Torque-Components-Deep-Dive)](RNEA-Four-Torque-Components-Deep-Dive.md)  
   *惯性力矩、向心力矩、科氏耦合力矩、重力力矩机理，基于 RNEA 的数值四次解耦技巧。*

### 第三模块 · 分析力学与参数实验辨识

5. [平面两连杆动力学标准型 M-C-G (Planar-Two-Link-Dynamics-Equation-M-C-G)](Planar-Two-Link-Dynamics-Equation-M-C-G.md)  
   *经典拉格朗日 $M(q)\ddot{q} + C(q,\dot{q})\dot{q} + G(q) = \tau$ 闭式推导、能量守恒与 $(\dot{M} - 2C)$ 斜对称性证明。*
6. [机器人动力学参数线性回归辨识 (Dynamics-Parameter-Identification-Regression)](Dynamics-Parameter-Identification-Regression.md)  
   *线性参数化特征、最小基参数集 (Base Parameters) 提取、充分激励傅里叶轨迹设计与最小二乘估计。*

---

## 交互实验区联动

本体系内所有动力学算法均在交互实验室配备了原生物理仿真台与自测题库：
- 📌 [LearningLab 26：单关节动力学交互实验台](../LearningLab/26-single-joint-dynamics.html)
- 📌 [LearningLab 31：RNEA 总览交互实验台](../LearningLab/31-rnea-overview.html)
- 📌 [LearningLab 31a：牛顿-欧拉隔离体受力平衡演练](../LearningLab/31a-newton-euler-force-balance.html)
- 📌 [LearningLab 31b：RNEA 前向与后向双通递推演练](../LearningLab/31b-rnea-forward-backward-pass.html)
- 📌 [LearningLab 31c：两连杆 RNEA 空间力矩物理仿真台](../LearningLab/31c-rnea-two-link-simulation-lab.html)
- 📌 [LearningLab 31d：RNEA 四项力矩解耦交互实验台](../LearningLab/31d-rnea-four-torque-terms.html)
- 📌 [LearningLab 32：两连杆动力学矩阵结构演练](../LearningLab/32-two-link-dynamics-structure.html)
- 📌 [LearningLab 37：两连杆闭环动力学对比仿真台](../LearningLab/37-two-link-closed-loop-simulation.html)
- 📌 [LearningLab 38：动力学参数实验辨识仿真台](../LearningLab/38-dynamics-parameter-identification.html)
- 📌 [LearningLab 39：伺服级联三环与力矩饱和](../LearningLab/39-servo-cascade-and-limits.html)
