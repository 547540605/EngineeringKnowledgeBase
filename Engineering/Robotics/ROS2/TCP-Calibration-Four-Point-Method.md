# 机器人工具中心点 (TCP) 标定算法与精度评测 (Robot TCP Calibration)

## 领域归属

- **学科体系**：Engineering / Robotics / ROS2 (机器人高精度空间标定与工具几何建模)
- **上游先修**：[运动学坐标变换链与多系复合](../Kinematics/Kinematic-Transformation-Chains.md)、[工业工作站坐标系拓扑与 TF2](ROS2-Industrial-Workcell-Frames-and-TF2.md)
- **并列概念**：[机器人手眼标定算法](Hand-Eye-Calibration-Eye-in-Hand-and-Eye-to-Hand.md)、机械臂几何参数辨识
- **下游应用**：[精密销孔柔顺装配](../Force-Control-and-Compliant-Assembly/index.md)、工业喷涂/焊接轨迹规划
- **配套实验室**：[ROS 2 实验 16：TCP 标定与精度评测 (LearningLab)](../LearningLab/ros2/16-tcp-calibration-and-accuracy.html)

---

## 1. 物理背景与定义

在工业机器人作业中，真正接触工件或执行作业的不是机械臂末端输出法兰盘，而是安装在法兰盘前端的工具（焊枪针尖、喷嘴出口、胶枪尖端或两指夹爪中心）。

- **工具中心点 (Tool Center Point, TCP)**：执行机构在末端工具上的几何作用点；
- **TCP 变换矩阵**：由法兰盘坐标系 $\{F\}$ 指向工具坐标系 $\{T\}$ 的空间齐次变换矩阵 ${^F_T\boldsymbol{T}} = \begin{bmatrix} {^F_T\boldsymbol{R}} & {^F\boldsymbol{P}}_{\text{tcp}} \\ \boldsymbol{0} & 1 \end{bmatrix}$。

若 TCP 存在 1 mm 的位置误差，当末端绕工具尖点做大角度自转姿态调整（Reorientation）时，尖点将在空间画出剧烈的晃动弧线，严重影响加工装配精度。

---

## 2. 工具中心点 (TCP) 四点法标定平移向量

四点法（4-Point Method）是工业现场标定工具尖点平移偏置 ${^F\boldsymbol{P}}_{\text{tcp}} \in \mathbb{R}^3$ 最经典、最高效的工程方法。

### 2.1 标定几何原理
在机器人工作空间内固定放置一根尖锐的参考标定针，其尖端在基座标系 $\{0\}$ 下的位置固定为未知向量 $\boldsymbol{P}_{\text{fixed}} \in \mathbb{R}^3$。

操作示教器，驱动机器人以 **4 种姿态差异极大、空间倾斜角分布均匀** 的构型，让末端工具尖点精准触碰该固定参考针尖：

$$
{^0\boldsymbol{R}}_i \, {^F\boldsymbol{P}}_{\text{tcp}} + {^0\boldsymbol{P}}_i = \boldsymbol{P}_{\text{fixed}} \quad (i = 1, 2, 3, 4)
$$

其中：
- ${^0\boldsymbol{R}}_i \in SO(3)$：第 $i$ 次触碰时，机械臂正运动学输出的法兰盘旋转矩阵；
- ${^0\boldsymbol{P}}_i \in \mathbb{R}^3$：第 $i$ 次触碰时，法兰盘中心在基座标系下的位置向量。

---

### 2.2 最小二乘线性代数求解

由于固定尖点位置 $\boldsymbol{P}_{\text{fixed}}$ 未知，任选两个不同姿态方程作差以消除 $\boldsymbol{P}_{\text{fixed}}$：

$$
({^0\boldsymbol{R}}_i - {^0\boldsymbol{R}}_j) \, {^F\boldsymbol{P}}_{\text{tcp}} = {^0\boldsymbol{P}}_j - {^0\boldsymbol{P}}_i
$$

选取姿态对 $(1, 2)$、$(1, 3)$ 与 $(1, 4)$，堆叠构建超定线性方程组：

$$
\begin{bmatrix}
{^0\boldsymbol{R}}_1 - {^0\boldsymbol{R}}_2 \\
{^0\boldsymbol{R}}_1 - {^0\boldsymbol{R}}_3 \\
{^0\boldsymbol{R}}_1 - {^0\boldsymbol{R}}_4
\end{bmatrix} {^F\boldsymbol{P}}_{\text{tcp}} = \begin{bmatrix}
{^0\boldsymbol{P}}_2 - {^0\boldsymbol{P}}_1 \\
{^0\boldsymbol{P}}_3 - {^0\boldsymbol{P}}_1 \\
{^0\boldsymbol{P}}_4 - {^0\boldsymbol{P}}_1
\end{bmatrix} \quad \Longrightarrow \quad \boldsymbol{A} {^F\boldsymbol{P}}_{\text{tcp}} = \boldsymbol{b}
$$

其中 $\boldsymbol{A} \in \mathbb{R}^{9 \times 3}, \boldsymbol{b} \in \mathbb{R}^9$。采用奇异值分解 (SVD) 最小二乘求解：

$$
{^F\boldsymbol{P}}_{\text{tcp}} = (\boldsymbol{A}^T \boldsymbol{A})^{-1} \boldsymbol{A}^T \boldsymbol{b}
$$

---

## 3. 六点法标定姿态矩阵 (6-Point Method)

四点法仅能解出位置偏置 ${^F\boldsymbol{P}}_{\text{tcp}}$，工具的三个姿态轴（$X_T, Y_T, Z_T$）仍默认平行于法兰盘。
若需要严格标定工具主方向（如焊枪喷嘴轴向对齐 $Z_T$ 轴，出丝方向对齐 $X_T$ 轴）：
1. 在完成前四点平移标定后，额外增加第 5 点与第 6 点；
2. **第 5 点**：末端沿工具期望的 $Z_T$ 轴向后退一段距离；
3. **第 6 点**：末端沿工具期望的 $X_T$ 轴平移一段距离；
4. 利用空间向量叉乘构造相互正交的单位基底矩阵 ${^F_T\boldsymbol{R}} = [\boldsymbol{n}, \boldsymbol{o}, \boldsymbol{a}]$。

---

## 4. 精度评测与残差残差指标 (Residual Analysis)

标定完成后，必须通过计算**拟合残差球半径**检验标定品质：

$$
\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^N \| ({^0\boldsymbol{R}}_i {^F\boldsymbol{P}}_{\text{tcp}} + {^0\boldsymbol{P}}_i) - \hat{\boldsymbol{P}}_{\text{fixed}} \|^2}
$$

- **优质标准**：工业高精度协作臂在经过良好示教后，$\text{RMSE} \le 0.2 \, \text{mm}$；
- **异常诊断**：若 $\text{RMSE} > 0.5 \, \text{mm}$，通常由四种姿态倾角太小（导致矩阵 $\boldsymbol{A}$ 接近病态奇异）、机械臂末端存在机械间隙或人工示教未精确贴合引起。

---

## 5. Python TCP 四点法最小二乘解算模块

```python
import numpy as np

def calibrate_tcp_4points(R_list: list[np.ndarray], P_list: list[np.ndarray]) -> dict:
    """
    四点法标定工具中心点 (TCP)
    输入:
      R_list: 4组 [3x3] 旋转矩阵 (法兰在基座下的姿态)
      P_list: 4组 [3] 位置矢量 (法兰在基座下的位置)
    返回:
      dict: {"tcp_offset": P_tcp, "rmse": rmse, "fixed_point": P_fixed}
    """
    assert len(R_list) >= 4 and len(P_list) >= 4
    
    A_rows, b_rows = [], []
    for i in range(1, len(R_list)):
        A_rows.append(R_list[0] - R_list[i])
        b_rows.append(P_list[i] - P_list[0])
        
    A = np.vstack(A_rows)
    b = np.concatenate(b_rows)
    
    # 奇异值分解最小二乘求解
    P_tcp, _, _, _ = np.linalg.lstsq(A, b, rcond=None)
    
    # 计算标定基准尖点均值
    fixed_points = [R @ P_tcp + P for R, P in zip(R_list, P_list)]
    P_fixed_mean = np.mean(fixed_points, axis=0)
    
    # 残差 RMSE
    errors = [np.linalg.norm(pt - P_fixed_mean) for pt in fixed_points]
    rmse = float(np.sqrt(np.mean(np.square(errors))))
    
    return {
        "tcp_offset": P_tcp,
        "rmse": rmse,
        "fixed_point": P_fixed_mean
    }
```
