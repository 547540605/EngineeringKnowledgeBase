# ROS2-04～10 实施 Review 矩阵：3R 从位置 IK 到工位坐标

用途：交给实际实现 ROS 2 工作区的人，也用于后续 code review。

当前仓库没有 ROS 2 源码工作区；本文件定义将来实现必须提供的证据，不声称这些包、命令或运行结果已经存在。

## 0. 冻结约定

实施中不得为了让公式“对上”而改动下列模型含义：

| 项 | 固定约定 |
| --- | --- |
| joints | joint1 绕 +Z；joint2、joint3 绕各自局部 +Y |
| limits | joint1 [-3.14, 3.14]；joint2 [-1.57, 1.57]；joint3 [-2.00, 2.00] rad |
| geometry | d=0.25 m；L1=0.50 m；L2=0.40 m |
| frames | base_link → link1 → link2 → link3 → tool0 |

实施前必须记录实际 ROS 发行版、Python 版本、工作区路径、URDF/Xacro 权威来源、启动命令和依赖版本。没有这些记录，不能宣称工程可复现。

## 1. 总体顺序

1. S2：ROS2-04/05，FK、解析 IK、限位、连续选支。
2. S3：ROS2-06/07，笛卡尔采样、整段预扫描、Marker。
3. S4：ROS2-08/09，Jacobian、有限差分、DLS。
4. S5：ROS2-10，TF2 工位目标转换。

每个切片失败时必须停在本切片；禁止用下游 RViz 动画掩盖上游数值问题。

## 2. S2：单点 IK 与连续选支

### 最小交付物

| 模块 | 必须提供 | 禁止行为 |
| --- | --- | --- |
| my_arm_motion/kinematics_3r.py | forward_position、几何可达检查、两支 IK 候选、FK 回代误差 | Node、Marker、joint_states 发布 |
| my_arm_motion/selection.py | 限位筛选、角度 wrap、距 previous_q 的带权代价、失败原因 | 取候选数组第一项 |
| test/test_kinematics_3r.py | FK→IK→FK、边界和失败例、限位例 | 只测一个手工样例 |

### 必测情形

| 情形 | 必须断言的结果 |
| --- | --- |
| 一般可达点 | FK 生成 P 后，至少一支 IK 候选合法，FK 回代位置误差在明确阈值内 |
| 双支解 | 正、负 q3 两支都保留，不能在求解器内部丢掉一支 |
| 几何不可达 | 返回结构化失败，不产生 NaN 或 acos 领域错误 |
| Z 轴目标 | 返回 axis_ambiguous；不能默选 q1=0 |
| 受限不可达 | 返回 joint_limited；不能裁剪角度后报告成功 |
| 连续点列 | q3 不无理由翻符号；记录各候选代价和最终选择 |
| ±π 邻域 | 角距离使用 wrap，不把临近角误判成相差 2π |

### S2 通过证据

1. unit test 输出或 CI 结果；
2. 可达点的双候选、限位和 FK 误差日志；
3. 不可达、轴向歧义、受限不可达的结构化失败日志；
4. 连续路径的 previous_q、candidates、selected 记录。

## 3. S3：直线采样与 Marker

| 模块 | 必须提供 | 禁止行为 |
| --- | --- | --- |
| my_arm_motion/cartesian_path.py | 五次时间律、A→B 点列、整段 IK 预扫描、每点 FK 误差 | 把关节线性插值称为笛卡尔直线 |
| my_arm_motion/marker_publisher.py | 目标轨迹、FK 实际轨迹、当前点；固定 base_link | 一条线混淆目标与实际 |
| test/test_cartesian_path.py | 端点、共线性、单调时间、失败点定位 | 只检查最终点 |

### S3 必查项

- 五次时间律满足端点位置、速度、加速度条件。
- 任一点 P(t)=A+s(t)(B-A)，到 A-B 直线的距离在数值阈值内。
- 预扫描失败时返回第一失败点和原因，且不开始该段发布。
- Marker 的目标线、FK 实际线 namespace/color 不同，点数有上限。

通过证据：正常路径的采样数、最大 FK 误差和分支摘要；故意失败路径的失败摘要；同图可见目标线、实际线、当前点的 RViz 证据。

## 4. S4：Jacobian 与 DLS

| 模块 | 必须提供 | 禁止行为 |
| --- | --- | --- |
| my_arm_motion/jacobian_3r.py | 3×3 位置 Jacobian、最小奇异值或条件指标、DLS | 把 Jacobian 当全局 FK |
| test/test_jacobian_3r.py | 解析列与有限差分对照、远离/接近奇异的速度边界 | 任意姿态直接矩阵求逆 |

### S4 必查项

- 小 Δq 下，J(q)Δq 与 FK(q+Δq)-FK(q) 的差在阈值内。
- 远离奇异时，普通逆与 DLS 结果接近。
- 接近奇异时，记录 sigma_min、lambda、关节速度限幅和残余末端误差。
- 奇异位形规避不是避障；碰撞由规划场景处理。

通过证据：多个姿态的解析-vs-数值误差表；远离/接近奇异的 q_dot 与残余误差对照；限速触发日志。

## 5. S5：TF2 工位目标进入 base_link

| 模块 | 必须提供 | 禁止行为 |
| --- | --- | --- |
| my_arm_bringup launch/config | 静态 world/workcell/camera，动态 target 的来源和时间语义 | 把外部坐标直接送进 IK |
| 目标转换函数/节点 | 查询 base_link ← target、超时/缺帧/旧时间戳失败 | 失败后静默沿用旧目标 |
| launch/integration test | TF 树、成功转换、缺失变换、超时的处理 | 只凭 RViz 截图证明正确 |

### S5 必查项

- 修改 world→workcell 后，不改 IK 代码，base_link 下目标应正确更新。
- 查询返回 frame、stamp 与转换结果。
- transform 缺失或过期时，禁止把 camera/world 原始数值交给 IK。
- 静态/动态变换不能由多个节点竞争广播。

通过证据：带时间信息的 tf2_echo 或等价输出；TF Display 与目标 Marker；成功、缺变换、超时三类日志；工位安装位姿改变后的回归记录。

## 6. 每次 review 的固定提问

1. 输入在哪个 frame、单位和时间戳下？
2. 成功、不可达、限位、超时分别返回什么？
3. 下游凭什么确信上游结果新鲜且合法？
4. RViz 中这条线是目标、FK 实际还是传感器观测？
5. joint 名、URDF 轴、单位或接口变了，哪一个检查会最先失败？

任何问题没有证据，就停留在 review，不进入六轴、MoveIt 或真机控制。

## 7. 关联入口

- [ROS2-04～13 路线](04-13-engineering-roadmap.md)
- [ROS2-04：单点 IK](04-3r-analytic-ik.html)
- [ROS2-05：连续选支](05-ik-continuity-and-limits.html)
- [ROS2-06：笛卡尔直线](06-cartesian-line-and-time-law.html)
- [ROS2-07：Marker](07-rviz-trajectory-markers.html)
- [ROS2-08：Jacobian](08-3r-position-jacobian.html)
- [ROS2-09：DLS 与奇异](09-differential-ik-and-singularity.html)
- [ROS2-10：TF2](10-tf2-workcell-frames.html)
- [全阶段实施交接规格](implementation-handoff.md)
