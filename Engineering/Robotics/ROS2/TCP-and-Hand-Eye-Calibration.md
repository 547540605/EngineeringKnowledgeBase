# 机器人 TCP 标定与手眼标定工程算法 (Robot TCP and Hand-Eye Calibration)

## 领域归属

- **学科体系**：Engineering / Robotics / ROS2 (机器人高精度空间标定与视觉集成)
- **上游先修**：[运动学坐标变换链与多系复合](../Kinematics/Kinematic-Transformation-Chains.md)、[工业工作站坐标系拓扑与 TF2](ROS2-Industrial-Workcell-Frames-and-TF2.md)
- **并列概念**：机械臂几何参数运动学标定、DH 参数辨识
- **下游应用**：[精密销孔柔顺装配](../Force-Control-and-Compliant-Assembly/index.md)、[三维视觉引导抓取](../LearningLab/ros2/17-hand-eye-calibration-and-visual-loop.html)
- **配套实验室**：[ROS 2 实验 16：TCP 标定与精度评测 (LearningLab)](../LearningLab/ros2/16-tcp-calibration-and-accuracy.html)、[ROS 2 实验 17：手眼标定与视觉闭环引导抓取](../LearningLab/ros2/17-hand-eye-calibration-and-visual-loop.html)

---

## 1. 为什么标定是工业机器人的生命线？

在出厂时，机械臂各轴的减速机减速比和连杆长度由数控加工保证，**重复定位精度通常在 $\pm 0.02 \, \text{mm}$ 以内**。
但在实际安装了夹爪、焊枪或工业相机后：
- 若末端工具中心点（TCP）未经过数学标定，末端绕工具尖点自转时，尖点将画出巨大的摆动球面；
- 若视觉相机与机械臂坐标系未完成手眼标定，相机看到的工件三维坐标无法准确转换为机械臂抓取命令。

---

## 2. 工具中心点 (TCP) 四点法标定平移向量

目标：求解工具末端尖点在法兰盘坐标系中的固定相对平移向量 ${^F\boldsymbol{P}}_{\text{tcp}} \in \mathbb{R}^3$。

### 2.1 标定几何原理
在工作台上设置一个绝对固定的尖锐参考基准点 $\boldsymbol{P}_{\text{fixed}}$。
操控机械臂，以**四种截然不同、大倾斜角度的姿态**，让工具末端尖点严格抵住该固定点：

$$
{^0\boldsymbol{R}}_i \, {^F\boldsymbol{P}}_{\text{tcp}} + {^0\boldsymbol{P}}_i = \boldsymbol{P}_{\text{fixed}} \quad (i = 1, 2, 3, 4)
$$

其中 ${^0\boldsymbol{R}}_i$ 与 ${^0\boldsymbol{P}}_i$ 为各次示教时机器人正运动学计算出的法兰盘位姿。

### 2.2 最小二乘线性方程组构建
消去未知的固定基准点 $\boldsymbol{P}_{\text{fixed}}$。任取第 $j$ 个姿态与第 $i$ 个姿态作差：
$$
({^0\boldsymbol{R}}_i - {^0\boldsymbol{R}}_j) \, {^F\boldsymbol{P}}_{\text{tcp}} = {^0\boldsymbol{P}}_j - {^0\boldsymbol{P}}_i
$$
将 4 个姿态组成 3 对差分方程，堆叠为超定方程组 $\boldsymbol{A} {^F\boldsymbol{P}}_{\text{tcp}} = \boldsymbol{b}$，直接采用普通最小二乘法（SVD 解法）求解：
$$
{^F\boldsymbol{P}}_{\text{tcp}} = (\boldsymbol{A}^T \boldsymbol{A})^{-1} \boldsymbol{A}^T \boldsymbol{b}
$$

---

## 3. 手眼标定两类经典构型 (Hand-Eye Calibration)

根据相机与机械臂的物理装配关系，手眼标定分为两大流派：

### 3.1 眼在手上 (Eye-in-Hand)
相机固连安装在机械臂末端第 6 轴法兰盘上，随机械臂一起空间运动。
- **待求解未知量**：法兰盘到相机的固定变换矩阵 $\boldsymbol{X} = {^F_C\boldsymbol{T}}$；
- **经典齐次方程**：
  $$
  \boldsymbol{A} \boldsymbol{X} = \boldsymbol{X} \boldsymbol{B}
  $$
  其中 $\boldsymbol{A} = ({^0_{F2}\boldsymbol{T}})^{-1} \cdot {^0_{F1}\boldsymbol{T}}$ 为机械臂法兰两次运动的相对位姿差；$\boldsymbol{B} = {^{C2}_M\boldsymbol{T}} \cdot ({^{C1}_M\boldsymbol{T}})^{-1}$ 为标定板在相机视野中前后两次的相对位姿差。

### 3.2 眼在手外 (Eye-to-Hand)
相机架设在机器人外部固定的三脚架或铝型材机架上，俯视机器人工作区域。
- **待求解未知量**：机器人基座到相机的固定变换矩阵 $\boldsymbol{X} = {^0_C\boldsymbol{T}}$；
- **经典齐次方程**：
  $$
  \boldsymbol{A} \boldsymbol{X} = \boldsymbol{Y} \boldsymbol{B}
  $$

---

## 4. Tsai-Lenz 经典解法与双四元数法

求解矩阵方程 $\boldsymbol{A}\boldsymbol{X} = \boldsymbol{X}\boldsymbol{B}$ 的核心挑战是旋转群 $SO(3)$ 具有正交性约束，直接线性求解会导致旋转矩阵失效。

### Tsai-Lenz 分步解算策略：
1. **旋转解耦**：利用轴角向量（Axis-Angle）先独立求解旋转矩阵 $\boldsymbol{R}_X$；
2. **平移回代**：将求得的 $\boldsymbol{R}_X$ 代入平移约束方程：
   $$
   (\boldsymbol{R}_A - \boldsymbol{I}) \boldsymbol{t}_X = \boldsymbol{R}_X \boldsymbol{t}_B - \boldsymbol{t}_A
   $$
   求解平移向量 $\boldsymbol{t}_X$。

---

## 5. Python TCP 四点法最小二乘解算模块

```python
import numpy as np

def calibrate_tcp_4points(R_list: list[np.ndarray], P_list: list[np.ndarray]) -> np.ndarray:
    """
    输入:
      R_list: 4组 [3x3] 法兰旋转矩阵
      P_list: 4组 [3x1] 法兰原点位置矢量
    输出:
      P_tcp: [3x1] 工具尖点在法兰系中的平移偏移
    """
    A_rows = []
    b_rows = []
    
    # 构建 3 对差分方程
    for i in range(3):
        j = i + 1
        A_ij = R_list[i] - R_list[j]
        b_ij = P_list[j] - P_list[i]
        A_rows.append(A_ij)
        b_rows.append(b_ij)
        
    A = np.vstack(A_rows)
    b = np.vstack(b_rows)
    
    # 最小二乘求解
    P_tcp, residuals, rank, s = np.linalg.lstsq(A, b, rcond=None)
    return P_tcp.flatten()
```
