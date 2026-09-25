# 机械臂轨迹规划时间律 (Trajectory Time Laws)

## 领域归属

- **学科体系**：Engineering / Robotics / Control (运动规划与轨迹生成)
- **上游先修**：[平面两连杆正逆运动学](../Kinematics/Planar-Two-Link-Forward-Kinematics.md)、数值分析（插值理论）
- **并列概念**：B 样条曲线轨迹、笛卡尔空间直线/圆弧插补
- **下游应用**：[单关节 PD/PID 位置控制](Single-Joint-PD-PID-Position-Control.md)、[计算力矩前馈控制 (CTC)](Computed-Torque-Control-CTC.md)
- **配套实验室**：[笔记 33：时间轨迹律交互实验台 (LearningLab)](../LearningLab/33-trajectory-time-laws.html)

---

## 1. 路径 (Path) 与轨迹 (Trajectory) 的本质区别

- **路径 (Path)**：机械臂末端或关节变量在空间中走过的几何曲线集合，**不包含时间维度**（例如 $y = f(x)$）；
- **轨迹 (Trajectory)**：在几何路径的基础上赋予了明确的**时间演化规律**，即包含位置、速度、加速度乃至加加速度随时间变化的显式函数：
  $$
  q(t), \quad \dot{q}(t), \quad \ddot{q}(t), \quad \dddot{q}(t) \quad (t \in [0, T])
  $$

若仅规划路径而不做平滑的时间律分配，速度或加速度在起停瞬间可能发生阶跃突变（无限大加速度），引发机械减速机齿轮冲击打齿或电机过流急停。

---

## 2. 三次多项式插值 (Cubic Polynomial Trajectory)

设定初始时刻 $t=0$ 与终止时刻 $t=T$ 的位置与速度边界条件：
$$
\begin{cases}
q(0) = q_0, & \dot{q}(0) = v_0 \\
q(T) = q_f, & \dot{q}(T) = v_f
\end{cases}
$$

设定 3 次多项式：
$$
q(t) = a_0 + a_1 t + a_2 t^2 + a_3 t^3
$$
一阶与二阶求导：
$$
\dot{q}(t) = a_1 + 2 a_2 t + 3 a_3 t^2
$$
$$
\ddot{q}(t) = 2 a_2 + 6 a_3 t
$$

代入边界条件解得系数闭式解：
$$
\begin{cases}
a_0 = q_0 \\
a_1 = v_0 \\
a_2 = \frac{3(q_f - q_0)}{T^2} - \frac{2v_0 + v_f}{T} \\
a_3 = -\frac{2(q_f - q_0)}{T^3} + \frac{v_0 + v_f}{T^2}
\end{cases}
$$

### 工程评价：
- **优点**：计算轻量，能保证位置与速度的严格连续；
- **缺点**：加速度 $\ddot{q}(t)$ 是关于时间的一次线性函数，在起始点 $t=0$ 和终点 $t=T$ 处加速度非零（$\ddot{q}(0) = 2a_2 \neq 0$），存在**加速度跳变（Jerk 为冲击脉冲）**。

---

## 3. 五次多项式插值 (Quintic Polynomial Trajectory)

为了消除起始与终止时刻的加速度跳变，在边界条件中加入加速度约束（通常起止加速度设为零）：
$$
\begin{cases}
q(0) = q_0, & \dot{q}(0) = 0, & \ddot{q}(0) = 0 \\
q(T) = q_f, & \dot{q}(T) = 0, & \ddot{q}(T) = 0
\end{cases}
$$

设定 5 次多项式：
$$
q(t) = a_0 + a_1 t + a_2 t^2 + a_3 t^3 + a_4 t^4 + a_5 t^5
$$
利用 $s = t / T \in [0, 1]$ 归一化时间变量，解得极其优美的标准权重函数：
$$
q(t) = q_0 + (q_f - q_0) \cdot \left( 10 s^3 - 15 s^4 + 6 s^5 \right)
$$
对应速度与加速度：
$$
\dot{q}(t) = \frac{q_f - q_0}{T} \cdot \left( 30 s^2 - 60 s^3 + 30 s^4 \right)
$$
$$
\ddot{q}(t) = \frac{q_f - q_0}{T^2} \cdot \left( 60 s - 180 s^2 + 120 s^3 \right)
$$

### 工程评价：
- 位置、速度、加速度全程处处连续平滑；
- 起止加速度严格归零，从物理上杜绝了起停冲击，广泛应用于点到点（PTP）精密定位。

---

## 4. 梯形速度抛物线过渡时间律 (LSPB / Trapezoidal Velocity Profile)

在长行程输送或搬运任务中，五次多项式无法使电机长时间运行在额定最高匀速段。工程中广泛采用 **带有抛物线过渡的线性段时间律 (Linear Segment with Parabolic Blends, LSPB)**。

轨迹分为三段：
1. **匀加速段 ($t \in [0, t_b]$)**：以最大恒定加速度 $a_{\max}$ 抛物线加速；
2. **匀速巡航段 ($t \in [t_b, T - t_b]$)**：以额定最大线速度 $v_{\max}$ 匀速运行；
3. **匀减速段 ($t \in [T - t_b, T]$)**：以 $-a_{\max}$ 抛物线减速停靠。

过渡时间 $t_b$ 满足：
$$
t_b = \frac{q_0 - q_f + v_{\max} T}{v_{\max}}
$$
其加速度约束条件为：$a = \frac{v_{\max}}{t_b} \ge \frac{4(q_f - q_0)}{T^2}$。

---

## 5. Python 轨迹生成器模块

```python
import numpy as np

def generate_quintic_trajectory(q0: float, qf: float, T: float, dt: float = 0.001):
    """
    生成五次多项式平滑位置、速度、加速度时间序列
    """
    t_steps = np.arange(0, T + dt, dt)
    s = t_steps / T
    
    # 权重函数及其导数
    poly_pos = 10 * (s**3) - 15 * (s**4) + 6 * (s**5)
    poly_vel = (30 * (s**2) - 60 * (s**3) + 30 * (s**4)) / T
    poly_acc = (60 * s - 180 * (s**2) + 120 * (s**3)) / (T**2)
    
    delta = qf - q0
    q = q0 + delta * poly_pos
    q_dot = delta * poly_vel
    q_ddot = delta * poly_acc
    
    return t_steps, q, q_dot, q_ddot
```
