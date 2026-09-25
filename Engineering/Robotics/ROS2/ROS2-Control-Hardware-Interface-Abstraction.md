# ros2_control 硬件接口抽象与实时控制栈 (ros2_control Hardware Abstraction)

## 领域归属

- **学科体系**：Engineering / Robotics / ROS2 (实时控制与底层硬件驱动抽象)
- **上游先修**：[MoveIt 2 运动规划架构](MoveIt2-Motion-Planning-Architecture.md)、[伺服三环级联控制与带宽匹配](../Control/Servo-Cascade-Loops-Current-Velocity-Position.md)
- **并列概念**：EtherCAT 工业主站 (SOEM / IgH)、CANopen 协议栈
- **下游应用**：[两连杆闭环系统仿真](../LearningLab/ros2/13-ros2-control-and-fake-hardware.html)、[工业级真机防冲击控制](../Control/index.md)
- **配套实验室**：[ROS 2 实验 13：ros2_control 与硬件接口仿真 (LearningLab)](../LearningLab/ros2/13-ros2-control-and-fake-hardware.html)、[ROS 2 实验 03：Python 轨迹控制接口](../LearningLab/ros2/03-python-trajectory-control.html)

---

## 1. 为什么需要 ros2_control 统一架构？

在传统机器人软件中，驱动电机通常由厂商特定的专有 SDK 或私有总线协议实现，导致上层运动算法与底层硬件紧密耦合，无法跨硬件移植。

**ros2_control** 是 ROS 2 为解决工业级**硬实时（Hard Real-Time）、多控制器动态热插拔与统一硬件抽象**而建立的官方标准框架：

```text
上层应用 / MoveIt 2 (FollowJointTrajectory / 轨迹流)
                     │
                     ▼
┌───────────────────────────────── ros2_control 框架 ─────────────────────────────────┐
│                                                                                     │
│  Controller Manager (负责控制器生命周期调度、抢占与管理)                             │
│     ├── joint_state_broadcaster (高频发布 /joint_states)                            │
│     └── joint_trajectory_controller (执行样条插补，输出目标位置/速度/力矩)           │
│                                                                                     │
│  Resource Manager (资源管理器：负责解析硬件描述，分配并借出接口指针)                 │
│     ├── Command Interfaces (loaned_command_interfaces_) ──> 借出给活动的控制器     │
│     └── State Interfaces   (loaned_state_interfaces_)   ──> 供所有监控器只读共享   │
│                                                                                     │
│  Hardware Component (硬件插件：System / Actuator / Sensor Interface)                │
└─────────────────────────────────────────┬───────────────────────────────────────────┘
                                          │  实时控制更新循环 (1 kHz / 1 ms)
                                          ▼
                               底层物理伺服 (EtherCAT / CANopen / USB-CAN)
```

---

## 2. 硬件组件类型划分 (Hardware Components)

根据物理设备的结构，`hardware_interface::SystemInterface` 将硬件分为三类：
1. **Actuator (执行器)**：适用于单关节独立电机或抓手电缸，具有 1 个输入命令和若干状态；
2. **Sensor (传感器)**：纯输入设备，仅提供 `StateInterface`，无执行命令（如六维力/力矩传感器 ATI F/T、温度传感器、编码器）；
3. **System (系统)**：包含多个关节联动或多传感器一体化的完整机械臂系统（如工业六轴机械臂、移动复合机器人底盘）。

---

## 3. 命令接口与状态接口 (Command / State Interfaces)

在 XML/URDF 中通过 `<ros2_control>` 标签进行强类型声明：

```xml
<ros2_control name="IndustrialArmHardware" type="system">
  <hardware>
    <plugin>my_robot_hardware/IndustrialArmSystemHardware</plugin>
    <param name="ethercat_interface">eth0</param>
  </hardware>
  <joint name="joint_1">
    <command_interface name="position"/>
    <command_interface name="velocity"/>
    <command_interface name="effort"/>
    <state_interface name="position"/>
    <state_interface name="velocity"/>
    <state_interface name="effort"/>
  </joint>
</ros2_control>
```

### 独占性与安全保护机制：
- **状态接口 (StateInterface)**：支持多路只读共享读取（广播器、监控器、力控算法可同时读取 `joint_1/position`）；
- **命令接口 (CommandInterface)**：**严格独占锁定（Exclusive Loan）**！在同一时刻，有且仅能有一个激活状态的控制器持有 `joint_1/position` 的写入控制权，杜绝控制指令冲突引发飞车。

---

## 4. 硬实时安全准则 (Real-Time Safety Rules)

在运行频率为 1 kHz（周期 1 ms）的实时控制更新函数 `read()` 与 `write()` 中，必须严格遵守以下**内核安全铁律**：

1. **零动态内存分配**：严禁在 `update()` 中调用 `malloc`、`free`、`new`、`delete` 或使用引起内存重分配的 `std::vector::push_back`；
2. **零阻塞式系统调用与 I/O**：严禁在循环内执行文件读写、打印控制台日志（如 `printf`、`std::cout`，必须使用基于无锁环形队列的实时日志 `RCLCPP_INFO_THROTTLE`）；
3. **无锁通信机制 (Lock-Free)**：非实时线程（如 ROS 话题订阅）与实时控制线程之间的数据交换，必须采用无锁环形缓冲区（`realtime_tools::RealtimeBox` 或 `realtime_tools::RealtimeBuffer`），严禁使用互斥锁 `std::mutex`（防止发生优先级反转 Priority Inversion）。

---

## 5. C++ 工业硬件插件实现骨架

```cpp
#include <hardware_interface/system_interface.hpp>
#include <rclcpp/rclcpp.hpp>

class IndustrialArmHardware : public hardware_interface::SystemInterface {
public:
    CallbackReturn on_init(const hardware_interface::HardwareInfo & info) override {
        if (SystemInterface::on_init(info) != CallbackReturn::SUCCESS) return CallbackReturn::ERROR;
        // 初始化数据缓冲区
        hw_positions_.resize(info_.joints.size(), 0.0);
        hw_commands_.resize(info_.joints.size(), 0.0);
        return CallbackReturn::SUCCESS;
    }

    std::vector<hardware_interface::StateInterface> export_state_interfaces() override {
        std::vector<hardware_interface::StateInterface> state_interfaces;
        for (size_t i = 0; i < info_.joints.size(); ++i) {
            state_interfaces.emplace_back(info_.joints[i].name, "position", &hw_positions_[i]);
        }
        return state_interfaces;
    }

    std::vector<hardware_interface::CommandInterface> export_command_interfaces() override {
        std::vector<hardware_interface::CommandInterface> command_interfaces;
        for (size_t i = 0; i < info_.joints.size(); ++i) {
            command_interfaces.emplace_back(info_.joints[i].name, "position", &hw_commands_[i]);
        }
        return command_interfaces;
    }

    hardware_interface::return_type read(const rclcpp::Time & time, const rclcpp::Duration & period) override {
        // 从物理总线 (EtherCAT / CAN) 读取硬件编码器反馈，更新 hw_positions_
        return hardware_interface::return_type::OK;
    }

    hardware_interface::return_type write(const rclcpp::Time & time, const rclcpp::Duration & period) override {
        // 将 hw_commands_ 发送到底层驱动器
        return hardware_interface::return_type::OK;
    }
private:
    std::vector<double> hw_positions_;
    std::vector<double> hw_commands_;
};
```
