# MoveIt 2 运动规划架构与执行管道 (MoveIt 2 Motion Planning Architecture)

## 领域归属

- **学科体系**：Engineering / Robotics / ROS2 (运动规划与环境碰撞检测)
- **上游先修**：[工业工作站坐标系拓扑与 TF2](ROS2-Industrial-Workcell-Frames-and-TF2.md)、[机械臂轨迹规划时间律](../Control/Trajectory-Time-Laws-Cubic-Quintic-LSPB.md)
- **并列概念**：Tesseract 工业运动规划框架、Drake 动力学规划
- **下游应用**：[ros2_control 硬件接口抽象](ROS2-Control-Hardware-Interface-Abstraction.md)、[MoveIt Servo 流式伺服控制](../LearningLab/ros2/15-moveit-servo-online-control.html)
- **配套实验室**：[ROS 2 实验 11：六轴机械臂 MoveIt 配置 (LearningLab)](../LearningLab/ros2/11-six-axis-moveit-config.html)、[ROS 2 实验 12：位姿规划与碰撞场景](../LearningLab/ros2/12-moveit-pose-and-planning-scene.html)、[ROS 2 实验 15：MoveIt Servo 实时流式伺服](../LearningLab/ros2/15-moveit-servo-online-control.html)

---

## 1. MoveIt 2 系统核心架构

MoveIt 2 是 ROS 2 生态中功能最强大、工业应用最广泛的操作臂运动规划基础设施。其总体架构围绕核心节点 `move_group` 展开：

```text
               用户应用 API (moveit_cpp / MoveGroupInterface)
                                    │
                                    ▼
┌────────────────────────────── move_group ──────────────────────────────┐
│                                                                        │
│  ┌──────────────────────┐               ┌───────────────────────────┐  │
│  │ PlanningSceneMonitor │ ◄───────────► │     Planning Pipeline     │  │
│  │ (OctoMap / 几何碰撞) │               │ (OMPL / Pilz / CHOMP)     │  │
│  └──────────────────────┘               └───────────────────────────┘  │
│            ▲                                          │                │
└────────────┼──────────────────────────────────────────┼────────────────┘
             │                                          ▼
     /planning_scene_diff                     FollowJointTrajectory Action
             │                                          │
       三维视觉点云 / 障碍物                             ▼
                                                ros2_control 控制器栈
```

---

## 2. 规划场景监视器 (PlanningSceneMonitor)

`PlanningSceneMonitor` 是环境几何感知的核心中枢，负责实时维持机械臂自身与外界工件环境的安全拓扑：
1. **机械臂自碰撞检测 (Self-Collision)**：基于 URDF 中的 `<collision>` 几何网格（Mesh）与 SRDF 中禁用的相邻连杆免检矩阵（Allowed Collision Matrix, ACM）；
2. **外部静态/动态障碍物**：接收 CAD 凸包模型（Box、Cylinder、Mesh）或基于深度相机 3D 点云构建的体素栅格地图（OctoMap）；
3. **碰撞检测引擎**：默认集成 FCL（Flexible Collision Library）或 Bullet 物理碰撞库，以微秒级速度判定包围盒相交。

---

## 3. 规划算法流水线 (Planning Pipeline)

MoveIt 2 采用模块化的规划管道，典型的工业管道包含三大阶段：

### 3.1 预处理 (Pre-Processing)
校验目标笛卡尔位姿的可达性，调用逆运动学解算器（KDL、TRAC-IK 或自定义解析求解器）将笛卡尔目标转为关节空间目标。

### 3.2 路径搜索 (Path Searching)
- **OMPL 采样规划器 (RRT-Connect / PRM)**：用于复杂避障与高维自由度无碰撞大范围迁移；
- **Pilz 工业运动规划器 (LIN / CIRC / PTP)**：用于传统工业场景下的精确空间直线插补（LIN）、圆弧插补（CIRC）与点到点快速对准（PTP），速度曲线极其确定，满足工业焊接涂胶规范。

### 3.3 轨迹时间参数化 (Trajectory Time Parameterization)
采样算法输出的仅是一连串无时间信息的几何路标点。必须通过时间参数化算法为每个路标点分配时间戳、速度和加速度：
- **TOTG (Time-Optimal Trajectory Generation)**：时间最优轨迹生成，在关节速度与加速度物理极限内以最快速度完成动作；
- **IPTP (Iterative Parabolic Time Parameterization)**：迭代抛物线时间参数化。

---

## 4. 实时在线伺服管道：MoveIt Servo

传统的 `move_group` 采用“规划-审查-整体下发”的批处理阻塞模式，无法响应手柄遥控、视觉伺服闭环或动态避障。

**MoveIt Servo** 提供了高频流式控制管道（Streaming Pipeline）：
- 订阅 `/servo_node/delta_twist_cmds`（笛卡尔速度）或 `/servo_node/delta_joint_cmds`；
- 以 $50 \sim 200 \, \text{Hz}$ 实时计算阻尼微分逆运动学（DLS-IK）；
- 结合实时碰撞预测与奇异点自衰减，将速度指令直接注入底层关节控制器。

---

## 5. C++ MoveGroupInterface 工业点位规划标准代码

```cpp
#include <rclcpp/rclcpp.hpp>
#include <moveit/move_group_interface/move_group_interface.h>

void plan_and_execute(rclcpp::Node::SharedPtr node) {
    using moveit::planning_interface::MoveGroupInterface;
    auto move_group = MoveGroupInterface(node, "arm_manipulator");
    
    // 1. 设置工作空间与公差约束
    move_group.setPlanningTime(5.0);
    move_group.setMaxVelocityScalingFactor(0.8);
    move_group.setMaxAccelerationScalingFactor(0.5);
    
    // 2. 设定笛卡尔目标位姿
    geometry_msgs::msg::Pose target_pose;
    target_pose.orientation.w = 1.0;
    target_pose.position.x = 0.35;
    target_pose.position.y = 0.10;
    target_pose.position.z = 0.45;
    move_group.setPoseTarget(target_pose);
    
    // 3. 规划并执行
    MoveGroupInterface::Plan my_plan;
    bool success = (move_group.plan(my_plan) == moveit::core::MoveItErrorCode::SUCCESS);
    
    if (success) {
        RCLCPP_INFO(node->get_logger(), "规划成功，开始执行轨迹...");
        move_group.execute(my_plan);
    } else {
        RCLCPP_ERROR(node->get_logger(), "规划失败：目标位姿不可达或存在碰撞！");
    }
}
```
