# 机器人动力学参数线性回归辨识 (Robot Dynamics Parameter Identification)

## 领域归属

- **学科体系**：Engineering / Robotics / Dynamics (系统辨识与模型参数估计)
- **上游先修**：[两连杆动力学标准型 (M/C/G)](Planar-Two-Link-Dynamics-Equation-M-C-G.md)、[单关节动力学模型](Single-Joint-Dynamics-Inertia-Gravity-Friction.md)
- **并列概念**：CAD 三维建模惯量估算、自适应在线参数估计
- **下游应用**：[计算力矩前馈控制 (CTC)](../Control/Computed-Torque-Control-CTC.md)、[基于辨识模型的碰撞检测与力控](../Force-Control-and-Compliant-Assembly/index.md)
- **配套实验室**：[笔记 38：动力学参数辨识实验台 (LearningLab)](../LearningLab/38-dynamics-parameter-identification.html)

---

## 1. 为什么需要动力学参数辨识？

在工业制造中，机械臂实际构件受铸造壁厚公差、线缆走线、法兰工装夹具及末端工具的影响，**名义 CAD 模型与真实机械臂的质量分布存在 5%~20% 的系统偏差**。

若直接将不准确的 CAD 惯量代入计算力矩前馈控制（CTC）或力矩传感器无传感器碰撞检测中，将产生持续的前馈偏差与误报警。因此，必须通过**实体运动激励与关节力矩采集，进行动力学参数实验辨识**。

---

## 2. 动力学方程的线性参数化特性 (Linear-in-the-Parameters)

机械臂动力学方程虽然关于状态变量 $(\boldsymbol{q}, \dot{\boldsymbol{q}}, \ddot{\boldsymbol{q}})$ 是高度非线性的，但**关于物理惯性参数（质量、质心一阶矩、惯量张量、摩擦系数）在数学上具有严格的线性参数化特性**：

$$
\boldsymbol{\tau} = \boldsymbol{Y}(\boldsymbol{q}, \dot{\boldsymbol{q}}, \ddot{\boldsymbol{q}}) \boldsymbol{\pi}
$$

其中：
- $\boldsymbol{\pi} \in \mathbb{R}^p$：待辨识的**动力学惯性参数向量**；
- $\boldsymbol{Y}(\boldsymbol{q}, \dot{\boldsymbol{q}}, \ddot{\boldsymbol{q}}) \in \mathbb{R}^{n \times p}$：仅由运动学测量量决定的**回归矩阵 (Regressor Matrix / Observation Matrix)**。

---

## 3. 标准惯量参数与最小基参数集 (Base Parameters)

对于具有 $n$ 个运动连杆的空间机械臂，每个刚体连杆在传统力学上有 10 个标准惯量参数：
$$
\boldsymbol{\pi}_i = \left[ m_i, \; m_i x_{ci}, \; m_i y_{ci}, \; m_i z_{ci}, \; I_{xxi}, \; I_{xyi}, \; I_{xzi}, \; I_{yyi}, \; I_{yzi}, \; I_{zzi} \right]^T \in \mathbb{R}^{10}
$$
加上关节粘性摩擦 $b_i$ 与库仑摩擦 $f_{ci}$，总参数量达 $12n$ 个。

### 冗余性与参数重组（基参数集 Base Parameter Set）：
在串联机构中，并不是所有 $12n$ 个参数都能对关节力矩产生独立影响：
1. **不可辨识参数 (Unidentifiable)**：例如第 1 关节基座回转轴上的 $I_{xx1}$ 与 $I_{yy1}$，因无法改变重力势能且绕垂直轴无转动贡献，其对力矩输出完全无感；
2. **线性相关参数 (Linearly Dependent)**：两相邻连杆的质量和惯量往往以代数和的形式耦合在一起（例如 $m_1 l_{c1}^2 + m_2 L_1^2$）。

通过对庞大的全量回归矩阵 $\boldsymbol{Y}$ 进行 **QR 分解或奇异值分解 (SVD)**，可精确提取出极小线性无关基：
$$
\boldsymbol{\tau} = \boldsymbol{Y}_b(\boldsymbol{q}, \dot{\boldsymbol{q}}, \ddot{\boldsymbol{q}}) \boldsymbol{\pi}_b
$$
其中 $\boldsymbol{\pi}_b \in \mathbb{R}^{p_{\text{base}}}$（对于经典 6 轴机械臂，标准基参数通常只有 36~40 个左右）。

---

## 4. 充分激励轨迹设计 (Excitation Trajectory Optimization)

为了保证回归矩阵 $\boldsymbol{Y}_b$ 具有良好的可逆性（抗测量噪声干扰），机械臂在辨识采集过程中必须运行一段**充分激励轨迹 (Persistently Exciting Trajectory)**。

工程上通常采用**有限项截断傅里叶级数 (Finite Fourier Series)** 作为激励轨迹：
$$
q_i(t) = q_{i,0} + \sum_{k=1}^N \left[ \frac{a_{i,k}}{\omega_0 k} \sin(\omega_0 k t) - \frac{b_{i,k}}{\omega_0 k} \cos(\omega_0 k t) \right]
$$

### 轨迹优化目标：
在满足关节位置、速度、加速度边界的前提下，通过非线性优化算法（如 SQP）最小化回归矩阵的**条件数 (Condition Number)**：
$$
\min_{a, b} \operatorname{cond}(\boldsymbol{Y}_b) = \frac{\sigma_{\max}(\boldsymbol{Y}_b)}{\sigma_{\min}(\boldsymbol{Y}_b)}
$$
条件数越小，测量力矩中的白噪声被矩阵逆放大的倍数越低，辨识结果的置信度与方差越优。

---

## 5. 最小二乘求解法 (Ordinary & Weighted Least Squares)

在时间序列 $t_1, t_2, \dots, t_N$ 上同步采集多点数据，纵向堆叠构建超定方程组：
$$
\begin{bmatrix} \boldsymbol{\tau}(t_1) \\ \boldsymbol{\tau}(t_2) \\ \vdots \\ \boldsymbol{\tau}(t_N) \end{bmatrix} = \begin{bmatrix} \boldsymbol{Y}_b(t_1) \\ \boldsymbol{Y}_b(t_2) \\ \vdots \\ \boldsymbol{Y}_b(t_N) \end{bmatrix} \boldsymbol{\pi}_b + \boldsymbol{\epsilon} \quad \Longrightarrow \quad \boldsymbol{\Gamma} = \boldsymbol{\Phi} \boldsymbol{\pi}_b + \boldsymbol{\epsilon}
$$

### 5.1 普通最小二乘解 (OLS)
$$
\hat{\boldsymbol{\pi}}_b = (\boldsymbol{\Phi}^T \boldsymbol{\Phi})^{-1} \boldsymbol{\Phi}^T \boldsymbol{\Gamma}
$$

### 5.2 物理一致性检验 (Physical Consistency Verification)
由于数值拟合与测量噪声，求解出的数值解偶尔会出现反物理现象（如转动惯量矩阵不满足三角不等式 $I_{xx} + I_{yy} \ge I_{zz}$，或质量计算出负数）。
现代工业规范采用**半定规划 (Semidefinite Programming, SDP)** 施加黎曼流形正定性约束，确保辨识出的每个连杆等效伪惯量矩阵（Pseudo-Inertia Matrix）严格正定。

---

## 6. Python 最小二乘辨识范式

```python
import numpy as np

def identify_base_parameters(Y_data: np.ndarray, tau_data: np.ndarray) -> np.ndarray:
    """
    输入:
      Y_data: 堆叠回归矩阵 [N*n, p]
      tau_data: 对应时刻关节力矩测量向量 [N*n]
    输出:
      pi_identified: 辨识出的基参数值 [p]
    """
    # 采用 SVD / 截断最小二乘保证数值稳定性
    pi_identified, residuals, rank, s = np.linalg.lstsq(Y_data, tau_data, rcond=None)
    
    cond_number = s[0] / s[-1]
    print(f"[辨识诊断] 回归矩阵秩: {rank}/{Y_data.shape[1]}, 条件数: {cond_number:.2f}")
    
    return pi_identified
```
