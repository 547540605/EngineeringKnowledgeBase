# RNEA 驱动力矩四项物理分解 (Four Torque Components in Robot Dynamics)

## 领域归属

- **学科体系**：Engineering / Robotics / Dynamics (力矩成分物理机理解析)
- **上游先修**：[牛顿-欧拉双向递推算法 (RNEA)](RNEA-Outward-Inward-Two-Passes.md)、[隔离体空间牛顿-欧拉方程](Newton-Euler-Equations-Isolated-Body.md)
- **并列概念**：[两连杆动力学标准型 (M/C/G)](Planar-Two-Link-Dynamics-Equation-M-C-G.md)
- **下游应用**：[计算力矩前馈控制 (CTC)](../Control/Computed-Torque-Control-CTC.md)、[单关节与多轴伺服闭环控制](../Control/Single-Joint-PD-PID-Position-Control.md)
- **配套实验室**：[笔记 31d：RNEA 四项力矩解耦交互实验台 (LearningLab)](../LearningLab/31d-rnea-four-torque-terms.html)、[笔记 32：两连杆动力学矩阵结构演练](../LearningLab/32-two-link-dynamics-structure.html)

---

## 1. 物理机理分解方程

在任意多自由度机械臂中，无论采用拉格朗日分析力学还是牛顿-欧拉递推方法，各关节所承受的总电机驱动力矩 $\boldsymbol{\tau} \in \mathbb{R}^n$ 在物理本质上都可以严格且唯一地分解为四个力学项的代数叠加：

$$
\boldsymbol{\tau} = \boldsymbol{\tau}_{\text{inertia}} + \boldsymbol{\tau}_{\text{centrifugal}} + \boldsymbol{\tau}_{\text{coriolis}} + \boldsymbol{\tau}_{\text{gravity}}
$$

对应标准二阶非线性刚体动力学矩阵方程：

$$
\boldsymbol{\tau} = \boldsymbol{M}(\boldsymbol{q})\ddot{\boldsymbol{q}} + \boldsymbol{C}_{\text{cent}}(\boldsymbol{q}) \dot{\boldsymbol{q}}^2 + \boldsymbol{C}_{\text{cori}}(\boldsymbol{q}) [\dot{q}_i \dot{q}_j] + \boldsymbol{G}(\boldsymbol{q})
$$

---

## 2. 四大分项的物理机理与工程特性

| 分项名称 | 代数表达形式 | 速度/加速度依赖 | 随工况演化特征与工程关键点 |
| :--- | :--- | :--- | :--- |
| **惯性力矩**<br>$\boldsymbol{\tau}_{\text{inertia}}$ | $\boldsymbol{M}(\boldsymbol{q})\ddot{\boldsymbol{q}}$ | 严格正比于角加速度 $\ddot{\boldsymbol{q}}$，与速度无关 | 机械臂瞬时加速或急停制动时起主导作用。质量矩阵 $\boldsymbol{M}(\boldsymbol{q})$ 强烈依赖构型，臂伸展时惯量激增数倍。 |
| **向心力矩**<br>$\boldsymbol{\tau}_{\text{centrifugal}}$ | $\sum_i c_{ii}(\boldsymbol{q}) \dot{q}_i^2$ | 正比于单一关节速度的平方 $\dot{q}_i^2$ | 连杆绕自身或上级关节旋转时，质心产生的向心拉力拉扯前级关节。**高速运动时占据统治地位**。 |
| **科里奥利力矩**<br>$\boldsymbol{\tau}_{\text{coriolis}}$ | $\sum_{i \neq j} c_{ij}(\boldsymbol{q}) \dot{q}_i \dot{q}_j$ | 双线性正比于两个不同关节速度的乘积 | 动坐标系自身在旋转的同时，另一关节在动坐标系中相对运动产生的科氏惯性力矩。**多轴协同联动转弯时的典型耦合干扰**。 |
| **重力力矩**<br>$\boldsymbol{\tau}_{\text{gravity}}$ | $\boldsymbol{G}(\boldsymbol{q})$ | 仅依赖关节位置 $\boldsymbol{q}$，与速度/加速度无关 | 地球重力场对各偏心连杆质心的静态悬臂拉力。静止悬停时电机唯一需要对抗的力矩。 |

---

## 3. 工况主导性分析：速度与加速度的权衡博弈

在工业机器人的实际运行生命周期中，驱动器力矩的主导成分随工况发生剧烈迁移：

### 3.1 极低速或静态悬停工况 ($\dot{\boldsymbol{q}} \to 0, \ddot{\boldsymbol{q}} \to 0$)
- 惯性力矩与向心科氏力矩几乎完全归零；
- **重力项 $\boldsymbol{G}(\boldsymbol{q})$ 占 100% 绝对主导**；
- 若无重力前馈补偿，PID 控制器中的积分项 $K_i$ 将持续饱和累积，造成严重超调。

### 3.2 恒定超高速巡航工况 ($\dot{\boldsymbol{q}} \gg 0, \ddot{\boldsymbol{q}} = 0$)
- 惯性项归零；
- **向心力矩与科氏力矩随速度呈二次方爆炸性增长**，其幅值经常超越静态重力力矩数倍；
- 传统单轴独立 PID 控制器因无法感知跨轴交叉耦合，在此阶段会导致末端轨迹严重侧向偏离。

### 3.3 紧急停止或急加急减工况 ($\ddot{\boldsymbol{q}} \to \ddot{q}_{\max}$)
- **惯性力矩 $\boldsymbol{M}(\boldsymbol{q})\ddot{\boldsymbol{q}}$ 瞬间达到电机扭矩过载极限**；
- 决定减速机制动力矩选型与减速机齿面剪切强度安全系数。

---

## 4. 利用 RNEA 快速数值解耦四项的算法黑科技

在工业控制器中，如何不通过繁重的符号推导直接获得这四项的数值？巧妙调用 RNEA 算法 4 次：

1. **重力项提取**：

$$
\boldsymbol{\tau}_{\text{gravity}} = \operatorname{RNEA}(\boldsymbol{q}, \dot{\boldsymbol{q}}=\boldsymbol{0}, \ddot{\boldsymbol{q}}=\boldsymbol{0}, \boldsymbol{g})
$$

2. **纯惯性项提取**：

$$
\boldsymbol{\tau}_{\text{inertia}} = \operatorname{RNEA}(\boldsymbol{q}, \dot{\boldsymbol{q}}=\boldsymbol{0}, \ddot{\boldsymbol{q}}, \boldsymbol{g}=\boldsymbol{0})
$$

3. **向心与科氏力总和提取**：

$$
\boldsymbol{\tau}_{\text{velocity}} = \operatorname{RNEA}(\boldsymbol{q}, \dot{\boldsymbol{q}}, \ddot{\boldsymbol{q}}=\boldsymbol{0}, \boldsymbol{g}=\boldsymbol{0})
$$

4. **向心力与科氏力单独隔离**：
   - 设仅有关节 $i$ 运动：$\dot{\boldsymbol{q}}_i = [0, \dots, \dot{q}_i, \dots, 0]$，则 $\operatorname{RNEA}$ 输出即为纯关节 $i$ 的向心力项；
   - 两者作差即可得到两轴之间的纯科氏耦合力矩。

---

## 5. Python 力矩成分解耦实验函数

```python
import numpy as np

def decompose_torques(rnea_func, q: np.ndarray, q_dot: np.ndarray, q_ddot: np.ndarray, g: float = 9.81):
    """
    通过巧妙配置 RNEA 的输入变量，完全解耦四项物理力矩
    """
    zero_vel = np.zeros_like(q_dot)
    zero_acc = np.zeros_like(q_ddot)
    
    # 1. 静态重力项
    tau_g = rnea_func(q, zero_vel, zero_acc, g=g)
    
    # 2. 纯动态惯性项
    tau_m = rnea_func(q, zero_vel, q_ddot, g=0.0)
    
    # 3. 速度项 (向心 + 科氏)
    tau_c = rnea_func(q, q_dot, zero_acc, g=0.0)
    
    # 4. 总驱动扭矩验证
    tau_total = tau_m + tau_c + tau_g
    
    return {
        "inertia": tau_m,
        "centrifugal_and_coriolis": tau_c,
        "gravity": tau_g,
        "total": tau_total
    }
```
