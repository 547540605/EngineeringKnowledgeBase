# 坐标系与点的位置映射 (Coordinate Frames and Point Mapping)

## 领域归属

- **学科体系**：Engineering / Robotics / Kinematics (运动学)
- **上游先修**：线性代数 (向量空间、基底、内积)、解析几何
- **并列概念**：[三维单轴旋转矩阵 (SO(3))](SO3-Single-Axis-Rotation-Matrices.md)、[齐次变换矩阵](Homogeneous-Transformation-Matrices.md)
- **下游应用**：[运动学坐标变换链](Kinematic-Transformation-Chains.md)、机器人工位标定、传感器位姿转换
- **配套实验室**：[笔记 01：坐标系中的点 (LearningLab)](../LearningLab/01-coordinate-frames.html)

---

## 1. 核心概念与物理直觉

在机器人学中，“空间中的点”是一个不依赖于人为坐标系的物理实体；但为了对机械臂进行测量、规划与控制，必须在空间建立基准坐标系，并用数值分量表示该点。

### 1.1 刚体坐标系的定义
空间笛卡尔正交坐标系 $\{A\}$ 由两部分组成：
1. **坐标原点** $O_A$：空间中的基准参考位置点；
2. **正交规范化基底** $(\hat{X}_A, \hat{Y}_A, \hat{Z}_A)$：满足右手定则的三个两两正交且模长为 1 的方向单位向量：
   $$
   \hat{X}_A \cdot \hat{Y}_A = 0, \quad \hat{Y}_A \cdot \hat{Z}_A = 0, \quad \hat{Z}_A \cdot \hat{X}_A = 0, \quad \hat{X}_A \times \hat{Y}_A = \hat{Z}_A
   $$

### 1.2 点在坐标系下的向量表示
对于空间中任一点 $P$，其在坐标系 $\{A\}$ 中的位置矢量表示为列向量 ${}^A P$：
$$
{}^A P = \begin{bmatrix} p_x \\ p_y \\ p_z \end{bmatrix}
$$
其物理几何意义为：从原点 $O_A$ 指向点 $P$ 的空间几何向量，投影到三个基底方向上的标量坐标：
$$
\vec{P} = p_x \hat{X}_A + p_y \hat{Y}_A + p_z \hat{Z}_A
$$
其中各分量可通过内积求得：
$$
p_x = \vec{P} \cdot \hat{X}_A, \quad p_y = \vec{P} \cdot \hat{Y}_A, \quad p_z = \vec{P} \cdot \hat{Z}_A
$$

---

## 2. 纯平移映射模型 (Pure Translation Mapping)

设有两个方向严格平行的坐标系 $\{A\}$ 与 $\{B\}$（即 $\hat{X}_A \parallel \hat{X}_B, \hat{Y}_A \parallel \hat{Y}_B, \hat{Z}_A \parallel \hat{Z}_B$），但两者的原点不重合。

定义 $\{B\}$ 的原点 $O_B$ 在 $\{A\}$ 中的位置向量为：
$$
{}^A P_{B\,ORG} = \begin{bmatrix} x_{B\,org} \\ y_{B\,org} \\ z_{B\,org} \end{bmatrix}
$$

若已知某目标工件点 $P$ 在 $\{B\}$ 坐标系下的坐标为 ${}^B P$，则其在参考系 $\{A\}$ 下的坐标由向量三角形法则决定：
$$
{}^A P = {}^B P + {}^A P_{B\,ORG}
$$

展开为分量形式：
$$
\begin{bmatrix} {}^A p_x \\ {}^A p_y \\ {}^A p_z \end{bmatrix} = \begin{bmatrix} {}^B p_x \\ {}^B p_y \\ {}^B p_z \end{bmatrix} + \begin{bmatrix} x_{B\,org} \\ y_{B\,org} \\ z_{B\,org} \end{bmatrix}
$$

---

## 3. 常见工程误区与边界

1. **左上角上标的权威定义**：
   - ${}^A P$ 中的左上标 $A$ 明确指代**描述该矢量的参考系**；若脱离上标直接书写 $P$，在多坐标系机器人系统中极易引发严重的方向混淆与控制事故。
2. **纯平移与旋转平移混合的区别**：
   - 本文模型仅适用于**轴向严格平行**的情形；若坐标系 $\{B\}$ 相对于 $\{A\}$ 存在旋转，不能直接进行向量求和，必须引入旋转矩阵进行投影变换：${}^A P = {}^A_B R \, {}^B P + {}^A P_{B\,ORG}$（参见 [齐次变换矩阵](Homogeneous-Transformation-Matrices.md)）。
3. **坐标变换与物理移动的区别**：
   - **点在系间的映射**：物体和点在空间中不动，改变的是观察者的参考系（代数表达变化）；
   - **算子操作（Operator）**：同一个参考系内将物体平移或旋转到了新物理位置。

---

## 4. 交互式仿真验证

在知识库实验区中可实时拖拽观察点在双坐标系下的坐标映射演变：
👉 [访问 LearningLab 01：坐标系中的点交互实验台](../LearningLab/01-coordinate-frames.html)
