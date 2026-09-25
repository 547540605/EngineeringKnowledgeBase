# 速度分解运动控制 (Resolved-Rate Motion Control)

## 领域归属

- **学科体系**：Engineering / Robotics / Kinematics (闭环微分运动控制)
- **上游先修**：[雅可比矩阵几何推导与定义](Jacobian-Matrix-Geometric-Derivation.md)、[逆速度运动学求解](Inverse-Velocity-Kinematics.md)、[运动学奇异性与解耦](Kinematic-Singularity-and-Decoupling.md)
- **并列概念**：[平面两连杆正逆运动学](Planar-Two-Link-Forward-Kinematics.md)、[时间轨迹律规划](../Control/index.md)
- **下游应用**：[单关节与多轴伺服闭环控制](../Control/index.md)、[MoveIt Servo 实时遥控与手柄跟随](../ROS2/index.md)
- **配套实验室**：[笔记 18：速度分解运动控制交互实验台 (LearningLab)](../LearningLab/18-resolved-rate-motion.html)、[ROS 2 实验 15：MoveIt Servo 在线流式伺服控制](../LearningLab/ros2/15-moveit-servo-online-control.html)

---

## 1. 历史渊源与核心思想

**速度分解运动控制 (Resolved-Rate Motion Control)** 由丹尼尔·惠特尼（Daniel E. Whitney）于 1969 年在 MIT 首次提出。

### 核心痛点与创新：
- **传统逆运动学困境**：在没有解析逆解或需要连续笛卡尔轨迹跟踪（如焊接、涂胶、切削）时，每个控制周期求解高维非线性方程 $\boldsymbol{q} = f^{-1}(\boldsymbol{x})$ 计算开销大，且容易在多解分支间跳变；
- **惠特尼的解决方案**：放弃在位置层求解高维非线性方程，将控制指令直接在**笛卡尔速度空间**下达，通过**雅可比矩阵逆（或伪逆）分解为各关节速度命令**，驱动底层伺服驱动器。

---

## 2. 开环速度分解与数值漂移问题

最基础的开环速度控制律为：
$$
\dot{\boldsymbol{q}}(t) = \boldsymbol{J}^\dagger(\boldsymbol{q}(t)) \dot{\boldsymbol{x}}_d(t)
$$
在数字控制器中按离散步长 $\Delta t$ 进行数值欧拉积分：
$$
\boldsymbol{q}_{k+1} = \boldsymbol{q}_k + \dot{\boldsymbol{q}}_k \Delta t
$$

### 数值漂移缺陷 (Numerical Integration Drift)：
由于一阶离散化截断误差、有限浮点精度以及雅可比矩阵在步长内的局部近似性，随着时间累积，末端实际位置 $\boldsymbol{x}_k = f(\boldsymbol{q}_k)$ 会不可避免地逐渐脱离期望目标轨迹 $\boldsymbol{x}_{d, k}$，且漂移无法自愈。

---

## 3. 闭环逆运动学架构 (CLIK: Closed-Loop Inverse Kinematics)

为彻底根除开环积分漂移，现代工业控制采用**闭环逆运动学 (CLIK)** 算法架构，在前馈速度上叠加**笛卡尔位置误差的比例纠偏项**：

$$
\dot{\boldsymbol{q}} = \boldsymbol{J}^\dagger(\boldsymbol{q}) \left[ \dot{\boldsymbol{x}}_d + \boldsymbol{K}_p (\boldsymbol{x}_d - f(\boldsymbol{q})) \right]
$$

其中：
- $\boldsymbol{x}_d$ 为期望笛卡尔位姿；
- $f(\boldsymbol{q})$ 为正运动学计算出的末端实际位姿；
- $\boldsymbol{e} = \boldsymbol{x}_d - f(\boldsymbol{q})$ 为瞬时笛卡尔跟踪误差；
- $\boldsymbol{K}_p > 0$ 为对角对称正定比例增益矩阵（通常取 $K_p \in [10, 100] \, \text{s}^{-1}$）。

### 李雅普诺夫指数收敛性证明：
定义误差导数：
$$
\dot{\boldsymbol{e}} = \dot{\boldsymbol{x}}_d - \dot{\boldsymbol{x}} = \dot{\boldsymbol{x}}_d - \boldsymbol{J}\dot{\boldsymbol{q}}
$$
代入控制律（设 $\boldsymbol{J}$ 为满秩方阵或冗余满行秩，$\boldsymbol{J}\boldsymbol{J}^\dagger = \boldsymbol{I}$）：
$$
\dot{\boldsymbol{e}} = \dot{\boldsymbol{x}}_d - \boldsymbol{J} \boldsymbol{J}^\dagger [\dot{\boldsymbol{x}}_d + \boldsymbol{K}_p \boldsymbol{e}] = \dot{\boldsymbol{x}}_d - (\dot{\boldsymbol{x}}_d + \boldsymbol{K}_p \boldsymbol{e}) = -\boldsymbol{K}_p \boldsymbol{e}
$$
解此一阶常微分方程：
$$
\boldsymbol{e}(t) = \boldsymbol{e}(0) \exp(-\boldsymbol{K}_p t)
$$
> **数学保证**：末端执行器位置误差以指数衰减速度严格收敛到零！任何因离散化引起的微小漂移都会在几个控制周期内被自动拉回标称轨迹。

---

## 4. 工业级避障与奇异保护控制律 (DLS-CLIK)

在实际工程系统中，必须同时融入阻尼最小二乘（DLS）与关节速度限幅：

$$
\dot{\boldsymbol{q}} = \boldsymbol{J}^T (\boldsymbol{J}\boldsymbol{J}^T + \lambda^2 \boldsymbol{I})^{-1} \left[ \dot{\boldsymbol{x}}_d + \boldsymbol{K}_p (\boldsymbol{x}_d - f(\boldsymbol{q})) \right]
$$

### 速度饱和缩放 (Velocity Scaling)：
若某个关节计算速度超出物理硬件上限：$\max_i |\dot{q}_i| > \dot{q}_{\max}$，则**等比例缩放所有关节速度**：
$$
\dot{\boldsymbol{q}}_{\text{safe}} = \frac{\dot{q}_{\max}}{\max_i |\dot{q}_i|} \dot{\boldsymbol{q}}
$$
**切忌直接单独裁剪超限关节**！单独裁剪会破坏关节协同，导致末端严重脱离既定轨迹。

---

## 5. Python 闭环控制器仿真示例

```python
import numpy as np

def clik_step(q_curr: np.ndarray, x_des: np.ndarray, x_dot_des: np.ndarray, 
              fk_func, jacobian_func, Kp: float = 20.0, dt: float = 0.001) -> np.ndarray:
    """
    单周期闭环速度分解控制 (CLIK) 步进计算
    """
    x_curr = fk_func(q_curr)
    error = x_des - x_curr
    
    # 期望笛卡尔修正速度
    v_cmd = x_dot_des + Kp * error
    
    # 雅可比阻尼求解
    J = jacobian_func(q_curr)
    J_pinv = J.T @ np.linalg.inv(J @ J.T + 1e-4 * np.eye(len(x_des)))
    
    q_dot = J_pinv @ v_cmd
    q_next = q_curr + q_dot * dt
    return q_next, error
```
