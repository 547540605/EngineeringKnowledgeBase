# 隔离体牛顿-欧拉方程与欧拉转动方程 (Newton-Euler Equations for Isolated Rigid Body)

## 领域归属

- **学科体系**：Engineering / Robotics / Dynamics (刚体动力学基础)
- **上游先修**：[单关节动力学模型](Single-Joint-Dynamics-Inertia-Gravity-Friction.md)、[连杆间速度与加速度递推外推](../Kinematics/Link-to-Link-Velocity-Propagation.md)
- **并列概念**：分析力学拉格朗日方程、虚功原理
- **下游应用**：[牛顿-欧拉双向递推算法 (RNEA)](RNEA-Outward-Inward-Two-Passes.md)、[两连杆动力学标准型 (M/C/G)](Planar-Two-Link-Dynamics-Equation-M-C-G.md)
- **配套实验室**：[笔记 31a：牛顿-欧拉隔离体受力平衡演练 (LearningLab)](../LearningLab/31a-newton-euler-force-balance.html)、[参考专题：空间惯量张量与欧拉动力学方程](../LearningLab/ref-spatial-inertia-tensor-euler-equations.html)

---

## 1. 物理背景与基本假设

在多连杆串联机械臂中，若将第 $i$ 个连杆从机械链中“切割”出来，视为一个完全独立的**隔离体 (Isolated Rigid Body)**，其在空间三维运动中所受到的合外力与合外力矩，完全由经典空间牛顿-欧拉方程所统领。

### 基本几何与惯性量定义（在连杆质心参考系中）：
- 连杆质量为 $m$；
- 质心（Center of Mass, COM）的瞬时绝对线加速度为 $\dot{\boldsymbol{v}}_C \in \mathbb{R}^3$；
- 连杆的瞬时绝对角速度为 $\boldsymbol{\omega} \in \mathbb{R}^3$，绝对角加速度为 $\dot{\boldsymbol{\omega}} \in \mathbb{R}^3$；
- 连杆关于质心的三维转动惯量张量（Inertia Tensor）记为 $\boldsymbol{I}_C \in \mathbb{R}^{3 \times 3}$。

---

## 2. 牛顿动量定理（质心平动方程）

作用在刚体隔离体上的**空间总合外力 $\boldsymbol{F}$** 等于刚体总质量与质心绝对加速度的乘积：

$$
\boldsymbol{F} = m \dot{\boldsymbol{v}}_C
$$

### 坐标分量形式：

$$
\begin{bmatrix} F_x \\ F_y \\ F_z \end{bmatrix} = m \begin{bmatrix} \dot{v}_{C, x} \\ \dot{v}_{C, y} \\ \dot{v}_{C, z} \end{bmatrix}
$$

由于质量 $m$ 是不随运动变化的定标量，平动方程表现为完全解耦的线性关系。

---

## 3. 欧拉转动方程（绕质心转动定律）

作用在刚体上的**空间总合外力矩 $\boldsymbol{N}$** 等于角动量的时间变化率：

$$
\boldsymbol{N} = \frac{d}{dt} (\boldsymbol{I}_C \boldsymbol{\omega})
$$

### 动坐标系微分展开（欧拉转动方程）：
在随刚体固连旋转的局部基底坐标系下展开微分运算，由于基底自身以角速度 $\boldsymbol{\omega}$ 转动，必须引入叉乘导数项：

$$
\boldsymbol{N} = \boldsymbol{I}_C \dot{\boldsymbol{\omega}} + \boldsymbol{\omega} \times (\boldsymbol{I}_C \boldsymbol{\omega})
$$

### 各分项的力学含义：
1. **纯角加速度惯性力矩项**：$\boldsymbol{I}_C \dot{\boldsymbol{\omega}}$，直接反抗自身角速度变化的力矩；
2. **陀螺力矩 / 惯性力矩耦合项 (Gyroscopic Cross-Torque)**：$\boldsymbol{\omega} \times (\boldsymbol{I}_C \boldsymbol{\omega})$，这是三维空间刚体动力学**最核心的非线性项**。
   - 当刚体绕非惯性主轴旋转，或者不同主轴转动惯量不相等（$I_{xx} \neq I_{yy} \neq I_{zz}$）时，即使角加速度 $\dot{\boldsymbol{\omega}} = \boldsymbol{0}$，只要角速度 $\boldsymbol{\omega}$ 不为零，该项仍会产生持续的力矩需求。

---

## 4. 空间 3×3 惯量张量矩阵结构

在刚体质心坐标系下，惯量张量矩阵 $\boldsymbol{I}_C$ 为对称正定矩阵：

$$
\boldsymbol{I}_C = \begin{bmatrix}
I_{xx} & -I_{xy} & -I_{xz} \\
-I_{xy} & I_{yy} & -I_{yz} \\
-I_{xz} & -I_{yz} & I_{zz}
\end{bmatrix}
$$

主对角线为主惯量（Moments of Inertia），非对角线为惯量积（Products of Inertia）：

$$
I_{xx} = \int (y^2 + z^2) \, dm, \quad I_{xy} = \int x y \, dm
$$

根据主惯性轴定理（Principal Axes of Inertia），总可以通过空间正交变换找到一组对齐主轴的坐标系，使得惯量积全部归零，化为纯对角矩阵 $\boldsymbol{I}_C = \operatorname{diag}(I_{xx}, I_{yy}, I_{zz})$。

---

## 5. 平面两连杆简化情形验证

对于在 $X-Y$ 平面内做纯二维转动的连杆：
- 角速度与角加速度方向严格沿纸外法线：$\boldsymbol{\omega} = [0, 0, \omega_z]^T, \dot{\boldsymbol{\omega}} = [0, 0, \alpha_z]^T$；
- 欧拉方程中的陀螺交叉乘积项计算为：

$$
\boldsymbol{I}_C \boldsymbol{\omega} = \begin{bmatrix} 0 \\ 0 \\ I_{zz} \omega_z \end{bmatrix} \implies \boldsymbol{\omega} \times (\boldsymbol{I}_C \boldsymbol{\omega}) = \begin{bmatrix} 0 \\ 0 \\ \omega_z \end{bmatrix} \times \begin{bmatrix} 0 \\ 0 \\ I_{zz} \omega_z \end{bmatrix} = \boldsymbol{0}
$$

> **重要工程推论**：在平面机械臂中，**陀螺耦合力矩恒等于零**！欧拉方程在平面内完全退化为标量形式 $N_z = I_{zz} \alpha_z$。这解释了为何平面两连杆的连杆转动阻抗如此平缓，而空间六轴机械臂在高速旋转时会出现强烈的空间扭转力矩。

---

## 6. Python 空间隔离体动力学解算函数

```python
import numpy as np

def compute_isolated_body_wrench(mass: float, I_C: np.ndarray, 
                                 a_com: np.ndarray, 
                                 omega: np.ndarray, alpha: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """
    计算刚体隔离体在空间运动所需的净合力 F 与净合力矩 N
    """
    # 质心平动牛顿方程: F = m * a_C
    F_net = mass * a_com
    
    # 空间转动欧拉方程: N = I * alpha + omega x (I * omega)
    N_net = I_C @ alpha + np.cross(omega, I_C @ omega)
    
    return F_net, N_net
```
