# ROS 2 实施交接规格：从 3R 数字孪生到六轴工位闭环

> 角色分工：本文件给后续实施者使用。它定义要创建的包、接口契约、分阶段验收和 review 红线；不把当前仓库伪装成已经存在可运行的 ROS 2 工作区。

## 0. 当前事实与范围

当前仓库的权威内容是 ROS2-01～20 学习页；没有 `src/`、`package.xml`、`setup.py` 或已构建的 `ros2_ws`。因此下文的文件树是**待实施目标**，不是对现有文件的描述。

已有 3R 教学模型的固定运动学约定：

```text
joint1: 绕 +Z 回转，limit [-3.14, 3.14] rad
joint2: 绕局部 +Y 俯仰，limit [-1.57, 1.57] rad
joint3: 绕局部 +Y 俯仰，limit [-2.00, 2.00] rad

d  = 0.25 m       # base → shoulder
L1 = 0.50 m       # shoulder → elbow
L2 = 0.40 m       # elbow → tool0
```

ROS2-03 的 `my_arm_description` 是早期“描述 + 正弦波演示”教学包。ROS2-04 起，应将可测试的运动学/轨迹逻辑拆到 `my_arm_motion`，避免把算法、URDF 和 launch 混在一起。

### 绝对红线

1. `/joint_states` 只作为数字孪生/状态发布输入，绝不当作通用真机命令接口。
2. 真机轨迹要经过 `joint_trajectory_controller` 的 `FollowJointTrajectory` action；规划成功不等于执行成功。
3. 不把 Servo、碰撞检查、状态机当作急停、安全 PLC 或现场安全认证功能。
4. 不假定未来六轴品牌、关节名、控制协议或 ROS 发行版；涉及这些内容都由实际设备资料覆盖。
5. 不以 RViz “看起来能动”作为模型、控制器或真机正确性的唯一证据。

---

## 1. 目标工作区与职责边界

建议在 Linux/ROS 2 环境中新建工作区 `~/ros2_ws`；不要把 `build/`、`install/`、`log/` 提交到资料仓库。

```text
ros2_ws/src/
├── my_arm_description/        # URDF/Xacro、mesh、RViz、纯描述启动
│   ├── urdf/
│   ├── rviz/
│   └── launch/view.launch.py
├── my_arm_motion/             # 与 ROS 隔离的 FK/IK/插补/Jacobian + ROS 演示节点
│   ├── my_arm_motion/
│   │   ├── kinematics_3r.py
│   │   ├── cartesian_path.py
│   │   ├── jacobian_3r.py
│   │   └── marker_publisher.py
│   └── test/
├── my_arm_bringup/            # 只编排节点、参数、frame 和 demo 启动
│   ├── config/
│   └── launch/
├── my_arm_control/            # ros2_control 标签、controller YAML、fake hardware 启动
│   ├── config/controllers.yaml
│   └── launch/fake_control.launch.py
├── my_arm_moveit_config/      # MoveIt Setup Assistant 生成后经 review 的配置
│   ├── config/
│   └── launch/
└── my_arm_cell/               # 后期：任务状态机、mock I/O、诊断与 bag 测试
    ├── config/
    ├── my_arm_cell/
    └── test/
```

### 每个包只能回答一个问题

| 包 | 应承担 | 不应承担 |
| --- | --- | --- |
| `my_arm_description` | link/joint、visual/collision/inertial、固定 TCP、RViz 展示 | IK、控制器参数、工位状态机 |
| `my_arm_motion` | 3R 纯函数、路径采样、有限的演示节点与 Marker | 厂商网络协议、直接设备写命令 |
| `my_arm_bringup` | launch 编排、参数注入、演示入口 | 复制算法实现 |
| `my_arm_control` | ros2_control 接口、fake hardware、controller 参数 | 规划场景、视觉策略 |
| `my_arm_moveit_config` | SRDF、运动学/规划/控制器映射 | 修改真实 URDF 真值来“修规划” |
| `my_arm_cell` | 任务状态、mock I/O、错误归类、诊断与回归 | 高频关节伺服、安全功能替代 |

---

## 2. 不可变接口契约

### 2.1 名称与 frame

```text
3R joints: joint1, joint2, joint3
3R frames: base_link → link1 → link2 → link3 → tool0

六轴阶段：由选定 URDF 的真实 joint/link 名称定义；不得为了套教学代码改名。
任务 TCP: tool0（必要时 flange → tool0 为固定 joint）
```

任何实施者在将 3R 代码迁到六轴前，必须创建显式映射，而不是假定 `joint1` 等于 `joint_1`。

### 2.2 3R 纯函数 contract

```python
forward_position(q1: float, q2: float, q3: float) -> tuple[float, float, float]

solve_position_ik(
    x: float, y: float, z: float,
    *, previous_q: tuple[float, float, float] | None = None,
) -> IKResult
```

`IKResult` 至少包含：

```text
reachable_geometry: bool
candidates: 每支的 q、是否满足关节限位、FK 回代误差
selected: 仅当存在可执行候选时给出
reason: out_of_workspace / joint_limited / axis_ambiguous / ok
```

禁止的 API 行为：目标不可达时 clamp 成一个限位角后仍报告成功；目标在 base Z 轴时默默把 `atan2(0,0)` 当作普通腰部角。

### 2.3 路径与可视化 contract

```text
输入：base_link 下的起点 A、终点 B、时长 T、采样频率、上一时刻关节解
输出：带时间的关节候选序列、每点 FK 位置、失败点与失败原因
```

目标直线和 FK 实际轨迹必须使用不同的 Marker namespace/color；不允许只画目标线就声称 TCP 实际走直线。

### 2.4 真实控制 contract

```text
MoveIt / Servo output
  → joint_trajectory_controller
  → FollowJointTrajectory action feedback/result
  → hardware state → joint_state_broadcaster → /joint_states
```

控制器 `joints` 顺序、URDF joints、SRDF group 和轨迹 `joint_names` 必须逐项相同。任何一层变更都要求相应的启动检查和回归测试。

---

## 3. 实施切片与验收门槛

每个切片完成后再进入下一切片。不得为了“端到端演示”跳过上游测试。

ROS2-04～10 的逐项源文件职责、失败用例与 review 证据，见 [04～10 实施 Review 矩阵](04-10-review-matrix.md)。本节保留全阶段切片边界；矩阵负责把 S2～S5 细化为可审查的问题清单。

| 切片 | 对应学习页 | 实施任务 | 必须给出的证据 |
| --- | --- | --- | --- |
| S1 | 02–03 | 3R URDF、`robot_state_publisher`、可控 `/joint_states` 演示 | `base_link→tool0` TF 与已知关节姿态匹配；关节名完全一致 |
| S2 | 04–05 | FK/解析 IK、双支候选、限位/连续选择 | unit test：随机可达点 FK→IK→FK；越界/轴线目标的明确错误结果 |
| S3 | 06–07 | 直线采样、五次时间律、Marker 对照 | 目标线与实际 FK 线同图；每采样点误差、失败点可读取 |
| S4 | 08–09 | Jacobian、有限差分、DLS | 解析 Jacobian 与有限差分误差门槛；奇异接近时无无穷大关节速度 |
| S5 | 10 | workcell/base/tool/target TF2 变换 | static/dynamic frame 分开；带 timestamp 的转换失败可被拒绝 |
| S6 | 11–13 | 六轴 URDF/SRDF、MoveIt、fake hardware、轨迹 Action | Planning Group/TCP 正确；无障碍/有障碍规划对比；Action 成功/取消/失败可区分 |
| S7 | 15 | MoveIt Servo | 固定 frame Twist 可复现；命令超时、关节限位、奇异/碰撞缩放有观测证据 |
| S8 | 16–18 | 标定数据结构、视觉 TF、动力学离线计算 | 合成数据与未参与拟合的验证数据分开；真机步骤明确标注为待设备到位 |
| S9 | 19–20 | 状态机、mock I/O、bag/回归 | 规划失败、Action 中止、I/O 超时、TF 过期均进入预期 FAULT；能回放复现 |

---

## 4. Review 必查项

### 模型与坐标

- 每个 revolute joint 的 `<axis>` 是在 joint 坐标，不是“屏幕观察到的轴”。
- `origin`、零位、连杆尺寸均由 URDF/图纸来源说明；不要由 SVG 或视觉估算反推。
- `tool0` 的位置和朝向来自工具定义；更换工具有独立标定版本。
- 目标 Pose 永远包含 reference frame、timestamp（动态场景）和 TCP link。

### 算法与数值

- trig 求解前检查可达域；浮点 clamp 只允许处理边界微小误差。
- IK 多解有可解释选择策略：连续性、限位余量、任务偏好；不是数组第一个。
- Jacobian 有有限差分单元测试；DLS 阻尼和阈值可配置、可记录。
- 笛卡尔路径的 `fraction < 1.0` 一律视为未完成，不可当完整工艺轨迹执行。

### ROS/控制

- `robot_state_publisher` 从状态生成 TF；不承担 IK、碰撞或真机命令。
- controller 已 active、接口 claim 正确、joint state 新鲜，才允许提交 Action。
- Action result 进入状态机；禁止仅凭“发送成功”进入下一工艺步骤。
- Servo 的输入 `frame_id`、command timeout、输出 topic/type 与 controller 配置均有集成验证。

### 工程可靠性

- 每个计划/执行/视觉目标带 cycle ID、goal ID 和配置版本。
- 失败日志中保留状态、TF/scene/控制器/I/O 时间戳；bag 有白名单和容量策略。
- 物理接触、真机速度、扭矩、使能、急停和安全回路从不被 mock/fake test 宣称为已验证。

---

## 5. 未来真机接入前必须补齐的信息

以下信息不足时，ROS2-14 只能停留在设计，不允许臆造 launch 或驱动代码：

```text
1. 机械臂品牌、型号、控制柜/驱动版本、实际 ROS 发行版
2. 厂商是否提供 ROS 2 driver；支持的控制模式和官方 joint/TF 命名
3. 网络/现场总线方式、是否允许外部控制、通信/权限流程
4. 真实 joint limit、速度/加速度/负载与工具法兰参数
5. 急停/保护停机/使能/门锁等安全接口的责任边界
6. 可用的工装、TCP 定义、工件 frame 基准、I/O 点表
7. 有无相机、力传感器；其时间同步、内参、驱动与数据权限
```

收到这些资料后，实施者应先输出“厂商接口 → ros2_control Hardware Interface → controller → MoveIt → 任务层”的映射评审，而不是直接连真机。

---

## 6. 交付物定义

每个实施切片提交时至少包含：

1. 源码与配置；
2. 可重复启动说明（环境版本、依赖、启动顺序）；
3. 正常路径演示证据；
4. 至少一个对应失败路径的证据；
5. 自动化 unit/launch/integration test 或清晰说明为何该项只能真机验收；
6. 已知边界与下一切片的输入/输出约定。

这样 review 的问题才从“它好像能动”升级为“它是否实现了约定的接口和失败行为”。
