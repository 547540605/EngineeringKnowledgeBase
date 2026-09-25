# 连杆间速度与加速度递推外推 (Link-to-Link Velocity Propagation)

## 领域归属

- **学科体系**：Engineering / Robotics / Kinematics (连杆递推运动学)
- **上游先修**：[单连杆 DH 变换矩阵推导](DH-Single-Link-Transformation-Matrix.md)、[雅可比矩阵几何推导与定义](Jacobian-Matrix-Geometric-Derivation.md)
- **并列概念**：[三维单轴旋转矩阵 SO(3)](SO3-Single-Axis-Rotation-Matrices.md)、[齐次变换矩阵](Homogeneous-Transformation-Matrices.md)
- **下游应用**：[牛顿-欧拉前向外推外推通道](../Dynamics/index.md)、[两连杆动力学方程建模](../Dynamics/index.md)
- **配套实验室**：[笔记 25：两连杆速度递推交互实验台 (LearningLab)](../LearningLab/25-two-link-velocity-recursion.html)、[笔记 31b：RNEA 前向与后向递推演练](../LearningLab/31b-rnea-forward-backward-pass.html)

---

## 1. 物理背景与坐标系局部化优势

在求解复杂空间高自由度机械臂（如 6 自由度工业机械臂或双足人形机器人）的速度与加速度时，直接对基座全局坐标求解析偏导会导致公式维度发生“组合爆炸”（数千项三角函数交叉乘积）。

**连杆递推外推法 (Outward Propagation)** 由 John J. Craig 系统化规范：
- 将每个连杆的速度与加速度直接表达在**连杆自身的局部坐标系 $\{i+1\}$** 中；
- 从固定的基座 $\{0\}$ 出发，利用刚体运动学传输定理（Transport Theorem），沿着运动链逐级向外传播至末端执行器；
- 计算复杂度严格维持在 $\mathcal{O}(n)$ 线性阶，是递归牛顿-欧拉算法 (RNEA) 前向几何通路的数学基石。

---

## 2. 速度前向递推公式 (Velocity Propagation)

对于旋转关节（Revolute Joint），关节 $i+1$ 的转动轴定义在连杆 $\{i+1\}$ 坐标系的 $Z$ 轴方向，即：
$$
{^{i+1}\boldsymbol{z}}_{i+1} = \begin{bmatrix} 0 \\ 0 \\ 1 \end{bmatrix}
$$

### 2.1 角速度递推 (Angular Velocity)
连杆 $i+1$ 的绝对角速度等于连杆 $i$ 的角速度（经旋转矩阵 ${^{i+1}_i\boldsymbol{R}}$ 投影）叠加关节 $i+1$ 本身的旋转速度：
$$
{^{i+1}\boldsymbol{\omega}}_{i+1} = {^{i+1}_i\boldsymbol{R}} \, {^i\boldsymbol{\omega}}_i + \dot{\theta}_{i+1} \, {^{i+1}\boldsymbol{z}}_{i+1}
$$

### 2.2 坐标原点线速度递推 (Linear Velocity)
连杆 $i+1$ 坐标系原点的线速度等于连杆 $i$ 原点速度加上由于转动产生的线速度（刚体旋转线速度公式 $\boldsymbol{v} = \boldsymbol{\omega} \times \boldsymbol{r}$）：
$$
{^{i+1}\boldsymbol{v}}_{i+1} = {^{i+1}_i\boldsymbol{R}} \left( {^i\boldsymbol{v}}_i + {^i\boldsymbol{\omega}}_i \times {^i\boldsymbol{P}}_{i+1} \right)
$$
其中 ${^i\boldsymbol{P}}_{i+1}$ 为连杆 $\{i+1\}$ 原点在连杆 $\{i\}$ 坐标系下的位置矢量。

---

## 3. 加速度前向递推公式 (Acceleration Propagation)

对上述速度公式关于时间求导，必须计入动坐标系自身转动产生的微分项（即科里奥利与向心效应）。

### 3.1 角加速度递推 (Angular Acceleration)
$$
{^{i+1}\dot{\boldsymbol{\omega}}}_{i+1} = {^{i+1}_i\boldsymbol{R}} \, {^i\dot{\boldsymbol{\omega}}}_i + {^{i+1}_i\boldsymbol{R}} \, {^i\boldsymbol{\omega}}_i \times (\dot{\theta}_{i+1} \, {^{i+1}\boldsymbol{z}}_{i+1}) + \ddot{\theta}_{i+1} \, {^{i+1}\boldsymbol{z}}_{i+1}
$$
- 第一项：父连杆角加速度传递；
- 第二项：**陀螺力矩耦合项 (Gyroscopic Cross-term)**，由于转轴随基底转动而进动产生；
- 第三项：本关节电机的角加速度输出。

### 3.2 坐标原点线加速度递推 (Linear Acceleration)
$$
{^{i+1}\dot{\boldsymbol{v}}}_{i+1} = {^{i+1}_i\boldsymbol{R}} \left[ {^i\dot{\boldsymbol{v}}}_i + {^i\dot{\boldsymbol{\omega}}}_i \times {^i\boldsymbol{P}}_{i+1} + {^i\boldsymbol{\omega}}_i \times ({^i\boldsymbol{\omega}}_i \times {^i\boldsymbol{P}}_{i+1}) \right]
$$
- ${^i\dot{\boldsymbol{\omega}}}_i \times {^i\boldsymbol{P}}_{i+1}$：切向加速度（Tangential Acceleration）；
- ${^i\boldsymbol{\omega}}_i \times ({^i\boldsymbol{\omega}}_i \times {^i\boldsymbol{P}}_{i+1})$：向心加速度（Centripetal Acceleration）。

---

## 4. 连杆质心加速度与重力等效技巧 (Centroid Acceleration)

在动力学计算中，牛顿第二定律 $\boldsymbol{F} = m \boldsymbol{a}_C$ 作用于连杆的**质心 (Center of Mass, COM)**，而非关节原点：
$$
{^{i+1}\dot{\boldsymbol{v}}_{C, i+1}} = {^{i+1}\dot{\boldsymbol{v}}}_{i+1} + {^{i+1}\dot{\boldsymbol{\omega}}}_{i+1} \times {^{i+1}\boldsymbol{P}}_{C, i+1} + {^{i+1}\boldsymbol{\omega}}_{i+1} \times ({^{i+1}\boldsymbol{\omega}}_{i+1} \times {^{i+1}\boldsymbol{P}}_{C, i+1})
$$

### 爱因斯坦等效原理在机器人学中的绝妙应用：
机器人在真实环境中承受向下的重力加速度 $\boldsymbol{g} = [0, 0, -9.81]^T \, \text{m/s}^2$。
若在算法中为每个连杆显式叠加重力项，计算冗余且繁琐。
**规范工业解法**：在算法初始化时，**将静止的基座赋予一个向上的虚拟假想加速度**：
$$
{^0\dot{\boldsymbol{v}}}_0 = -\boldsymbol{g} = \begin{bmatrix} 0 \\ 0 \\ +9.81 \end{bmatrix} \, \text{m/s}^2, \quad {^0\boldsymbol{\omega}}_0 = \boldsymbol{0}, \quad {^0\dot{\boldsymbol{\omega}}}_0 = \boldsymbol{0}
$$
由于惯性力与重力的不可分辨性，这一虚拟底座加速度将通过向外递推公式自动且完全精确地作用到所有连杆的质心上，无需在后续动力学方程中单独添加任何一行重力补偿代码！

---

## 5. C++ / Eigen 算法参考实现

```cpp
#include <Eigen/Dense>

struct LinkState {
    Eigen::Vector3d omega;      // 角速度
    Eigen::Vector3d alpha;      // 角加速度
    Eigen::Vector3d a_origin;   // 原点线加速度
    Eigen::Vector3d a_com;      // 质心线加速度
};

LinkState propagate_link(const LinkState& parent, 
                         const Eigen::Matrix3d& R_i_to_next, 
                         const Eigen::Vector3d& P_next_in_i,
                         const Eigen::Vector3d& P_com_in_next,
                         double q_dot, double q_ddot) 
{
    LinkState child;
    Eigen::Vector3d z_axis(0, 0, 1);
    
    // 角速度递推
    child.omega = R_i_to_next * parent.omega + q_dot * z_axis;
    
    // 角加速度递推
    child.alpha = R_i_to_next * parent.alpha 
                + (R_i_to_next * parent.omega).cross(q_dot * z_axis) 
                + q_ddot * z_axis;
                
    // 原点加速度递推
    Eigen::Vector3d a_trans = parent.a_origin 
                            + parent.alpha.cross(P_next_in_i) 
                            + parent.omega.cross(parent.omega.cross(P_next_in_i));
    child.a_origin = R_i_to_next * a_trans;
    
    // 质心加速度
    child.a_com = child.a_origin 
                + child.alpha.cross(P_com_in_next) 
                + child.omega.cross(child.omega.cross(P_com_in_next));
                
    return child;
}
```
