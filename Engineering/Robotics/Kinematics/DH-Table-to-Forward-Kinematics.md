# DH 参数表到全局正运动学 (DH Table to Forward Kinematics Pipeline)

## 领域归属

- **学科体系**：Engineering / Robotics / Kinematics (运动学)
- **上游先修**：[DH 建系法则与参数定义](Denavit-Hartenberg-Frame-Rules.md)、[单连杆 DH 变换矩阵推导](DH-Single-Link-Transformation-Matrix.md)
- **并列概念**：指数积公式 (PoE)、URDF 机器人运动学模型
- **下游应用**：[机械臂雅可比矩阵几何推导](Jacobian-Matrix-Geometric-Derivation.md)、[解析逆运动学求解](Analytic-Inverse-Kinematics-Planar-2R.md)
- **配套实验室**：[笔记 10：DH 表到正运动学自动化推演 (LearningLab)](../LearningLab/10-dh-table-to-forward-kinematics.html)

---

## 1. 运动学流水线架构

正运动学（Forward Kinematics, FK）的核心任务是：**已知各关节当前的位置变量 $q = [\theta_1, \theta_2, \dots, \theta_n]^T$，计算机械臂末端执行器相对于基座参考系的位姿 ${}^0_n T(q)$**。

完整工程计算流水线分为 4 步：

$$
\text{连杆结构与关节测量} \xrightarrow{\text{建系}} \text{DH 参数表} \xrightarrow{\text{公式代入}} \{{}^{i-1}_i T(\theta_i)\} \xrightarrow{\text{链式连乘}} {}^0_n T(q)
$$

---

## 2. 链式连乘总方程

根据 [运动学坐标变换链](Kinematic-Transformation-Chains.md) 的右乘合成准则，从基座坐标系 $\{0\}$ 到工具末端坐标系 $\{n\}$ 的总齐次变换矩阵为：

$$
{}^0_n T(q) = {}^0_1 T(\theta_1) \cdot {}^1_2 T(\theta_2) \cdot {}^2_3 T(\theta_3) \cdots {}^{n-1}_n T(\theta_n)
$$

其中每个单连杆齐次变换矩阵 ${}^{i-1}_i T$ 严格由通用单连杆公式生成：

$$
{}^{i-1}_i T = \begin{bmatrix}
\cos\theta_i & -\sin\theta_i & 0 & a_{i-1} \\
\sin\theta_i \cos\alpha_{i-1} & \cos\theta_i \cos\alpha_{i-1} & -\sin\alpha_{i-1} & -d_i \sin\alpha_{i-1} \\
\sin\theta_i \sin\alpha_{i-1} & \cos\theta_i \sin\alpha_{i-1} & \cos\alpha_{i-1} & d_i \cos\alpha_{i-1} \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

最终得到的复合矩阵结构为：

$$
{}^0_n T = \begin{bmatrix}
\mathbf{n} & \mathbf{s} & \mathbf{a} & \mathbf{P} \\
0 & 0 & 0 & 1
\end{bmatrix} = \begin{bmatrix}
r_{11} & r_{12} & r_{13} & p_x \\
r_{21} & r_{22} & r_{23} & p_y \\
r_{31} & r_{32} & r_{33} & p_z \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

* $\mathbf{P} = [p_x, p_y, p_z]^T$：末端在基座系下的**三维空间笛卡尔位置**；
* $[\mathbf{n}, \mathbf{s}, \mathbf{a}]$：末端工具正交基底在基座系下的**三维空间旋转姿态**。

---

## 3. 经典工业三自由度机械臂（3R 空间臂）实战案例

以经典的 3 自由度垂直关节机械臂（基座转动 + 大臂俯仰 + 小臂俯仰）为例：

### 3.1 连杆几何参数
* 连杆 1：基座高度 $d_1$，大臂水平偏置 $a_1 = 0$，扭角 $\alpha_0 = 0^\circ$；
* 连杆 2：肩部正交扭转 $\alpha_1 = 90^\circ$，大臂长度 $a_1 = L_1$，偏距 $d_2 = 0$；
* 连杆 3：肘部平行 $\alpha_2 = 0^\circ$，小臂长度 $a_2 = L_2$，偏距 $d_3 = 0$。

### 3.2 Craig DH 参数表
| 连杆 $i$ | 连杆长 $a_{i-1}$ | 连杆扭角 $\alpha_{i-1}$ | 连杆偏距 $d_i$ | 关节变量 $\theta_i$ |
| :---: | :---: | :---: | :---: | :---: |
| **1** | $0$ | $0^\circ$ | $d_1$ | $\theta_1^*$ |
| **2** | $0$ | $90^\circ$ | $0$ | $\theta_2^*$ |
| **3** | $L_1$ | $0^\circ$ | $0$ | $\theta_3^*$ |

### 3.3 各连杆变换矩阵

$$
{}^0_1 T = \begin{bmatrix}
c_1 & -s_1 & 0 & 0 \\
s_1 & c_1 & 0 & 0 \\
0 & 0 & 1 & d_1 \\
0 & 0 & 0 & 1
\end{bmatrix}, \quad
{}^1_2 T = \begin{bmatrix}
c_2 & -s_2 & 0 & 0 \\
0 & 0 & -1 & 0 \\
s_2 & c_2 & 0 & 0 \\
0 & 0 & 0 & 1
\end{bmatrix}, \quad
{}^2_3 T = \begin{bmatrix}
c_3 & -s_3 & 0 & L_1 \\
s_3 & c_3 & 0 & 0 \\
0 & 0 & 1 & 0 \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

### 3.4 连乘展开末端位置方程
计算 ${}^0_3 T = {}^0_1 T \cdot {}^1_2 T \cdot {}^2_3 T$，提取末端点位置列向量 $\mathbf{P} = [x, y, z]^T$：

$$
\begin{cases}
x = \cos\theta_1 \cdot \left( L_1 \cos\theta_2 + L_2 \cos(\theta_2 + \theta_3) \right) \\
y = \sin\theta_1 \cdot \left( L_1 \cos\theta_2 + L_2 \cos(\theta_2 + \theta_3) \right) \\
z = d_1 + L_1 \sin\theta_2 + L_2 \sin(\theta_2 + \theta_3)
\end{cases}
$$

> **极坐标降维直觉**：
> 观察上述方程可见：关节 1 的回转纯粹控制水平面投影方向（$\cos\theta_1, \sin\theta_1$）；而括号内的径向距离 $r$ 与高度 $z$ 纯粹由大臂小臂的二维两连杆几何支配！这构成了后续 [ROS 2 解析逆运动学节点](../LearningLab/ros2/04-3r-analytic-ik.html) 能够快速解析求解的数学根基。

---

## 4. 交互式仿真验证

在知识库实验区中可在线修改任意连杆参数，自动实时生成矩阵与末端位姿：
👉 [访问 LearningLab 10：DH 表到正运动学自动化推演](../LearningLab/10-dh-table-to-forward-kinematics.html)
