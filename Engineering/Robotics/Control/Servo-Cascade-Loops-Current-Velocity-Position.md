# 伺服驱动三环级联控制与带宽匹配 (Servo Cascade Loops: Current, Velocity, and Position)

## 领域归属

- **学科体系**：Engineering / Robotics / Control (工业伺服驱动工程与底层闭环架构)
- **上游先修**：[单关节 PD/PID 位置控制](Single-Joint-PD-PID-Position-Control.md)、[单关节动力学模型](../Dynamics/Single-Joint-Dynamics-Inertia-Gravity-Friction.md)
- **并列概念**：磁场定向矢量控制 (FOC)、直接转矩控制 (DTC)
- **下游应用**：[ros2_control 硬件接口抽象](../ROS2/index.md)、[机器人力控制与柔顺装配](../Force-Control-and-Compliant-Assembly/index.md)
- **配套实验室**：[笔记 39：伺服级联三环与力矩饱和交互实验台 (LearningLab)](../LearningLab/39-servo-cascade-and-limits.html)

---

## 1. 工业伺服三环级联拓扑架构

在工业机器人伺服驱动器（如 Kollmorgen、Beckhoff、Elmo、汇川）中，底层电机控制普遍采用**由内到外严格分层的三环级联控制架构 (Cascade Control Architecture)**：

```text
位置指令 q_d ──> [ 位置环 P ] ──> 速度指令 v_cmd ──> [ 速度环 PI ] ──> 电流指令 I_cmd ──> [ 电流环 PI/FOC ] ──> PWM 逆变器 ──> 电机
                       ▲                                    ▲                                     ▲
                       └── 编码器位置反馈 q ────────────────┴── 速度微分反馈 dq ─────────────────┴── 相电流霍尔采样 I
```

### 各闭环的分工与物理职责：
1. **电流/转矩环 (Current / Torque Loop - 最内环)**：
   - **运行频率**：通常在 $10 \sim 20 \, \text{kHz}$（周期 $50 \sim 100 \, \mu\text{s}$）；
   - **控制机理**：基于 $dq$ 轴磁场定向控制（FOC），将交轴电流 $I_q$ 与转矩常数 $K_t$ 绑定（$\tau = K_t I_q$），快速克服电机定子电感反电势干扰，提供极其敏捷的净转矩源。
2. **速度环 (Velocity Loop - 中间环)**：
   - **运行频率**：通常在 $1 \sim 4 \, \text{kHz}$（周期 $250 \sim 1000 \, \mu\text{s}$）；
   - **控制机理**：标准 PI 控制器，消除机械粘性阻尼与低频负载扰动。
3. **位置环 (Position Loop - 最外环)**：
   - **运行频率**：通常在 $500 \sim 1000 \, \text{Hz}$（周期 $1 \sim 2 \, \text{ms}$，与机器人运动控制器/EtherCAT 总线同步）；
   - **控制机理**：标准 P 控制器（配合速度前馈），确保末端轨迹严格对准。

---

## 2. 闭环带宽分离设计准则 (Bandwidth Separation Principle)

为了保证级联多环系统的稳定性，避免内外环之间产生相位交叠与剧烈共振，**内环的闭环截止频率必须显著高于外环的闭环截止频率**。

### 工业黄金经验法则（$5 \sim 10$ 倍递增准则）：

$$
f_{\text{bw, current}} \ge (5 \sim 10) \cdot f_{\text{bw, velocity}} \ge (25 \sim 100) \cdot f_{\text{bw, position}}
$$

- 经典配置案例：
  - 电流环带宽：$f_c \approx 1000 \, \text{Hz}$；
  - 速度环带宽：$f_v \approx 100 \sim 200 \, \text{Hz}$；
  - 位置环带宽：$f_p \approx 20 \sim 40 \, \text{Hz}$。
- **物理意义**：从位置环的角度看，速度环是一个响应极快的“理想速度源”；从速度环的角度看，电流环是一个瞬时响应的“理想力矩发生器”。

---

## 3. 速度前馈与加速度前馈 (Velocity & Acceleration Feedforward)

若仅使用纯位置 P 环控制，根据稳态误差定理，在机械臂匀速运动段（速度为 $v$）必定存在固定的**滞后跟踪误差**：

$$
e_{ss} = \frac{v}{K_{vp}}
$$

其中 $K_{vp}$ 为位置环比例增益。

### 消除滞后的工程法宝：前馈通道 (Feedforward Channel)

$$
v_{\text{cmd}} = K_{vp} (q_d - q) + \boldsymbol{FF_v} \cdot \dot{q}_d
$$

$$
I_{\text{cmd}} = \operatorname{PI}_{\text{vel}}(v_{\text{cmd}} - \dot{q}) + \boldsymbol{FF_a} \cdot \ddot{q}_d
$$

- 当设置 $FF_v = 100\%$（完全速度前馈）时，期望速度指令直接注入速度环，位置环仅负责微小的偏差修正，**动态滞后跟踪误差在理论上被完全消除为零**！
- 当设置 $FF_a$（加速度前馈）时，电机直接输出加速所需的转矩，极大减轻了速度环积分器的纠错负担。

---

## 4. 级联环中的物理饱和与限幅保护

在伺服驱动器内部，物理硬件具有不可逾越的边界：
1. **电流/力矩硬限幅**：防止电机绕组过热烧毁与永磁体退磁（通常限制为额定电流的 200%~300%，且受 $I^2 t$ 热积累保护）；
2. **速度硬限幅**：防止轴承和滚珠丝杠超速飞车；
3. **积分分离与抗饱和**：当电流指令达到峰值上限时，立即冻结速度环积分器，杜绝超调反弹。

---

## 5. Python 伺服三环仿真原型

```python
class ServoCascadeController:
    def __init__(self, Kp_pos: float = 30.0, 
                 Kp_vel: float = 0.5, Ki_vel: float = 10.0,
                 Kt: float = 0.8, max_torque: float = 20.0):
        self.Kp_pos = Kp_pos
        self.Kp_vel = Kp_vel
        self.Ki_vel = Ki_vel
        self.Kt = Kt
        self.max_torque = max_torque
        
        self.vel_integral = 0.0
        
    def step(self, q_des: float, dq_des: float, 
             q_meas: float, dq_meas: float, dt: float = 0.001) -> float:
        # 1. 位置环 (带 100% 速度前馈)
        pos_error = q_des - q_meas
        vel_cmd = self.Kp_pos * pos_error + dq_des
        
        # 2. 速度环 (PI)
        vel_error = vel_cmd - dq_meas
        self.vel_integral += vel_error * dt
        
        # 速度 PI 输出扭矩指令
        tau_cmd = self.Kp_vel * vel_error + self.Ki_vel * self.vel_integral
        
        # 3. 电流/扭矩饱和限制与抗饱和
        if abs(tau_cmd) > self.max_torque:
            tau_cmd = np.sign(tau_cmd) * self.max_torque
            # 简单抗饱和：回退积分
            self.vel_integral -= vel_error * dt
            
        return float(tau_cmd)
```
