# 雅可比矩阵几何推导与定义 (Geometric Jacobian Derivation)

## 领域归属

- **学科体系**：Engineering / Robotics / Kinematics (微分运动学)
- **上游先修**：[平面两连杆正运动学](Planar-Two-Link-Forward-Kinematics.md)、[DH 参数表到正运动学](DH-Table-to-Forward-Kinematics.md)
- **并列概念**：[连杆间速度外推与递推](Link-to-Link-Velocity-Propagation.md)、[解析雅可比 vs 几何雅可比](Jacobian-Velocity-Mapping.md)
- **下游应用**：[运动学奇异性与构型退化](Kinematic-Singularity-and-Decoupling.md)、[逆速度运动学求解](Inverse-Velocity-Kinematics.md)、[速度分解运动控制 (Resolved-Rate Control)](Resolved-Rate-Motion-Control.md)
- **配套实验室**：[笔记 14：平面两连杆雅可比实验台 (LearningLab)](../LearningLab/14-planar-two-link-jacobian.html)、[笔记 16：雅可比速度映射与椭球实验台](../LearningLab/16-planar-jacobian-velocity.html)

---

## 1. 物理背景与核心定义

在机器人学中，**雅可比矩阵 (Jacobian Matrix)** 是连接**关节空间速度** $\dot{\boldsymbol{q}} \in \mathbb{R}^n$ 与**操作空间（末端）速度** $\boldsymbol{v}_e = [\boldsymbol{v}^T, \boldsymbol{\omega}^T]^T \in \mathbb{R}^6$ 的线性映射变换算子：

$$
\boldsymbol{v}_e = \boldsymbol{J}(\boldsymbol{q}) \dot{\boldsymbol{q}}
$$

其中：
- $\boldsymbol{v} \in \mathbb{R}^3$ 为末端执行器的线速度（Linear Velocity）；
- $\boldsymbol{\omega} \in \mathbb{R}^3$ 为末端执行器的角速度（Angular Velocity）；
- $\boldsymbol{J}(\boldsymbol{q}) \in \mathbb{R}^{6 \times n}$ 称为机器人的**几何雅可比矩阵 (Geometric Jacobian)**，其数值强烈依赖于机械臂当前构型 $\boldsymbol{q}$。

---

## 2. 空间连杆机构的几何推导法

对于串联多关节机械臂，每一个关节运动对末端速度的贡献满足**刚体运动速度叠加原理**。雅可比矩阵的第 $i$ 列 $\boldsymbol{J}_i$ 表示**仅有关节 $i$ 以单位速度运动（$\dot{q}_i = 1$，其余关节固定）时，末端执行器产生的线速度与角速度**：

$$
\boldsymbol{J}(\boldsymbol{q}) = \begin{bmatrix} \boldsymbol{J}_1 & \boldsymbol{J}_2 & \cdots & \boldsymbol{J}_n \end{bmatrix} = \begin{bmatrix} \boldsymbol{J}_{v1} & \boldsymbol{J}_{v2} & \cdots & \boldsymbol{J}_{vn} \\ \boldsymbol{J}_{\omega 1} & \boldsymbol{J}_{\omega 2} & \cdots & \boldsymbol{J}_{\omega n} \end{bmatrix}
$$

### 2.1 旋转关节 (Revolute Joint) 的列向量
设关节 $i$ 的转轴方向单位向量在基坐标系下表示为 $\boldsymbol{z}_{i-1}$，转轴上任一点（通常取关节 $i$ 坐标系原点）的位置向量为 $\boldsymbol{p}_{i-1}$，末端执行器位置为 $\boldsymbol{p}_e$。
- **角速度贡献**：关节转动直接产生绕转轴的角速度：
  $$
  \boldsymbol{J}_{\omega i} = \boldsymbol{z}_{i-1}
  $$
- **线速度贡献**：绕轴转动通过杠杆臂 $(\boldsymbol{p}_e - \boldsymbol{p}_{i-1})$ 产生线速度（叉乘公式 $\boldsymbol{v} = \boldsymbol{\omega} \times \boldsymbol{r}$）：
  $$
  \boldsymbol{J}_{vi} = \boldsymbol{z}_{i-1} \times (\boldsymbol{p}_e - \boldsymbol{p}_{i-1})
  $$

因此旋转关节的列向量为：
$$
\boldsymbol{J}_i = \begin{bmatrix} \boldsymbol{z}_{i-1} \times (\boldsymbol{p}_e - \boldsymbol{p}_{i-1}) \\ \boldsymbol{z}_{i-1} \end{bmatrix}
$$

### 2.2 移动关节 (Prismatic Joint) 的列向量
移动关节沿轴线方向平动，不产生末端角速度：
$$
\boldsymbol{J}_i = \begin{bmatrix} \boldsymbol{z}_{i-1} \\ \boldsymbol{0}_{3 \times 1} \end{bmatrix}
$$

---

## 3. 平面两连杆 (2R) 雅可比解析实例

考虑经典的水平平面 2R 机械臂（连杆长 $L_1, L_2$，关节角 $q_1, q_2$）：
末端位置方程为：
$$
\begin{cases}
x = L_1 \cos q_1 + L_2 \cos(q_1 + q_2) \\
y = L_1 \sin q_1 + L_2 \sin(q_1 + q_2)
\end{cases}
$$

### 3.1 对时间求全微分法 (Analytical Differentiation)
对时间 $t$ 求偏导：
$$
\dot{x} = \frac{\partial x}{\partial q_1} \dot{q}_1 + \frac{\partial x}{\partial q_2} \dot{q}_2 = -[L_1 \sin q_1 + L_2 \sin(q_1 + q_2)] \dot{q}_1 - L_2 \sin(q_1 + q_2) \dot{q}_2
$$
$$
\dot{y} = \frac{\partial y}{\partial q_1} \dot{q}_1 + \frac{\partial y}{\partial q_2} \dot{q}_2 = [L_1 \cos q_1 + L_2 \cos(q_1 + q_2)] \dot{q}_1 + L_2 \cos(q_1 + q_2) \dot{q}_2
$$

写成紧凑矩阵形式（使用简写 $s_1 = \sin q_1, c_1 = \cos q_1, s_{12} = \sin(q_1+q_2), c_{12} = \cos(q_1+q_2)$）：
$$
\begin{bmatrix} \dot{x} \\ \dot{y} \end{bmatrix} = \begin{bmatrix} -L_1 s_1 - L_2 s_{12} & -L_2 s_{12} \\ L_1 c_1 + L_2 c_{12} & L_2 c_{12} \end{bmatrix} \begin{bmatrix} \dot{q}_1 \\ \dot{q}_2 \end{bmatrix} = \boldsymbol{J}_{2R}(\boldsymbol{q}) \begin{bmatrix} \dot{q}_1 \\ \dot{q}_2 \end{bmatrix}
$$

### 3.2 几何交叉积核对
- 关节 1 轴向 $\boldsymbol{z}_0 = [0, 0, 1]^T$，原点 $\boldsymbol{p}_0 = [0, 0, 0]^T$；
- 关节 2 轴向 $\boldsymbol{z}_1 = [0, 0, 1]^T$，原点 $\boldsymbol{p}_1 = [L_1 c_1, L_1 s_1, 0]^T$；
- 末端 $\boldsymbol{p}_e = [L_1 c_1 + L_2 c_{12}, L_1 s_1 + L_2 s_{12}, 0]^T$。

计算 $\boldsymbol{z}_0 \times (\boldsymbol{p}_e - \boldsymbol{p}_0)$ 与 $\boldsymbol{z}_1 \times (\boldsymbol{p}_e - \boldsymbol{p}_1)$，得到的结果与解析微分完全一致，验证了几何推导法在平面与空间中的普适等价性。

---

## 4. 工程实现与算法范式 (Python / NumPy)

```python
import numpy as np

def compute_planar_2r_jacobian(q1: float, q2: float, l1: float, l2: float) -> np.ndarray:
    """
    计算平面 2R 机械臂的 2x2 线速度雅可比矩阵
    """
    s1, c1 = np.sin(q1), np.cos(q1)
    s12, c12 = np.sin(q1 + q2), np.cos(q1 + q2)
    
    J11 = -l1 * s1 - l2 * s12
    J12 = -l2 * s12
    J21 =  l1 * c1 + l2 * c12
    J22 =  l2 * c12
    
    return np.array([
        [J11, J12],
        [J21, J22]
    ], dtype=np.float64)
```

---

## 5. 常见工程误区与避坑指南

1. **混淆基系雅可比与末端系雅可比**：
   - 上述公式导出的 $\boldsymbol{J}(\boldsymbol{q})$ 是在**基座标系 $\{0\}$** 下投影的速度。
   - 若控制器在**工具端坐标系 $\{e\}$** 工作，必须对雅可比矩阵进行坐标旋转：${^e\boldsymbol{J}} = \begin{bmatrix} {^0_e\boldsymbol{R}}^T & \boldsymbol{0} \\ \boldsymbol{0} & {^0_e\boldsymbol{R}}^T \end{bmatrix} {^0\boldsymbol{J}}$。
2. **对姿态微分求导的陷阱**：
   - 几何角速度 $\boldsymbol{\omega}$ 并不是任何姿态角（如欧拉角 $\boldsymbol{\alpha}$）的直接时间导数，即 $\boldsymbol{\omega} \neq \dot{\boldsymbol{\alpha}}$。解析雅可比与几何雅可比之间存在欧拉角变换矩阵 $\boldsymbol{T}(\boldsymbol{\alpha})$，不可直接混用。
