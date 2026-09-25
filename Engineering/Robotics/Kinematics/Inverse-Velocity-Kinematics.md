# 逆速度运动学求解 (Inverse Velocity Kinematics)

## 领域归属

- **学科体系**：Engineering / Robotics / Kinematics (微分逆运动学)
- **上游先修**：[雅可比矩阵几何推导与定义](Jacobian-Matrix-Geometric-Derivation.md)、[雅可比速度映射与速度/力椭球](Jacobian-Velocity-Mapping.md)
- **并列概念**：[运动学奇异性与解耦](Kinematic-Singularity-and-Decoupling.md)、[连杆间速度外推](Link-to-Link-Velocity-Propagation.md)
- **下游应用**：[速度分解运动控制 (Resolved-Rate Control)](Resolved-Rate-Motion-Control.md)、[冗余机械臂零空间优化与避障](../ROS2/index.md)
- **配套实验室**：[笔记 17：平面逆速度运动学交互实验台 (LearningLab)](../LearningLab/17-planar-inverse-velocity.html)、[ROS 2 实验 08：3R 逆运动学与速度雅可比](../LearningLab/ros2/08-3r-position-jacobian.html)

---

## 1. 逆速度问题的基本表述

逆速度运动学（Inverse Velocity Kinematics）旨在解决：**已知末端执行器的期望笛卡尔速度 $\boldsymbol{v}_e = [\boldsymbol{v}^T, \boldsymbol{\omega}^T]^T \in \mathbb{R}^m$ 与当前构型 $\boldsymbol{q}$，求解能实现该末端速度的各关节瞬时速度 $\dot{\boldsymbol{q}} \in \mathbb{R}^n$**：

$$
\boldsymbol{v}_e = \boldsymbol{J}(\boldsymbol{q}) \dot{\boldsymbol{q}} \quad \Longrightarrow \quad \text{求解 } \dot{\boldsymbol{q}}
$$

根据雅可比矩阵的维度，分为非冗余（$m = n$）、冗余（$n > m$）与超定（$m > n$）三种数学形态。

---

## 2. 满秩非冗余机械臂 ($m = n$)

当关节数等于任务空间自由度且构型非奇异（$\det(\boldsymbol{J}) \neq 0$）时，存在唯一的逆速度解析解：
$$
\dot{\boldsymbol{q}} = \boldsymbol{J}(\boldsymbol{q})^{-1} \boldsymbol{v}_e
$$

### 求解算法建议：
在实时控制器（如 1kHz 控制循环）中，**严禁显式计算逆矩阵 $\boldsymbol{J}^{-1}$**。应使用数值线性代数的高效分解方法（如 LU 分解或带有列主元选取的 Gaussian 消元）：
$$
\boldsymbol{J}(\boldsymbol{q}) \dot{\boldsymbol{q}} = \boldsymbol{v}_e \quad \xrightarrow{\text{LU 分解}} \quad \boldsymbol{L}\boldsymbol{U}\dot{\boldsymbol{q}} = \boldsymbol{v}_e
$$

---

## 3. 冗余机械臂与摩尔-彭罗斯伪逆 ($n > m$)

对于冗余机械臂（例如 7 轴协作机械臂控制 6 自由度空间位姿，或平面 3R 机械臂控制 2 自由度末端位置），方程欠定，存在无穷多组关节速度解。

### 3.1 极小范数伪逆解 (Right Moore-Penrose Pseudoinverse)
构建带拉格朗日乘子的凸优化问题：在满足末端速度约束的前提下，最小化**关节速度欧氏 2-范数平方**：
$$
\min_{\dot{\boldsymbol{q}}} \frac{1}{2} \|\dot{\boldsymbol{q}}\|^2 = \frac{1}{2} \dot{\boldsymbol{q}}^T \dot{\boldsymbol{q}} \quad \text{s.t.} \quad \boldsymbol{J} \dot{\boldsymbol{q}} = \boldsymbol{v}_e
$$
推导出右伪逆（Right Pseudoinverse）：
$$
\dot{\boldsymbol{q}} = \boldsymbol{J}^\dagger \boldsymbol{v}_e = \boldsymbol{J}^T (\boldsymbol{J} \boldsymbol{J}^T)^{-1} \boldsymbol{v}_e
$$

> **数学与物理边界辨析（重要）**：
> 最小化欧氏范数 $\|\dot{\boldsymbol{q}}\|^2$ 仅意味着各关节角速度的平方和最小，**在物理上一般不等价于机械臂瞬时动能最小**。真实系统的瞬时动能由机械臂质量矩阵度量：$T = \frac{1}{2} \dot{\boldsymbol{q}}^T \boldsymbol{M}(\boldsymbol{q}) \dot{\boldsymbol{q}}$。只有当机械臂质量矩阵恰好退化为单位矩阵的标量倍（$\boldsymbol{M} = m \boldsymbol{I}$）时，两者才重合。若在动力学优化中追求严格的瞬时动能极小化，必须采用以惯性矩阵为权重的**加权伪逆 (Inertia-Weighted Pseudoinverse)**：$\boldsymbol{J}_M^\dagger = \boldsymbol{M}^{-1} \boldsymbol{J}^T (\boldsymbol{J} \boldsymbol{M}^{-1} \boldsymbol{J}^T)^{-1}$。

---

## 4. 零空间投影与多任务分级控制 (Null-Space Projection)

这是冗余机械臂最核心的技术优势。雅可比矩阵的零空间（Null Space）正交投影算子为：
$$
\boldsymbol{P}_{\text{null}} = (\boldsymbol{I}_n - \boldsymbol{J}^\dagger \boldsymbol{J})
$$

### 速度解的完全通解公式：
$$
\dot{\boldsymbol{q}} = \boldsymbol{J}^\dagger \boldsymbol{v}_e + (\boldsymbol{I}_n - \boldsymbol{J}^\dagger \boldsymbol{J}) \dot{\boldsymbol{q}}_0
$$

### 核心数学性质：
将 $\boldsymbol{J}$ 左乘到零空间速度项：
$$
\boldsymbol{J} \cdot \left[ (\boldsymbol{I}_n - \boldsymbol{J}^\dagger \boldsymbol{J}) \dot{\boldsymbol{q}}_0 \right] = (\boldsymbol{J} - \boldsymbol{J} \boldsymbol{J}^\dagger \boldsymbol{J}) \dot{\boldsymbol{q}}_0 = (\boldsymbol{J} - \boldsymbol{J}) \dot{\boldsymbol{q}}_0 = \boldsymbol{0}
$$
> **重要工程结论**：任意任意选择的自运动速度 $\dot{\boldsymbol{q}}_0$，经零空间投影后，**绝对不会对末端执行器的轨迹产生任何干扰（自运动 Self-Motion）**！

### 次级优化任务（$\dot{\boldsymbol{q}}_0$）的典型选择：
1. **关节限位规避 (Joint Limit Avoidance)**：$\dot{\boldsymbol{q}}_0 = -k \nabla V_{\text{limit}}(\boldsymbol{q})$；
2. **奇异点规避 (Singularity Avoidance)**：$\dot{\boldsymbol{q}}_0 = +k \nabla w(\boldsymbol{q})$（提升可操作度）；
3. **连杆自碰撞或环境避障 (Obstacle Avoidance)**。

---

## 5. Python 零空间逆速度解算器

```python
import numpy as np

def inverse_velocity_nullspace(J: np.ndarray, v_cartesian: np.ndarray, q0_bias: np.ndarray = None) -> np.ndarray:
    """
    计算冗余机械臂的逆速度解，包含零空间次级任务投影
    """
    m, n = J.shape
    # 右伪逆 J_pinv = J.T @ (J @ J.T)^(-1)
    J_pinv = J.T @ np.linalg.inv(J @ J.T)
    
    # 主任务速度
    q_dot_primary = J_pinv @ v_cartesian
    
    if q0_bias is None:
        return q_dot_primary
        
    # 零空间投影算子 P = I - J_pinv @ J
    P_null = np.eye(n) - J_pinv @ J
    
    # 综合速度
    return q_dot_primary + P_null @ q0_bias
```
