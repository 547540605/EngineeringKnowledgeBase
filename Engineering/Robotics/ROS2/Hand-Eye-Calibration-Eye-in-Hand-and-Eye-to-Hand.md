# 机器人手眼标定算法：眼在手上与眼在手外 (Hand-Eye Calibration)

## 领域归属

- **学科体系**：Engineering / Robotics / ROS2 (三维视觉与机器人空间几何联合标定)
- **上游先修**：[运动学坐标变换链与多系复合](../Kinematics/Kinematic-Transformation-Chains.md)、[工业工作站坐标系拓扑与 TF2](ROS2-Industrial-Workcell-Frames-and-TF2.md)
- **并列概念**：[工具中心点 (TCP) 标定算法](TCP-Calibration-Four-Point-Method.md)、相机内参标定 (张正友棋盘格法)
- **下游应用**：[MoveIt 2 视觉引导运动规划](MoveIt2-Motion-Planning-Architecture.md)、[三维点云动态抓取](../LearningLab/ros2/17-hand-eye-calibration-and-visual-loop.html)
- **配套实验室**：[ROS 2 实验 17：手眼标定与视觉闭环引导抓取 (LearningLab)](../LearningLab/ros2/17-hand-eye-calibration-and-visual-loop.html)

---

## 1. 手眼标定的核心任务与物理意义

在视觉引导抓取（Vision-Guided Manipulation）与工业检测中，相机检测到的工件位姿是相对于**相机光学坐标系 $\{C\}$** 的。为了让机械臂能准确前往抓取，必须将相机坐标转换到**机器人基座坐标系 $\{B\}$**。

**手眼标定 (Hand-Eye Calibration)** 的核心任务就是：**精确求解相机坐标系与机械臂坐标系之间的相对空间齐次变换矩阵 $\boldsymbol{X} \in SE(3)$**。

---

## 2. 两类物理装配构型

根据工业相机与机械臂机械结构的固连关系，严格划分为两大几何拓扑：

```text
构型 A: 眼在手上 (Eye-in-Hand)             构型 B: 眼在手外 (Eye-to-Hand)

     [基座 {B}]                                  [基座 {B}]
         │ 机械臂连杆链                              │ 机械臂连杆链
         ▼                                           ▼
     [法兰 {F}] ──固定固连──> [相机 {C}]         [法兰 {F}] ──固连标定板──> [标定板 {M}]
         │ 观察视野                                  ▲
         ▼                                           │ 外部固定俯视观察
     [标定板 {M}] (地面固定)                    [相机 {C}] (外部支架固定)
```

---

## 3. 数学模型与矩阵方程推导

设定机械臂在空间移动两个不同位姿（位姿 1 与位姿 2），标定板在空间保持绝对静止不动。

### 3.1 眼在手上 (Eye-in-Hand)：经典方程 $\boldsymbol{A} \boldsymbol{X} = \boldsymbol{X} \boldsymbol{B}$
- **待求解未知量**：法兰盘到相机的固定变换矩阵 $\boldsymbol{X} = {^F_C\boldsymbol{T}}$；
- 考察从标定板 $\{M\}$ 到基座 $\{B\}$ 的闭合运动链回路：
  $$
  {^B_{F1}\boldsymbol{T}} \, {^F_C\boldsymbol{T}} \, {^{C1}_M\boldsymbol{T}} = {^B_{F2}\boldsymbol{T}} \, {^F_C\boldsymbol{T}} \, {^{C2}_M\boldsymbol{T}}
  $$
- 整理得标准矩阵方程：
  $$
  \boldsymbol{A} \boldsymbol{X} = \boldsymbol{X} \boldsymbol{B}
  $$
  其中：
  $$
  \boldsymbol{A} = ({^B_{F2}\boldsymbol{T}})^{-1} {^B_{F1}\boldsymbol{T}}, \quad \boldsymbol{B} = {^{C2}_M\boldsymbol{T}} ({^{C1}_M\boldsymbol{T}})^{-1}
  $$
  - $\boldsymbol{A}$ 为机械臂法兰两次运动的相对位姿变化（由机械臂正运动学与编码器精确测量）；
  - $\boldsymbol{B}$ 为标定板在相机视野中两次观察到的相对位姿变化（由相机 PnP 视觉算法解算）。

### 3.2 眼在手外 (Eye-to-Hand)：矩阵方程 $\boldsymbol{A} \boldsymbol{X} = \boldsymbol{Y} \boldsymbol{B}$
- **待求解未知量**：机器人基座到外部相机的固定变换矩阵 $\boldsymbol{X} = {^B_C\boldsymbol{T}}$；
- 此时标定板固连在机械臂末端法兰盘上（相对变换为 $\boldsymbol{Y} = {^F_M\boldsymbol{T}}$）；
- 闭合运动回路：
  $$
  {^B_C\boldsymbol{T}} \, {^{C1}_M\boldsymbol{T}} = {^B_{F1}\boldsymbol{T}} \, {^F_M\boldsymbol{T}} \implies ({^B_{F1}\boldsymbol{T}})^{-1} {^B_C\boldsymbol{T}} \, {^{C1}_M\boldsymbol{T}} = {^F_M\boldsymbol{T}}
  $$
  同样可规范转化为两步线性求解架构。

---

## 4. Tsai-Lenz 经典两步解法

直接对 $4\times 4$ 矩阵方程 $\boldsymbol{A}\boldsymbol{X} = \boldsymbol{X}\boldsymbol{B}$ 展开最小二乘会导致 $3\times 3$ 旋转矩阵丢失正交性约束（$\boldsymbol{R}^T \boldsymbol{R} = \boldsymbol{I}$）。
Tsai 和 Lenz（1989）提出了极其优雅的旋转与平移解耦解法：

### 4.1 第一步：姿态旋转解算
利用轴角表示法（Rodrigues 旋转向量），方程 $\boldsymbol{R}_A \boldsymbol{R}_X = \boldsymbol{R}_X \boldsymbol{R}_B$ 可以转化为：
$$
\operatorname{skew}(\boldsymbol{P}_A + \boldsymbol{P}_B) \cdot \boldsymbol{P}_X^\prime = \boldsymbol{P}_B - \boldsymbol{P}_A
$$
通过至少两组不共轴的机械臂运动构型，堆叠最小二乘方程求解出修正向量 $\boldsymbol{P}_X^\prime$，进而完全解析恢复出严格正交的旋转矩阵 $\boldsymbol{R}_X$。

### 4.2 第二步：平移向量回代解算
将已精确解出的 $\boldsymbol{R}_X$ 代入平移约束方程：
$$
(\boldsymbol{R}_A - \boldsymbol{I}_3) \boldsymbol{t}_X = \boldsymbol{R}_X \boldsymbol{t}_B - \boldsymbol{t}_A
$$
这是标准超定线性代数方程，直接通过 SVD 或 QR 分解求得唯一最优平移向量 $\boldsymbol{t}_X$。

---

## 5. 工业标定避坑指南与构型退化

在实施手眼标定时，必须严格杜绝以下三类现场常见错误：

1. **纯平移运动陷阱 (Pure Translation Degeneracy)**：
   若机械臂仅在 $X, Y, Z$ 方向做纯平移而不发生姿态旋转（$\boldsymbol{R}_A = \boldsymbol{I}$），则 $\boldsymbol{R}_A - \boldsymbol{I} = \boldsymbol{0}$，旋转矩阵 $\boldsymbol{R}_X$ 在数学上完全不可解！**手眼标定必须包含至少两组绕不平行轴的大角度旋转（建议转角 $\ge 30^\circ$）**；
2. **两轴平行旋转退化**：两次旋转如果绕同一空间主轴旋转，方程秩不足，退化为欠定；
3. **标定板平面晃动**：相机视野中标定板角点检测误差会被杠杆臂放大，必须确保标定板平整刚性固定。

---

## 6. Python 手眼标定调用原型 (基于 OpenCV)

```python
import cv2
import numpy as np

def perform_hand_eye_calibration(R_gripper2base: list[np.ndarray], 
                                 t_gripper2base: list[np.ndarray],
                                 R_target2cam: list[np.ndarray], 
                                 t_target2cam: list[np.ndarray],
                                 eye_to_hand: bool = False):
    """
    输入:
      R_gripper2base, t_gripper2base: 机械臂法兰位姿列表
      R_target2cam, t_target2cam: 相机检测到的标定板位姿列表
      eye_to_hand: False 表示眼在手上，True 表示眼在手外
    返回:
      R_cam2gripper, t_cam2gripper (或 R_cam2base, t_cam2base)
    """
    method = cv2.CALIB_HAND_EYE_TSAI
    if not eye_to_hand:
        # Eye-in-Hand: AX = XB
        R_cam2gripper, t_cam2gripper = cv2.calibrateHandEye(
            R_gripper2base, t_gripper2base,
            R_target2cam, t_target2cam,
            method=method
        )
        return R_cam2gripper, t_cam2gripper
    else:
        # Eye-to-Hand
        # 需根据 OpenCV 约定转换输入格式或设置标志位
        R_base2cam, t_base2cam = cv2.calibrateHandEye(
            R_gripper2base, t_gripper2base,
            R_target2cam, t_target2cam,
            method=cv2.CALIB_HAND_EYE_DANIILIDIS
        )
        return R_base2cam, t_base2cam
```
