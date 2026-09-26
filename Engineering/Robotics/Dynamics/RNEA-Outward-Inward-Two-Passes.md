# 递归牛顿-欧拉动力学算法 (RNEA) 双向递推流程 (Recursive Newton-Euler Algorithm)

## 领域归属

- **学科体系**：Engineering / Robotics / Dynamics (计算动力学算法)
- **上游先修**：[隔离体空间牛顿-欧拉方程](Newton-Euler-Equations-Isolated-Body.md)、[连杆间速度与加速度递推外推](../Kinematics/Link-to-Link-Velocity-Propagation.md)
- **并列概念**：拉格朗日方程符号推导、铰接体算法 (Articulated-Body Algorithm, ABA)
- **下游应用**：[RNEA 四项力矩物理拆解](RNEA-Four-Torque-Components-Deep-Dive.md)、[计算力矩前馈控制 (CTC)](../Control/Computed-Torque-Control-CTC.md)
- **配套实验室**：[笔记 31：RNEA 总览交互实验台 (LearningLab)](../LearningLab/31-rnea-overview.html)、[笔记 31b：RNEA 前向与后向双通递推演练](../LearningLab/31b-rnea-forward-backward-pass.html)、[笔记 31c：两连杆 RNEA 动力学仿真台](../LearningLab/31c-rnea-two-link-simulation-lab.html)

---

## 1. 算法背景与计算复杂度革命

逆动力学问题是指：**已知机械臂当前的关节位置 $\boldsymbol{q}$、关节速度 $\dot{\boldsymbol{q}}$ 与期望加速度 $\ddot{\boldsymbol{q}}$，求解驱动各关节电机所需施加的驱动力矩 $\boldsymbol{\tau}$**。

传统的拉格朗日解析展开法由于存在庞大的符号交叉耦合，计算开销随自由度 $n$ 呈指数级或高阶多项式增长（$\mathcal{O}(n^4)$），在 1980 年代以前无法应用于工业实时闭环控制（1 kHz）。

1980 年，J. Y. S. Luh、M. W. Walker 和 R. P. Paul 提出了著名的**递归牛顿-欧拉算法 (Recursive Newton-Euler Algorithm, RNEA)**：
- 将计算完全局部化在各个连杆自身的坐标系中；
- 采用“先向外外推运动、再向内反推受力”的两步扫描架构；
- 计算复杂度严格降低为**与自由度成正比的线性阶 $\mathcal{O}(n)$**；
- 至今仍是现代工业机械臂控制器与物理仿真引擎（Bullet、MuJoCo、Pinocchio）的核心标准算法。

---

## 2. RNEA 算法双向递推完全流水线

算法分为严密交替的两个阶段（Pass）：

```text
基座 {0} ──[Pass 1: 前向运动外推 (i = 0 -> n-1)]──> 末端 {n}
基座 {0} <──[Pass 2: 后向力平衡反推 (i = n -> 1)]─── 末端 {n}
```

---

### 2.1 第一阶段：前向外推 (Forward / Outward Pass)
从基座连杆 $\{0\}$ 开始向末端执行器递推，初始化条件：

$$
{^0\boldsymbol{\omega}}_0 = \boldsymbol{0}, \quad {^0\dot{\boldsymbol{\omega}}}_0 = \boldsymbol{0}, \quad {^0\dot{\boldsymbol{v}}}_0 = -\boldsymbol{g} = \begin{bmatrix} 0 \\ 0 \\ 9.81 \end{bmatrix} \, \text{m/s}^2
$$

对每个连杆 $i = 0, 1, \dots, n-1$：
1. **递推连杆角速度与角加速度**：

$$
{^{i+1}\boldsymbol{\omega}}_{i+1} = {^{i+1}_i\boldsymbol{R}} \, {^i\boldsymbol{\omega}}_i + \dot{\theta}_{i+1} \, {^{i+1}\boldsymbol{z}}_{i+1}
$$

$$
{^{i+1}\dot{\boldsymbol{\omega}}}_{i+1} = {^{i+1}_i\boldsymbol{R}} \, {^i\dot{\boldsymbol{\omega}}}_i + {^{i+1}_i\boldsymbol{R}} \, {^i\boldsymbol{\omega}}_i \times (\dot{\theta}_{i+1} \, {^{i+1}\boldsymbol{z}}_{i+1}) + \ddot{\theta}_{i+1} \, {^{i+1}\boldsymbol{z}}_{i+1}
$$

2. **递推坐标原点与质心加速度**：

$$
{^{i+1}\dot{\boldsymbol{v}}}_{i+1} = {^{i+1}_i\boldsymbol{R}} \left[ {^i\dot{\boldsymbol{v}}}_i + {^i\dot{\boldsymbol{\omega}}}_i \times {^i\boldsymbol{P}}_{i+1} + {^i\boldsymbol{\omega}}_i \times ({^i\boldsymbol{\omega}}_i \times {^i\boldsymbol{P}}_{i+1}) \right]
$$

$$
{^{i+1}\dot{\boldsymbol{v}}_{C, i+1}} = {^{i+1}\dot{\boldsymbol{v}}}_{i+1} + {^{i+1}\dot{\boldsymbol{\omega}}}_{i+1} \times {^{i+1}\boldsymbol{P}}_{C, i+1} + {^{i+1}\boldsymbol{\omega}}_{i+1} \times ({^{i+1}\boldsymbol{\omega}}_{i+1} \times {^{i+1}\boldsymbol{P}}_{C, i+1})
$$

3. **计算刚体隔离体净惯性力与净外力矩**：

$$
\boldsymbol{F}_{i+1} = m_{i+1} \, {^{i+1}\dot{\boldsymbol{v}}_{C, i+1}}
$$

$$
\boldsymbol{N}_{i+1} = \boldsymbol{I}_{C, i+1} \, {^{i+1}\dot{\boldsymbol{\omega}}_{i+1}} + {^{i+1}\boldsymbol{\omega}}_{i+1} \times (\boldsymbol{I}_{C, i+1} \, {^{i+1}\boldsymbol{\omega}}_{i+1})
$$

---

### 2.2 第二阶段：后向平衡 (Backward / Inward Pass)
从末端执行器连杆 $\{n\}$ 逆向扫描回基座连杆 $\{1\}$。
设机械臂末端受到的外部接触力为 $\boldsymbol{f}_{n+1}$，外力矩为 $\boldsymbol{n}_{n+1}$（若自由悬空则为零）。

对每个连杆 $i = n, n-1, \dots, 1$：
1. **连杆间内力平衡方程**：
   前一连杆对本连杆的作用力 ${^i\boldsymbol{f}}_i$ 必须平衡本连杆质心惯性力与下一连杆传递过来的反作用力：

$$
{^i\boldsymbol{f}}_i = {^{i}_{i+1}\boldsymbol{R}} \, {^{i+1}\boldsymbol{f}}_{i+1} + \boldsymbol{F}_i
$$

2. **连杆间内力矩平衡方程**（关于连杆坐标原点对力矩取矩）：

$$
{^i\boldsymbol{n}}_i = \boldsymbol{N}_i + {^{i}_{i+1}\boldsymbol{R}} \, {^{i+1}\boldsymbol{n}}_{i+1} + {^i\boldsymbol{P}}_{C, i} \times \boldsymbol{F}_i + {^i\boldsymbol{P}}_{i+1} \times ({^{i}_{i+1}\boldsymbol{R}} \, {^{i+1}\boldsymbol{f}}_{i+1})
$$

3. **电机轴向投影提取驱动扭矩**：
   电机的驱动转子仅沿关节运动轴（$Z$ 轴）做功，其余垂直方向的力矩全部由机械轴承刚性承受：

$$
\tau_i = {^i\boldsymbol{n}}_i^T \, {^i\boldsymbol{z}}_i = n_{i, z} \quad (\text{旋转关节})
$$

   若为移动关节（Prismatic Joint），则投影内力：$\tau_i = {^i\boldsymbol{f}}_i^T \, {^i\boldsymbol{z}}_i$。

---

## 3. RNEA 算法在计算力矩控制 (CTC) 中的核心地位

在计算力矩控制算法 $\boldsymbol{\tau} = \boldsymbol{M}(\boldsymbol{q})\ddot{\boldsymbol{q}}^* + \boldsymbol{C}(\boldsymbol{q}, \dot{\boldsymbol{q}})\dot{\boldsymbol{q}} + \boldsymbol{G}(\boldsymbol{q})$ 中：
- 只需将当前测量得到的 $(\boldsymbol{q}, \dot{\boldsymbol{q}})$ 与闭环虚拟加速度 $\ddot{\boldsymbol{q}}^*$ 直接传入 RNEA 算法；
- RNEA 在数微秒内即可同时输出包含惯性耦合、向心科氏力以及重力补偿在内的完全驱动力矩；
- 无需对巨型的拉格朗日 $M, C, G$ 矩阵做任何显式矩阵代数运算，计算极速且数值极其稳定。

---

## 4. Python 极简 RNEA 两连杆推演模块

```python
import numpy as np

def rnea_planar_2link(q: np.ndarray, q_dot: np.ndarray, q_ddot: np.ndarray,
                      m1: float = 1.0, m2: float = 1.0, 
                      l1: float = 1.0, l2: float = 1.0, 
                      lc1: float = 0.5, lc2: float = 0.5,
                      I1: float = 0.083, I2: float = 0.083,
                      g: float = 9.81) -> np.ndarray:
    """
    平面两连杆 RNEA 逆动力学数值解算
    """
    # 阶段 1: 前向运动外推
    # 连杆 1
    w1 = q_dot[0]
    alpha1 = q_ddot[0]
    # 基座虚拟重力加速度 a0 = [0, g, 0]^T
    # 连杆 1 质心加速度
    a_c1_x = -lc1 * (w1**2) - g * np.sin(q[0])
    a_c1_y = lc1 * alpha1 + g * np.cos(q[0])
    
    # 净力与净力矩
    F1_x = m1 * a_c1_x
    F1_y = m1 * a_c1_y
    N1_z = I1 * alpha1
    
    # 连杆 2
    w2 = w1 + q_dot[1]
    alpha2 = alpha1 + q_ddot[1]
    # 原点 1 加速度
    a1_x = -l1 * (w1**2) - g * np.sin(q[0])
    a1_y = l1 * alpha1 + g * np.cos(q[0])
    # 投影到系 2
    c2, s2 = np.cos(q[1]), np.sin(q[1])
    a1_x_in2 = c2 * a1_x + s2 * a1_y
    a1_y_in2 = -s2 * a1_x + c2 * a1_y
    
    a_c2_x = a1_x_in2 - lc2 * (w2**2)
    a_c2_y = a1_y_in2 + lc2 * alpha2
    
    F2_x = m2 * a_c2_x
    F2_y = m2 * a_c2_y
    N2_z = I2 * alpha2
    
    # 阶段 2: 后向力平衡反推
    # 连杆 2 关节力矩
    f2_x = F2_x
    f2_y = F2_y
    tau2 = N2_z + lc2 * F2_y
    
    # 连杆 1 关节力矩
    # 连杆 2 对连杆 1 的反作用力投影回系 1
    f2_in_1_x = c2 * f2_x - s2 * f2_y
    f2_in_1_y = s2 * f2_x + c2 * f2_y
    
    tau1 = N1_z + lc1 * F1_y + l1 * f2_in_1_y + tau2
    
    return np.array([tau1, tau2])
```
