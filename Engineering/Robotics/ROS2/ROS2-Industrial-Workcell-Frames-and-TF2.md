# 工业工作站坐标系拓扑与 TF2 动态坐标变换 (Industrial Workcell Frames & TF2)

## 领域归属

- **学科体系**：Engineering / Robotics / ROS2 (工业软件工程与空间几何管理)
- **上游先修**：[运动学坐标变换链与多系复合](../Kinematics/Kinematic-Transformation-Chains.md)、[空间机械臂坐标系分配准则](../Kinematics/Spatial-Arm-Coordinate-Assignment.md)
- **并列概念**：URDF / Xacro 机械臂连杆树
- **下游应用**：[MoveIt 2 运动规划架构](MoveIt2-Motion-Planning-Architecture.md)、[TCP 工具中心点与手眼标定](TCP-and-Hand-Eye-Calibration.md)
- **配套实验室**：[ROS 2 实验 10：TF2 工作站坐标拓扑管理 (LearningLab)](../LearningLab/ros2/10-tf2-workcell-frames.html)、[ROS 2 实验 02：URDF 机械臂建模](../LearningLab/ros2/02-urdf-and-arm-modeling.html)

---

## 1. 工业机器人工作站标准坐标系拓扑规范

在一个符合工业安全标准（如 ISO 9787、RIA 15.06）的自动化机器人工作站中，存在一棵严密的单根**空间坐标变换拓扑树 (Coordinate Frame Tree)**：

```text
world (全局大地坐标系)
  └── base_link (机器人安装基座参考系)
        └── link_1 -> ... -> link_6 (各运动连杆坐标系)
              └── flange (机械臂输出机械法兰盘面)
                    └── tool0 (未施加旋转偏移的工具基准系)
                          └── tcp / tool_tip (工具中心点，焊枪尖端/吸盘接触面)
  └── camera_link (工作站工件识别相机)
  └── worktable / fixture (工装夹具与物料工作台)
        └── part_nominal (工件理论装配位姿)
```

### 核心坐标系定义准则：
- `base_link`：机器人固定底座，原点位于第 1 关节回转中心线与底座底面的交点；
- `flange`：机械臂最后一根轴的前端机械法兰中心。机械法兰具有高加工精度和硬销定位孔；
- `tool0`：机器人厂商出厂默认定义的工具法兰系。绝不允许随意篡改其原点；
- `tcp`（Tool Center Point）：末端工具的有效作用点（如点焊钳极尖、喷嘴出料口、夹爪咬合中心）。

---

## 2. TF2 动态变换树的单父节点约束与缓冲机制

ROS 2 中的 `tf2` 库是整个机器人系统空间变换的神经中枢。

### 2.1 铁律：有向无环图与严格单父节点约束
在 TF2 坐标树中：
- **每一个子坐标系（child frame）有且仅能有一个父坐标系（parent frame）**；
- 严禁出现环状依赖（如 A 依赖 B，B 依赖 C，C 又发布指向 A 的变换）。若出现双重父节点，TF2 树将在两帧之间发生激烈的跳变与撕裂。

### 2.2 静态广播 vs 动态广播
- **静态变换 (`tf2_ros::StaticTransformBroadcaster`)**：用于空间几何关系恒定不随时间变化的连接（如 `world -> base_link`、`flange -> tcp`、`base_link -> camera_mount`）。静态广播采用 Latching 机制，极低带宽开销；
- **动态变换 (`tf2_ros::TransformBroadcaster`)**：用于随关节运动实时演化的连接（如 `robot_state_publisher` 接收 `/joint_states` 后广播的各连杆间的正向运动学变换）。通常以 $50 \sim 100 \, \text{Hz}$ 高频持续刷新。

---

## 3. 时间同步与坐标查询 (Transform Listener)

在分布式机器人系统中，相机拍照获取工件坐标时，相机数据、机械臂当前位姿和上位机规划指令存在微小的网络与硬件时间戳偏差（Timestamp Jitter）。

TF2 内部维护了一个大小通常为 10 秒的**时间滑动环形缓冲区 (Transform Buffer)**。

### 时间旅行查询范式 (Time Travel Query)：
当查询“相机在 $T_{\text{camera}}$ 时刻检测到的物体在当前基座坐标系下的位姿”时：
```python
# 等待变换可用并进行插值查询
transform = tf_buffer.lookup_transform(
    target_frame='base_link',
    source_frame='object_frame',
    time=point_cloud_timestamp,
    timeout=rclpy.duration.Duration(seconds=0.1)
)
```
TF2 会在时间轴上自动进行**四元数球面线性插值 (SLERP)** 与平移向量线性插值，杜绝因通信延迟导致的运动脱节。

---

## 4. C++ 工业节点标准变换广播范例

```cpp
#include <rclcpp/rclcpp.hpp>
#include <geometry_msgs/msg/transform_stamped.hpp>
#include <tf2_ros/static_transform_broadcaster.h>
#include <tf2/LinearMath/Quaternion.h>

class WorkcellFramePublisher : public rclcpp::Node {
public:
    WorkcellFramePublisher() : Node("workcell_frame_publisher") {
        static_broadcaster_ = std::make_shared<tf2_ros::StaticTransformBroadcaster>(this);
        
        geometry_msgs::msg::TransformStamped t;
        t.header.stamp = this->get_clock()->now();
        t.header.frame_id = "flange";
        t.child_frame_id = "tcp";
        
        // 工具 TCP 偏置: 沿 Z 延伸 150mm，绕 Z 轴偏转 45 度
        t.transform.translation.x = 0.0;
        t.transform.translation.y = 0.0;
        t.transform.translation.z = 0.15;
        
        tf2::Quaternion q;
        q.setRPY(0.0, 0.0, M_PI / 4.0);
        t.transform.rotation.x = q.x();
        t.transform.rotation.y = q.y();
        t.transform.rotation.z = q.z();
        t.transform.rotation.w = q.w();
        
        static_broadcaster_->sendTransform(t);
        RCLCPP_INFO(this->get_logger(), "已发布静态工具坐标系: flange -> tcp");
    }
private:
    std::shared_ptr<tf2_ros::StaticTransformBroadcaster> static_broadcaster_;
};
```
