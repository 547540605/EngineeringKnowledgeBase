"""
Inject explicit Knowledge Graph backlink banners into all 74 LearningLab HTML notes.
Ensures full bidirectional navigation between LearningLab simulation/study pages
and the core single-topic Knowledge Graph Markdown documents.
"""

from pathlib import Path
from bs4 import BeautifulSoup
import re

import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT = Path(__file__).resolve().parents[1]
LEARNING_LAB = ROOT / "Engineering" / "Robotics" / "LearningLab"

MAPPING = {
    # 基础与运动学 (Kinematics)
    "01-coordinate-frames.html": (
        "../Kinematics/Coordinate-Frames-and-Point-Mapping/index.html",
        "坐标系与点的位置映射 (Coordinate-Frames-and-Point-Mapping)"
    ),
    "02-homogeneous-transform.html": (
        "../Kinematics/Homogeneous-Transformation-Matrices/index.html",
        "齐次变换矩阵与特殊欧氏群 SE(3) (Homogeneous-Transformation-Matrices)"
    ),
    "03-transform-chains.html": (
        "../Kinematics/Kinematic-Transformation-Chains/index.html",
        "运动学坐标变换链与多系复合 (Kinematic-Transformation-Chains)"
    ),
    "04-planar-two-link-forward-kinematics.html": (
        "../Kinematics/Planar-Two-Link-Forward-Kinematics/index.html",
        "平面两连杆正运动学 (Planar-Two-Link-Forward-Kinematics)"
    ),
    "05-3d-single-axis-rotations.html": (
        "../Kinematics/SO3-Single-Axis-Rotation-Matrices/index.html",
        "三维单轴旋转矩阵 SO(3) (SO3-Single-Axis-Rotation-Matrices)"
    ),
    "06-3d-arm-coordinate-frames.html": (
        "../Kinematics/Spatial-Arm-Coordinate-Assignment/index.html",
        "空间机械臂坐标系分配准则 (Spatial-Arm-Coordinate-Assignment)"
    ),
    "07-foundation-review-quiz.html": (
        "../Kinematics/index.html",
        "机器人运动学体系总览 (Robot Kinematics)"
    ),
    "08-dh-coordinate-assignment.html": (
        "../Kinematics/Denavit-Hartenberg-Frame-Rules/index.html",
        "DH 建系法则与参数定义 (Denavit-Hartenberg-Frame-Rules)"
    ),
    "09-dh-single-link-transform.html": (
        "../Kinematics/DH-Single-Link-Transformation-Matrix/index.html",
        "单连杆 DH 变换矩阵推导 (DH-Single-Link-Transformation-Matrix)"
    ),
    "10-dh-table-to-forward-kinematics.html": (
        "../Kinematics/DH-Table-to-Forward-Kinematics/index.html",
        "DH 参数表到全局正运动学 (DH-Table-to-Forward-Kinematics)"
    ),
    "11-dh-review-quiz.html": (
        "../Kinematics/Denavit-Hartenberg-Frame-Rules/index.html",
        "DH 建系法则与参数定义 (Denavit-Hartenberg-Frame-Rules)"
    ),
    "12-planar-two-link-inverse-kinematics.html": (
        "../Kinematics/Analytic-Inverse-Kinematics-Planar-2R/index.html",
        "平面 2R 解析逆运动学双解法 (Analytic-Inverse-Kinematics-Planar-2R)"
    ),
    "13-planar-forward-inverse-quiz.html": (
        "../Kinematics/Analytic-Inverse-Kinematics-Planar-2R/index.html",
        "平面 2R 解析逆运动学双解法 (Analytic-Inverse-Kinematics-Planar-2R)"
    ),
    "14-planar-two-link-jacobian.html": (
        "../Kinematics/Jacobian-Matrix-Geometric-Derivation/index.html",
        "雅可比矩阵几何推导与定义 (Jacobian-Matrix-Geometric-Derivation)"
    ),
    "15-planar-two-link-singularity.html": (
        "../Kinematics/Kinematic-Singularity-and-Decoupling/index.html",
        "运动学奇异性与解耦 (Kinematic-Singularity-and-Decoupling)"
    ),
    "16-planar-jacobian-velocity.html": (
        "../Kinematics/Jacobian-Velocity-Mapping/index.html",
        "雅可比速度映射与速度/力椭球 (Jacobian-Velocity-Mapping)"
    ),
    "17-planar-inverse-velocity.html": (
        "../Kinematics/Inverse-Velocity-Kinematics/index.html",
        "逆速度运动学求解 (Inverse-Velocity-Kinematics)"
    ),
    "18-resolved-rate-motion.html": (
        "../Kinematics/Resolved-Rate-Motion-Control/index.html",
        "速度分解运动控制 CLIK (Resolved-Rate-Motion-Control)"
    ),
    "19-time-varying-position-velocity.html": (
        "../Kinematics/Resolved-Rate-Motion-Control/index.html",
        "速度分解运动控制 CLIK (Resolved-Rate-Motion-Control)"
    ),
    "20-velocity-jacobian-review-quiz.html": (
        "../Kinematics/index.html",
        "机器人运动学体系总览 (Robot Kinematics)"
    ),
    "21-spatial-rigid-body-velocity.html": (
        "../Kinematics/Link-to-Link-Velocity-Propagation/index.html",
        "连杆间速度与加速度递推外推 (Link-to-Link-Velocity-Propagation)"
    ),
    "22-velocity-propagation.html": (
        "../Kinematics/Link-to-Link-Velocity-Propagation/index.html",
        "连杆间速度与加速度递推外推 (Link-to-Link-Velocity-Propagation)"
    ),
    "23-angular-velocity-propagation.html": (
        "../Kinematics/Link-to-Link-Velocity-Propagation/index.html",
        "连杆间速度与加速度递推外推 (Link-to-Link-Velocity-Propagation)"
    ),
    "24-linear-velocity-propagation.html": (
        "../Kinematics/Link-to-Link-Velocity-Propagation/index.html",
        "连杆间速度与加速度递推外推 (Link-to-Link-Velocity-Propagation)"
    ),
    "25-two-link-velocity-recursion.html": (
        "../Kinematics/Link-to-Link-Velocity-Propagation/index.html",
        "连杆间速度与加速度递推外推 (Link-to-Link-Velocity-Propagation)"
    ),

    # 动力学 (Dynamics)
    "26-single-joint-dynamics.html": (
        "../Dynamics/Single-Joint-Dynamics-Inertia-Gravity-Friction/index.html",
        "单关节动力学模型 (Single-Joint-Dynamics-Inertia-Gravity-Friction)"
    ),
    "27-recursive-newton-euler-dynamics.html": (
        "../Dynamics/RNEA-Outward-Inward-Two-Passes/index.html",
        "递归牛顿-欧拉算法 RNEA (RNEA-Outward-Inward-Two-Passes)"
    ),
    "28-recursive-newton-euler-dynamics.html": (
        "../Dynamics/RNEA-Outward-Inward-Two-Passes/index.html",
        "递归牛顿-欧拉算法 RNEA (RNEA-Outward-Inward-Two-Passes)"
    ),
    "29-recursive-newton-euler-dynamics.html": (
        "../Dynamics/RNEA-Outward-Inward-Two-Passes/index.html",
        "递归牛顿-欧拉算法 RNEA (RNEA-Outward-Inward-Two-Passes)"
    ),
    "30-recursive-newton-euler-dynamics.html": (
        "../Dynamics/RNEA-Outward-Inward-Two-Passes/index.html",
        "递归牛顿-欧拉算法 RNEA (RNEA-Outward-Inward-Two-Passes)"
    ),
    "31-rnea-overview.html": (
        "../Dynamics/RNEA-Outward-Inward-Two-Passes/index.html",
        "递归牛顿-欧拉算法 RNEA (RNEA-Outward-Inward-Two-Passes)"
    ),
    "31a-newton-euler-force-balance.html": (
        "../Dynamics/Newton-Euler-Equations-Isolated-Body/index.html",
        "隔离体牛顿-欧拉方程 (Newton-Euler-Equations-Isolated-Body)"
    ),
    "31b-rnea-forward-backward-pass.html": (
        "../Dynamics/RNEA-Outward-Inward-Two-Passes/index.html",
        "递归牛顿-欧拉算法 RNEA (RNEA-Outward-Inward-Two-Passes)"
    ),
    "31c-rnea-two-link-simulation-lab.html": (
        "../Dynamics/RNEA-Outward-Inward-Two-Passes/index.html",
        "递归牛顿-欧拉算法 RNEA (RNEA-Outward-Inward-Two-Passes)"
    ),
    "31d-rnea-four-torque-terms.html": (
        "../Dynamics/RNEA-Four-Torque-Components-Deep-Dive/index.html",
        "RNEA 驱动力矩四项物理分解 (RNEA-Four-Torque-Components-Deep-Dive)"
    ),
    "32-two-link-dynamics-structure.html": (
        "../Dynamics/Planar-Two-Link-Dynamics-Equation-M-C-G/index.html",
        "两连杆动力学标准型 M-C-G (Planar-Two-Link-Dynamics-Equation-M-C-G)"
    ),
    "38-dynamics-parameter-identification.html": (
        "../Dynamics/Dynamics-Parameter-Identification-Regression/index.html",
        "动力学参数线性回归辨识 (Dynamics-Parameter-Identification-Regression)"
    ),

    # 控制 (Control)
    "33-trajectory-time-laws.html": (
        "../Control/Trajectory-Time-Laws-Cubic-Quintic-LSPB/index.html",
        "机械臂轨迹规划时间律 (Trajectory-Time-Laws-Cubic-Quintic-LSPB)"
    ),
    "34-pid-position-control.html": (
        "../Control/Single-Joint-PD-PID-Position-Control/index.html",
        "单关节 PD/PID 位置闭环控制 (Single-Joint-PD-PID-Position-Control)"
    ),
    "35-computed-torque-control.html": (
        "../Control/Computed-Torque-Control-CTC/index.html",
        "计算力矩控制 CTC (Computed-Torque-Control-CTC)"
    ),
    "36-force-impedance-admittance-control.html": (
        "../Force-Control-and-Compliant-Assembly/NISTIR-7901-Force-Control-Algorithms/index.html",
        "力控制算法与闭环控制 (NISTIR-7901-Force-Control-Algorithms)"
    ),
    "37-two-link-closed-loop-simulation.html": (
        "../Control/Computed-Torque-Control-CTC/index.html",
        "计算力矩控制 CTC (Computed-Torque-Control-CTC)"
    ),
    "39-servo-cascade-and-limits.html": (
        "../Control/Servo-Cascade-Loops-Current-Velocity-Position/index.html",
        "伺服驱动三环级联控制与带宽匹配 (Servo-Cascade-Loops-Current-Velocity-Position)"
    ),

    # 辅助、专题与归档页面
    "linear-algebra-homogeneous-coordinates.html": (
        "../Kinematics/Homogeneous-Transformation-Matrices/index.html",
        "齐次变换矩阵与特殊欧氏群 SE(3) (Homogeneous-Transformation-Matrices)"
    ),
    "project-01-portable-4axis-robot.html": (
        "../Kinematics/Spatial-Arm-Coordinate-Assignment/index.html",
        "空间机械臂坐标系分配准则 (Spatial-Arm-Coordinate-Assignment)"
    ),
    "quiz-center.html": (
        "../index.html",
        "机器人工程体系总览 (Robotics Knowledge Base)"
    ),
    "reader.html": (
        "00-progress.html",
        "LearningLab 实验区学习总览看板"
    ),
    "ref-dynamics-foundations-force-torque-inertia.html": (
        "../Dynamics/Single-Joint-Dynamics-Inertia-Gravity-Friction/index.html",
        "单关节动力学模型 (Single-Joint-Dynamics-Inertia-Gravity-Friction)"
    ),
    "ref-matrix-multiplication-and-frame-transform.html": (
        "../Kinematics/Coordinate-Frames-and-Point-Mapping/index.html",
        "坐标系与点的位置映射 (Coordinate-Frames-and-Point-Mapping)"
    ),
    "ref-rigid-body-rotation-foundations.html": (
        "../Kinematics/SO3-Single-Axis-Rotation-Matrices/index.html",
        "三维单轴旋转矩阵 SO(3) (SO3-Single-Axis-Rotation-Matrices)"
    ),
    "ref-spatial-inertia-tensor-euler-equations.html": (
        "../Dynamics/Newton-Euler-Equations-Isolated-Body/index.html",
        "隔离体牛顿-欧拉方程 (Newton-Euler-Equations-Isolated-Body)"
    ),
    "ref-velocity-derivative-vs-projection.html": (
        "../Kinematics/Link-to-Link-Velocity-Propagation/index.html",
        "连杆间速度与加速度递推外推 (Link-to-Link-Velocity-Propagation)"
    ),
    "archive/31-recursive-newton-euler-dynamics.html": (
        "../../Dynamics/RNEA-Outward-Inward-Two-Passes/index.html",
        "递归牛顿-欧拉算法 RNEA (RNEA-Outward-Inward-Two-Passes)"
    ),

    # 首页看板
    "00-progress.html": (
        "../index.html",
        "机器人工程体系总览 (Robotics Knowledge Base)"
    ),

    # ROS 2 专栏页面
    "ros2/00-progress.html": (
        "../../ROS2/index.html",
        "ROS 2 现代工业机器人工程架构体系 (ROS2)"
    ),
    "ros2/01-nodes-and-topics.html": (
        "../../ROS2/index.html",
        "ROS 2 现代工业机器人工程架构体系 (ROS2)"
    ),
    "ros2/02-urdf-and-arm-modeling.html": (
        "../../ROS2/ROS2-Industrial-Workcell-Frames-and-TF2/index.html",
        "工业工作站坐标系拓扑与 TF2 (ROS2-Industrial-Workcell-Frames-and-TF2)"
    ),
    "ros2/03-python-trajectory-control.html": (
        "../../ROS2/ROS2-Control-Hardware-Interface-Abstraction/index.html",
        "ros2_control 硬件接口抽象 (ROS2-Control-Hardware-Interface-Abstraction)"
    ),
    "ros2/04-3r-analytic-ik.html": (
        "../../Kinematics/Analytic-Inverse-Kinematics-Planar-2R/index.html",
        "平面 2R 解析逆运动学双解法 (Analytic-Inverse-Kinematics-Planar-2R)",
        "相关前置知识",
        " <span style=\"color: #94a3b8; font-size: 0.85rem;\">（3R 空间解算通过基座回转角将三维目标降维至垂直平面 2R 模型）</span>"
    ),
    "ros2/05-ik-continuity-and-limits.html": (
        "../../Kinematics/Analytic-Inverse-Kinematics-Planar-2R/index.html",
        "平面 2R 解析逆运动学双解法 (Analytic-Inverse-Kinematics-Planar-2R)"
    ),
    "ros2/06-cartesian-line-and-time-law.html": (
        "../../Control/Trajectory-Time-Laws-Cubic-Quintic-LSPB/index.html",
        "机械臂轨迹规划时间律 (Trajectory-Time-Laws-Cubic-Quintic-LSPB)"
    ),
    "ros2/07-rviz-trajectory-markers.html": (
        "../../ROS2/index.html",
        "ROS 2 现代工业机器人工程架构体系 (ROS2)"
    ),
    "ros2/08-3r-position-jacobian.html": (
        "../../Kinematics/Jacobian-Matrix-Geometric-Derivation/index.html",
        "雅可比矩阵几何推导与定义 (Jacobian-Matrix-Geometric-Derivation)"
    ),
    "ros2/09-differential-ik-and-singularity.html": (
        "../../Kinematics/Kinematic-Singularity-and-Decoupling/index.html",
        "运动学奇异性与解耦 (Kinematic-Singularity-and-Decoupling)"
    ),
    "ros2/10-tf2-workcell-frames.html": (
        "../../ROS2/ROS2-Industrial-Workcell-Frames-and-TF2/index.html",
        "工业工作站坐标系拓扑与 TF2 (ROS2-Industrial-Workcell-Frames-and-TF2)"
    ),
    "ros2/11-six-axis-moveit-config.html": (
        "../../ROS2/MoveIt2-Motion-Planning-Architecture/index.html",
        "MoveIt 2 运动规划架构 (MoveIt2-Motion-Planning-Architecture)"
    ),
    "ros2/12-moveit-pose-and-planning-scene.html": (
        "../../ROS2/MoveIt2-Motion-Planning-Architecture/index.html",
        "MoveIt 2 运动规划架构 (MoveIt2-Motion-Planning-Architecture)"
    ),
    "ros2/13-ros2-control-and-fake-hardware.html": (
        "../../ROS2/ROS2-Control-Hardware-Interface-Abstraction/index.html",
        "ros2_control 硬件接口抽象 (ROS2-Control-Hardware-Interface-Abstraction)"
    ),
    "ros2/15-moveit-servo-online-control.html": (
        "../../ROS2/MoveIt2-Motion-Planning-Architecture/index.html",
        "MoveIt 2 运动规划架构 (MoveIt2-Motion-Planning-Architecture)"
    ),
    "ros2/16-tcp-calibration-and-accuracy.html": (
        "../../ROS2/TCP-Calibration-Four-Point-Method/index.html",
        "工具中心点 (TCP) 标定算法 (TCP-Calibration-Four-Point-Method)"
    ),
    "ros2/17-hand-eye-calibration-and-visual-loop.html": (
        "../../ROS2/Hand-Eye-Calibration-Eye-in-Hand-and-Eye-to-Hand/index.html",
        "机器人手眼标定算法 (Hand-Eye-Calibration-Eye-in-Hand-and-Eye-to-Hand)"
    ),
    "ros2/18-dynamics-trajectory-and-compliance.html": (
        "../../Force-Control-and-Compliant-Assembly/NISTIR-7901-Force-Control-Algorithms/index.html",
        "力控制算法与闭环控制 (NISTIR-7901-Force-Control-Algorithms)"
    ),
    "ros2/19-task-state-machine-and-io.html": (
        "../../ROS2/index.html",
        "ROS 2 现代工业机器人工程架构体系 (ROS2)"
    ),
    "ros2/20-diagnostics-bag-and-regression.html": (
        "../../ROS2/index.html",
        "ROS 2 现代工业机器人工程架构体系 (ROS2)"
    ),
}


def make_banner_html(
    target_url: str,
    target_title: str,
    is_ros2: bool,
    is_archive: bool,
    label: str = "对应知识图谱专题",
    note: str = ""
) -> str:
    if is_ros2:
        dashboard_url = "00-progress.html"
        dashboard_text = "返回 ROS 2 实验看板 ←"
    elif is_archive:
        dashboard_url = "../00-progress.html"
        dashboard_text = "返回主实验区看板 ←"
    else:
        dashboard_url = "00-progress.html"
        dashboard_text = "返回实验区看板 ←"

    return (
        f'\n    <!-- 📚 知识图谱双向回链导航条 -->\n'
        f'    <nav class="kb-backlink-nav" style="margin: 14px 0 20px; padding: 10px 16px; background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.28); border-radius: 8px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; font-size: 0.92rem;">\n'
        f'      <span style="color: #cbd5e1;">📚 {label}：<a href="{target_url}" style="color: #38bdf8; font-weight: 600; text-decoration: underline;">{target_title} ↗</a>{note}</span>\n'
        f'      <a href="{dashboard_url}" style="color: #94a3b8; text-decoration: none; font-size: 0.86rem;">{dashboard_text}</a>\n'
        f'    </nav>\n'
    )


def main():
    modified_count = 0
    for rel_path_str, entry in MAPPING.items():
        file_path = LEARNING_LAB / rel_path_str
        if not file_path.exists():
            print(f"⚠️ 文件不存在: {file_path}")
            continue

        if len(entry) == 4:
            target_url, target_title, label, note = entry
        else:
            target_url, target_title = entry
            label = "对应知识图谱专题"
            note = ""

        content = file_path.read_text(encoding="utf-8")
        if 'class="kb-backlink-nav"' in content:
            # Already injected, replace existing banner if needed
            content = re.sub(
                r'<!-- 📚 知识图谱双向回链导航条 -->\s*<nav class="kb-backlink-nav".*?</nav>',
                '',
                content,
                flags=re.DOTALL
            )

        is_ros2 = rel_path_str.startswith("ros2/")
        is_archive = rel_path_str.startswith("archive/")
        banner = make_banner_html(target_url, target_title, is_ros2, is_archive, label=label, note=note)

        # Inject right after </h1>, or in header/reader-head
        if rel_path_str == "reader.html":
            target_marker = '<div class="reader-head">'
            if target_marker in content:
                content = content.replace(
                    target_marker,
                    target_marker + f'\n      <a href="{target_url}" style="color:#38bdf8; font-weight:600; text-decoration:none;">📚 知识图谱：{target_title} ↗</a>'
                )
                file_path.write_text(content, encoding="utf-8")
                modified_count += 1
                continue
        elif "</h1>" in content:
            # Find the position of </h1> and insert banner right after
            idx = content.find("</h1>") + len("</h1>")
            content = content[:idx] + banner + content[idx:]
            file_path.write_text(content, encoding="utf-8")
            modified_count += 1
        elif "</h1>" in content.lower():
            idx = content.lower().find("</h1>") + len("</h1>")
            content = content[:idx] + banner + content[idx:]
            file_path.write_text(content, encoding="utf-8")
            modified_count += 1
        else:
            print(f"⚠️ 无法找到 </h1> 插入点: {rel_path_str}")

    print(f"🎉 成功为 {modified_count} 篇 LearningLab HTML 页面注入知识图谱回链导航！")


if __name__ == "__main__":
    main()
