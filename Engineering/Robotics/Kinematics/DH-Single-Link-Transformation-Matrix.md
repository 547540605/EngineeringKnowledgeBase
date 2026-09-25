# 单连杆 DH 变换矩阵推导 (DH Single-Link Transformation Matrix)

## 领域归属

- **学科体系**：Engineering / Robotics / Kinematics (运动学)
- **上游先修**：[齐次变换矩阵 (SE(3))](Homogeneous-Transformation-Matrices.md)、[DH 建系法则与参数定义](Denavit-Hartenberg-Frame-Rules.md)
- **并列概念**：[三维单轴旋转矩阵 SO(3)](SO3-Single-Axis-Rotation-Matrices.md)
- **下游应用**：[DH 参数表到全局正运动学](DH-Table-to-Forward-Kinematics.md)、[机器人雅可比矩阵几何推导](Jacobian-Matrix-Geometric-Derivation.md)
- **配套实验室**：[笔记 09：单节 DH 变换推导演练 (LearningLab)](../LearningLab/09-dh-single-link-transform.html)

---

## 1. 四步基本变换分解

在 Craig 改进 DH 约定（Modified DH）下，从坐标系 $\{i-1\}$ 变换到相邻的坐标系 $\{i\}$，可以精确分解为 4 个沿/绕主轴的原子变换序列：

$$
{}^{i-1}_i T = \mathrm{Rot}(X_{i-1}, \alpha_{i-1}) \cdot \mathrm{Trans}(X_{i-1}, a_{i-1}) \cdot \mathrm{Rot}(Z_i, \theta_i) \cdot \mathrm{Trans}(Z_i, d_i)
$$

### 四步物理动作详解
1. **绕 $X_{i-1}$ 轴旋转 $\alpha_{i-1}$**：使 $Z_{i-1}$ 轴与 $Z_i$ 轴在空间中达到平行；
2. **沿 $X_{i-1}$ 轴平移 $a_{i-1}$**：使坐标原点沿公垂线移动，将两轴重合；
3. **绕 $Z_i$ 轴旋转 $\theta_i$**：使 $X_{i-1}$ 轴与 $X_i$ 轴方向对齐；
4. **沿 $Z_i$ 轴平移 $d_i$**：使坐标系原点完全重合到 $\{i\}$ 原点。

---

## 2. 原子齐次矩阵与逐步乘积

### 2.1 四个原子变换矩阵
$$
\mathrm{Rot}(X, \alpha_{i-1}) = \begin{bmatrix}
1 & 0 & 0 & 0 \\
0 & \cos\alpha_{i-1} & -\sin\alpha_{i-1} & 0 \\
0 & \sin\alpha_{i-1} & \cos\alpha_{i-1} & 0 \\
0 & 0 & 0 & 1
\end{bmatrix}, \quad
\mathrm{Trans}(X, a_{i-1}) = \begin{bmatrix}
1 & 0 & 0 & a_{i-1} \\
0 & 1 & 0 & 0 \\
0 & 0 & 1 & 0 \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

$$
\mathrm{Rot}(Z, \theta_i) = \begin{bmatrix}
\cos\theta_i & -\sin\theta_i & 0 & 0 \\
\sin\theta_i & \cos\theta_i & 0 & 0 \\
0 & 0 & 1 & 0 \\
0 & 0 & 0 & 1
\end{bmatrix}, \quad
\mathrm{Trans}(Z, d_i) = \begin{bmatrix}
1 & 0 & 0 & 0 \\
0 & 1 & 0 & 0 \\
0 & 0 & 1 & d_i \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

### 2.2 两两乘积展开
首先计算连杆自身结构参数的乘积（关于 $X$ 轴）：
$$
T_X = \mathrm{Rot}(X, \alpha_{i-1}) \cdot \mathrm{Trans}(X, a_{i-1}) = \begin{bmatrix}
1 & 0 & 0 & a_{i-1} \\
0 & \cos\alpha_{i-1} & -\sin\alpha_{i-1} & 0 \\
0 & \sin\alpha_{i-1} & \cos\alpha_{i-1} & 0 \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

接着计算关节运动参数的乘积（关于 $Z$ 轴）：
$$
T_Z = \mathrm{Rot}(Z, \theta_i) \cdot \mathrm{Trans}(Z, d_i) = \begin{bmatrix}
\cos\theta_i & -\sin\theta_i & 0 & 0 \\
\sin\theta_i & \cos\theta_i & 0 & 0 \\
0 & 0 & 1 & d_i \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

---

## 3. 通用单连杆 DH 齐次变换矩阵（Craig 权威标准型）

将 $T_X$ 与 $T_Z$ 进行标准矩阵乘法合成，得到单连杆通用齐次变换矩阵 ${}^{i-1}_i T$：

$$
{}^{i-1}_i T = \begin{bmatrix}
\cos\theta_i & -\sin\theta_i & 0 & a_{i-1} \\
\sin\theta_i \cos\alpha_{i-1} & \cos\theta_i \cos\alpha_{i-1} & -\sin\alpha_{i-1} & -d_i \sin\alpha_{i-1} \\
\sin\theta_i \sin\alpha_{i-1} & \cos\theta_i \sin\alpha_{i-1} & \cos\alpha_{i-1} & d_i \cos\alpha_{i-1} \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

引入常用三角简写（$c\theta_i = \cos\theta_i, s\theta_i = \sin\theta_i, c\alpha_{i-1} = \cos\alpha_{i-1}, s\alpha_{i-1} = \sin\alpha_{i-1}$）：

$$
{}^{i-1}_i T = \begin{bmatrix}
c\theta_i & -s\theta_i & 0 & a_{i-1} \\
s\theta_i \, c\alpha_{i-1} & c\theta_i \, c\alpha_{i-1} & -s\alpha_{i-1} & -d_i \, s\alpha_{i-1} \\
s\theta_i \, s\alpha_{i-1} & c\theta_i \, s\alpha_{i-1} & c\alpha_{i-1} & d_i \, c\alpha_{i-1} \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

---

## 4. 常见特化情形（特殊角度快速化简）

在工业六轴机械臂设计中，为降低加工装配难度，相邻关节轴的扭角 $\alpha_{i-1}$ 绝大多数取值为 $0^\circ$ 或 $\pm 90^\circ$：

1. **当 $\alpha_{i-1} = 0^\circ$（两关节轴严格平行）时**：
   $\cos\alpha_{i-1} = 1, \sin\alpha_{i-1} = 0$：
   $$
   {}^{i-1}_i T = \begin{bmatrix}
   \cos\theta_i & -\sin\theta_i & 0 & a_{i-1} \\
   \sin\theta_i & \cos\theta_i & 0 & 0 \\
   0 & 0 & 1 & d_i \\
   0 & 0 & 0 & 1
   \end{bmatrix}
   $$
   此时退化为纯平面的二维运动学扩展型。

2. **当 $\alpha_{i-1} = 90^\circ$（两关节轴空间正交垂直）时**：
   $\cos\alpha_{i-1} = 0, \sin\alpha_{i-1} = 1$：
   $$
   {}^{i-1}_i T = \begin{bmatrix}
   \cos\theta_i & -\sin\theta_i & 0 & a_{i-1} \\
   0 & 0 & -1 & -d_i \\
   \sin\theta_i & \cos\theta_i & 0 & 0 \\
   0 & 0 & 0 & 1
   \end{bmatrix}
   $$

---

## 5. 交互式仿真验证

在知识库实验区中可调节 4 个 DH 变量，观察单连杆几何坐标系的实时对齐变换过程：
👉 [访问 LearningLab 09：单节 DH 变换推导演练](../LearningLab/09-dh-single-link-transform.html)
