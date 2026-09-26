# 单关节动力学模型：惯量、重力与摩擦 (Single Joint Dynamics)

## 领域归属

- **学科体系**：Engineering / Robotics / Dynamics (单关节动力学基础)
- **上游先修**：理论力学（牛顿第二定律、转动刚体转动定律）
- **并列概念**：[隔离体空间牛顿-欧拉方程](Newton-Euler-Equations-Isolated-Body.md)
- **下游应用**：[牛顿-欧拉双向递推算法 (RNEA)](RNEA-Outward-Inward-Two-Passes.md)、[两连杆动力学标准型 (M/C/G)](Planar-Two-Link-Dynamics-Equation-M-C-G.md)、[单关节 PID 位置控制](../Control/Single-Joint-PD-PID-Position-Control.md)
- **配套实验室**：[笔记 26：单关节动力学交互实验台 (LearningLab)](../LearningLab/26-single-joint-dynamics.html)、[笔记 39：伺服级联三环与力矩饱和](../LearningLab/39-servo-cascade-and-limits.html)

---

## 1. 物理模型与受力分析

单关节旋转机构由驱动电机、减速器、转动连杆以及负载组成。设关节旋转角度为 $\theta$，角速度为 $\dot{\theta}$，角加速度为 $\ddot{\theta}$，驱动电机在关节端输出的总转矩为 $\tau$。

根据达朗贝尔原理与角动量定理，单关节动力学微分方程可精确表述为：

$$
J \ddot{\theta} + b \dot{\theta} + \tau_c \operatorname{sgn}(\dot{\theta}) + \tau_g(\theta) = \tau
$$

各物理项的工程含义与量纲如下：

| 项符号 | 物理含义 | SI 单位 | 物理机理 |
| :--- | :--- | :--- | :--- |
| $J$ | 等效转动惯量 (Effective Inertia) | $\text{kg}\cdot\text{m}^2$ | 包含电机转子惯量（乘以减速比平方 $n^2$）与机械连杆及负载的惯量之和 |
| $b \dot{\theta}$ | 粘性摩擦阻尼 (Viscous Friction) | $\text{N}\cdot\text{m}$ | 润滑油剪切阻力，与转速严格成线性正比 |
| $\tau_c \operatorname{sgn}(\dot{\theta})$ | 库仑摩擦 (Coulomb Friction) | $\text{N}\cdot\text{m}$ | 接触面干燥滑动摩擦，大小恒定，方向始终与运动速度相反 |
| $\tau_g(\theta)$ | 重力平衡力矩 (Gravity Torque) | $\text{N}\cdot\text{m}$ | 偏心质心产生的力矩，满足 $\tau_g(\theta) = m g l_c \cos\theta$（或 $\sin\theta$） |
| $\tau$ | 驱动器输出力矩 (Applied Torque) | $\text{N}\cdot\text{m}$ | 伺服电机通过电磁安培力产生的净输出驱动力矩 |

---

## 2. 非线性摩擦力扩展模型 (Stribeck 模型)

在实际精密机器人关节轴承与谐波/RV减速机中，摩擦力展现出高度非线性。经典的 **Stribeck 摩擦模型** 能够完整刻画低速爬行现象：

$$
\tau_f(\dot{\theta}) = \left[ \tau_c + (\tau_s - \tau_c) e^{-|\dot{\theta} / \dot{\theta}_s|^\delta} \right] \operatorname{sgn}(\dot{\theta}) + b \dot{\theta}
$$

其中：
- $\tau_s$：最大静摩擦力矩（Static Friction / Breakaway Torque），通常 $\tau_s > \tau_c$；
- $\dot{\theta}_s$：Stribeck 特征滑动线速度；
- $\delta$：衰减指数（通常取 $1 \sim 2$）。

### 工程辨识意义：
在关节速度穿越零点换向时，摩擦力存在突变死区与局部负斜率软化效应。若未在前馈中补偿 Stribeck 摩擦，低速轮廓跟踪将出现严重的“平顶”（Flat-top）或死区滞后。

---

## 3. 重力力矩的随角变化机理

设连杆质量为 $m$，回转轴到连杆质心的距离为 $l_c$，当连杆处于水平位姿（重力垂线夹角为 $90^\circ$）时，重力力矩达到峰值：

$$
\tau_{g, \max} = m \cdot g \cdot l_c
$$

当连杆处于垂直下垂位姿时，重力力矩归零，处于稳定平衡点；垂直直立位姿为不稳定平衡点。

---

## 4. 连续时间传递函数与控制基础

忽略非线性静摩擦，将方程在工作点处线性化并进行拉普拉斯变换（设初始状态为零）：

$$
J s^2 \Theta(s) + b s \Theta(s) = T(s) - T_g(s)
$$

从驱动力矩到角速度 $\Omega(s) = s\Theta(s)$ 的开环传递函数为典型的一阶惯性环节：

$$
G_v(s) = \frac{\Omega(s)}{T(s)} = \frac{1}{J s + b} = \frac{K_m}{\tau_m s + 1}
$$

其中系统时间常数 $\tau_m = J / b$，放大增益 $K_m = 1 / b$。转动惯量 $J$ 越大，机械系统的动态响应越慢。

---

## 5. Python 动力学仿真器实现

```python
import numpy as np

class SingleJoint:
    def __init__(self, J: float = 0.05, b: float = 0.01, tau_c: float = 0.1, m: float = 1.0, lc: float = 0.2):
        self.J = J
        self.b = b
        self.tau_c = tau_c
        self.m = m
        self.lc = lc
        self.g = 9.81
        
        self.theta = 0.0
        self.theta_dot = 0.0
        
    def step(self, tau_cmd: float, dt: float = 0.001) -> tuple[float, float, float]:
        """单步执行动力学数值积分"""
        tau_g = self.m * self.g * self.lc * np.cos(self.theta)
        tau_f = self.b * self.theta_dot + self.tau_c * np.sign(self.theta_dot) if abs(self.theta_dot) > 1e-4 else 0.0
        
        # 净加速扭矩
        tau_net = tau_cmd - tau_g - tau_f
        theta_ddot = tau_net / self.J
        
        self.theta_dot += theta_ddot * dt
        self.theta += self.theta_dot * dt
        return self.theta, self.theta_dot, theta_ddot
```
