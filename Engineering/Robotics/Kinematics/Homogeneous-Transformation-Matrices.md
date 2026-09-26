# 齐次变换矩阵与特殊欧氏群 SE(3)

## 领域归属

- **学科体系**：Engineering / Robotics / Kinematics (运动学)
- **上游先修**：[坐标系与点的位置映射](Coordinate-Frames-and-Point-Mapping.md)、[三维单轴旋转矩阵 (SO(3))](SO3-Single-Axis-Rotation-Matrices.md)
- **并列概念**：旋量理论 (Screw Theory)、对偶四元数 (Dual Quaternions)
- **下游应用**：[运动学坐标变换链](Kinematic-Transformation-Chains.md)、[Denavit-Hartenberg (DH) 建模](Denavit-Hartenberg-Frame-Rules.md)
- **配套实验室**：[笔记 02：齐次变换矩阵交互推演 (LearningLab)](../LearningLab/02-homogeneous-transform.html)

---

## 1. 为什么需要齐次坐标？

在三维笛卡尔空间中，刚体的运动既包含旋转（线性变换）又包含平移（仿射偏移）：

$$
{}^A P = {}^A_B R \, {}^B P + {}^A P_{B\,ORG}
$$

由于存在平移项加法，这一变换在 3 维向量空间中**不是线性变换**，无法直接写成单一矩阵乘法形式。当机械臂拥有多个串联关节时，连乘操作将迅速演变为复杂的嵌套展开：

$$
{}^0 P = R_1 (R_2 (R_3 P_3 + P_{org3}) + P_{org2}) + P_{org1}
$$

为了将“旋转”与“平移”统一为纯粹的矩阵乘法，数学家引入了**齐次坐标（Homogeneous Coordinates）**。

---

## 2. 4×4 齐次变换矩阵的结构

定义空间中点 $P$ 的齐次坐标形式为增加一个标量尺度的 4 维列向量：

$$
{}^A \tilde{P} = \begin{bmatrix} {}^A p_x \\ {}^A p_y \\ {}^A p_z \\ 1 \end{bmatrix}
$$

定义 $4 \times 4$ 齐次变换矩阵 ${}^A_B T$ 为：

$$
{}^A_B T = \begin{bmatrix}
{}^A_B R_{3 \times 3} & {}^A P_{B\,ORG, 3 \times 1} \\
0_{1 \times 3} & 1
\end{bmatrix} = \begin{bmatrix}
r_{11} & r_{12} & r_{13} & p_x \\
r_{21} & r_{22} & r_{23} & p_y \\
r_{31} & r_{32} & r_{33} & p_z \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

此时，复合的空间位姿映射简化为单一矩阵与向量的乘积：

$$
{}^A \tilde{P} = {}^A_B T \, {}^B \tilde{P}
$$

### 特殊欧氏群 SE(3)
所有合法的刚体齐次变换矩阵构成**特殊欧氏群** $\mathrm{SE}(3)$：

$$
\mathrm{SE}(3) = \left\{ T = \begin{bmatrix} R & P \\ 0 & 1 \end{bmatrix} \;\middle|\; R \in \mathrm{SO}(3), \; P \in \mathbb{R}^3 \right\}
$$

---

## 3. 齐次矩阵的闭式快速求逆算法

通用 $4 \times 4$ 矩阵的代数求逆（如伴随矩阵或高斯消元法）耗时较长且存在数值截断误差。利用分块矩阵结构及 $R^{-1} = R^T$ 的正交性质，可推导出 $\mathrm{SE}(3)$ 的**解析闭式快速逆解**：

设 $T = \begin{bmatrix} R & P \\ 0 & 1 \end{bmatrix}$，其逆矩阵 $T^{-1} = \begin{bmatrix} R_{inv} & P_{inv} \\ 0 & 1 \end{bmatrix}$ 满足 $T T^{-1} = I$：

$$
\begin{bmatrix} R & P \\ 0 & 1 \end{bmatrix} \begin{bmatrix} R_{inv} & P_{inv} \\ 0 & 1 \end{bmatrix} = \begin{bmatrix} R R_{inv} & R P_{inv} + P \\ 0 & 1 \end{bmatrix} = \begin{bmatrix} I & 0 \\ 0 & 1 \end{bmatrix}
$$

由分块恒等式可得：
1. $R R_{inv} = I \implies R_{inv} = R^T$
2. $R P_{inv} + P = 0 \implies P_{inv} = -R^T P$

### 权威求逆公式

$$
{}^B_A T = ({}^A_B T)^{-1} = \begin{bmatrix}
{}^A_B R^T & -{}^A_B R^T \, {}^A P_{B\,ORG} \\
0_{1 \times 3} & 1
\end{bmatrix}
$$

> **工程提示**：在任何工业运动控制板卡或实时机器人控制器中，**严禁调用通用逆矩阵库求解齐次变换逆矩阵**，必须严格使用上述转置与矩阵乘积公式，计算量从 $O(n^3)$ 直降为常数时间。

---

## 4. 齐次变换算子 (Transform Operator)

与旋转矩阵类似，齐次变换矩阵具有多重含义：
1. **位姿表达（Description）**：描述活动系 $\{B\}$ 相对于基座系 $\{A\}$ 的位置与朝向；
2. **坐标映射（Mapping）**：将同一个点在不同坐标系下的数值坐标进行互相转换；
3. **空间移动算子（Operator）**：将参考系内部的某几何点或刚体，沿指定平移量和旋转轴整体搬运到新位置。

---

## 5. 交互式仿真验证

在知识库实验区中可在线调节齐次矩阵分量，观察坐标系平移与旋转合成效果：
👉 [访问 LearningLab 02：齐次变换矩阵推演实验台](../LearningLab/02-homogeneous-transform.html)
