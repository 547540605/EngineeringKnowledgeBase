# ROS 2 工程实战 04–13：可跟做执行路线

> 目标不是“把一台机械臂在 RViz 里动起来”，而是建立一条能读懂真实开源机器人项目的因果链：
>
> `工位目标 → 坐标变换 → IK/规划 → 轨迹 → 控制器 → 硬件接口 → 状态反馈`

## 0. 已完成的起点（不重复学）

当前已经有三件可用的基础：

1. ROS2-01：知道节点、话题、工作空间和 `colcon` 的角色；
2. ROS2-02：有一台 3R 数字孪生，结构为 `joint1` 绕 Z 回转、`joint2/joint3` 绕 Y 俯仰；
3. ROS2-03：Python 节点以 50 Hz 向 `/joint_states` 发布关节位置，经 `robot_state_publisher → /tf → RViz` 显示模型。

这台 3R 模型的后续唯一真值：

```text
d  = 0.05 + 0.20 = 0.25 m      # base_link 原点到肩关节高度
L1 = 0.50 m                    # shoulder → elbow
L2 = 0.40 m                    # elbow → tool0
q1: 绕 Z；q2、q3: 绕 Y
```

`/joint_states` 在 ROS2-03 中只是**数字孪生的状态输入**，不是实际设备控制命令。真机执行会在 ROS2-13 通过 `JointTrajectory` 和控制器完成。

---

## 1. 全线分段与切换点

```text
ROS2-04 ~ 10：现有 3R
理解自己写的几何、路径、速度和 TF；不依赖 MoveIt 黑盒。

ROS2-11 ~ 13：通用六轴 + fake hardware
理解真实工程的描述包、MoveIt 配置、规划、控制器与硬件接口分层。

ROS2-14（未来）：工作中实际六轴
替换厂商驱动、总线、控制柜、安全接口；本路线不预设型号。
```

每一篇必须同时交付四项证据：

1. **输入/输出契约**：这一讲函数、节点或控制器接收什么，产出什么；
2. **最小可运行改动**：只增加本讲所需的一个能力；
3. **可观察结果**：终端、`tf2_echo`、`rqt_graph` 或 RViz 中应看到什么；
4. **失败边界**：不可达、限位、接口不匹配或超时分别如何呈现和排查。

不在单篇末尾新增零散自测；理解考核继续放在全站题库。

---

## 2. 建议的工作空间分层

ROS2-04 开始，将现有示例逐步整理为下列职责，而不是把 URDF、业务逻辑和 Launch 全塞进一个包：

```text
~/ros2_ws/src/
├── my_arm_description/       # URDF、网格、RViz 配置；只描述“是什么”
├── my_arm_motion/            # 3R IK、FK、插补、轨迹 Marker；只计算“怎么动”
└── my_arm_bringup/           # Launch 与参数；只负责“怎样一起启动”

六轴阶段：
├── <arm>_description/        # 厂商/通用六轴 URDF、TCP、关节限制
├── <arm>_moveit_config/      # SRDF、IK、规划器、碰撞矩阵、控制器映射
├── <arm>_bringup/            # MoveIt、ros2_control、fake/real hardware Launch
└── <arm>_tasks/              # 工位目标、规划请求、执行状态机
```

没有实际六轴时，`<arm>` 仅代表“ROS2 支持成熟的通用六轴模型”。不要先假装有 CAN、EtherCAT 或厂商控制柜；ROS2-13 先采用 fake hardware。

---

## 3. ROS2-04：3R 单点解析逆运动学

### 本讲唯一问题

给 `base_link` 下的目标位置 `P=(x,y,z)`，求合法的 `[q1,q2,q3]`。只处理**位置**，不承诺末端姿态。

### 本讲不做什么

- 不做直线插补、方形轨迹、Marker；
- 不接 MoveIt；
- 不使用 `/joint_states` 假装给真机发指令。

### 跟做步骤

1. 从 `my_arm.urdf` 抄录 `d,L1,L2`、各关节轴与限位；禁止凭图目测。
2. 将目标投影到肩部平面：`r=sqrt(x^2+y^2)`，`h=z-d`。
3. 先做可达性检查：`abs(L1-L2) <= sqrt(r^2+h^2) <= L1+L2`。
4. 求腰部：`q1=atan2(y,x)`；当 `r` 近似零时明确报“腰部方向不唯一”，不偷偷给随机角。
5. 求两支肘角：

   ```text
   c3 = (r²+h²-L1²-L2²) / (2 L1 L2)
   q3 = ±acos(clamp(c3, -1, 1))
   q2 = atan2(r,h) - atan2(L2 sin(q3), L1 + L2 cos(q3))
   ```

   这里角度从竖直 `+Z` 量起，和二维笔记“从 +X 量起”的公式仅差坐标约定，必须在讲义画图说明。
6. 逐支检查 `joint2/joint3` 限位；剩下的解才是可执行候选。
7. 对每个候选做 FK 回代，输出位置误差；此处的回代是证明“本讲解对了”的唯一标准。

### 交付物与可见结果

- `my_arm_motion/kinematics_3r.py`：纯函数 `solve_position_ik()` 与 `forward_position()`；
- 一个固定目标的命令行或参数化节点，打印两支解、限位淘汰原因和 FK 误差；
- RViz 中先选一支解发布到 `/joint_states`，`tool0` 到达目标 Marker。

### 必须解释的失败现象

| 现象 | 原因 | 正确处理 |
|---|---|---|
| `acos` 输入超出 `[-1,1]` | 目标几何不可达或浮点边界 | 先判可达，再仅对极小误差 clamp |
| 有几何解却没有可执行解 | 超出 URDF 限位 | 返回“受限不可达”，不篡改角度 |
| 目标在 Z 轴上 | `q1` 任意 | 保持上一帧 `q1` 或明确要求调用者指定 |
| RViz 到不了 Marker | joint 名/角度约定/FK 不一致 | 先对零位做 FK 真值核对 |

### 通过门槛

同一目标能列出双解；至少一支在限位内；FK 回代位置误差在数值精度范围内；不可达目标有明确报错而非 NaN。

---

## 4. ROS2-05：IK 工程化——连续选支与工作空间边界

### 本讲唯一问题

单点有两支解，连续移动时到底选哪一支，才不会让肘部突然翻转？

### 跟做步骤

1. 定义 `IKResult`：`reachable`、所有候选、每支的限位状态、`selected`、失败原因。
2. 引入上一时刻关节状态 `q_prev`；在合法候选中最小化带权关节距离 `||W(q-q_prev)||`。
3. 对转动关节做角度 wrap 处理，避免 `+π` 与 `-π` 被错误认为相差一整圈。
4. 沿一小段手工给定点列依次求 IK，记录每一步选中的分支和关节增量。
5. 展示三类边界：外可达边界、内可达边界、关节限位裁掉的区域。

### 可见结果

- RViz 中目标缓慢移动时，机械臂保持同一肘部构型；
- 主动跨过不可达区时节点停止发布新姿态并说明原因；
- 输出表中能看到“几何可达”与“受限可执行”是两件事。

### 通过门槛

连续目标序列不出现无理由的 `q3` 符号跳变；用户可看懂“无解、双解、限位淘汰、连续选择”的差别。

---

## 5. ROS2-06：笛卡尔直线与五次时间律

### 本讲唯一问题

不再给关节编正弦波，而是让 `tool0` 在 `base_link` 中从 A 走到 B 的真直线。

### 跟做步骤

1. 选择经过 ROS2-04/05 筛选的安全 A、B；所有路径点均需满足限位。
2. 定义总时长 `T` 和归一化时间 `u=t/T`。
3. 用五次时间律 `s(u)=10u^3-15u^4+6u^5`；它保证起止速度、加速度为零。
4. 计算 `P(t)=A+s(t)(B-A)`，以 50 Hz 取点。
5. 每一目标点先经 ROS2-05 的连续 IK，再发布关节位置给数字孪生。
6. 每帧记录目标点、FK 实际点与位置误差；不把“关节插值”误称为“笛卡尔直线”。

### 可见结果

- RViz 的末端从 A 平稳到 B；
- 目标 Marker 沿直线移动；
- 终端记录 `max_cartesian_error`，能区分 IK/FK 误差与可视化误差。

### 通过门槛

起止没有关节突跳；每个点有合法 IK；目标点列在 `base_link` 下共线。

---

## 6. ROS2-07：轨迹可视化与固定平面正方形

### 本讲唯一问题

如何不靠肉眼猜，让 RViz 明确显示末端是否走出了设计轨迹？

### 跟做步骤

1. 使用 `visualization_msgs/msg/Marker`，固定 `header.frame_id='base_link'`。
2. 用一个 `LINE_STRIP` 保存已走过的 FK 点，限制最大点数，防止长期运行造成 RViz 卡顿。
3. 依次显示三类 Marker：目标轨迹（灰虚线）、FK 实际轨迹（彩色实线）、当前目标/当前末端点。
4. 选择一个固定平面及四个全部可达的顶点，逐边调用 ROS2-06 的直线执行器。
5. 每段结束时保留路径，完整呈现正方形；“正方形”必须指明在哪个坐标平面内。

### 通过门槛

用户能同时看到目标线、实际线、当前点；两条线误差可解释；路径不会无限增长。

---

## 7. ROS2-08：3R 位置 Jacobian

### 本讲唯一问题

关节各自转一点或转得更快时，末端此刻朝哪个方向动、速度多大？

### 跟做步骤

1. 从 ROS2-04 的 3R FK 对 `q1,q2,q3` 求偏导，得到 `J_p(q)`（3×3，位置 Jacobian）。
2. 对每一列分别作物理解释：只给对应关节单位角速度时的末端瞬时速度贡献。
3. 数值差分核对解析 Jacobian：只用足够小的 `Δq`，比较 `JΔq` 与 `FK(q+Δq)-FK(q)`。
4. 在 RViz 或二维数值面板中分别显示三列速度贡献和总速度 `v=Jq_dot`。
5. 明确 Jacobian 是局部瞬时映射，不是“输入位置、输出位置”的总公式。

### 通过门槛

解析 Jacobian 和微小扰动的 FK 结果一致；每一列能对应具体关节和具体速度方向。

---

## 8. ROS2-09：微分 IK、阻尼最小二乘与奇异位形规避

### 本讲唯一问题

已知想让末端瞬时朝某方向走，如何求关节速度；接近奇异位形时如何不让关节速度失控？

### 跟做步骤

1. 先在远离奇异点处解 `q_dot=J^{-1}v_des`，再观察其局限。
2. 展示行列式或最小奇异值的意义：它们是“某些末端方向快要走不出来”的预警，不是障碍物。
3. 改用阻尼最小二乘：`q_dot=J^T(JJ^T+λ²I)^{-1}v_des`。
4. 让 `λ` 随最小奇异值变大；同时设置关节速度上限。
5. 对比普通逆与 DLS 在接近奇异姿态时的关节速度、末端误差与降速行为。

### 通过门槛

用户能看到“末端速度请求相同，但普通逆爆速、DLS 允许误差并保护关节”的差别；全篇只称“奇异位形规避”，不混称“避障”。

---

## 9. ROS2-10：TF2——把工位目标变成机械臂目标

### 本讲唯一问题

为什么相机、治具或上位机给出的坐标不能直接拿来求 IK？

### 跟做步骤

1. 定义并画出帧树：`world → base_link → ... → tool0`，以及 `world → workcell → target`；可选 `camera`。
2. 先用静态变换放置工位与相机，再广播会变化的 `target`。
3. 使用 `tf2_ros.Buffer` 与 `TransformListener` 查询同一时刻的 `base_link ← target`。
4. 将转换后的目标位置交给 ROS2-04 IK，而不是把原始 `camera` 坐标直接给它。
5. 用 `tf2_echo`、RViz TF Display 和 Marker 同时核对帧名、单位、方向。
6. 显式处理 transform 不存在、超时、时间戳不同步；任何失败都禁止下发新轨迹。

### 通过门槛

改变 `workcell` 或 `camera` 的安装位姿后，不改 IK 代码也能使末端仍然指向同一真实工位目标。

---

## 10. ROS2-11：六轴描述与 MoveIt 配置

### 本讲唯一问题

从手写 3R 切换到工业六轴时，哪些东西由 URDF、SRDF、MoveIt 配置和控制器配置分别负责？

### 跟做步骤

1. 选定一个 ROS2 支持成熟的通用六轴模型；实际工作机械手到手后只替换这一层。
2. 逐项核对 URDF：关节轴、限位、惯量、碰撞几何、`tool0/TCP`，不要只看视觉网格。
3. 用 Setup Assistant 或等价配置生成 SRDF：planning group、end effector、虚拟关节、自碰撞矩阵。
4. 配置运动学求解器、规划器、`joint_limits.yaml` 与控制器映射。
5. 启动 MoveIt RViz；观察可达、不可达、自碰撞和目标状态的区别。

### 通过门槛

不把 `robot_description`、SRDF、规划场景和控制器配置混为同一份文件；能解释它们各自在哪个节点被使用。

---

## 11. ROS2-12：MoveIt 位姿规划与碰撞场景

### 本讲唯一问题

六轴如何从当前状态到目标 Pose，绕开工位障碍物并得到可执行轨迹？

### 跟做步骤

1. 先用 RViz MotionPlanning 面板区分 scene robot、start state、goal state、planned path。
2. 用客户端设置关节目标和 Pose 目标，比较两者约束的差别。
3. 在 Planning Scene 添加盒体工位障碍物；确认模型碰撞变红与规划失败的含义。
4. 调用规划，检查返回码、轨迹点数、路径长度和碰撞结果，再允许执行。
5. 单独调用 Cartesian path；检查完成比例，禁止把部分路径当成完整成功。
6. 使用 MoveItPy 时只写 Python API；需要 MoveItCpp 时另开 C++ 示例，二者不混称。

### 通过门槛

用户能解释“IK 找到一个姿态”与“无碰撞路径规划成功”不是同一件事；目标在障碍物后时不会盲目执行。

---

## 12. ROS2-13：ros2_control、JointTrajectory 与 fake hardware

### 本讲唯一问题

MoveIt 规划出的轨迹如何经过控制器，成为设备可观测、可反馈的执行过程？

### 跟做步骤

1. 在 URDF/xacro 中声明每个关节的 command/state interface；先使用 fake hardware。
2. 启动 `controller_manager`、`joint_state_broadcaster` 和 `joint_trajectory_controller`。
3. 用 `ros2 control` 查看硬件组件、可用接口、控制器 lifecycle 与接口 claim 情况。
4. 发送包含 `positions` 与 `time_from_start` 的 `trajectory_msgs/JointTrajectory`；理解它与 `/joint_states` 的根本区别。
5. 优先走 `FollowJointTrajectory` action，读取成功、取消、超时和容差失败结果；topic 方式只用于无需执行反馈的情形。
6. 将 ROS2-12 的规划结果交给控制器；观察控制器状态、实际关节状态和 RViz 路径。
7. 最后画出未来替换点：fake hardware 的 `read()/write()` 将如何替换为厂商 ROS 驱动或自写总线接口。

### 通过门槛

能清楚说出四条数据流：规划轨迹、控制器命令、硬件状态、RViz 状态；并能从 action 结果判断“规划成功”和“执行成功”是否同时成立。

---

## 13. 后续实际六轴接入（ROS2-14，暂不实施）

实际机械手到位后再补齐，不在当前阶段假设协议：

```text
厂商 ROS2 驱动 / SDK
→ 网络、CAN、EtherCAT 或串口通信
→ 控制柜状态、使能、急停、保护停机
→ 编码器、限位、力传感器反馈
→ 控制模式切换、速度缩放、故障恢复
→ 工位级状态机与安全互锁
```

这里的硬件接口不是“写几个串口命令”而已。它必须明确 `read()` 读什么状态、`write()` 写什么命令、什么错误需要禁止后续动作。

---

## 14. 参考资料（只作为工程事实核对）

- [MoveIt 2 Quickstart in RViz](https://moveit.picknik.ai/main/doc/tutorials/quickstart_in_rviz/quickstart_in_rviz_tutorial.html)：规划场景、目标状态、Cartesian path 与仿真执行的可视化。
- [MoveGroupInterface](https://moveit.picknik.ai/main/doc/examples/move_group_interface/move_group_interface_tutorial.html)：客户端如何通过 MoveGroup 设置 joint/Pose 目标、规划场景与执行。
- [ros2_control 概览](https://control.ros.org/jazzy/doc/ros2_control/doc/index.html)：controller manager、hardware component、mock component 和生命周期。
- [joint_trajectory_controller](https://control.ros.org/jazzy/doc/ros2_controllers/joint_trajectory_controller/doc/userdoc.html)：`JointTrajectory`、action、状态反馈和接口要求。
- [UR ROS2 Driver hardware interface](https://github.com/UniversalRobots/Universal_Robots_ROS2_Driver/blob/main/ur_robot_driver/doc/hardware_interface.rst)：真实厂商驱动中硬件接口和控制器的职责分界。

---

## 15. 13 之后的进阶路线：按“能交付机械臂项目”的先后，不按名词堆砌

13 结束后，已经具备了“离线规划一条无碰撞轨迹，并经标准控制器在 fake hardware 执行”的最小闭环。下一段不应立刻跳进复杂的强化学习、SLAM 或通用大模型，而要补齐工业机械臂最常遇到的四个缺口：**在线性、精度、接触、可靠性**。

| 优先级 | 拟定笔记 | 解决的真实问题 | 先决条件 | 可交付的可见成果 |
| --- | --- | --- | --- | --- |
| P0（有真机时） | ROS2-14 真机接入、状态机与安全边界 | 怎么从 fake hardware 换到厂商驱动，并明确什么情况下绝不能发动作 | 13；明确型号、ROS 发行版、厂商控制模式与现场权限 | 使能/故障/保护停机状态可见；一个安全的 home 动作能被批准、执行、取消和恢复 |
| P0（无真机也能学） | ROS2-15 MoveIt Servo 与在线速度控制 | 手柄、视觉或上层算法持续给“速度”，机械臂如何连续响应并限速、避碰、远离奇异 | 08–09、12–13 | 键盘/手柄给 TCP Twist；RViz/fake hardware 中连续跟随，接近限位、碰撞或奇异时减速/停止 |
| P1 | ROS2-16 工位标定、TCP 与精度误差预算 | 为什么“规划到了坐标”却没有真正对准工件 | 10；真机/工装到位时再实测 | base、workpiece、tool0、TCP 的标定链；位置误差按来源拆分，而不是只说“不准” |
| P1 | ROS2-17 相机坐标、手眼标定与视觉闭环 | 相机识别出的目标如何可靠地变成机器人目标 | 10、15；相机内参 | eye-to-hand / eye-in-hand 的 TF 链；采样、残差与失败数据可追溯 |
| P1 | ROS2-18 动力学、轨迹参数化与柔顺控制 | 不只是“到达”，还要控制速度、加速度、力和接触行为 | 当前 Craig 动力学主线、13 | 重力补偿/前馈的概念验证；速度/加速度/jerk 约束；阻抗或导纳的单轴仿真 |
| P2 | ROS2-19 任务状态机、I/O 与异常恢复 | 一个工位怎样持续运行而不是只演示一次动作 | 13–15 | 初始化→取位→作业→放置→完成/故障恢复；每一步有前置条件、超时和回退 |
| P2 | ROS2-20 诊断、rosbag、回归与部署 | 出问题后怎么复现、定位、验证修改没有带来退化 | 13、19 | 日志、诊断指标、bag 回放、launch/integration test；一个可重复的验收脚本 |

### 推荐学习顺序

```text
13 fake hardware 闭环
 ├─ 无真机现在就做：15 在线 Servo → 16 精度/标定理论 → 17 手眼标定仿真 → 18 动力学/柔顺控制
 └─ 真机可用时再做：14 厂商驱动与安全边界 → 19 工位状态机/I-O → 20 诊断与回归
```

这不是两条互斥路线。15–18 先建立“算法和坐标的心智模型”；14、19、20 等真实设备到位后把它落到受控现场。这样不会因为暂时没有六轴，学习主线停下来。

---

## 16. 各主题为什么和目标岗位直接相关

### ROS2-15：MoveIt Servo 与在线速度控制

离线规划适合“从 A 到 B”。但示教、视觉纠偏、远程操作、目标在动、人工微调都需要以更高频率连续接收关节速度或 TCP 速度命令。MoveIt Servo 可以接收 joint velocity、末端速度或末端 pose 命令，并在参数允许的范围内输出关节轨迹；它还具备奇异和碰撞相关的保护能力。这里学习的重点不是“让手柄动起来”，而是：参考坐标系、速度上限、延迟、停止条件、奇异接近和控制器输出接口。

**不在本讲承诺的事情：** Servo 的软件保护不能替代真实设备的急停、安全 PLC、保护区和风险评估。

### ROS2-16：标定、TCP 与精度

重复精度好不代表绝对精度好。一个末端偏差可能来自：base 安装误差、关节零位、连杆参数、TCP 长度、工件坐标、相机外参、负载挠度和温漂。该阶段将每一个误差放回明确的 frame/参数，而不是笼统调 IK。

**核心产物：** 一张误差预算表与一条可复现的标定流程；先校什么、怎么验证、哪一种残差表示哪个环节有问题。

### ROS2-17：视觉与手眼标定

视觉系统输出的是 <code>camera_frame</code> 下的目标，不是机器人可直接执行的 <code>base_link</code> 下目标。必须通过 TF 链连接：

```text
eye-to-hand: base_link → camera_link → target
eye-in-hand: base_link → tool0 → camera_link → target
```

手眼标定的输入是多组机器人末端位姿与相机观测，而不是拍一张照片就能得到外参。MoveIt Calibration 官方教程同时说明了 eye-in-hand/eye-to-hand 的坐标语义、相机内参和多姿态采样要求。

### ROS2-18：动力学与柔顺控制

这是对应 JD 中“动力学建模、参数辨识、重力/摩擦补偿、力控/阻抗控制”的一段，但不能直接在真机上跳着做。顺序是：

```text
RNEA / 质量矩阵 / 重力项的可计算模型
→ 轨迹的速度、加速度、jerk 与扭矩边界
→ 重力与摩擦前馈
→ 单轴接触仿真
→ 阻抗 / 导纳
→ 有力传感器与安全限制时的真机验证
```

其中“阻抗”和“导纳”要通过输入输出区分：阻抗控制从位移/速度误差产生期望力；导纳控制从测得外力产生位移/速度修正。二者都不是把 PID 的名字换一下。

### ROS2-19/20：把单次演示变成可维护系统

任务状态机负责业务流程与恢复，不负责高频伺服；controller 负责实时关节闭环，不负责决定下一件工件做什么。两层边界清楚，才能在超时、工件缺失、视觉失败、保护停机、通信丢失时给出受控回退。

再向后必须学会用 rosbag、TF/控制器诊断、时间戳和 launch/integration test 复现问题。工程能力不只是“当天能跑”，而是任何一次参数修改后能回答：它改了什么、怎么验证、会不会破坏已有工位行为。

---

## 17. 进阶资料（只作为工程事实核对）

- [MoveIt Servo 官方文档](https://moveit.picknik.ai/main/doc/examples/realtime_servo/realtime_servo_tutorial.html)：关节速度、末端速度与位姿命令的输入边界，以及输出关节轨迹的方式。
- [MoveIt Hand-Eye Calibration](https://moveit.picknik.ai/main/doc/examples/hand_eye_calibration/hand_eye_calibration_tutorial.html)：eye-in-hand/eye-to-hand、内参、TF 语义与多姿态采样。
- [ros2_control Controller Manager](https://control.ros.org/jazzy/doc/ros2_control/controller_manager/doc/userdoc.html)：控制器/硬件生命周期、实时 update loop 和 command limit 的职责。
- [ros2_control 六自由度完整示例](https://control.ros.org/master/doc/ros2_control_demos/example_7/doc/userdoc.html)：从 URDF、Hardware Interface 到 controller 的完整六轴骨架。版本应当以未来实际使用的 ROS 发行版为准。
