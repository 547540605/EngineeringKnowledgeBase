# Denavit-Hartenberg (DH) 建系法则与参数定义 (Denavit-Hartenberg Frame Rules)

## 领域归属

- **学科体系**：Engineering / Robotics / Kinematics (运动学)
- **上游先修**：[齐次变换矩阵 (SE(3))](Homogeneous-Transformation-Matrices.md)、[空间机械臂坐标系分配准则](Spatial-Arm-Coordinate-Assignment.md)
- **并列概念**：旋量理论 (Product of Exponentials, PoE 形式)
- **下游应用**：[单连杆 DH 变换矩阵](DH-Single-Link-Transformation-Matrix.md)、[DH 参数表到全局正运动学](DH-Table-to-Forward-Kinematics.md)
- **配套实验室**：[笔记 08：DH 坐标系分配算法实操 (LearningLab)](../LearningLab/08-dh-coordinate-assignment.html)

---

## 1. 为什么需要 DH 参数法？

空间中两个任意相对位姿的刚体坐标系需要 6 个自由度（3 旋转 + 3 平移）来完全描述。但由于机器人相邻连杆之间通过单自由度运动关节固连，两个坐标系之间存在强烈的结构几何约束。

1955 年，Jacques Denavit 与 Richard Hartenberg 提出了一种极度精炼的连杆建模体系：**仅用 4 个几何参数**即可唯一确定相邻连杆坐标系之间的完整相对变换，彻底将串联机械臂的运动学代数方程标准化。

---

## 2. 四大 DH 参数的物理定义

在标准机器人学（尤其是 Craig《Introduction to Robotics》体系，称为 Modified DH 或 Craig DH）中，4 个核心参数定义如下：

| 参数符号 | 中文名称 | 几何物理定义 | 测量轴线 | 参数性质 |
| :---: | :---: | :--- | :---: | :---: |
| $a_{i-1}$ | **连杆长度 (Link Length)** | 沿轴线 $X_{i-1}$ 从 $Z_{i-1}$ 移动到 $Z_i$ 的距离（两轴公垂线长度） | $X_{i-1}$ | 连杆结构常量 |
| $\alpha_{i-1}$ | **连杆扭角 (Link Twist)** | 绕轴线 $X_{i-1}$ 从 $Z_{i-1}$ 旋转到 $Z_i$ 的夹角（右手定则） | $X_{i-1}$ | 连杆结构常量 |
| $d_i$ | **连杆偏距 (Link Offset)** | 沿轴线 $Z_i$ 从 $X_{i-1}$ 移动到 $X_i$ 的距离 | $Z_i$ | 转动关节为常量，移动关节为**变量** |
| $\theta_i$ | **关节转角 (Joint Angle)** | 绕轴线 $Z_i$ 从 $X_{i-1}$ 旋转到 $X_i$ 的夹角（右手定则） | $Z_i$ | 转动关节为**变量**，移动关节为常量 |

> **关键物理记忆法**：
> - 两个以 $a$ 或 $\alpha$ 命名的参数（连杆长 $a$、扭角 $\alpha$）是**绕或沿 $X$ 轴（公垂线）**测量的，属于连杆本身的刚性机械结构；
> - 两个以 $d$ 或 $\theta$ 命名的参数（偏距 $d$、转角 $\theta$）是**绕或沿 $Z$ 轴（关节运动轴）**测量的，描述相邻两根连杆在关节处的连接配合与运动状态。

---

## 3. 标准 DH (Standard DH) 与改进 DH (Modified / Craig DH) 的对比

在工业控制与学术文献中，存在两种主流约定，两者的连乘顺序和下标定义截然不同：

| 维度 | 标准 DH (Classic / Standard DH) | 改进 DH (Modified DH / Craig DH) |
| :--- | :--- | :--- |
| **提出者** | Denavit & Hartenberg (1955) | John J. Craig (1986) |
| **坐标系原点** | 坐标系 $\{i\}$ 固连在连杆 $i$ 的**出射端（末端）** | 坐标系 $\{i\}$ 固连在连杆 $i$ 的**入射端（关节 $i$ 处）** |
| **公垂线定义** | $X_i$ 为 $Z_i$ 与 $Z_{i+1}$ 的公垂线 | $X_i$ 为 $Z_i$ 与 $Z_{i-1}$ 的公垂线 |
| **变换顺序** | 先关于 $Z$ 变换，再关于 $X$ 变换：$R_z(\theta) D_z(d) D_x(a) R_x(\alpha)$ | 先关于 $X$ 变换，再关于 $Z$ 变换：$R_x(\alpha) D_x(a) R_z(\theta) D_z(d)$ |
| **分支树状链适配** | 难以优雅表达树形结构 | 坐标系原点固定在关节输入端，**原生支持树状分支机构** |

> **知识库标准**：本知识库与 LearningLab 交互实验区全面采用 **Craig 改进 DH 约定（Modified DH）**，其在树形运动学、ROS 2 与工业多轴动力学递推中具有天然的一致性。

---

## 4. 建立 DH 坐标系的五步法法则

1. **定 $Z$ 轴**：找到每个活动关节的旋转轴（或平移轴），令坐标系 $\{i\}$ 的 $Z_i$ 轴与关节轴 $i$ 重合；
2. **求公垂线定 $X$ 轴**：
   - 确定 $Z_{i-1}$ 与 $Z_i$ 的公垂线；
   - 若两轴相交，取 $X_{i-1} \perp \text{Plane}(Z_{i-1}, Z_i)$；
   - 若两轴平行，公垂线取穿过前一坐标系原点的一条；
3. **确定原点 $O_i$**：$Z_i$ 轴与公垂线 $X_i$ 的交点即为坐标系 $\{i\}$ 的原点；
4. **定 $Y$ 轴**：依照右手正交法则 $\hat{Y}_i = \hat{Z}_i \times \hat{X}_i$ 补齐坐标系；
5. **填入 DH 参数表**：按照 4 个定义依次读出几何尺寸并填入表格。

---

## 5. 交互式仿真验证

在知识库实验区中可在线查看多轴机械臂的公垂线几何构造与参数提取：
👉 [访问 LearningLab 08：DH 坐标系分配算法实操](../LearningLab/08-dh-coordinate-assignment.html)
