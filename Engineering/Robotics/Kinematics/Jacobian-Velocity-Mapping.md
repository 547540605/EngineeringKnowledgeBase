# 雅可比速度映射与速度/力椭球 (Jacobian Velocity Mapping and Ellipsoids)

## 领域归属

- **学科体系**：Engineering / Robotics / Kinematics (速度与静力学对偶分析)
- **上游先修**：[雅可比矩阵几何推导与定义](Jacobian-Matrix-Geometric-Derivation.md)、[运动学奇异性与解耦](Kinematic-Singularity-and-Decoupling.md)
- **并列概念**：[逆速度运动学求解](Inverse-Velocity-Kinematics.md)、[连杆间速度外推](Link-to-Link-Velocity-Propagation.md)
- **下游应用**：[速度分解运动控制](Resolved-Rate-Motion-Control.md)、[力控制与柔顺装配](../Force-Control-and-Compliant-Assembly/index.md)
- **配套实验室**：[笔记 16：雅可比速度映射与椭球实验台 (LearningLab)](../LearningLab/16-planar-jacobian-velocity.html)、[笔记 17：逆速度运动学交互实验台](../LearningLab/17-planar-inverse-velocity.html)

---

## 1. 速度前向映射与几何解释

雅可比矩阵 $\boldsymbol{J}(\boldsymbol{q}) \in \mathbb{R}^{m \times n}$ 建立了从关节速度空间 $\mathbb{R}^n$ 到笛卡尔操作速度空间 $\mathbb{R}^m$ 的线性变换：

$$
\boldsymbol{v} = \boldsymbol{J}(\boldsymbol{q}) \dot{\boldsymbol{q}}
$$

### 速度映射的核心几何含义：
- 若关节空间约束在一个单位超球体（Unit Hyper-Sphere）内，即满足：
  $$
  \|\dot{\boldsymbol{q}}\|^2 = \dot{\boldsymbol{q}}^T \dot{\boldsymbol{q}} \le 1
  $$
- 经过雅可比矩阵映射后，末端执行器所有可达的笛卡尔线速度集合构成一个**速度可操作度椭球 (Velocity Manipulability Ellipsoid)**。

---

## 2. 速度椭球代数推导与奇异值分解 (SVD)

设雅可比矩阵 $\boldsymbol{J}$ 为满行秩（远离奇异点），则其逆向映射为 $\dot{\boldsymbol{q}} = \boldsymbol{J}^\dagger \boldsymbol{v}$（若方阵则为 $\boldsymbol{J}^{-1}\boldsymbol{v}$）。代入单位球方程：

$$
(\boldsymbol{J}^{-1} \boldsymbol{v})^T (\boldsymbol{J}^{-1} \boldsymbol{v}) \le 1 \implies \boldsymbol{v}^T (\boldsymbol{J}\boldsymbol{J}^T)^{-1} \boldsymbol{v} \le 1
$$

这是以对称正定矩阵 $\boldsymbol{A} = (\boldsymbol{J}\boldsymbol{J}^T)^{-1}$ 为特征核心的椭球面方程。

### 奇异值分解 (Singular Value Decomposition)
对 $\boldsymbol{J}$ 作 SVD 分解：
$$
\boldsymbol{J} = \boldsymbol{U} \boldsymbol{\Sigma} \boldsymbol{V}^T = \sum_{i=1}^m \sigma_i \boldsymbol{u}_i \boldsymbol{v}_i^T
$$
其中：
- $\boldsymbol{U} = [\boldsymbol{u}_1, \cdots, \boldsymbol{u}_m]$ 为笛卡尔空间的特征正交基，指示**椭球主轴的方向**；
- $\sigma_1 \ge \sigma_2 \ge \cdots \ge \sigma_m \ge 0$ 为奇异值，指示**椭球各主轴的半长轴长度**；
- $\boldsymbol{V} = [\boldsymbol{v}_1, \cdots, \boldsymbol{v}_n]$ 为关节空间的输入正交基。

> **物理直观**：在 $\boldsymbol{u}_1$（最大奇异值对应方向）上，机械臂移动最敏捷、加速度最高；在 $\boldsymbol{u}_m$（最小奇异值对应方向）上，末端运动最迟钝。若 $\sigma_m = 0$，椭球退化扁平，即发生奇异！

---

## 3. 速度与静力学的对偶性 (Velocity-Force Duality)

根据虚功原理（Principle of Virtual Work），在无摩擦理想机械机构中，关节做功等于末端外力做功：
$$
\boldsymbol{\tau}^T \dot{\boldsymbol{q}} = \boldsymbol{F}^T \boldsymbol{v} = \boldsymbol{F}^T (\boldsymbol{J}\dot{\boldsymbol{q}}) = (\boldsymbol{J}^T \boldsymbol{F})^T \dot{\boldsymbol{q}}
$$
对任意非零 $\dot{\boldsymbol{q}}$ 恒成立，因此获得**机器人静力学映射方程**：
$$
\boldsymbol{\tau} = \boldsymbol{J}(\boldsymbol{q})^T \boldsymbol{F}
$$

### 力可操作度椭球 (Force Manipulability Ellipsoid)
若关节驱动器输出扭矩约束在单位球 $\|\boldsymbol{\tau}\|^2 = \boldsymbol{\tau}^T \boldsymbol{\tau} \le 1$，则末端力满足：
$$
(\boldsymbol{J}^T \boldsymbol{F})^T (\boldsymbol{J}^T \boldsymbol{F}) \le 1 \implies \boldsymbol{F}^T (\boldsymbol{J}\boldsymbol{J}^T) \boldsymbol{F} \le 1
$$

### 核心物理定律：对偶互补
比较速度椭球核心矩阵 $(\boldsymbol{J}\boldsymbol{J}^T)^{-1}$ 与力椭球核心矩阵 $(\boldsymbol{J}\boldsymbol{J}^T)$：
1. **速度椭球的长轴方向是力椭球的短轴方向**；
2. **机械臂在移动最快的方向上，能够输出的外力最小；在移动最慢的方向上（连杆接近伸直抵靠），机构几何自锁，能够承受/输出最大的外力**。

---

## 4. 工业应用场景：装配与切削轨迹姿态优化

在工业打磨、重载切削与精密销轴装配（Peg-in-Hole）任务中：
- **装配入孔**：应使机械臂力椭球的长轴对准轴向插入方向，以具备最大的抗载和推力储备；
- **表面抛光/力控顺应**：应使速度椭球长轴与切向走刀方向一致，以提高进给均匀度；
- 在机器人力控与柔顺装配专题中，该性质直接被用于设计刚度/阻抗矩阵的椭球整形（Ellipsoid Shaping）。

---

## 5. Python SVD 椭球分析模块

```python
import numpy as np

def compute_manipulability_ellipsoid(J: np.ndarray):
    """
    计算雅可比矩阵的速度与力椭球主轴与奇异值
    返回: (U_axes, singular_values, manipulability_index)
    """
    U, S, Vt = np.linalg.svd(J)
    w = np.prod(S)  # 吉川吉夫可操作度指标
    return {
        "axes": U,
        "velocity_semi_lengths": S,
        "force_semi_lengths": 1.0 / (S + 1e-9),
        "manipulability_index": float(w)
    }
```
