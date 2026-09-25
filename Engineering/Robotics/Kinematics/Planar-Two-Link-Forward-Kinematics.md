# 平面两连杆正运动学 (Planar Two-Link Forward Kinematics)

## 领域归属

- **学科体系**：Engineering / Robotics / Kinematics (运动学)
- **上游先修**：[坐标系与点的位置映射](Coordinate-Frames-and-Point-Mapping.md)、[三维单轴旋转矩阵 (SO(3))](SO3-Single-Axis-Rotation-Matrices.md)
- **并列概念**：[齐次变换矩阵](Homogeneous-Transformation-Matrices.md)、[Denavit-Hartenberg (DH) 建模](Denavit-Hartenberg-Frame-Rules.md)
- **下游应用**：[平面两连杆逆运动学解析求解](Analytic-Inverse-Kinematics-Planar-2R.md)、[雅可比矩阵几何推导](Jacobian-Matrix-Geometric-Derivation.md)
- **配套实验室**：[笔记 04：二维两连杆正运动学交互实验台 (LearningLab)](../LearningLab/04-planar-two-link-forward-kinematics.html)

---

## 1. 机构模型与物理约定

平面两连杆（Planar 2R Arm）是机器人学中最经典的基础模型。它由两个刚性连杆和两个平行回转关节组成，机构约束在二维铅垂或水平平面内运动。

### 1.1 几何参数定义
* **基座坐标系 $\{0\}$**：原点 $O_0$ 设在关节 1 回转中心，$X_0$ 轴水平向右，$Y_0$ 轴垂直向上，$Z_0$ 轴由右手定则指向纸外。
* **连杆 1 参数**：长度为 $L_1$，关节角为 $\theta_1$（连杆 1 相对 $X_0$ 轴的逆时针夹角）。
* **连杆 2 参数**：长度为 $L_2$，关节角为 $\theta_2$（连杆 2 相对连杆 1 延长线的**相对偏转角**）。
* **末端执行器位置**：记为 $P = [x, y]^T$。

---

## 2. 闭式几何推导 (Geometric Derivation)

### 2.1 关节 1 末端（关节 2 中心）坐标
由简单的极坐标三角关系：
$$
\begin{cases}
x_1 = L_1 \cos\theta_1 \\
y_1 = L_1 \sin\theta_1
\end{cases}
$$

### 2.2 连杆 2 绝对姿态角
连杆 2 相对基座 $X_0$ 轴的总倾角为关节 1 与关节 2 的角度代数叠加：
$$
\phi = \theta_1 + \theta_2
$$

### 2.3 末端执行器全局坐标方程
将连杆 2 的位移向量叠加到关节 1 末端：
$$
\begin{cases}
x = L_1 \cos\theta_1 + L_2 \cos(\theta_1 + \theta_2) \\
y = L_1 \sin\theta_1 + L_2 \sin(\theta_1 + \theta_2)
\end{cases}
$$

引入机器人学常用三角简写：$c_1 = \cos\theta_1, s_1 = \sin\theta_1, c_{12} = \cos(\theta_1+\theta_2), s_{12} = \sin(\theta_1+\theta_2)$：
$$
\begin{cases}
x = L_1 c_1 + L_2 c_{12} \\
y = L_1 s_1 + L_2 s_{12}
\end{cases}
$$

---

## 3. 齐次矩阵法合成推导 (Matrix Composition)

利用 [齐次变换矩阵](Homogeneous-Transformation-Matrices.md) 进行链式计算：

$$
{}^0_1 T = \begin{bmatrix}
\cos\theta_1 & -\sin\theta_1 & 0 & L_1 \cos\theta_1 \\
\sin\theta_1 & \cos\theta_1 & 0 & L_1 \sin\theta_1 \\
0 & 0 & 1 & 0 \\
0 & 0 & 0 & 1
\end{bmatrix}, \quad
{}^1_2 T = \begin{bmatrix}
\cos\theta_2 & -\sin\theta_2 & 0 & L_2 \cos\theta_2 \\
\sin\theta_2 & \cos\theta_2 & 0 & L_2 \sin\theta_2 \\
0 & 0 & 1 & 0 \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

连乘合成基座到末端的总变换矩阵 ${}^0_2 T = {}^0_1 T \cdot {}^1_2 T$：
$$
{}^0_2 T = \begin{bmatrix}
c_{12} & -s_{12} & 0 & L_1 c_1 + L_2 c_{12} \\
s_{12} & c_{12} & 0 & L_1 s_1 + L_2 s_{12} \\
0 & 0 & 1 & 0 \\
0 & 0 & 0 & 1
\end{bmatrix}
$$
其平移列向量精确复现了几何推导中的 $(x, y)$ 坐标；左上角 $2 \times 2$ 旋转子块代表末端坐标系的总旋转姿态。

---

## 4. 工作空间分析 (Workspace Analysis)

末端到原点的距离平方为：
$$
R^2 = x^2 + y^2 = L_1^2 + L_2^2 + 2 L_1 L_2 \cos\theta_2
$$

由于 $-1 \le \cos\theta_2 \le 1$：
1. **最大可达半径（外边界）**：
   当 $\theta_2 = 0$（两杆完全伸直共线）时，$\cos\theta_2 = 1$：
   $$
   R_{max} = L_1 + L_2
   $$
2. **最小可达半径（内边界）**：
   当 $\theta_2 = \pi$（两杆完全折叠重合）时，$\cos\theta_2 = -1$：
   $$
   R_{min} = |L_1 - L_2|
   $$
3. **工作空间拓扑**：
   若关节可无限制 $360^\circ$ 旋转，工作空间为一个以内径 $|L_1 - L_2|$、外径 $L_1 + L_2$ 的**圆环形区域（Annulus）**。任何超出该区间的笛卡尔目标点均无解。

---

## 5. 交互式仿真验证

在知识库实验区中可实时拖拽 $\theta_1, \theta_2$ 滑块，动态观察连杆矢量与末端坐标合成轨迹：
👉 [访问 LearningLab 04：二维两连杆正运动学交互实验台](../LearningLab/04-planar-two-link-forward-kinematics.html)
