# 平面两连杆动力学标准型 (M-C-G Equations for Planar 2R Arm)

## 领域归属

- **学科体系**：Engineering / Robotics / Dynamics (分析动力学解析模型)
- **上游先修**：[平面两连杆正运动学](../Kinematics/Planar-Two-Link-Forward-Kinematics.md)、[隔离体空间牛顿-欧拉方程](Newton-Euler-Equations-Isolated-Body.md)
- **并列概念**：[牛顿-欧拉双向递推算法 (RNEA)](RNEA-Outward-Inward-Two-Passes.md)
- **下游应用**：[计算力矩前馈控制 (CTC)](../Control/Computed-Torque-Control-CTC.md)、[动力学参数线性回归辨识](Dynamics-Parameter-Identification-Regression.md)
- **配套实验室**：[笔记 32：两连杆动力学矩阵结构演练 (LearningLab)](../LearningLab/32-two-link-dynamics-structure.html)、[笔记 37：两连杆闭环动力学仿真台](../LearningLab/37-two-link-closed-loop-simulation.html)

---

## 1. 标准拉格朗日动力学矩阵结构

任意刚性串联机械臂的闭式运动微分方程均可统一写成著名的**机器人动力学标准型 (Canonical Manipulator Equation)**：

$$
\boldsymbol{M}(\boldsymbol{q})\ddot{\boldsymbol{q}} + \boldsymbol{C}(\boldsymbol{q}, \dot{\boldsymbol{q}})\dot{\boldsymbol{q}} + \boldsymbol{G}(\boldsymbol{q}) = \boldsymbol{\tau}
$$

其中：
- $\boldsymbol{M}(\boldsymbol{q}) \in \mathbb{R}^{n \times n}$：**对称正定惯性质量矩阵 (Inertia Matrix)**；
- $\boldsymbol{C}(\boldsymbol{q}, \dot{\boldsymbol{q}}) \in \mathbb{R}^{n \times n}$：**向心力与科里奥利矩阵 (Coriolis/Centrifugal Matrix)**；
- $\boldsymbol{G}(\boldsymbol{q}) \in \mathbb{R}^n$：**重力矢量 (Gravity Vector)**；
- $\boldsymbol{\tau} \in \mathbb{R}^n$：驱动器关节转矩向量。

---

## 2. 平面两连杆 (2R) 解析闭式推导

考虑质量为 $m_1, m_2$，全长为 $L_1, L_2$，转动惯量为 $I_1, I_2$，质心距为 $l_{c1}, l_{c2}$ 的水平/垂直平面 2R 臂。

### 2.1 质量矩阵 $\boldsymbol{M}(\boldsymbol{q})$
$$
\boldsymbol{M}(\boldsymbol{q}) = \begin{bmatrix} M_{11} & M_{12} \\ M_{21} & M_{22} \end{bmatrix}
$$
各矩阵元素展开式如下：
$$
M_{11} = m_1 l_{c1}^2 + I_1 + m_2 \left( L_1^2 + l_{c2}^2 + 2 L_1 l_{c2} \cos q_2 \right) + I_2
$$
$$
M_{12} = M_{21} = m_2 \left( l_{c2}^2 + L_1 l_{c2} \cos q_2 \right) + I_2
$$
$$
M_{22} = m_2 l_{c2}^2 + I_2
$$

> **关键物理洞察**：
> 1. $\boldsymbol{M}(\boldsymbol{q})$ 严格对称且为正定矩阵（对任意非零速度，动能 $T = \frac{1}{2}\dot{\boldsymbol{q}}^T \boldsymbol{M} \dot{\boldsymbol{q}} > 0$）；
> 2. 惯性矩阵**仅依赖于第二关节角 $q_2$**，与基座转角 $q_1$ 完全无关；
> 3. 当 $q_2 = 0$（机械臂完全展开）时，交叉项 $2 L_1 l_{c2} \cos(0)$ 达到极大值，转动惯量最大；当 $q_2 = \pi$（折叠）时转动惯量最小。

---

### 2.2 科里奥利与向心力矩阵 $\boldsymbol{C}(\boldsymbol{q}, \dot{\boldsymbol{q}})$
定义几何耦合标量：
$$
h = -m_2 L_1 l_{c2} \sin q_2
$$
则通过克里斯托弗符号（Christoffel Symbols）定义的标准 $\boldsymbol{C}$ 矩阵为：
$$
\boldsymbol{C}(\boldsymbol{q}, \dot{\boldsymbol{q}}) = \begin{bmatrix} h \dot{q}_2 & h (\dot{q}_1 + \dot{q}_2) \\ -h \dot{q}_1 & 0 \end{bmatrix}
$$
其与速度向量的乘积产生关节力和矩：
$$
\boldsymbol{C}(\boldsymbol{q}, \dot{\boldsymbol{q}})\dot{\boldsymbol{q}} = \begin{bmatrix} 2 h \dot{q}_1 \dot{q}_2 + h \dot{q}_2^2 \\ -h \dot{q}_1^2 \end{bmatrix}
$$
- 第一关节承受来自第二关节的向心力矩 $h \dot{q}_2^2$ 和强烈的科氏耦合力矩 $2 h \dot{q}_1 \dot{q}_2$；
- 第二关节承受由于第一关节基底旋转产生的向心力矩 $-h \dot{q}_1^2$。

---

### 2.3 重力向量 $\boldsymbol{G}(\boldsymbol{q})$
设重力加速度沿 $-Y$ 方向（垂直铅垂工作平面）：
$$
\boldsymbol{G}(\boldsymbol{q}) = \begin{bmatrix} G_1 \\ G_2 \end{bmatrix} = \begin{bmatrix} (m_1 l_{c1} + m_2 L_1) g \cos q_1 + m_2 l_{c2} g \cos(q_1 + q_2) \\ m_2 l_{c2} g \cos(q_1 + q_2) \end{bmatrix}
$$

---

## 3. 最核心的动力学物理性质：斜对称性 (Skew-Symmetry)

在先进非线性控制理论（自适应控制、无源性控制、滑模控制）中，存在一条极为重要的**能量守恒基石定理**：

$$
\boldsymbol{N}(\boldsymbol{q}, \dot{\boldsymbol{q}}) = \dot{\boldsymbol{M}}(\boldsymbol{q}) - 2 \boldsymbol{C}(\boldsymbol{q}, \dot{\boldsymbol{q}}) \quad \text{是一个斜对称矩阵 (Skew-Symmetric Matrix)}
$$

即满足：
$$
\boldsymbol{x}^T \left[ \dot{\boldsymbol{M}}(\boldsymbol{q}) - 2 \boldsymbol{C}(\boldsymbol{q}, \dot{\boldsymbol{q}}) \right] \boldsymbol{x} = 0 \quad (\forall \boldsymbol{x} \in \mathbb{R}^n)
$$

### 物理本质证明：
机械臂系统总机械能为 $E = T + V = \frac{1}{2}\dot{\boldsymbol{q}}^T \boldsymbol{M}(\boldsymbol{q}) \dot{\boldsymbol{q}} + V(\boldsymbol{q})$。
对时间求导：
$$
\frac{dE}{dt} = \dot{\boldsymbol{q}}^T \boldsymbol{M}\ddot{\boldsymbol{q}} + \frac{1}{2}\dot{\boldsymbol{q}}^T \dot{\boldsymbol{M}}\dot{\boldsymbol{q}} + \dot{\boldsymbol{q}}^T \boldsymbol{G}(\boldsymbol{q}) = \dot{\boldsymbol{q}}^T \left[ \boldsymbol{\tau} - \boldsymbol{C}\dot{\boldsymbol{q}} - \boldsymbol{G} \right] + \frac{1}{2}\dot{\boldsymbol{q}}^T \dot{\boldsymbol{M}}\dot{\boldsymbol{q}} + \dot{\boldsymbol{q}}^T \boldsymbol{G}
$$
化简得：
$$
\frac{dE}{dt} = \dot{\boldsymbol{q}}^T \boldsymbol{\tau} + \frac{1}{2} \dot{\boldsymbol{q}}^T (\dot{\boldsymbol{M}} - 2\boldsymbol{C}) \dot{\boldsymbol{q}}
$$
由于外力矩输入功率在无摩擦下必须严格等于机械能变化率（$\frac{dE}{dt} = \dot{\boldsymbol{q}}^T \boldsymbol{\tau}$），因此必有：
$$
\dot{\boldsymbol{q}}^T (\dot{\boldsymbol{M}} - 2\boldsymbol{C}) \dot{\boldsymbol{q}} \equiv 0
$$
该性质不仅用于证明自适应控制器的全局稳定性，还在数值仿真中作为**校验动力学求解器是否存在能量泄露/数值发散的最高黄金准则**。

---

## 4. Python 解析计算与斜对称性数值校验

```python
import numpy as np

def compute_mcg_planar_2r(q: np.ndarray, q_dot: np.ndarray,
                          m1=1.0, m2=1.0, l1=1.0, l2=1.0, lc1=0.5, lc2=0.5,
                          I1=0.083, I2=0.083, g=9.81):
    q1, q2 = q
    dq1, dq2 = q_dot
    
    # 质量矩阵
    c2 = np.cos(q2)
    s2 = np.sin(q2)
    
    M11 = m1*(lc1**2) + I1 + m2*(l1**2 + lc2**2 + 2*l1*lc2*c2) + I2
    M12 = m2*(lc2**2 + l1*lc2*c2) + I2
    M22 = m2*(lc2**2) + I2
    M = np.array([[M11, M12], [M12, M22]])
    
    # 科氏矩阵
    h = -m2 * l1 * lc2 * s2
    C = np.array([[h * dq2, h * (dq1 + dq2)],
                  [-h * dq1, 0.0]])
                  
    # 重力矢量
    c1 = np.cos(q1)
    c12 = np.cos(q1 + q2)
    G1 = (m1*lc1 + m2*l1)*g*c1 + m2*lc2*g*c12
    G2 = m2*lc2*g*c12
    G = np.array([G1, G2])
    
    return M, C, G
```
