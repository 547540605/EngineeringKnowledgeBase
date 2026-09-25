# ROS 2 现代工业机器人工程架构体系 (ROS 2 Robotics)

## 领域总览

ROS 2（Robot Operating System 2）是现代智能机器人与工业自动化产线的主流软件基础设施，负责将上层的空间运动规划算法、三维视觉感知、实时硬件总线以及任务状态机无缝整合为高可靠的工业级软件系统。

本专题严格按照“一主题一知识点”的规范，系统性地构建从工作站坐标系拓扑与 TF2 动态变换树、MoveIt 2 运动规划与碰撞感知架构、ros2_control 硬件资源接口抽象与实时控制栈，到工具端 TCP 标定与手眼标定算法的完整知识图谱。

---

## 知识图谱结构

```text
Engineering/Robotics/ROS2/
├── 1. 空间坐标拓扑与几何建模
│   └── 工业工作站坐标系拓扑与 TF2 动态变换 (ROS2-Industrial-Workcell-Frames-and-TF2)
│
├── 2. 运动规划与场景感知
│   └── MoveIt 2 运动规划架构与执行管道 (MoveIt2-Motion-Planning-Architecture)
│
├── 3. 硬件抽象与实时控制
│   └── ros2_control 硬件接口抽象与实时控制栈 (ROS2-Control-Hardware-Interface-Abstraction)
│
├── 4. 空间度量与工业标定
│   ├── 工具中心点 (TCP) 标定算法与精度评测 (TCP-Calibration-Four-Point-Method)
│   └── 机器人手眼标定算法：眼在手上与眼在手外 (Hand-Eye-Calibration-Eye-in-Hand-and-Eye-to-Hand)
```

---

## 核心主题条目索引

### 第一模块 · 空间坐标拓扑与几何建模

1. [工业工作站坐标系拓扑与 TF2 动态变换 (ROS2-Industrial-Workcell-Frames-and-TF2)](ROS2-Industrial-Workcell-Frames-and-TF2.md)  
   *基座 `base_link`、法兰 `flange` 与工具 `tcp` 规范、TF2 单父节点树形拓扑、静态/动态广播与时间插值查询机制。*

### 第二模块 · 运动规划与场景感知

2. [MoveIt 2 运动规划架构与执行管道 (MoveIt2-Motion-Planning-Architecture)](MoveIt2-Motion-Planning-Architecture.md)  
   *`move_group` 架构、`PlanningSceneMonitor` 碰撞网格与 OctoMap、OMPL 采样与 Pilz 工业直线插补、TOTG 时间参数化与 MoveIt Servo 流式伺服。*

### 第三模块 · 硬件抽象与实时控制

3. [ros2_control 硬件接口抽象与实时控制栈 (ROS2-Control-Hardware-Interface-Abstraction)](ROS2-Control-Hardware-Interface-Abstraction.md)  
   *Controller Manager、Command/State 接口强类型借出独占机制、可配置控制循环频率 `update_rate` 与硬实时内核安全铁律。*

### 第四模块 · 空间度量与工业标定

4. [工具中心点 (TCP) 标定算法与精度评测 (TCP-Calibration-Four-Point-Method)](TCP-Calibration-Four-Point-Method.md)  
   *工具尖点四点法最小二乘线性代数求解、六点法姿态标定、拟合残差球 RMSE 精度评估。*
5. [机器人手眼标定算法：眼在手上与眼在手外 (Hand-Eye-Calibration-Eye-in-Hand-and-Eye-to-Hand)](Hand-Eye-Calibration-Eye-in-Hand-and-Eye-to-Hand.md)  
   *眼在手上 (Eye-in-Hand: $AX=XB$) 与眼在手外 (Eye-to-Hand: $AX=YB$) 闭环回路推导、Tsai-Lenz 旋转平移解耦解法与纯平移退化规避。*

---

## 交互实验区联动

本体系内所有工程架构与算法均在交互实验室配备了原生 Web 仿真台与实战演练教程：
- 📌 [ROS 2 实验 01：节点与话题通信基础](../LearningLab/ros2/01-nodes-and-topics.html)
- 📌 [ROS 2 实验 02：URDF 机械臂建模演练](../LearningLab/ros2/02-urdf-and-arm-modeling.html)
- 📌 [ROS 2 实验 03：Python 轨迹控制接口](../LearningLab/ros2/03-python-trajectory-control.html)
- 📌 [ROS 2 实验 08：3R 逆运动学与速度雅可比](../LearningLab/ros2/08-3r-position-jacobian.html)
- 📌 [ROS 2 实验 09：微分逆运动学与奇异点规避](../LearningLab/ros2/09-differential-ik-and-singularity.html)
- 📌 [ROS 2 实验 10：TF2 工作站坐标拓扑管理](../LearningLab/ros2/10-tf2-workcell-frames.html)
- 📌 [ROS 2 实验 11：六轴机械臂 MoveIt 配置](../LearningLab/ros2/11-six-axis-moveit-config.html)
- 📌 [ROS 2 实验 12：位姿规划与碰撞场景演练](../LearningLab/ros2/12-moveit-pose-and-planning-scene.html)
- 📌 [ROS 2 实验 13：ros2_control 与硬件接口仿真](../LearningLab/ros2/13-ros2-control-and-fake-hardware.html)
- 📌 [ROS 2 实验 15：MoveIt Servo 实时流式伺服](../LearningLab/ros2/15-moveit-servo-online-control.html)
- 📌 [ROS 2 实验 16：TCP 标定与精度评测演练](../LearningLab/ros2/16-tcp-calibration-and-accuracy.html)
- 📌 [ROS 2 实验 17：手眼标定与视觉闭环引导抓取](../LearningLab/ros2/17-hand-eye-calibration-and-visual-loop.html)
