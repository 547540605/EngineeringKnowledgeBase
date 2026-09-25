# 平面两连杆解析逆运动学 (Analytic Inverse Kinematics for Planar 2R Arm)

## 领域归属

- **学科体系**：Engineering / Robotics / Kinematics (运动学)
- **上游先修**：[平面两连杆正运动学](Planar-Two-Link-Forward-Kinematics.md)、解析三角学 (余弦定理、atan2)
- **并列概念**：数值逆运动学 (Newton-Raphson、阻尼最小二乘 DLS)
- **下游应用**：[运动学奇异性与构型退化](Kinematic-Singularity-and-Decoupling.md)、[ROS 2 机械臂单点解析逆解节点](../LearningLab/ros2/04-3r-analytic-ik.html)
- **配套实验室**：[笔记 12：二维两连杆逆运动学推演 (LearningLab)](../LearningLab/12-planar-two-link-inverse-kinematics.html)

---

## 1. 逆运动学的挑战与解的存在性

正运动学是将关节角映射到笛卡尔位姿（$q \mapsto x$），这是一个确定性且唯一的映射；而**逆运动学（Inverse Kinematics, IK）**则是反向求解：**已知期望末端位置 $(x, y)$，求解使末端到达该位置的所有可能关节角 $(\theta_1, \theta_2)$**。

### 逆运动学的核心特征
1. **非线性**：方程包含高阶三角函数复合；
2. **多解性**：同一个笛卡尔位置通常对应多个机械臂构型（例如“肘上”与“肘下”）；
3. **奇异性与边界**：在工作空间边界或特定退化构型处，解的数量会发生突变甚至无实数解。

---

## 2. 闭式余弦代数解析推导

回顾平面两连杆的正运动学方程：
$$
\begin{cases}
x = L_1 \cos\theta_1 + L_2 \cos(\theta_1 + \theta_2) \\
y = L_1 \sin\theta_1 + L_2 \sin(\theta_1 + \theta_2)
\end{cases}
$$

### 第一步：消去 $\theta_1$ 求取 $\theta_2$
将两式分别平方并相加：
$$
x^2 + y^2 = (L_1 \cos\theta_1 + L_2 \cos(\theta_1 + \theta_2))^2 + (L_1 \sin\theta_1 + L_2 \sin(\theta_1 + \theta_2))^2
$$
利用三角恒等式 $\cos^2\phi + \sin^2\phi = 1$ 与和角公式逆展开：
$$
x^2 + y^2 = L_1^2 + L_2^2 + 2 L_1 L_2 (\cos\theta_1 \cos(\theta_1+\theta_2) + \sin\theta_1 \sin(\theta_1+\theta_2))
$$
$$
x^2 + y^2 = L_1^2 + L_2^2 + 2 L_1 L_2 \cos\theta_2
$$

从而得到 $\cos\theta_2$ 的解析闭式表达式（这正是三角形的**余弦定理**）：
$$
\cos\theta_2 = \frac{x^2 + y^2 - L_1^2 - L_2^2}{2 L_1 L_2}
$$

#### 解的存在性判定
定义判别量 $D = \cos\theta_2$：
* 若 $|D| > 1$：目标点超出工作空间（太远或太近），**无实数解**；
* 若 $|D| = 1$：机械臂完全伸直或完全重叠，处于工作空间边界，**有唯一解**；
* 若 $|D| < 1$：目标点位于工作空间内部，**必然存在两个实数解**。

### 第二步：求解双解 $\theta_2$（肘上与肘下）
利用正弦值 $\sin\theta_2 = \pm\sqrt{1 - \cos^2\theta_2}$，通过工业界标准四象限反正切函数 `atan2(y, x)` 获得无歧义角度：
$$
\theta_2 = \mathrm{atan2}\left(\pm\sqrt{1 - D^2}, \; D\right)
$$
* 取正号时（$\sin\theta_2 > 0$）：为**肘上构型（Elbow-Up）**；
* 取负号时（$\sin\theta_2 < 0$）：为**肘下构型（Elbow-Down）**。

### 第三步：求解关节 1 角 $\theta_1$
将正运动学方程展开为 $\cos\theta_1$ 与 $\sin\theta_1$ 的代数线性组合：
$$
\begin{cases}
x = (L_1 + L_2 \cos\theta_2)\cos\theta_1 - (L_2 \sin\theta_2)\sin\theta_1 \\
y = (L_1 + L_2 \cos\theta_2)\sin\theta_1 + (L_2 \sin\theta_2)\cos\theta_1
\end{cases}
$$
令辅助常量：
$$
k_1 = L_1 + L_2 \cos\theta_2, \quad k_2 = L_2 \sin\theta_2
$$
则方程组变为平面坐标旋转投影：
$$
\begin{cases}
x = k_1 \cos\theta_1 - k_2 \sin\theta_1 \\
y = k_1 \sin\theta_1 + k_2 \cos\theta_1
\end{cases}
$$
解得 $\theta_1$ 的极坐标角与辅助三角形偏角的差值：
$$
\theta_1 = \mathrm{atan2}(y, x) - \mathrm{atan2}(k_2, k_1)
$$

---

## 3. 为什么严禁使用普通反正切 `atan()`？

在任何实际控制器或 Python/C++ 算法中，**绝对禁止使用 `atan(y / x)`**：
1. **分母除以零**：当 $x = 0$（机械臂处于正上方或正下方）时，浮点除法产生 `NaN` 或崩溃；
2. **丢失象限信息**：$\frac{y}{x} = \frac{-y}{-x}$，导致第一象限与第三象限、第二象限与第四象限完全无法区分；
3. **全域定义**：`atan2(y, x)` 在 $[-\pi, \pi]$ 全圆周区间具有严格且连续的四象限数值定义。

---

## 4. 工业多解筛选与限位过滤策略

面对数学上的多解，工程控制器必须经过三道防线确定唯一最优执行解：
1. **物理软限位过滤**：剔除任何超出电机物理行程限制的解 $[\theta_{min}, \theta_{max}]$；
2. **构型连续性准则（最小位移）**：选取与当前关节位置 $q_{current}$ 欧氏距离最小的解：
   $$
   q^* = \arg\min_k \|q_k - q_{current}\|_2
   $$
   防止机械臂在轨迹跟踪过程中突然出现“大翻转”危险动作；
3. **正运动学回代核验 (FK Round-trip Check)**：
   将求解出的 $(\theta_1^*, \theta_2^*)$ 代入正运动学公式，检验其计算位置与输入目标 $(x, y)$ 的欧氏误差是否小于允许阈值（如 $10^{-6}\,\text{m}$）。

---

## 5. 交互式仿真验证

在知识库实验区中可拖拽目标点 $P(x, y)$，实时观察“肘上”与“肘下”构型的双解镜像切换：
👉 [访问 LearningLab 12：二维两连杆逆运动学推演实验台](../LearningLab/12-planar-two-link-inverse-kinematics.html)
