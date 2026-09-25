# 计算力矩控制 (Computed Torque Control, CTC)

## 领域归属

- **学科体系**：Engineering / Robotics / Control (非线性反馈线性化多轴控制)
- **上游先修**：[两连杆动力学标准型 M-C-G](../Dynamics/Planar-Two-Link-Dynamics-Equation-M-C-G.md)、[递归牛顿-欧拉算法 (RNEA)](../Dynamics/RNEA-Outward-Inward-Two-Passes.md)、[单关节 PD/PID 控制](Single-Joint-PD-PID-Position-Control.md)
- **并列概念**：自适应动力学控制 (Adaptive Control)、滑模控制 (Sliding Mode Control, SMC)
- **下游应用**：[两连杆闭环动力学对比仿真](../LearningLab/37-two-link-closed-loop-simulation.html)、[笛卡尔空间阻抗控制](../Force-Control-and-Compliant-Assembly/index.md)
- **配套实验室**：[笔记 35：计算力矩控制交互对比实验台 (LearningLab)](../LearningLab/35-computed-torque-control.html)、[笔记 37：两连杆闭环动力学仿真台](../LearningLab/37-two-link-closed-loop-simulation.html)

---

## 1. 核心痛点与反馈线性化思想

传统工业机械臂若采用独立的单轴 PID 控制器，在高速大范围运动时，各关节之间的惯性交叉耦合力矩、向心力矩与科氏力矩充当了强烈的非线性未知外扰。单轴 PID 控制器无法前馈感知这些力矩，导致末端轨迹跟踪误差急剧放大。

**计算力矩控制 (Computed Torque Control, CTC)**，又称**逆动力学控制 (Inverse Dynamics Control)** 或**非线性反馈线性化 (Feedback Linearization)**，其核心思想是：
- 依靠全状态动力学模型，在控制律内部主动构造抵消项；
- **将一个高度耦合、高阶非线性的多输入多输出（MIMO）多刚体系，在数学上精确解耦为 $n$ 个完全独立的二阶单位双积分器线性系统**。

---

## 2. 数学推导与控制律构建

回顾标准多刚体动力学模型：
$$
\boldsymbol{M}(\boldsymbol{q})\ddot{\boldsymbol{q}} + \boldsymbol{C}(\boldsymbol{q}, \dot{\boldsymbol{q}})\dot{\boldsymbol{q}} + \boldsymbol{G}(\boldsymbol{q}) = \boldsymbol{\tau}
$$

设计非线性计算力矩控制律：
$$
\boldsymbol{\tau} = \hat{\boldsymbol{M}}(\boldsymbol{q}) \boldsymbol{u} + \hat{\boldsymbol{C}}(\boldsymbol{q}, \dot{\boldsymbol{q}})\dot{\boldsymbol{q}} + \hat{\boldsymbol{G}}(\boldsymbol{q})
$$

其中 $\boldsymbol{u} \in \mathbb{R}^n$ 为新引入的**虚拟辅助控制输入向量 (Auxiliary Control Input)**。

### 误差伺服环配置（前馈加速度 + 比例微分）：
$$
\boldsymbol{u} = \ddot{\boldsymbol{q}}_d(t) + \boldsymbol{K}_d (\dot{\boldsymbol{q}}_d(t) - \dot{\boldsymbol{q}}(t)) + \boldsymbol{K}_p (\boldsymbol{q}_d(t) - \boldsymbol{q}(t))
$$
其中 $\boldsymbol{K}_p = \operatorname{diag}(\omega_{n1}^2, \dots, \omega_{nn}^2)$，$\boldsymbol{K}_d = \operatorname{diag}(2\zeta_1\omega_{n1}, \dots, 2\zeta_n\omega_{nn})$。

---

## 3. 全局解耦与渐近收敛性证明

假设机械臂的名义动力学模型完全精确（$\hat{\boldsymbol{M}} = \boldsymbol{M}, \hat{\boldsymbol{C}} = \boldsymbol{C}, \hat{\boldsymbol{G}} = \boldsymbol{G}$）。
将控制律代入真实动力学系统：
$$
\boldsymbol{M}(\boldsymbol{q})\ddot{\boldsymbol{q}} + \boldsymbol{C}(\boldsymbol{q}, \dot{\boldsymbol{q}})\dot{\boldsymbol{q}} + \boldsymbol{G}(\boldsymbol{q}) = \boldsymbol{M}(\boldsymbol{q}) \boldsymbol{u} + \boldsymbol{C}(\boldsymbol{q}, \dot{\boldsymbol{q}})\dot{\boldsymbol{q}} + \boldsymbol{G}(\boldsymbol{q})
$$
两边消去非线性的速度项与重力项：
$$
\boldsymbol{M}(\boldsymbol{q})\ddot{\boldsymbol{q}} = \boldsymbol{M}(\boldsymbol{q})\boldsymbol{u}
$$
由于惯性矩阵 $\boldsymbol{M}(\boldsymbol{q})$ 严格对称正定，恒可逆（$\det(\boldsymbol{M}) > 0$），两边左乘逆矩阵 $\boldsymbol{M}^{-1}$：
$$
\ddot{\boldsymbol{q}} = \boldsymbol{u}
$$

将 $\boldsymbol{u}$ 的定义式代入，定义跟踪误差向量 $\boldsymbol{e}(t) = \boldsymbol{q}_d(t) - \boldsymbol{q}(t)$：
$$
\ddot{\boldsymbol{e}} + \boldsymbol{K}_d \dot{\boldsymbol{e}} + \boldsymbol{K}_p \boldsymbol{e} = \boldsymbol{0}
$$

### 核心控制结论：
每一个关节的误差微分方程均满足独立的标量二阶线性齐次方程：
$$
\ddot{e}_i + 2 \zeta_i \omega_{ni} \dot{e}_i + \omega_{ni}^2 e_i = 0 \quad (i = 1, \dots, n)
$$
- 关节之间在动态上**彻底解耦，互不干扰**；
- 只要选择 $\boldsymbol{K}_p > 0, \boldsymbol{K}_d > 0$，误差系统必在全局渐近稳定收敛至零（$\lim_{t\to\infty} \boldsymbol{e}(t) = \boldsymbol{0}$）。

---

## 4. 工业实现：结合 RNEA 的高速高效算法

在工业控制器内部，直接计算矩阵乘积 $\boldsymbol{M}(\boldsymbol{q})\boldsymbol{u} + \boldsymbol{C}\dot{\boldsymbol{q}} + \boldsymbol{G}$ 计算量较大。
最规范且高效的实现方式是**直接复用递归牛顿-欧拉算法 (RNEA)**：

$$
\boldsymbol{\tau} = \operatorname{RNEA}(\boldsymbol{q}, \dot{\boldsymbol{q}}, \ddot{\boldsymbol{q}} = \boldsymbol{u}, \boldsymbol{g})
$$

只需将辅助加速度 $\boldsymbol{u}$ 直接作为 RNEA 的角加速度输入，算法在 $\mathcal{O}(n)$ 线性时间内即可自动输出精确的解耦力矩，无需任何矩阵求逆或符号展开！

---

## 5. Python 计算力矩控制器与两连杆仿真

```python
import numpy as np

class ComputedTorqueController:
    def __init__(self, Kp_diag: np.ndarray, Kd_diag: np.ndarray):
        self.Kp = np.diag(Kp_diag)
        self.Kd = np.diag(Kd_diag)
        
    def compute(self, q: np.ndarray, dq: np.ndarray,
                qd: np.ndarray, dqd: np.ndarray, ddqd: np.ndarray,
                mcg_model_func) -> np.ndarray:
        # 1. 误差计算
        e = qd - q
        de = dqd - dq
        
        # 2. 虚拟控制加速度 u
        u = ddqd + self.Kd @ de + self.Kp @ e
        
        # 3. 动力学模型前馈
        M, C, G = mcg_model_func(q, dq)
        tau = M @ u + C @ dq + G
        return tau
```
