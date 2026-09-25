# 三维单轴旋转矩阵与特殊正交群 SO(3)

## 领域归属

- **学科体系**：Engineering / Robotics / Kinematics (运动学)
- **上游先修**：[坐标系与点的位置映射](Coordinate-Frames-and-Point-Mapping.md)、线性代数 (行列式、正交矩阵、内积)
- **并列概念**：欧拉角 (Euler Angles)、四元数 (Quaternions)、旋转向量 (Axis-Angle)
- **下游应用**：[齐次变换矩阵](Homogeneous-Transformation-Matrices.md)、[空间机械臂坐标系分配](Spatial-Arm-Coordinate-Assignment.md)
- **配套实验室**：[笔记 05：三维单轴旋转交互仿真台 (LearningLab)](../LearningLab/05-3d-single-axis-rotations.html)

---

## 1. 旋转矩阵的几何定义

当刚体坐标系 $\{B\}$ 相对于参考坐标系 $\{A\}$ 原点重合但姿态旋转时，我们通过三个单位基向量来描述 $\{B\}$ 的姿态。

设 $\{B\}$ 的主轴单位向量在 $\{A\}$ 中的坐标分别表示为 ${}^A \hat{X}_B$、${}^A \hat{Y}_B$、${}^A \hat{Z}_B$。将这三个列向量横向拼接构成的 $3 \times 3$ 方阵即为**旋转矩阵** ${}^A_B R$：

$$
{}^A_B R = \begin{bmatrix} {}^A \hat{X}_B & {}^A \hat{Y}_B & {}^A \hat{Z}_B \end{bmatrix} = \begin{bmatrix}
\hat{X}_B \cdot \hat{X}_A & \hat{Y}_B \cdot \hat{X}_A & \hat{Z}_B \cdot \hat{X}_A \\
\hat{X}_B \cdot \hat{Y}_A & \hat{Y}_B \cdot \hat{Y}_A & \hat{Z}_B \cdot \hat{Y}_A \\
\hat{X}_B \cdot \hat{Z}_A & \hat{Y}_B \cdot \hat{Z}_A & \hat{Z}_B \cdot \hat{Z}_A
\end{bmatrix}
$$

### 列向量与行向量的几何意义
* **列向量**：矩阵的第 $j$ 列代表 $\{B\}$ 系的第 $j$ 个基向量在参考系 $\{A\}$ 中的投影。
* **行向量**：矩阵的第 $i$ 行代表 $\{A\}$ 系的第 $i$ 个基向量在活动系 $\{B\}$ 中的投影。

---

## 2. 特殊正交群 SO(3) 的核心性质

所有合法的刚体旋转矩阵共同构成三维特殊正交群 $\mathrm{SO}(3)$（Special Orthogonal Group）：

$$
\mathrm{SO}(3) = \{ R \in \mathbb{R}^{3 \times 3} \mid R^T R = I, \; \det(R) = +1 \}
$$

### 关键性质推导
1. **逆矩阵等于转置矩阵**：
   $$
   {}^A_B R^{-1} = {}^A_B R^T = {}^B_A R
   $$
   几何含义：求反向旋转变换时，直接将矩阵转置即可，无需高复杂度的代数求逆运算。
2. **保内积与保距离性（刚体不形变）**：
   对空间任意两向量 $u, v$，有 $(Ru) \cdot (Rv) = u^T R^T R v = u^T v = u \cdot v$。长度与夹角在旋转后严格保持不变。
3. **行列式为正 1**：
   保证坐标系满足**右手系守恒**，排除了镜面反射（Reflection，其行列式为 -1）。

---

## 3. 三大主轴基本旋转矩阵

依据右手定则，围绕参考系的 $X$、$Y$、$Z$ 主轴逆时针旋转角度 $\theta$ 的标准矩阵形式如下：

### 围绕 X 轴旋转 $R_x(\theta)$
$$
R_x(\theta) = \begin{bmatrix}
1 & 0 & 0 \\
0 & \cos\theta & -\sin\theta \\
0 & \sin\theta & \cos\theta
\end{bmatrix}
$$

### 围绕 Y 轴旋转 $R_y(\theta)$
> **注意正负号顺序**：因右手定则中 $Z \times X = Y$，其正负号与 X、Z 轴对称形式互转：
$$
R_y(\theta) = \begin{bmatrix}
\cos\theta & 0 & \sin\theta \\
0 & 1 & 0 \\
-\sin\theta & 0 & \cos\theta
\end{bmatrix}
$$

### 围绕 Z 轴旋转 $R_z(\theta)$
$$
R_z(\theta) = \begin{bmatrix}
\cos\theta & -\sin\theta & 0 \\
\sin\theta & \cos\theta & 0 \\
0 & 0 & 1
\end{bmatrix}
$$

---

## 4. 向量的旋转映射与算子

旋转矩阵具有双重身份：
1. **坐标系间的位姿映射**：
   已知某点在活动系中的坐标 ${}^B P$，求其在基座系中的坐标：
   $$
   {}^A P = {}^A_B R \, {}^B P
   $$
2. **同坐标系下的旋转算子 (Operator)**：
   将参考系内的向量 $v_1$ 绕指定轴旋转得到新向量 $v_2$：
   $$
   v_2 = R \, v_1
   $$

---

## 5. 交互式仿真验证

在 3D Three.js WebGL 交互实验台中可实时旋转各主轴，观察基向量坐标解耦变化：
👉 [访问 LearningLab 05：三维单轴旋转交互仿真台](../LearningLab/05-3d-single-axis-rotations.html)
