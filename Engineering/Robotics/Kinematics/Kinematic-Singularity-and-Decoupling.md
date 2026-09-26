# 运动学奇异性与运动学解耦 (Kinematic Singularity and Decoupling)

## 领域归属

- **学科体系**：Engineering / Robotics / Kinematics (微分运动学与奇异性分析)
- **上游先修**：[雅可比矩阵几何推导与定义](Jacobian-Matrix-Geometric-Derivation.md)、[平面两连杆逆运动学解析求解](Analytic-Inverse-Kinematics-Planar-2R.md)
- **并列概念**：[雅可比速度映射与可操作度](Jacobian-Velocity-Mapping.md)、[逆速度运动学求解](Inverse-Velocity-Kinematics.md)
- **下游应用**：[速度分解运动控制与阻尼最小二乘](Resolved-Rate-Motion-Control.md)、[工业六轴机器人腕点解耦规划](../ROS2/index.md)
- **配套实验室**：[笔记 15：运动学奇异性交互实验台 (LearningLab)](../LearningLab/15-planar-two-link-singularity.html)、[ROS 2 实验 09：微分逆运动学与奇异点规避](../LearningLab/ros2/09-differential-ik-and-singularity.html)

---

## 1. 运动学奇异性的本质与物理定义

在机械臂运动学中，**奇异构型 (Singular Configuration)** 指机械臂关节变量 $\boldsymbol{q}$ 处于某些特定几何排列时，导致雅可比矩阵 $\boldsymbol{J}(\boldsymbol{q})$ 的**秩发生退化 (Rank Deficiency)**：

$$
\operatorname{rank}(\boldsymbol{J}(\boldsymbol{q})) < \min(m, n)
$$

对于方阵雅可比矩阵（如 6 自由度空间机械臂或 2 自由度平面机械臂），奇异判据为行列式归零：

$$
\det(\boldsymbol{J}(\boldsymbol{q})) = 0
$$

### 物理层面的三重危险现象：
1. **自由度瞬时丧失**：末端执行器在某些笛卡尔方向上无法产生瞬时线速度或角速度；
2. **逆解速度无限发散**：当末端沿退化方向以有限速度 $\boldsymbol{v}$ 运动时，关节速度要求 $\dot{\boldsymbol{q}} = \boldsymbol{J}^{-1} \boldsymbol{v}$ 趋近于无穷大，引发电机驱动过流、超速或剧烈抖动；
3. **力传递奇异**：根据虚功原理 $\boldsymbol{\tau} = \boldsymbol{J}^T \boldsymbol{F}$，在奇异方向上极小的关节力矩即可抗衡理论上无限大的外力（机构自锁或刚度极高）。

---

## 2. 奇异类型分类

### 2.1 边界奇异 (Boundary Singularities)
机械臂完全伸展（Fully Outstretched）或完全折叠（Folded Back onto Itself）至工作空间极限边界。
- **几何特征**：连杆共线排列，无法继续向外或向内移动；
- **排查方式**：通常通过工作空间包络限制（Workspace Boundary Envelope）在轨迹规划前端拦截。

### 2.2 内部奇异 (Interior Singularities)
发生在工作空间内部，常因两条或多条关节轴线共面、平行或同轴引起。
- 经典工业六轴机器人的三大内部奇异构型：
  1. **腕关节奇异 (Wrist Singularity)**：第 4 轴与第 6 轴共线（$\theta_5 = 0^\circ$ 或 $180^\circ$），腕部损失一个旋转自由度；
  2. **肩关节奇异 (Shoulder Singularity)**：腕中心点（Wrist Center Point）投影落在基座第 1 轴回转轴线上；
  3. **肘关节奇异 (Elbow Singularity)**：肘部关节完全伸直（$\theta_3 = 0^\circ$），前臂与上臂共线。

---

## 3. 平面两连杆 (2R) 奇异性代数推导

回顾平面 2R 雅可比矩阵：

$$
\boldsymbol{J}_{2R}(\boldsymbol{q}) = \begin{bmatrix} -L_1 s_1 - L_2 s_{12} & -L_2 s_{12} \\ L_1 c_1 + L_2 c_{12} & L_2 c_{12} \end{bmatrix}
$$

计算行列式：

$$
\begin{aligned}
\det(\boldsymbol{J}_{2R}) &= (-L_1 s_1 - L_2 s_{12})(L_2 c_{12}) - (-L_2 s_{12})(L_1 c_1 + L_2 c_{12}) \\
&= -L_1 L_2 s_1 c_{12} - L_2^2 s_{12} c_{12} + L_1 L_2 c_1 s_{12} + L_2^2 s_{12} c_{12} \\
&= L_1 L_2 (s_{12} c_1 - c_{12} s_1) \\
&= L_1 L_2 \sin((q_1 + q_2) - q_1) \\
&= L_1 L_2 \sin(q_2)
\end{aligned}
$$

### 结论分析：
- **奇异条件**：当 $\sin(q_2) = 0$ 时，$\det(\boldsymbol{J}) = 0$。即：

$$
q_2 = 0 \quad (\text{完全伸展}) \quad \text{或} \quad q_2 = \pi \quad (\text{完全折叠})
$$

- **物理意义**：与基座角度 $q_1$ 完全无关！只要肘关节伸直或折返，连杆 1 与连杆 2 共线，沿连杆方向的瞬时径向速度便无法产生。

---

## 4. 空间六轴机械臂的运动学解耦 (Kinematic Decoupling)

对于满足 **Pieper 准则**（最后三轴交于一点，即球形手腕 Spherical Wrist）的六轴机械臂，雅可比矩阵具有上三角块结构：

$$
\boldsymbol{J} = \begin{bmatrix} \boldsymbol{J}_{11} & \boldsymbol{0}_{3 \times 3} \\ \boldsymbol{J}_{21} & \boldsymbol{J}_{22} \end{bmatrix}
$$

其行列式可直接分解为位置与姿态的乘积：

$$
\det(\boldsymbol{J}) = \det(\boldsymbol{J}_{11}) \cdot \det(\boldsymbol{J}_{22})
$$

- $\det(\boldsymbol{J}_{11}) = 0$：**手臂奇异 (Arm Singularity)**，腕点位置退化；
- $\det(\boldsymbol{J}_{22}) = 0$：**手腕奇异 (Wrist Singularity)**，第 4 轴与第 6 轴平行对齐。
此解耦使得工业机械臂控制系统可独立监测并规避腕部与臂部奇异。

---

## 5. 可操作度与椭球度量 (Manipulability Measure)

吉川恒夫（Tsuneo Yoshikawa）定义的可操作度指标为：

$$
w = \sqrt{\det(\boldsymbol{J}\boldsymbol{J}^T)}
$$

- 对于非奇异方阵：$w = |\det(\boldsymbol{J})|$；
- 在奇异点处：$w = 0$；
- 在远离奇异点的舒适构型下：$w$ 达到局部极大值。在轨迹规划与梯度投影优化中，常以 $\nabla w$ 作为优化目标，驱动机械臂主动远离奇异点。

---

## 6. 工程应对策略：阻尼最小二乘法 (DLS)

在奇异点附近，直接求逆 $\boldsymbol{J}^{-1}$ 会造成速度发散。工业控制器普遍采用 **阻尼最小二乘法 (Damped Least Squares / Levenberg-Marquardt)**：

$$
\boldsymbol{J}^\dagger_{\lambda} = \boldsymbol{J}^T (\boldsymbol{J} \boldsymbol{J}^T + \lambda^2 \boldsymbol{I})^{-1}
$$

其中 $\lambda > 0$ 为可调阻尼系数：
- 远离奇异点时（$w \gg \epsilon$）：$\lambda \to 0$，保持精确速度跟踪；
- 临近奇异点时（$w < \epsilon$）：自动增大 $\lambda$，以牺牲微小的末端跟踪精度换取关节速度的有界平滑。

---

## 7. Python 核心计算模块

```python
import numpy as np

def compute_manipulability_planar_2r(q2: float, l1: float, l2: float) -> float:
    """计算平面 2R 臂的可操作度 w = |L1 * L2 * sin(q2)|"""
    return float(np.abs(l1 * l2 * np.sin(q2)))

def damped_least_squares_inverse(J: np.ndarray, damping: float = 0.05) -> np.ndarray:
    """
    计算雅可比矩阵的阻尼伪逆 J^T * (J * J^T + lambda^2 * I)^(-1)
    """
    m, _ = J.shape
    A = J @ J.T + (damping ** 2) * np.eye(m)
    return J.T @ np.linalg.inv(A)
```
