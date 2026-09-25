# 机器人运动学体系 (Robot Kinematics)

## 领域总览

运动学（Kinematics）是机器人学的几何基石，研究在**不考虑产生运动的受力与力矩**的前提下，机械臂各连杆的位置、速度与加速度随关节变量演化的纯几何规律。

本专题严格按照“一主题一知识点”的规范，将机械臂运动学拆解为**空间位姿与变换**、**正逆运动学与 DH 建模**、**微分运动与雅可比分析**三大模块，并与 [LearningLab 交互实验区](../LearningLab/00-progress.html) 的仿真台与自测题库建立双向互联。

---

## 知识图谱结构

```text
Engineering/Robotics/Kinematics/
├── 1. 空间位姿与坐标变换 (Spatial Transformations & Poses)
│   ├── 坐标系与点的位置映射 (Coordinate-Frames-and-Point-Mapping)
│   ├── 三维单轴旋转矩阵 SO(3) (SO3-Single-Axis-Rotation-Matrices)
│   ├── 齐次变换矩阵 SE(3) (Homogeneous-Transformation-Matrices)
│   ├── 运动学坐标变换链与多系复合 (Kinematic-Transformation-Chains)
│   └── 空间机械臂坐标系分配准则 (Spatial-Arm-Coordinate-Assignment)
│
├── 2. 正逆运动学与 DH 建模 (Forward & Inverse Kinematics)
│   ├── 平面两连杆正运动学 (Planar-Two-Link-Forward-Kinematics)
│   ├── Denavit-Hartenberg (DH) 建系法则 (Denavit-Hartenberg-Frame-Rules)
│   ├── 单连杆 DH 变换矩阵推导 (DH-Single-Link-Transformation-Matrix)
│   ├── DH 参数表到全局正运动学 (DH-Table-to-Forward-Kinematics)
│   └── 平面 2R 解析逆解双解法 (Analytic-Inverse-Kinematics-Planar-2R)
│
└── 3. 微分运动与雅可比矩阵 (Velocity & Jacobian)
    ├── 雅可比矩阵几何推导与定义 (Jacobian-Matrix-Geometric-Derivation)
    ├── 运动学奇异性与运动学解耦 (Kinematic-Singularity-and-Decoupling)
    ├── 雅可比速度映射与速度/力椭球 (Jacobian-Velocity-Mapping)
    ├── 逆速度运动学求解 (Inverse-Velocity-Kinematics)
    ├── 速度分解运动控制 (Resolved-Rate-Motion-Control)
    └── 连杆间速度与加速度递推外推 (Link-to-Link-Velocity-Propagation)
```

---

## 核心主题条目索引

### 第一模块 · 空间位姿与坐标变换

1. [坐标系与点的位置映射 (Coordinate-Frames-and-Point-Mapping)](Coordinate-Frames-and-Point-Mapping.md)  
   *正交基底、点向量投影与纯平移映射模型。*
2. [三维单轴旋转矩阵与特殊正交群 SO(3) (SO3-Single-Axis-Rotation-Matrices)](SO3-Single-Axis-Rotation-Matrices.md)  
   *$SO(3)$ 旋转矩阵性质、正交转置求逆、主轴基本旋转公式。*
3. [齐次变换矩阵与特殊欧氏群 SE(3) (Homogeneous-Transformation-Matrices)](Homogeneous-Transformation-Matrices.md)  
   *齐次坐标引入背景、4×4 矩阵结构与常数时间解析闭式求逆算法。*
4. [运动学坐标变换链与多系复合 (Kinematic-Transformation-Chains)](Kinematic-Transformation-Chains.md)  
   *上下标消去法则、绝对左乘 vs 相对右乘本质、闭环标定回路方程。*
5. [空间机械臂坐标系分配准则与几何基底 (Spatial-Arm-Coordinate-Assignment)](Spatial-Arm-Coordinate-Assignment.md)  
   *Z 轴沿关节运动轴、X 轴沿公垂线法则，垂直六轴腕点解耦准则。*

### 第二模块 · 正逆运动学与 DH 建模

6. [平面两连杆正运动学 (Planar-Two-Link-Forward-Kinematics)](Planar-Two-Link-Forward-Kinematics.md)  
   *几何三角推导、末端坐标方程、工作空间分析与角度叠加。*
7. [Denavit-Hartenberg (DH) 建系法则与参数定义 (Denavit-Hartenberg-Frame-Rules)](Denavit-Hartenberg-Frame-Rules.md)  
   *连杆四参数 $(a, \alpha, d, \theta)$ 物理定义、轴公垂线法、两大约束条件与退化处理。*
8. [单连杆 DH 变换矩阵推导 (DH-Single-Link-Transformation-Matrix)](DH-Single-Link-Transformation-Matrix.md)  
   *Craig 改良 DH 变换链分解、单步 $4\times 4$ 齐次变换矩阵闭式表达式与逆变换。*
9. [DH 参数表到全局正运动学 (DH-Table-to-Forward-Kinematics)](DH-Table-to-Forward-Kinematics.md)  
   *从连杆参数表格化填报到全局连乘流水线，空间 Puma 560 构型验证。*
10. [平面 2R 解析逆解双解法 (Analytic-Inverse-Kinematics-Planar-2R)](Analytic-Inverse-Kinematics-Planar-2R.md)  
    *余弦定理求肘部角、正切函数 atan2 双解（肘上/肘下）数值稳定性分析。*

### 第三模块 · 微分运动与雅可比矩阵

11. [雅可比矩阵几何推导与定义 (Jacobian-Matrix-Geometric-Derivation)](Jacobian-Matrix-Geometric-Derivation.md)  
    *速度映射算子定义、旋转/移动关节列向量几何叉乘公式与 2R 解析推导。*
12. [运动学奇异性与运动学解耦 (Kinematic-Singularity-and-Decoupling)](Kinematic-Singularity-and-Decoupling.md)  
    *行列式归零与秩退化、边界与内部奇异、腕部解耦与阻尼最小二乘 (DLS) 策略。*
13. [雅可比速度映射与速度/力椭球 (Jacobian-Velocity-Mapping)](Jacobian-Velocity-Mapping.md)  
    *SVD 奇异值分解、可操作度指标 $w$、速度与静力学虚功对偶互补定律。*
14. [逆速度运动学求解 (Inverse-Velocity-Kinematics)](Inverse-Velocity-Kinematics.md)  
    *非冗余求逆、冗余机械臂摩尔-彭罗斯伪逆、零空间投影自运动控制。*
15. [速度分解运动控制 (Resolved-Rate-Motion-Control)](Resolved-Rate-Motion-Control.md)  
    *开环积分漂移缺陷、CLIK 闭环逆运动学架构、李雅普诺夫指数收敛性证明。*
16. [连杆间速度与加速度递推外推 (Link-to-Link-Velocity-Propagation)](Link-to-Link-Velocity-Propagation.md)  
    *动坐标系传输定理、角速度/原点加速度/质心加速度局部化递推与爱因斯坦等效重力技巧。*

---

## 交互实验区联动

本体系内所有理论推导均在交互实验室配备了原生仿真台与测验：
- 📌 [LearningLab 01：坐标系中的点交互实验台](../LearningLab/01-coordinate-frames.html)
- 📌 [LearningLab 02：齐次变换矩阵推演实验台](../LearningLab/02-homogeneous-transform.html)
- 📌 [LearningLab 03：坐标变换链与相对位姿实验台](../LearningLab/03-transform-chains.html)
- 📌 [LearningLab 04：二维两连杆正运动学实验台](../LearningLab/04-planar-two-link-forward-kinematics.html)
- 📌 [LearningLab 05：三维单轴旋转交互仿真台](../LearningLab/05-3d-single-axis-rotations.html)
- 📌 [LearningLab 06：三维机械臂坐标系装配演练](../LearningLab/06-3d-arm-coordinate-frames.html)
- 🎯 [LearningLab 07：基础阶段综合复习自测](../LearningLab/07-foundation-review-quiz.html)
- 📌 [LearningLab 08：DH 参数与建系法则演练](../LearningLab/08-dh-coordinate-assignment.html)
- 📌 [LearningLab 09：单连杆 DH 矩阵推导演练](../LearningLab/09-dh-single-link-transform.html)
- 📌 [LearningLab 10：DH 表与正运动学仿真](../LearningLab/10-dh-table-to-forward-kinematics.html)
- 🎯 [LearningLab 11：DH 建模阶段自测](../LearningLab/11-dh-review-quiz.html)
- 📌 [LearningLab 12：平面 2R 逆运动学求解台](../LearningLab/12-planar-two-link-inverse-kinematics.html)
- 🎯 [LearningLab 13：正逆运动学综合自测](../LearningLab/13-planar-forward-inverse-quiz.html)
- 📌 [LearningLab 14：平面两连杆雅可比实验台](../LearningLab/14-planar-two-link-jacobian.html)
- 📌 [LearningLab 15：运动学奇异性交互实验台](../LearningLab/15-planar-two-link-singularity.html)
- 📌 [LearningLab 16：雅可比速度映射与椭球实验台](../LearningLab/16-planar-jacobian-velocity.html)
- 📌 [LearningLab 17：逆速度运动学求解实验台](../LearningLab/17-planar-inverse-velocity.html)
- 📌 [LearningLab 18：速度分解运动控制仿真台](../LearningLab/18-resolved-rate-motion.html)
- 📌 [LearningLab 19：时变位姿与速度外推实验台](../LearningLab/19-time-varying-position-velocity.html)
- 🎯 [LearningLab 20：速度与雅可比综合自测](../LearningLab/20-velocity-jacobian-review-quiz.html)
- 📌 [LearningLab 25：两连杆速度递推实验台](../LearningLab/25-two-link-velocity-recursion.html)
