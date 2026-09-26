# 单关节 PD/PID 位置闭环控制与重力补偿 (Single Joint PD/PID Position Control)

## 领域归属

- **学科体系**：Engineering / Robotics / Control (单关节闭环运动控制)
- **上游先修**：[单关节动力学模型](../Dynamics/Single-Joint-Dynamics-Inertia-Gravity-Friction.md)、[机械臂轨迹规划时间律](Trajectory-Time-Laws-Cubic-Quintic-LSPB.md)
- **并列概念**：状态空间极点配置、线性二次型调节器 (LQR)
- **下游应用**：[计算力矩前馈控制 (CTC)](Computed-Torque-Control-CTC.md)、[伺服三环级联架构](Servo-Cascade-Loops-Current-Velocity-Position.md)
- **配套实验室**：[笔记 34：单关节 PID 闭环控制交互实验台 (LearningLab)](../LearningLab/34-pid-position-control.html)、[笔记 39：伺服级联三环与力矩饱和](../LearningLab/39-servo-cascade-and-limits.html)

---

## 1. 闭环控制系统基本架构

在单关节伺服控制中，目标是驱动实际关节位置 $q(t)$ 极其精准地跟踪给定的期望时间轨迹 $q_d(t)$。

定义瞬时跟踪误差与速度误差：

$$
e(t) = q_d(t) - q(t), \quad \dot{e}(t) = \dot{q}_d(t) - \dot{q}(t)
$$

### 基础 PD 控制律与重力前馈 (PD with Gravity Compensation)：

$$
\tau = K_p e(t) + K_d \dot{e}(t) + \hat{\tau}_g(q)
$$

其中：
- $K_p > 0$：比例刚度增益（Proportional Gain），产生等效于“虚拟机械弹簧”的恢复扭矩；
- $K_d > 0$：微分阻尼增益（Derivative Gain），产生等效于“虚拟阻尼减震器”的制动力矩，抑制振荡；
- $\hat{\tau}_g(q)$：基于模型的重力力矩前馈项（Gravity Feedforward）。

---

## 2. 闭环误差动态方程与临界阻尼设计

将单关节动力学方程 $J \ddot{q} + b \dot{q} + \tau_g(q) = \tau$ 代入上述控制律。
假设重力模型精确补偿（$\hat{\tau}_g(q) = \tau_g(q)$），系统非线性项被精确消除，闭环误差动态方程退化为严格的二阶线性齐次常微分方程：

$$
J \ddot{e} + (b + K_d) \dot{e} + K_p e = 0
$$

两边同除以转动惯量 $J$：

$$
\ddot{e} + 2 \zeta \omega_n \dot{e} + \omega_n^2 e = 0
$$

由此解得闭环无阻尼固有角频率 $\omega_n$ 与阻尼比 $\zeta$：

$$
\omega_n = \sqrt{\frac{K_p}{J}}, \quad \zeta = \frac{b + K_d}{2 \sqrt{J K_p}}
$$

### 工业黄金参数整定准则：临界阻尼设计 ($\zeta = 1$)
在工业机器人精密定位中，**绝对不允许机械臂发生末端过冲打靶**（过冲可能碰撞模具或工件）：

$$
\zeta = 1 \quad \Longrightarrow \quad K_d = 2 \sqrt{J K_p} - b
$$

在此参数配置下，误差以最快速度单调指数衰减，彻底杜绝振荡超调。

---

## 3. 为什么重力前馈优于积分项 $K_i$？

传统工业工程师常常习惯加入积分项 $K_i \int e \, dt$ 来消除重力下垂引起的稳态误差（$e_{ss} = \tau_g / K_p$）。
但在高性能运控中，**重力前馈机制具有压倒性优势**：

| 对比维度 | 纯 PID 积分累加 ($K_i$) | 模型前馈重力补偿 ($\hat{\tau}_g$) |
| :--- | :--- | :--- |
| **响应时效** | 滞后！必须等待位置下垂产生误差累积数个周期后，力矩才逐渐建立 | **零延迟瞬时前馈**！在电机还未启动的瞬间，力矩已经直接抵消重力 |
| **动态稳定性** | 引入 $1/s$ 极点，降低系统相位裕度，极易引发极限环低频振荡 | 不改变闭环极点分布，保持高阻尼比 |
| **启动下垂** | 机械臂刹车松开瞬间必定发生轻微下坠（Sag） | 刹车松开即平衡，无下坠冲击 |

---

## 4. 积分抗饱和保护 (Anti-Windup)

若因存在未知负载或未建模摩擦力必须保留小积分项 $K_i$，则**必须引入抗积分饱和算法**。
当执行机构达到最大输出转矩 $|\tau| \ge \tau_{\max}$ 时：
- **钳位法 (Clamping)**：立即暂停误差累加（令 $\dot{I} = 0$）；
- **反算反向衰减法 (Back-Calculation)**：根据力矩超出饱和区的差值动态反向扣减积分器状态，防止电机在反向减速时产生巨大的超调与响应延迟。

---

## 5. Python 单关节闭环控制器仿真示例

```python
import numpy as np

class PDControllerWithGravity:
    def __init__(self, Kp: float, Kd: float, m: float, l_c: float, g: float = 9.81):
        self.Kp = Kp
        self.Kd = Kd
        self.m = m
        self.l_c = l_c
        self.g = g
        
    def compute_torque(self, q_curr: float, dq_curr: float, 
                       q_des: float, dq_des: float, tau_max: float = 50.0) -> float:
        # 误差计算
        e = q_des - q_curr
        de = dq_des - dq_curr
        
        # 状态反馈项
        tau_fb = self.Kp * e + self.Kd * de
        
        # 重力前馈项
        tau_ff = self.m * self.g * self.l_c * np.cos(q_curr)
        
        # 总指令与饱和截断
        tau_total = tau_fb + tau_ff
        return float(np.clip(tau_total, -tau_max, tau_max))
```
