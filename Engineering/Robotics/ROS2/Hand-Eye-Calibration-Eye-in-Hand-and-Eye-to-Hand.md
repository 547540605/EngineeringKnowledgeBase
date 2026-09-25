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

### 3.2 眼在手外 (Eye-to-Hand)：矩阵方程 $\boldsymbol{A}_{eth} \boldsymbol{X} = \boldsymbol{X} \boldsymbol{B}_{eth}$
- **待求解未知量**：机器人基座到外部固定相机的相对变换矩阵 $\boldsymbol{X} = {^B_C\boldsymbol{T}}$；
- 此时标定板刚性固连在机械臂末端法兰盘上（相对变换为固定常数矩阵 $\boldsymbol{Y} = {^F_M\boldsymbol{T}}$）；
- 考察从标定板 $\{M\}$ 经由相机 $\{C\}$ 到基座 $\{B\}$ 的闭合几何回路：
  $$
  {^B_C\boldsymbol{T}} \, {^{C1}_M\boldsymbol{T}} = {^B_{F1}\boldsymbol{T}} \, {^F_M\boldsymbol{T}} \implies ({^B_{F1}\boldsymbol{T}})^{-1} {^B_C\boldsymbol{T}} \, {^{C1}_M\boldsymbol{T}} = {^F_M\boldsymbol{T}}
  $$
- 针对任意两组机械臂位姿 1 与 2，由于 ${^F_M\boldsymbol{T}}$ 恒定保持不变，必有：
  $$
  ({^B_{F2}\boldsymbol{T}})^{-1} {^B_C\boldsymbol{T}} \, {^{C2}_M\boldsymbol{T}} = ({^B_{F1}\boldsymbol{T}})^{-1} {^B_C\boldsymbol{T}} \, {^{C1}_M\boldsymbol{T}}
  $$
- 等式左乘 ${^B_{F2}\boldsymbol{T}}$，右乘 $({^{C1}_M\boldsymbol{T}})^{-1}$，整理得：
  $$
  {^B_{F2}\boldsymbol{T}} ({^B_{F1}\boldsymbol{T}})^{-1} {^B_C\boldsymbol{T}} = {^B_C\boldsymbol{T}} \, {^{C2}_M\boldsymbol{T}} ({^{C1}_M\boldsymbol{T}})^{-1}
  $$
  定义眼在手外相对运动矩阵：
  $$
  \boldsymbol{A}_{eth} = {^B_{F2}\boldsymbol{T}} ({^B_{F1}\boldsymbol{T}})^{-1}, \quad \boldsymbol{B}_{eth} = {^{C2}_M\boldsymbol{T}} ({^{C1}_M\boldsymbol{T}})^{-1}
  $$
  得到与经典结构完全同构的标准矩阵方程：
  $$
  \boldsymbol{A}_{eth} \boldsymbol{X} = \boldsymbol{X} \boldsymbol{B}_{eth}
  $$

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

## 6. Python 手眼标定调用原型与坐标转换 (基于 OpenCV)

OpenCV 提供了函数 `cv2.calibrateHandEye`，其底层求解标准方程 $\boldsymbol{A}\boldsymbol{X}=\boldsymbol{X}\boldsymbol{B}$。根据 [OpenCV 官方接口规范](https://docs.opencv.org/5.0/main_modules/calib.html)，必须严格区分两大构型的输入输出坐标契约：

- **Eye-in-Hand (眼在手上)**：
  - 输入 `R_gripper2base`, `t_gripper2base`：机械臂末端在基座中的位姿序列 ${^B_F\boldsymbol{T}}$；
  - 输入 `R_target2cam`, `t_target2cam`：标定板在相机视野中的位姿序列 ${^C_M\boldsymbol{T}}$；
  - 输出 `R_cam2gripper`, `t_cam2gripper`：相机在法兰盘中的安装位姿 ${^F_C\boldsymbol{T}}$。
- **Eye-to-Hand (眼在手外)**：
  - 相机固定在环境基座中，标定板随法兰运动。对比数学推导可知，运动矩阵 $\boldsymbol{A}_{eth} = {^B_{F2}\boldsymbol{T}} ({^B_{F1}\boldsymbol{T}})^{-1}$；
  - 而 OpenCV 内部对第一组输入计算的是 $T_2^{-1} T_1$。若要满足 $T_2^{-1} T_1 = {^B_{F2}\boldsymbol{T}} ({^B_{F1}\boldsymbol{T}})^{-1}$，**必须将输入的机械臂末端位姿序列逐一求逆为 Base-to-Gripper**（即基座在法兰中的位姿 ${^F_B\boldsymbol{T}}$）：
    $$
    \boldsymbol{R}_{b2g} = \boldsymbol{R}_{g2b}^T, \quad \boldsymbol{t}_{b2g} = -\boldsymbol{R}_{g2b}^T \boldsymbol{t}_{g2b}
    $$
  - 将求逆后的 `R_base2gripper`, `t_base2gripper` 传入 `cv2.calibrateHandEye`；
  - 函数输出的矩阵即为 **${^B_C\boldsymbol{T}}$（外部固定相机在机器人基座坐标系下的位姿 `R_cam2base`, `t_cam2base`）**。若下游点云拼接算法需要基座在相机坐标系下的位姿 ${^C_B\boldsymbol{T}}$，只需再求一次逆即可。

```python
import cv2
import numpy as np


def invert_transform(R: np.ndarray, t: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """计算 SE(3) 齐次变换的逆变换: R_inv = R^T, t_inv = -R^T @ t"""
    R_inv = R.T
    t_inv = -R_inv @ t.reshape(3, 1)
    return R_inv, t_inv


def _skew(v: np.ndarray) -> np.ndarray:
    return np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])


def _mat_to_quat(R: np.ndarray) -> np.ndarray:
    tr = np.trace(R)
    if tr > 0:
        S = np.sqrt(tr + 1.0) * 2
        w = 0.25 * S
        x = (R[2, 1] - R[1, 2]) / S
        y = (R[0, 2] - R[2, 0]) / S
        z = (R[1, 0] - R[0, 1]) / S
    elif (R[0, 0] > R[1, 1]) and (R[0, 0] > R[2, 2]):
        S = np.sqrt(1.0 + R[0, 0] - R[1, 1] - R[2, 2]) * 2
        w = (R[2, 1] - R[1, 2]) / S
        x = 0.25 * S
        y = (R[0, 1] + R[1, 0]) / S
        z = (R[0, 2] + R[2, 0]) / S
    elif R[1, 1] > R[2, 2]:
        S = np.sqrt(1.0 + R[1, 1] - R[0, 0] - R[2, 2]) * 2
        w = (R[0, 2] - R[2, 0]) / S
        x = (R[0, 1] + R[1, 0]) / S
        y = 0.25 * S
        z = (R[1, 2] + R[2, 1]) / S
    else:
        S = np.sqrt(1.0 + R[2, 2] - R[0, 0] - R[1, 1]) * 2
        w = (R[1, 0] - R[0, 1]) / S
        x = (R[0, 2] + R[2, 0]) / S
        y = (R[1, 2] + R[2, 1]) / S
        z = 0.25 * S
    q = np.array([w, x, y, z])
    return q if q[0] >= 0 else -q


def _quat_to_mat(q: np.ndarray) -> np.ndarray:
    w, x, y, z = q
    return np.array([
        [1 - 2*y*y - 2*z*z, 2*x*y - 2*z*w, 2*x*z + 2*y*w],
        [2*x*y + 2*z*w, 1 - 2*x*x - 2*z*z, 2*y*z - 2*x*w],
        [2*x*z - 2*y*w, 2*y*z + 2*x*w, 1 - 2*x*x - 2*y*y]
    ])


def _solve_hand_eye_tsai(
    R_g2b: list[np.ndarray],
    t_g2b: list[np.ndarray],
    R_t2c: list[np.ndarray],
    t_t2c: list[np.ndarray]
) -> tuple[np.ndarray, np.ndarray]:
    """数值解析版 Tsai-Lenz 手眼标定求解器 (用于独立验证或在未编译 calibrateHandEye 的 Python 环境中回退)"""
    N = len(R_g2b)
    M_list, b_list, A_list, B_list = [], [], [], []
    for i in range(N - 1):
        j = i + 1
        T_i = np.eye(4)
        T_i[:3, :3] = R_g2b[i]
        T_i[:3, 3] = t_g2b[i].flatten()
        T_j = np.eye(4)
        T_j[:3, :3] = R_g2b[j]
        T_j[:3, 3] = t_g2b[j].flatten()
        T_A = np.linalg.inv(T_j) @ T_i

        C_i = np.eye(4)
        C_i[:3, :3] = R_t2c[i]
        C_i[:3, 3] = t_t2c[i].flatten()
        C_j = np.eye(4)
        C_j[:3, :3] = R_t2c[j]
        C_j[:3, 3] = t_t2c[j].flatten()
        T_B = C_j @ np.linalg.inv(C_i)

        A_list.append(T_A)
        B_list.append(T_B)

        q_A = _mat_to_quat(T_A[:3, :3])
        q_B = _mat_to_quat(T_B[:3, :3])
        M_list.append(_skew(q_A[1:] + q_B[1:]))
        b_list.append(q_B[1:] - q_A[1:])

    M = np.vstack(M_list)
    b = np.concatenate(b_list)
    P_X, _, _, _ = np.linalg.lstsq(M, b, rcond=None)
    w_X = 1.0 / np.sqrt(1.0 + np.sum(P_X**2))
    v_X = P_X * w_X
    R_X = _quat_to_mat(np.array([w_X, v_X[0], v_X[1], v_X[2]]))

    C_rows, d_rows = [], []
    for T_A, T_B in zip(A_list, B_list):
        C_rows.append(T_A[:3, :3] - np.eye(3))
        d_rows.append((R_X @ T_B[:3, 3] - T_A[:3, 3]).flatten())
    t_X, _, _, _ = np.linalg.lstsq(np.vstack(C_rows), np.concatenate(d_rows), rcond=None)
    return R_X, t_X.reshape(3, 1)


def perform_hand_eye_calibration(
    R_gripper2base: list[np.ndarray], 
    t_gripper2base: list[np.ndarray],
    R_target2cam: list[np.ndarray], 
    t_target2cam: list[np.ndarray],
    eye_to_hand: bool = False,
    method: int = getattr(cv2, "CALIB_HAND_EYE_TSAI", 0)
) -> tuple[np.ndarray, np.ndarray]:
    """
    执行手眼标定求解 (支持 Eye-in-Hand 与 Eye-to-Hand 双构型严格坐标映射)
    
    参数:
      R_gripper2base: 机械臂末端法兰相对于基座的旋转矩阵列表 (R_F_in_B)
      t_gripper2base: 机械臂末端法兰相对于基座的平移向量列表 (t_F_in_B, 单位: m)
      R_target2cam: 标定板在相机坐标系下的旋转矩阵列表 (R_M_in_C)
      t_target2cam: 标定板在相机坐标系下的平移向量列表 (t_M_in_C, 单位: m)
      eye_to_hand: False 为眼在手上，True 为眼在手外
      method: 解算算法，如 cv2.CALIB_HAND_EYE_TSAI / PARK / DANIILIDIS
      
    返回:
      若 eye_to_hand=False: 返回 (R_cam2gripper, t_cam2gripper), 即相机在法兰下的位姿 ^F_C T
      若 eye_to_hand=True:  返回 (R_cam2base, t_cam2base), 即外部相机在基座下的安装位姿 ^B_C T
    """
    if not eye_to_hand:
        # Eye-in-Hand: 标准 AX = XB 求解 ^F_C T
        if hasattr(cv2, "calibrateHandEye"):
            return cv2.calibrateHandEye(
                R_gripper2base, t_gripper2base,
                R_target2cam, t_target2cam,
                method=method
            )
        return _solve_hand_eye_tsai(R_gripper2base, t_gripper2base, R_target2cam, t_target2cam)
    else:
        # Eye-to-Hand: 依据 OpenCV 规范，将 Gripper2Base 严格反转为 Base2Gripper (^F_B T)
        R_base2gripper = []
        t_base2gripper = []
        for R_g2b, t_g2b in zip(R_gripper2base, t_gripper2base):
            R_b2g, t_b2g = invert_transform(R_g2b, t_g2b)
            R_base2gripper.append(R_b2g)
            t_base2gripper.append(t_b2g)

        # 传入反转后的运动参数，解出的即为 Camera-to-Base 位姿 (^B_C T)
        if hasattr(cv2, "calibrateHandEye"):
            return cv2.calibrateHandEye(
                R_base2gripper, t_base2gripper,
                R_target2cam, t_target2cam,
                method=method
            )
        return _solve_hand_eye_tsai(R_base2gripper, t_base2gripper, R_target2cam, t_target2cam)
```

---

## 7. 已知真值合成数据自闭环回代验证 (Verification with Synthetic Ground Truth)

为确保工程落地零歧义，以下给出完整的合成数据自闭环验证程序。设定已知装配真值，生成机械臂多姿态运动与对应的虚拟相机观测，**直接调用 `perform_hand_eye_calibration()` 函数求解**并精确断言解算结果与真值的旋转和平移误差：

```python
import numpy as np


def rodrigues_to_mat(r: np.ndarray) -> np.ndarray:
    theta = np.linalg.norm(r)
    if theta < 1e-12:
        return np.eye(3)
    u = r / theta
    K = _skew(u)
    return np.eye(3) + np.sin(theta) * K + (1 - np.cos(theta)) * (K @ K)


def make_homo_transform(R: np.ndarray, t: np.ndarray) -> np.ndarray:
    T = np.eye(4)
    T[:3, :3] = R
    T[:3, 3] = t.flatten()
    return T


def test_hand_eye_synthetic_verification():
    """
    验证 Eye-to-Hand 坐标转换回代精度
    真值设定:
      - 外部相机固定在基座旁: T_base_cam_gt
      - 标定板刚性固定在法兰端: T_gripper_target_gt
    """
    # 1. 设定合成真值
    R_base_cam_gt = rodrigues_to_mat(np.array([0.2, -0.4, 0.6]))
    t_base_cam_gt = np.array([1.20, -0.50, 0.85]).reshape(3, 1)
    T_base_cam_gt = make_homo_transform(R_base_cam_gt, t_base_cam_gt)

    R_grip_target_gt = rodrigues_to_mat(np.array([0.1, 0.3, -0.2]))
    t_grip_target_gt = np.array([0.05, -0.02, 0.15]).reshape(3, 1)
    T_grip_target_gt = make_homo_transform(R_grip_target_gt, t_grip_target_gt)

    # 2. 生成多组满足旋转独立性的机械臂末端位姿 (N >= 5)
    rot_axes = [
        np.array([0.3, 0.2, 0.1]),
        np.array([-0.2, 0.4, -0.3]),
        np.array([0.5, -0.1, 0.2]),
        np.array([0.1, 0.5, 0.4]),
        np.array([-0.4, -0.3, 0.5]),
    ]
    
    R_gripper2base_list = []
    t_gripper2base_list = []
    R_target2cam_list = []
    t_target2cam_list = []

    T_cam_base_gt = np.linalg.inv(T_base_cam_gt)

    for i, axis in enumerate(rot_axes):
        R_bg = rodrigues_to_mat(axis)
        t_bg = np.array([0.4 + 0.05 * i, 0.2 - 0.03 * i, 0.5 + 0.04 * i]).reshape(3, 1)
        T_bg = make_homo_transform(R_bg, t_bg)

        # 闭环视觉观测方程: T_cam_target = inv(T_base_cam) * T_base_gripper * T_gripper_target
        T_cam_target = T_cam_base_gt @ T_bg @ T_grip_target_gt

        R_gripper2base_list.append(R_bg)
        t_gripper2base_list.append(t_bg)
        R_target2cam_list.append(T_cam_target[:3, :3])
        t_target2cam_list.append(T_cam_target[:3, 3].reshape(3, 1))

    # 3. 实际调用 perform_hand_eye_calibration 求解外部相机在基座中的安装位姿
    R_cam2base_est, t_cam2base_est = perform_hand_eye_calibration(
        R_gripper2base_list, t_gripper2base_list,
        R_target2cam_list, t_target2cam_list,
        eye_to_hand=True
    )

    # 4. 精确量化求解结果与真值的误差
    rot_error = np.linalg.norm(R_cam2base_est - R_base_cam_gt)
    trans_error = np.linalg.norm(t_cam2base_est.flatten() - t_base_cam_gt.flatten())

    print(f"Eye-to-Hand 标定解算完成:")
    print(f"  - 旋转矩阵 Frobenius 范数误差: {rot_error:.2e}")
    print(f"  - 平移向量欧氏距离误差 (m):    {trans_error:.2e}")

    assert rot_error < 1e-10, f"求解旋转误差超标: {rot_error}"
    assert trans_error < 1e-10, f"求解平移误差超标: {trans_error}"
    print("✅ perform_hand_eye_calibration() 求解结果与装配真值完全吻合 (误差 < 1e-10)，回代验证通过！")


if __name__ == "__main__":
    test_hand_eye_synthetic_verification()
```

