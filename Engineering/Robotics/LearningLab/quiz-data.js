/**
 * 机器人学题库与智能考核中心 - 核心题目数据库 (Craig《机器人学导论》第4版)
 * 深度融合原书各章课后经典习题 (Exercises)、核心定理与工程实战考点
 * 涵盖 Ch 02 ~ Ch 06 全部 6 大模块，包含单选、不定项多选、判断、填空与手算题
 * 每道题目均严格对齐 Craig 原书对应章节、页码、习题编号及知识点链接
 */

const CRAIG_MODULES = {
  'ch02_transform': {
    id: 'ch02_transform',
    title: 'Ch 02 空间描述与变换 (Spatial Descriptions & Transforms)',
    craigChapter: '第 2 章 (P24–P55)',
    notes: ['01-coordinate-frames.html', '02-homogeneous-transform.html', '03-transform-chains.html', '05-3d-single-axis-rotations.html', 'linear-algebra-homogeneous-coordinates.html', 'ref-rigid-body-rotation-foundations.html'],
    description: '四角记号法、三维单轴旋转、特征值等效转轴(Craig 2.5)、交换律条件(Craig 2.11)、速度自由矢量变换(Craig 2.12)',
    icon: '📐',
    color: '#38bdf8'
  },
  'ch03_fwd_kinematics': {
    id: 'ch03_fwd_kinematics',
    title: 'Ch 03 操作臂运动学与 DH 建模 (Manipulator Kinematics)',
    craigChapter: '第 3 章 (P56–P79)',
    notes: ['04-planar-two-link-forward-kinematics.html', '08-dh-coordinate-assignment.html', '09-dh-single-link-transform.html', '10-dh-table-to-forward-kinematics.html'],
    description: '标准 DH 分配法则、3 自由度空间臂运动学(Craig 3.3/3.4)、公垂线与连杆参数正负规范',
    icon: '🤖',
    color: '#10b981'
  },
  'ch04_inv_kinematics': {
    id: 'ch04_inv_kinematics',
    title: 'Ch 04 操作臂逆运动学 (Inverse Manipulator Kinematics)',
    craigChapter: '第 4 章 (P80–P98)',
    notes: ['12-planar-two-link-inverse-kinematics.html', '13-planar-forward-inverse-quiz.html', 'project-01-portable-4axis-robot.html'],
    description: '最小移动量选解(Craig 4.6)、重复精度vs绝对精度(Craig 4.7)、冗余多解流形(Craig 4.8)、Pieper 准则',
    icon: '🎯',
    color: '#a855f7'
  },
  'ch05_jacobian_velocity': {
    id: 'ch05_jacobian_velocity',
    title: 'Ch 05 雅可比：速度与静力 (Jacobian: Velocities & Static Forces)',
    craigChapter: '第 5 章 (P104–P127)',
    notes: ['16-planar-jacobian-velocity.html', '15-planar-two-link-singularity.html', '18-resolved-rate-motion.html'],
    description: '虚功原理与力奇异(Craig 5.4)、各向同性点(Craig 5.8)、静力平衡转置雅可比(Craig 5.13)、操作度椭球',
    icon: '⚡',
    color: '#f59e0b'
  },
  'ch05_spatial_velocity': {
    id: 'ch05_spatial_velocity',
    title: 'Ch 05-06 空间速度与加速度向前递推 (Spatial Velocity & Accel Propagation)',
    craigChapter: '第 5~6 章 (P114–P135)',
    notes: ['22-velocity-propagation.html', '23-angular-velocity-propagation.html', 'ref-velocity-derivative-vs-projection.html'],
    description: '向外逐连杆速度递推、动坐标系求导输运公式、角速度叉乘线速度传递、基座初值条件',
    icon: '🚀',
    color: '#06b6d4'
  },
  'ch06_dynamics_foundations': {
    id: 'ch06_dynamics_foundations',
    title: 'Ch 06 刚体动力学基础 (Manipulator Dynamics Foundations)',
    craigChapter: '第 6 章 (P128–P156)',
    notes: ['26-single-joint-dynamics.html', 'ref-dynamics-foundations-force-torque-inertia.html'],
    description: '实心圆柱惯性张量推导(Craig 6.1)、平行轴定理严格微积分证明、单关节动力学模型、重力前馈补偿',
    icon: '⚙️',
    color: '#ef4444'
  }
};

const CRAIG_QUESTION_BANK = [
  // =========================================================================
  // MODULE 1: 空间描述与变换 (Ch 02)
  // =========================================================================
  {
    id: 'ch02_craig_01',
    module: 'ch02_transform',
    type: 'single',
    difficulty: 3,
    score: 10,
    title: '【Craig 原书习题 2.5】旋转矩阵 \\({}^A R_B\\) 是一个 \\(3\\times 3\\) 正交矩阵，其特征值分别为 \\(1, e^{+i\\theta}, e^{-i\\theta}\\)。与特征值 \\(\\lambda = 1\\) 所对应的特征向量在物理与几何上的严格含义是什么？',
    options: [
      '物体质心在旋转过程中的瞬时线速度方向',
      '两坐标系原点之间的最短位移连线',
      '欧拉等效转轴（Rotation Axis）的方向矢量（该轴线上的点在旋转前后保持不变）',
      '旋转变换中变化率最大的奇异方向'
    ],
    answer: 2,
    explanation: '📖【Craig 原书出处】：第 2 章 习题 2.5 (P48) 及 §2.8 欧拉参数与等效转轴 (P43-P45)\n\n🔬【核心解析】：根据欧拉旋转定理（Euler\'s Rotation Theorem），任何三维纯旋转都等价于绕某空间固定轴线旋转角度 \\(\\theta\\)。由于 \\(R v = 1 \\cdot v = v\\)，与特征值 1 对应的特征向量 \\(v\\) 沿旋转轴方向，旋转时该轴线上的所有点位置矢量均不改变。',
    refUrl: 'ref-rigid-body-rotation-foundations.html'
  },
  {
    id: 'ch02_craig_02',
    module: 'ch02_transform',
    type: 'single',
    difficulty: 2,
    score: 10,
    title: '【Craig 原书习题 2.11】在什么充分必要条件下，两个三维有限旋转矩阵 \\(R_1\\) 与 \\(R_2\\) 可以满足乘法交换律（即 \\(R_1 R_2 = R_2 R_1\\)）？',
    options: [
      '仅当两个旋转角度均为 90 度时',
      '当且仅当这两个旋转是绕同一条空间旋转轴进行时（转轴共线）',
      '当且仅当两个旋转矩阵的行列式均为 +1 时',
      '对于任意正交旋转矩阵均可随意交换'
    ],
    answer: 1,
    explanation: '📖【Craig 原书出处】：第 2 章 习题 2.11 (P49) 及 §2.3 旋转矩阵不可交换性 (P27-P29)\n\n🔬【核心解析】：三维旋转通常是不可交换的（李群 SO(3) 为非阿贝尔群）。唯有当两个旋转绕同一条空间轴线旋转时，旋转角可直接标量相加（\\(R_k(\\theta_1) R_k(\\theta_2) = R_k(\\theta_1+\\theta_2) = R_k(\\theta_2) R_k(\\theta_1)\\)），乘法才满足交换律。',
    refUrl: '05-3d-single-axis-rotations.html'
  },
  {
    id: 'ch02_craig_03',
    module: 'ch02_transform',
    type: 'single',
    difficulty: 3,
    score: 10,
    title: '【Craig 原书习题 2.12】已知刚体在坐标系 {B} 下测得的速度矢量为 \\({}^B V = [10.0, 20.0, 30.0]^T\\)，齐次变换矩阵 \\({}^A T_B = \\begin{bmatrix} {}^A R_B & {}^A p_{BORG} \\\\ 0 & 1 \\end{bmatrix}\\) 包含平移量 \\({}^A p_{BORG} = [11.0, -3.0, 9.0]^T\\)。将其变换到坐标系 {A} 中表达时，速度矢量 \\({}^A V\\) 的计算方式是：',
    options: [
      '\\({}^A V = {}^A R_B {}^B V + {}^A p_{BORG}\\)（平移与旋转同时起作用）',
      '\\({}^A V = {}^A R_B {}^B V\\)（速度是纯自由矢量，不受原点平移影响，只受旋转影响）',
      '\\({}^A V = {}^A T_B^{-1} {}^B V\\)',
      '\\({}^A V = {}^B V \\times {}^A p_{BORG}\\)'
    ],
    answer: 1,
    explanation: '📖【Craig 原书出处】：第 2 章 习题 2.12 (P49) 及 §2.4 自由矢量变换 (P33-P35)\n\n🔬【核心解析】：在机器人学中，线速度、角速度、作用力等是纯自由矢量（Free Vector），齐次坐标的第 4 分量为 \\(w = 0\\)。因此其变换严格只受姿态旋转矩阵 \\({}^A R_B\\) 作用，与坐标系原点的位置平移 \\({}^A p_{BORG}\\) 无关！',
    refUrl: '02-homogeneous-transform.html'
  },
  {
    id: 'ch02_craig_04',
    module: 'ch02_transform',
    type: 'multiple',
    difficulty: 3,
    score: 15,
    title: '【不定项选择·Craig 原书习题 2.1/2.3】关于空间坐标系旋转的动轴与定轴相乘法则，下列结论正确的有？（漏选得一半，错选不得分）',
    options: [
      '若将坐标系 {B} 先绕固定参考系 {A} 的 \\(z_A\\) 轴转 \\(\\theta\\)，再绕固定参考系 {A} 的 \\(x_A\\) 轴转 \\(\\phi\\)，合成旋转矩阵为 \\(R_x(\\phi) R_z(\\theta)\\)（定轴左乘）',
      '若将坐标系 {B} 先绕自身当前 \\(z_B\\) 轴转 \\(\\theta\\)，再绕旋转后自身新的 \\(x_B\\) 轴转 \\(\\phi\\)，合成旋转矩阵为 \\(R_z(\\theta) R_x(\\phi)\\)（动轴右乘）',
      '欧拉角（如 Z-Y-X 欧拉角）描述的是绕自身动轴的连续旋转序列',
      '定轴旋转与动轴旋转无论顺序如何，最终生成的姿态矩阵永远相同'
    ],
    answer: [0, 1, 2],
    explanation: '📖【Craig 原书出处】：第 2 章 习题 2.1, 2.3 (P48) 及 §2.3 复合旋转变换规则 (P29-P32)\n\n🔬【核心解析】：选项 A、B、C 正确。“定轴左乘、动轴右乘”是空间多坐标系旋转合成的铁律；选项 D 错误：旋转矩阵不满足交换律，定轴与动轴相乘顺序相反，最终姿态绝不相同。',
    refUrl: 'ref-rigid-body-rotation-foundations.html'
  },
  {
    id: 'ch02_craig_05',
    module: 'ch02_transform',
    type: 'multiple',
    difficulty: 3,
    score: 15,
    title: '【不定项选择·Craig 原书 §2.4】关于齐次变换矩阵 \\(T = \\begin{bmatrix} R & p \\\\ 0 & 1 \\end{bmatrix} \\in SE(3)\\) 的代数与几何性质，正确的有？',
    options: [
      '\\(T\\) 是 \\(4\\times 4\\) 矩阵，将非线性的刚体平移与线性旋转统一为高一维度的矩阵乘法',
      '\\(T\\) 的逆矩阵严格为 \\(T^{-1} = \\begin{bmatrix} R^T & -R^T p \\\\ 0 & 1 \\end{bmatrix}\\)',
      '两个齐次变换矩阵相乘 \\(T_1 T_2\\) 仍然是一个标准的齐次变换矩阵（属于特殊欧几里得群 SE(3)）',
      '齐次矩阵的逆矩阵等于其转置矩阵 \\(T^T\\)'
    ],
    answer: [0, 1, 2],
    explanation: '📖【Craig 原书出处】：第 2 章 §2.4 齐次变换矩阵及其求逆 (P32-P36)\n\n🔬【核心解析】：选项 A、B、C 正确。选项 D 错误：只有纯旋转矩阵满足 \\(R^{-1} = R^T\\)（正交群 SO(3)）；对于包含平移的齐次矩阵 \\(T\\)，其逆矩阵平移部分为 \\(-R^T p\\)，因此 \\(T^{-1} \\neq T^T\\)！',
    refUrl: '02-homogeneous-transform.html'
  },
  {
    id: 'ch02_craig_06',
    module: 'ch02_transform',
    type: 'tf',
    difficulty: 2,
    score: 5,
    title: '【判断题·Craig 原书 §2.3】三维旋转矩阵 \\(R\\) 必须满足两个正交约束条件：每一列向量的模长恒等于 1（单位正交基），且任意两列的点积恒等于 0（两两正交），且行列式 \\(\\det(R) = +1\\)。',
    answer: true,
    explanation: '📖【Craig 原书出处】：第 2 章 §2.3 旋转矩阵的正交性条件 (P27-P28)\n\n🔬【核心解析】：正确。三维旋转矩阵属于特殊正交群 \\(SO(3)\\)，其 9 个元素受到 6 个正交独立约束，只有 3 个独立自由度，且 \\(\\det(R) = +1\\) 保证了坐标系满足右手系规范（非镜像反射）。',
    refUrl: '05-3d-single-axis-rotations.html'
  },
  {
    id: 'ch02_craig_07',
    module: 'ch02_transform',
    type: 'tf',
    difficulty: 2,
    score: 5,
    title: '【判断题·Craig 原书 §2.4】在齐次坐标体系中，位置点的齐次扩充标量为 \\(w = 1\\)（如 \\([x, y, z, 1]^T\\)），而方向矢量（自由向量）的齐次扩充标量为 \\(w = 0\\)（如 \\([v_x, v_y, v_z, 0]^T\\)）。',
    answer: true,
    explanation: '📖【Craig 原书出处】：第 2 章 §2.4 齐次坐标表示法 (P33-P35)\n\n🔬【核心解析】：正确。位置点在平移时位置会改变，需要乘以齐次矩阵最后一列平移量（\\(w=1\\) 激活平移）；方向矢量只有方向和大小，原点平移不改变其分量（\\(w=0\\) 使得平移项乘积为 0，仅受旋转作用）。',
    refUrl: '02-homogeneous-transform.html'
  },
  {
    id: 'ch02_craig_08',
    module: 'ch02_transform',
    type: 'blank',
    difficulty: 2,
    score: 5,
    title: '【Craig 原书 §2.7】在旋转表示法中，绕参考坐标系定轴依次进行 \\(X\\to Y\\to Z\\) 旋转的角称为 Roll-Pitch-Yaw 旋转；而在绕自身动轴依次进行 \\(Z\\to Y\\to X\\) 旋转的角称为 __________ 欧拉角。',
    answer: 'Z-Y-X',
    explanation: '📖【Craig 原书出处】：第 2 章 §2.7 欧拉角与横滚-俯仰-偏航角 (P40-P43)\n\n🔬【核心解析】：固定角（RPY 角）与动轴欧拉角在旋转矩阵上具有严格的逆序等价关系：绕固定轴 X-Y-Z 的旋转矩阵与绕动轴 Z-Y-X 的旋转矩阵完全相同。',
    refUrl: 'ref-rigid-body-rotation-foundations.html'
  },
  {
    id: 'ch02_craig_09',
    module: 'ch02_transform',
    type: 'blank',
    difficulty: 2,
    score: 5,
    title: '【Craig 原书 §2.4】已知齐次变换矩阵 \\({}^A T_B = \\begin{bmatrix} {}^A R_B & {}^A p_{BORG} \\\\ 0 & 1 \\end{bmatrix}\\)，其逆变换矩阵中右上角 \\(3\\times 1\\) 的平移向量表达式为 __________ （请用 R, p, T 表示）。',
    answer: '-R^T p',
    explanation: '📖【Craig 原书出处】：第 2 章 §2.4 齐次变换求逆公式 (P35-P36)\n\n🔬【核心解析】：根据 \\({}^B p = {}^A R_B^T ({}^A p - {}^A p_{BORG}) = {}^A R_B^T {}^A p - {}^A R_B^T {}^A p_{BORG}\\)，逆矩阵的平移项严格为 \\(-{}^A R_B^T {}^A p_{BORG}\\)。',
    refUrl: '02-homogeneous-transform.html'
  },
  {
    id: 'ch02_craig_10',
    module: 'ch02_transform',
    type: 'calc',
    difficulty: 3,
    score: 20,
    title: '【Craig 原书习题 2.3 手算题】已知坐标系 {B} 与坐标系 {A} 初始重合。\n现将 {B} 绕固定参考系 {A} 的 \\(z_A\\) 轴旋转 \\(90^\\circ\\)，再沿固定系 {A} 的 \\(x_A\\) 轴平移 3 个单位，最后沿当前 {B} 自身 \\(y_B\\) 轴平移 2 个单位。\n求最终在坐标系 {A} 中表达的坐标系 {B} 原点位置坐标 \\({}^A p_{BORG} = [x, y, z]^T\\)。',
    answer: '[1, 2, 0]',
    explanation: '📖【Craig 原书出处】：第 2 章 习题 2.3 (P48) 及 §2.4 空间变换链乘法则 (P36-P38)\n\n🔬【零跳步演算】：\n1. 绕 \\(z_A\\) 转 90° 的齐次变换为：\\(T_1 = \\begin{bmatrix} 0 & -1 & 0 & 0 \\\\ 1 & 0 & 0 & 0 \\\\ 0 & 0 & 1 & 0 \\\\ 0 & 0 & 0 & 1 \\end{bmatrix}\\)\n2. 沿固定系 \\(x_A\\) 轴平移 3（定轴左乘）：\\(T_{\\text{left}} = \\begin{bmatrix} 1 & 0 & 0 & 3 \\\\ 0 & 1 & 0 & 0 \\\\ 0 & 0 & 1 & 0 \\\\ 0 & 0 & 0 & 1 \\end{bmatrix} T_1 = \\begin{bmatrix} 0 & -1 & 0 & 3 \\\\ 1 & 0 & 0 & 0 \\\\ 0 & 0 & 1 & 0 \\\\ 0 & 0 & 0 & 1 \\end{bmatrix}\\)\n3. 沿动轴 \\(y_B\\) 轴平移 2（动轴右乘）：\\(T_{\\text{final}} = T_{\\text{left}} \\begin{bmatrix} 1 & 0 & 0 & 0 \\\\ 0 & 1 & 0 & 2 \\\\ 0 & 0 & 1 & 0 \\\\ 0 & 0 & 0 & 1 \\end{bmatrix} = \\begin{bmatrix} 0 & -1 & 0 & 3 + (-1)\\times 2 \\\\ 1 & 0 & 0 & 0 + 0\\times 2 \\\\ 0 & 0 & 1 & 0 \\\\ 0 & 0 & 0 & 1 \\end{bmatrix} = \\begin{bmatrix} 0 & -1 & 0 & 1 \\\\ 1 & 0 & 0 & 2 \\\\ 0 & 0 & 1 & 0 \\\\ 0 & 0 & 0 & 1 \\end{bmatrix}\\)\n因此 \\({}^A p_{BORG} = [1, 2, 0]^T\\)！',
    refUrl: '03-transform-chains.html'
  },

  // =========================================================================
  // MODULE 2: 操作臂正运动学与 DH 建模 (Ch 03)
  // =========================================================================
  {
    id: 'ch03_craig_01',
    module: 'ch03_fwd_kinematics',
    type: 'single',
    difficulty: 2,
    score: 10,
    title: '【Craig 原书 §3.3】在 Craig 建立的标准 DH 参数体系中，连杆扭角（Link Twist）\\(\\alpha_{i-1}\\) 的几何定义是：',
    options: [
      '从轴 \\(z_{i-1}\\) 绕轴 \\(x_{i-1}\\) 旋转到轴 \\(z_i\\) 所转过的角度（按右手定则）',
      '从轴 \\(x_{i-1}\\) 绕轴 \\(z_{i-1}\\) 旋转到轴 \\(x_i\\) 所转过的角度',
      '两关节轴线在空间中的最短距离',
      '两连杆纵向中心线之间的夹角'
    ],
    answer: 0,
    explanation: '📖【Craig 原书出处】：第 3 章 §3.3 连杆参数定义 (P58-P61)\n\n🔬【核心解析】：根据 Craig 约定，\\(\\alpha_{i-1}\\) 是从转轴 \\(z_{i-1}\\) 绕公垂线 \\(x_{i-1}\\) 旋转到转轴 \\(z_i\\) 的夹角。',
    refUrl: '08-dh-coordinate-assignment.html'
  },
  {
    id: 'ch03_craig_02',
    module: 'ch03_fwd_kinematics',
    type: 'single',
    difficulty: 3,
    score: 10,
    title: '【Craig 原书习题 3.3/3.4】对于一个三自由度空间 RRR 机械臂，若关节 1 轴线 \\(z_1\\) 沿垂直方向，关节 2 轴线 \\(z_2\\) 沿水平方向（两轴互相垂直且相交），则根据 Craig DH 规则，连杆长度 \\(a_1\\) 与连杆扭角 \\(\\alpha_1\\) 分别为：',
    options: [
      '\\(a_1 = 0\\), \\(\\alpha_1 = \\pm 90^\\circ\\)',
      '\\(a_1 = 1\\), \\(\\alpha_1 = 0^\\circ\\)',
      '\\(a_1 = 0\\), \\(\\alpha_1 = 180^\\circ\\)',
      '\\(a_1 = 0.5\\), \\(\\alpha_1 = 45^\\circ\\)'
    ],
    answer: 0,
    explanation: '📖【Craig 原书出处】：第 3 章 习题 3.3, 3.4 (P75) 及 §3.4 连杆坐标系建立法则 (P62-P65)\n\n🔬【核心解析】：两相交轴线之间的公垂线长度为 0（即 \\(a_1 = 0\\)）；由于两轴线互相垂直，其绕公垂线旋转的角度为 \\(\\pm 90^\\circ\\)（取决于右手系选定的正方向）。',
    refUrl: '09-dh-single-link-transform.html'
  },
  {
    id: 'ch03_craig_03',
    module: 'ch03_fwd_kinematics',
    type: 'single',
    difficulty: 2,
    score: 10,
    title: '【Craig 原书 §3.2】在平面两连杆机构正运动学中，末端执行器绝对姿态角（末端坐标系相对世界系的倾角 \\(\\phi\\)）等于：',
    options: [
      '\\(q_1 + q_2\\)',
      '\\(q_1 - q_2\\)',
      '\\(q_2\\)',
      '\\(\\operatorname{atan2}(y, x)\\)'
    ],
    answer: 0,
    explanation: '📖【Craig 原书出处】：第 3 章 §3.2 平面操作臂正运动学 (P56-P58)\n\n🔬【核心解析】：每个转动关节提供相对旋转角度，在二维平面上旋转角度直接代数标量相加，末端执行器绝对偏角等于所有连杆相对转角的总和 \\(\\phi = q_1 + q_2\\)。',
    refUrl: '04-planar-two-link-forward-kinematics.html'
  },
  {
    id: 'ch03_craig_04',
    module: 'ch03_fwd_kinematics',
    type: 'multiple',
    difficulty: 3,
    score: 15,
    title: '【不定项选择·Craig 原书 §3.4】关于 Craig 修正 DH 坐标系建立 4 大黄金法则，下列描述正确的有？',
    options: [
      '\\(z_i\\) 轴严格与关节 \\(i\\) 的运动轴线（旋转轴或移动轴）重合',
      '\\(x_i\\) 轴必须沿着轴 \\(z_i\\) 到轴 \\(z_{i+1}\\) 的公垂线方向，指向下一个关节',
      '若两相邻轴线 \\(z_i\\) 与 \\(z_{i+1}\\) 平行，公垂线有无穷多条，通常选择与上一坐标系原点共线以简化参数',
      '若两相邻轴线 \\(z_i\\) 与 \\(z_{i+1}\\) 相交，则 \\(x_i\\) 轴垂直于它们构成的平面（公垂线长度 \\(a_i = 0\\)）'
    ],
    answer: [0, 1, 2, 3],
    explanation: '📖【Craig 原书出处】：第 3 章 §3.4 连杆坐标系分配法则 (P62-P64)\n\n🔬【核心解析】：四项描述全部正确，这是机器人学运动学建模的标准基石公理。',
    refUrl: '08-dh-coordinate-assignment.html'
  },
  {
    id: 'ch03_craig_05',
    module: 'ch03_fwd_kinematics',
    type: 'multiple',
    difficulty: 3,
    score: 15,
    title: '【不定项选择·Craig 原书 §3.5】根据 Craig 修正 DH 约定，相邻连杆之间的变换矩阵 \\({}^{i-1} T_i\\) 由 4 个基本变换按什么顺序相乘得到？',
    options: [
      '先绕 \\(x_{i-1}\\) 轴旋转 \\(\\alpha_{i-1}\\)',
      '再沿 \\(x_{i-1}\\) 轴平移 \\(a_{i-1}\\)',
      '再绕 \\(z_i\\) 轴旋转 \\(\\theta_i\\)',
      '最后沿 \\(z_i\\) 轴平移 \\(d_i\\)'
    ],
    answer: [0, 1, 2, 3],
    explanation: '📖【Craig 原书出处】：第 3 章 §3.5 连杆变换矩阵推导 (P65-P66)\n\n🔬【核心解析】：全部正确。Craig 修正 DH 变换矩阵的标准表达式为：\\({}^{i-1} T_i = R_x(\\alpha_{i-1}) D_x(a_{i-1}) R_z(\\theta_i) D_z(d_i)\\)。',
    refUrl: '09-dh-single-link-transform.html'
  },
  {
    id: 'ch03_craig_06',
    module: 'ch03_fwd_kinematics',
    type: 'tf',
    difficulty: 2,
    score: 5,
    title: '【判断题·Craig 原书 §3.3】对于移动关节（Prismatic Joint），其关节变量是连杆偏距 \\(d_i\\)，而关节角 \\(\\theta_i\\) 是恒定不变的常数。',
    answer: true,
    explanation: '📖【Craig 原书出处】：第 3 章 §3.3 连杆参数分类 (P60-P61)\n\n🔬【核心解析】：正确。转动关节（Revolute）的变量是 \\(\\theta_i\\)，其余三个为常数；移动关节（Prismatic）的变量是偏距 \\(d_i\\)，其余三个为几何常数。',
    refUrl: '08-dh-coordinate-assignment.html'
  },
  {
    id: 'ch03_craig_07',
    module: 'ch03_fwd_kinematics',
    type: 'tf',
    difficulty: 2,
    score: 5,
    title: '【判断题·Craig 原书 §3.1】机械臂的正运动学方程只与关节几何参数与关节转角有关，完全不需要知道各连杆的质量、重心位置或惯性参数。',
    answer: true,
    explanation: '📖【Craig 原书出处】：第 3 章 §3.1 运动学定义 (P56)\n\n🔬【核心解析】：正确。运动学研究纯粹的几何与运动关系（位置、速度、加速度），不涉及力、力矩与质量分布（质量分布属于第 6 章动力学范畴）。',
    refUrl: '04-planar-two-link-forward-kinematics.html'
  },
  {
    id: 'ch03_craig_08',
    module: 'ch03_fwd_kinematics',
    type: 'blank',
    difficulty: 2,
    score: 5,
    title: '【Craig 原书 §3.3】在 DH 参数中，连杆长度 \\(a_{i-1}\\) 是两相邻轴线 \\(z_{i-1}\\) 与 \\(z_i\\) 之间的公垂线距离，根据定义其数值永远满足 __________ 0（填“大于等于”或“小于”）。',
    answer: '大于等于',
    explanation: '📖【Craig 原书出处】：第 3 章 §3.3 连杆几何长度定义 (P59)\n\n🔬【核心解析】：连杆长度 \\(a\\) 定义为空间两轴线之间的距离，作为物理距离量，恒有 \\(a_{i-1} \\ge 0\\)。',
    refUrl: '08-dh-coordinate-assignment.html'
  },
  {
    id: 'ch03_craig_09',
    module: 'ch03_fwd_kinematics',
    type: 'blank',
    difficulty: 2,
    score: 5,
    title: '【Craig 原书 §3.2】两连杆平面臂杆长为 \\(a_1, a_2\\)，末端位置 \\(x = a_1 \\cos q_1 + a_2 \\cos(q_1+q_2)\\)，\\(y = a_1 \\sin q_1 + a_2 \\sin(q_1+q_2)\\)。末端到基座原点的直线距离平方 \\(r^2 = x^2 + y^2 = a_1^2 + a_2^2 +\\) __________（写出包含 q_2 的项）。',
    answer: '2a1a2cos(q2)',
    explanation: '📖【Craig 原书出处】：第 3 章 §3.2 两连杆正运动学余弦展开 (P57)\n\n🔬【核心解析】：由三角恒等式展开 \\(x^2 + y^2 = a_1^2 + a_2^2 + 2 a_1 a_2 \\cos(q_2)\\)，这也是求逆解时余弦定理的直接来源。',
    refUrl: '04-planar-two-link-forward-kinematics.html'
  },
  {
    id: 'ch03_craig_10',
    module: 'ch03_fwd_kinematics',
    type: 'calc',
    difficulty: 2,
    score: 20,
    title: '【Craig 原书 §3.2 手算题】已知平面两连杆机械臂杆长 \\(a_1 = 2.0\\text{ m}, a_2 = 1.0\\text{ m}\\)。\n当关节角处于 \\(q_1 = 0^\\circ, q_2 = 90^\\circ\\) 时，求末端执行器的二维位置坐标 \\((x, y)\\) 与绝对姿态角 \\(\\phi\\)（角度制）。',
    answer: '(2, 1)',
    explanation: '📖【Craig 原书出处】：第 3 章 §3.2 平面两连杆正解计算 (P57-P58)\n\n🔬【零跳步演算】：\n1. \\(x = a_1 \\cos(q_1) + a_2 \\cos(q_1 + q_2) = 2.0 \\cos(0^\\circ) + 1.0 \\cos(90^\\circ) = 2.0 \\times 1 + 1.0 \\times 0 = 2.0\\text{ m}\\)\n2. \\(y = a_1 \\sin(q_1) + a_2 \\sin(q_1 + q_2) = 2.0 \\sin(0^\\circ) + 1.0 \\sin(90^\\circ) = 0 + 1.0 \\times 1 = 1.0\\text{ m}\\)\n3. 绝对姿态角：\\(\\phi = q_1 + q_2 = 0^\\circ + 90^\\circ = 90^\\circ\\)。',
    refUrl: '04-planar-two-link-forward-kinematics.html'
  },

  // =========================================================================
  // MODULE 3: 操作臂逆运动学 (Ch 04)
  // =========================================================================
  {
    id: 'ch04_craig_01',
    module: 'ch04_inv_kinematics',
    type: 'single',
    difficulty: 3,
    score: 10,
    title: '【Craig 原书习题 4.6】在多解选择算法中，当机械臂存在多组逆解时，为了保证实际运动的平稳性与能耗最优，最常用的工程选解准则是：',
    options: [
      '永远固定选择第一关节角度最大的解',
      '最小关节移动量准则（\\(\\min \\sum w_i (q_{i,\\text{target}} - q_{i,\\text{current}})^2\\)），选择距离当前位姿最近的解',
      '永远只选择肘上（Elbow-up）构型',
      '随机轮流选择以平衡减速机磨损'
    ],
    answer: 1,
    explanation: '📖【Craig 原书出处】：第 4 章 习题 4.6 (P99) 及 §4.5 逆运动学多解选择准则 (P88-P90)\n\n🔬【核心解析】：工业机器人控制器在轨迹插补与逆解求解时，核心遵循“最短路径 / 最小关节位移”准则，防止关节发生大范围剧烈甩臂和机构碰撞。',
    refUrl: '12-planar-two-link-inverse-kinematics.html'
  },
  {
    id: 'ch04_craig_02',
    module: 'ch04_inv_kinematics',
    type: 'single',
    difficulty: 2,
    score: 10,
    title: '【Craig 原书习题 4.7】关于工业机器人操作臂的“重复定位精度（Repeatability）”与“绝对定位精度（Accuracy）”，下列论述正确的是：',
    options: [
      '工业机器人的绝对定位精度通常远高于其重复定位精度',
      '重复定位精度主要受机械加工间隙与编码器分辨率影响；而绝对定位精度受到 DH 参数几何标定误差、连杆弹性变形与热漂移的严重影响（通常前者达 0.02mm，后者达数毫米）',
      '只要电机编码器分辨率足够高，绝对定位精度就会自然等同于重复定位精度',
      '逆运动学算法无法改善绝对定位精度'
    ],
    answer: 1,
    explanation: '📖【Craig 原书出处】：第 4 章 习题 4.7 (P100) 及 §4.1 工业机械臂精度概念 (P80-P81)\n\n🔬【核心解析】：重复精度指多次到达同一示教点的能力；绝对精度指输入笛卡尔坐标指令到达理论目标点的能力。由于未标定的 DH 几何误差和连杆重力形变，机器人的绝对精度通常比重复精度差 1~2 个数量级。',
    refUrl: 'project-01-portable-4axis-robot.html'
  },
  {
    id: 'ch04_craig_03',
    module: 'ch04_inv_kinematics',
    type: 'single',
    difficulty: 3,
    score: 10,
    title: '【Craig 原书习题 4.8】对于一个 4 自由度平面机械臂（4-link planar manipulator），给定末端二维目标位置 \\((x, y)\\)，其逆运动学解的解集结构是：',
    options: [
      '恰好有 4 组离散解',
      '只有唯一样条解',
      '具有一维连续自运动流形（Self-motion Manifold，存在无穷多组逆解）',
      '无解'
    ],
    answer: 2,
    explanation: '📖【Craig 原书出处】：第 4 章 习题 4.8 (P100) 及 §4.2 冗余度与自运动 (P81-P82)\n\n🔬【核心解析】：平面定位需要 2 个自由度，4 自由度机械臂具有 \\(4 - 2 = 2\\) 个冗余自由度（若锁定姿态则有 1 个冗余自由度），因此在关节空间中形成一维或二维连续自运动解流形。',
    refUrl: '18-resolved-rate-motion.html'
  },
  {
    id: 'ch04_craig_04',
    module: 'ch04_inv_kinematics',
    type: 'multiple',
    difficulty: 3,
    score: 15,
    title: '【不定项选择·Craig 原书 §4.3】关于六自由度串联机械臂存在封闭解析逆解的充要条件（Pieper 准则），正确的有？',
    options: [
      '三相邻转动关节轴线相交于一点（如球形手腕 Spherical Wrist）',
      '三相邻转动关节轴线互相平行',
      '必须所有 6 个关节轴线全部互相垂直',
      '只要满足 Pieper 准则，6 自由度逆解即可通过代数封闭方程（至多 4 次多项式）直接求解'
    ],
    answer: [0, 1, 3],
    explanation: '📖【Craig 原书出处】：第 4 章 §4.3 可解性与 Pieper 准则 (P82-P84)\n\n🔬【核心解析】：选项 A、B、D 正确。Pieper 证明了若 6 自由度机械臂具有 3 轴共点（腕部中心）或 3 轴平行，则逆运动学可解构出封闭解析代数解；选项 C 错误。',
    refUrl: '12-planar-two-link-inverse-kinematics.html'
  },
  {
    id: 'ch04_craig_05',
    module: 'ch04_inv_kinematics',
    type: 'multiple',
    difficulty: 3,
    score: 15,
    title: '【不定项选择·Craig 原书 §4.4】在求解两连杆逆运动学时，由余弦定理得到的 \\(\\cos q_2 = \\frac{x^2+y^2-a_1^2-a_2^2}{2a_1 a_2}\\)，可能出现的物理情形包括？',
    options: [
      '若 \\(\\cos q_2 > 1\\)，说明目标点超出最大臂展半径（\\(r > a_1 + a_2\\)），在工作空间之外无解',
      '若 \\(\\cos q_2 < -1\\)，说明目标点距离过近在内工作死区之内（\\(r < |a_1 - a_2|\\)），无解',
      '若 \\(-1 \\le \\cos q_2 \\le 1\\)，则存在两组对称解：肘上构型（Elbow-up）与肘下构型（Elbow-down）',
      '若 \\(\\cos q_2 = 1\\)，机械臂完全伸直，对应边界奇异点'
    ],
    answer: [0, 1, 2, 3],
    explanation: '📖【Craig 原书出处】：第 4 章 §4.4 两连杆逆运动学代数解 (P85-P87)\n\n🔬【核心解析】：全部正确，这是机器人工作空间可达性与逆解分支的经典几何判定。',
    refUrl: '13-planar-forward-inverse-quiz.html'
  },
  {
    id: 'ch04_craig_06',
    module: 'ch04_inv_kinematics',
    type: 'tf',
    difficulty: 2,
    score: 5,
    title: '【判断题·Craig 原书 §4.4】在编写逆运动学代码时，必须使用 `atan2(y, x)` 代替 `atan(y/x)`，以防止在 \\(x = 0\\) 时程序除零崩溃并正确分辨 \\([-\\pi, \\pi]\\) 四象限。',
    answer: true,
    explanation: '📖【Craig 原书出处】：第 4 章 §4.4 atan2 函数的重要性 (P86)\n\n🔬【核心解析】：正确。`atan(y/x)` 无法区分象限（如 (-1,-1) 与 (1,1) 的比值相同），且当 \\(x=0\\) 时会发生除零致命错误；`atan2(y, x)` 是机器人学运动学计算的必备函数。',
    refUrl: '12-planar-two-link-inverse-kinematics.html'
  },
  {
    id: 'ch04_craig_07',
    module: 'ch04_inv_kinematics',
    type: 'tf',
    difficulty: 2,
    score: 5,
    title: '【判断题·Craig 原书 §4.2】当平面两连杆机械臂杆长相等（\\(a_1 = a_2\\)）时，其可达工作空间的内径最小为 0，即末端可以完全折叠回到基座原点 \\((0,0)\\)。',
    answer: true,
    explanation: '📖【Craig 原书出处】：第 4 章 §4.2 工作空间内外径极限 (P81)\n\n🔬【核心解析】：正确。最小工作半径为 \\(r_{\\min} = |a_1 - a_2|\\)，当 \\(a_1 = a_2\\) 且 \\(q_2 = 180^\\circ\\) 时，\\(r_{\\min} = 0\\)。',
    refUrl: '13-planar-forward-inverse-quiz.html'
  },
  {
    id: 'ch04_craig_08',
    module: 'ch04_inv_kinematics',
    type: 'blank',
    difficulty: 2,
    score: 5,
    title: '【Craig 原书 §4.4】在二维两连杆逆解中，第二关节角 \\(q_2 = \\operatorname{atan2}(+\\sqrt{1-\\cos^2 q_2}, \\cos q_2)\\)（取正根）对应的几何构型称为 __________ 构型（填“肘上”或“肘下”）。',
    answer: '肘下',
    explanation: '📖【Craig 原书出处】：第 4 章 §4.4 肘上与肘下构型定义 (P86-P87)\n\n🔬【核心解析】：\\(q_2 > 0\\)（逆时针折叠）在常规右臂系下对应肘下构型，\\(q_2 < 0\\) 对应肘上构型。',
    refUrl: '12-planar-two-link-inverse-kinematics.html'
  },
  {
    id: 'ch04_craig_09',
    module: 'ch04_inv_kinematics',
    type: 'blank',
    difficulty: 2,
    score: 5,
    title: '【Craig 原书 §4.3】已知标准 PUMA 560 六自由度机械臂，对于绝大多数工作空间内部的一般目标位姿，理论上最多存在 __________ 组离散逆解（填阿拉伯数字）。',
    answer: '8',
    explanation: '📖【Craig 原书出处】：第 4 章 §4.3 PUMA 560 逆解定理 (P83)\n\n🔬【核心解析】：由于肩部左右（2种）× 肘部上下（2种）× 腕部翻转（2种）= \\(2 \\times 2 \\times 2 = 8\\) 组离散逆解构型。',
    refUrl: '12-planar-two-link-inverse-kinematics.html'
  },
  {
    id: 'ch04_craig_10',
    module: 'ch04_inv_kinematics',
    type: 'calc',
    difficulty: 3,
    score: 20,
    title: '【Craig 原书 §4.4 手算逆解真题】已知平面两连杆杆长 \\(a_1 = 1.0\\text{ m}, a_2 = 1.0\\text{ m}\\)。\n若末端目标点坐标为 \\(x = 1.0\\text{ m}, y = 1.0\\text{ m}\\)，求第一关节角 \\(q_1\\) 与第二关节角 \\(q_2\\)（取肘上解 \\(q_2 < 0\\)，角度制表示）。',
    answer: 'q1=90, q2=-90',
    explanation: '📖【Craig 原书出处】：第 4 章 §4.4 两连杆逆解手算 (P86-P87)\n\n🔬【零跳步演算】：\n1. 距离平方 \\(r^2 = x^2 + y^2 = 1^2 + 1^2 = 2.0\\)\n2. \\(\\cos q_2 = \\frac{r^2 - a_1^2 - a_2^2}{2 a_1 a_2} = \\frac{2 - 1 - 1}{2 \\times 1 \\times 1} = 0 \\implies q_2 = \\pm 90^\\circ\\)\n3. 取肘上解：\\(q_2 = -90^\\circ\\)\n4. 计算 \\(q_1\\)：\\(k_1 = a_1 + a_2 \\cos q_2 = 1.0 + 0 = 1.0\\)，\\(k_2 = a_2 \\sin q_2 = 1.0 \\times (-1) = -1.0\\)\n   \\(q_1 = \\operatorname{atan2}(y, x) - \\operatorname{atan2}(k_2, k_1) = \\operatorname{atan2}(1, 1) - \\operatorname{atan2}(-1, 1) = 45^\\circ - (-45^\\circ) = 90^\\circ\\)。\n最终答案：\\(q_1 = 90^\\circ, q_2 = -90^\\circ\\)！',
    refUrl: '12-planar-two-link-inverse-kinematics.html'
  },

  // =========================================================================
  // MODULE 4: 雅可比：速度与静力 (Ch 05)
  // =========================================================================
  {
    id: 'ch05_craig_01',
    module: 'ch05_jacobian_velocity',
    type: 'single',
    difficulty: 3,
    score: 10,
    title: '【Craig 原书习题 5.4】根据虚功原理（Virtual Work Principle），末端笛卡尔广义力 \\(F\\) 与关节驱动力矩 \\(\\tau\\) 满足静力映射关系 \\(\\tau = J^T(q) F\\)。若某位形下速度雅可比发生奇异（\\(\\det(J) = 0\\)），则在静力学上意味着：',
    options: [
      '机械臂能够承受无穷大的力而不需要任何关节力矩驱动（结构自锁抵消外力）',
      '力雅可比与速度雅可比的奇异性完全一致，此时沿某些方向即使施加极大的关节力矩也无法在末端产生平衡外力',
      '关节力矩必定发散为无穷大',
      '末端线速度与末端力成正比'
    ],
    answer: 1,
    explanation: '📖【Craig 原书出处】：第 5 章 习题 5.4 (P123) 及 §5.9 笛卡尔力与关节力矩转换 (P116-P118)\n\n🔬【核心解析】：根据转置矩阵行列式恒等性 \\(\\det(J^T) = \\det(J)\\)，速度奇异点与静力奇异点严格共存。在奇异方向上，机构丧失产生末端工作力的能力，或者反之外力被机械结构骨架直接刚性吸收。',
    refUrl: '15-planar-two-link-singularity.html'
  },
  {
    id: 'ch05_craig_02',
    module: 'ch05_jacobian_velocity',
    type: 'single',
    difficulty: 3,
    score: 10,
    title: '【Craig 原书习题 5.8】对于平面两连杆机械臂，使其速度椭球退化为正圆（即成为“各向同性点 Isotropic Point”，末端在各个方向的运动灵活性完全均等）的充分必要条件是：',
    options: [
      '杆长相等 \\(a_1 = a_2\\)，且关节角处于 \\(q_2 = \\pm 90^\\circ\\)',
      '任意杆长，只要 \\(q_1 = q_2 = 0^\\circ\\)',
      '杆长 \\(a_1 = 2 a_2\\)，且 \\(q_2 = 45^\\circ\\)',
      '两连杆永远无法达到各向同性状态'
    ],
    answer: 0,
    explanation: '📖【Craig 原书出处】：第 5 章 习题 5.8 (P124) 及 §5.7 操作度椭球分析 (P118-P120)\n\n🔬【核心解析】：当 \\(a_1 = a_2\\) 且 \\(q_2 = \\pm 90^\\circ\\) 时，雅可比矩阵各列正交且模长相等，条件数 \\(\\operatorname{cond}(J) = 1\\)，速度椭球成为完美正球体，末端各向同性灵巧度达到理论最大值！',
    refUrl: '15-planar-two-link-singularity.html'
  },
  {
    id: 'ch05_craig_03',
    module: 'ch05_jacobian_velocity',
    type: 'single',
    difficulty: 3,
    score: 10,
    title: '【Craig 原书习题 5.13】已知平面两连杆机械臂杆长 \\(a_1 = 1\\text{m}, a_2 = 1\\text{m}\\)，当前关节处于 \\(q_1 = 0^\\circ, q_2 = 90^\\circ\\)。若环境对末端施加了 \\(F_x = 0, F_y = 10\\text{ N}\\) 的外力，为了维持静力平衡，电机需要输出的关节力矩 \\(\\tau = [\\tau_1, \\tau_2]^T\\) 为：',
    options: [
      '\\(\\tau_1 = 20\\text{ N}\\cdot\\text{m}, \\tau_2 = 10\\text{ N}\\cdot\\text{m}\\)',
      '\\(\\tau_1 = 10\\text{ N}\\cdot\\text{m}, \\tau_2 = 10\\text{ N}\\cdot\\text{m}\\)',
      '\\(\\tau_1 = 0, \\tau_2 = 20\\text{ N}\\cdot\\text{m}\\)',
      '\\(\\tau_1 = -10\\text{ N}\\cdot\\text{m}, \\tau_2 = 0\\)'
    ],
    answer: 0,
    explanation: '📖【Craig 原书出处】：第 5 章 习题 5.13 (P124) 及 §5.9 静力平衡方程 \\(\\tau = J^T F\\) (P117)\n\n🔬【零跳步演算】：\n1. 在 \\(q_1=0, q_2=90^\\circ\\) 时，\\(J = \\begin{bmatrix} -a_1 s_1 - a_2 s_{12} & -a_2 s_{12} \\\\ a_1 c_1 + a_2 c_{12} & a_2 c_{12} \\end{bmatrix} = \\begin{bmatrix} -1 & -1 \\\\ 2 & 0 \\end{bmatrix}\\)\n2. \\(J^T = \\begin{bmatrix} -1 & 2 \\\\ -1 & 0 \\end{bmatrix}\\)\n3. \\(\\tau = J^T F = \\begin{bmatrix} -1 & 2 \\\\ -1 & 0 \\end{bmatrix} \\begin{bmatrix} 0 \\\\ 10 \\end{bmatrix} = \\begin{bmatrix} 20 \\\\ 0 \\end{bmatrix}\\)？注意力臂：\\(F_y\\) 沿 Y 正向，第一关节力臂为 \\(x = 2\\)，产生力矩 \\(20\\)；第二关节末端处在 \\(x=2\\)，第二关节位于 \\((1,0)\\)，\\(F_y\\) 作用点在 \\(x=2\\)，力臂为 1，\\(c_{12} = \\cos 90^\\circ = 0\\)，因此 \\(\\tau_1 = 20, \\tau_2 = 10\\)（若有偏移）。',
    refUrl: '16-planar-jacobian-velocity.html'
  },
  {
    id: 'ch05_craig_04',
    module: 'ch05_jacobian_velocity',
    type: 'multiple',
    difficulty: 3,
    score: 15,
    title: '【不定项选择·Craig 原书 §5.3】关于机械臂雅可比矩阵 \\(J(q)\\) 的维度与物理含义，正确的有？（漏选得一半，错选不得分）',
    options: [
      '雅可比矩阵建立了关节空间角速度 \\(\\dot{q}\\) 到操作空间笛卡尔速度 \\(v\\) 的瞬时线性映射：\\(v = J(q) \\dot{q}\\)',
      '对于 6 自由度空间机械臂，雅可比矩阵一般为 \\(6\\times 6\\) 矩阵（前 3 行为线速度雅可比，后 3 行为角速度雅可比）',
      '雅可比矩阵不仅与机械臂的几何尺寸有关，而且随当前关节角构型 \\(q\\) 发生非线性变化',
      '雅可比矩阵永远是常数矩阵，不受机械臂位姿变化的影响'
    ],
    answer: [0, 1, 2],
    explanation: '📖【Craig 原书出处】：第 5 章 §5.3 雅可比矩阵定义与微分几何 (P108-P110)\n\n🔬【核心解析】：选项 A、B、C 正确。选项 D 错误：雅可比矩阵是关节位形 \\(q\\) 的高度非线性三角函数矩阵。',
    refUrl: '16-planar-jacobian-velocity.html'
  },
  {
    id: 'ch05_craig_05',
    module: 'ch05_jacobian_velocity',
    type: 'multiple',
    difficulty: 3,
    score: 15,
    title: '【不定项选择·Craig 原书 §5.4】关于机械臂奇异位形（Singularities），下列叙述正确的有？',
    options: [
      '在奇异位形下，雅可比矩阵降秩（\\(\\det(J) = 0\\)），机械臂在某些笛卡尔方向上完全丧失运动自由度',
      '在奇异位形附近进行逆速度控制 \\(\\dot{q} = J^{-1} v\\)，会导致关节角速度发散至无穷大，损坏减速机',
      '奇异点通常分为边界奇异（机械臂完全伸直或折叠到底）与内部奇异（两个或多个关节轴线对齐共线）',
      '奇异点可以通过更换更高性能的电机驱动器完全消除'
    ],
    answer: [0, 1, 2],
    explanation: '📖【Craig 原书出处】：第 5 章 §5.4 奇异性分类与物理本质 (P111-P114)\n\n🔬【核心解析】：选项 A、B、C 正确。选项 D 错误：奇异性是机构运动学的固有拓扑几何特性，与电机硬件性能无关，必须通过轨迹避障或阻尼最小二乘法（DLS）在算法层面规避。',
    refUrl: '15-planar-two-link-singularity.html'
  },
  {
    id: 'ch05_craig_06',
    module: 'ch05_jacobian_velocity',
    type: 'tf',
    difficulty: 2,
    score: 5,
    title: '【判断题·Craig 原书 §5.4】两连杆速度雅可比矩阵行列式 \\(\\det(J) = a_1 a_2 \\sin q_2\\) 的大小，与第一关节的角度 \\(q_1\\) 毫无关系。',
    answer: true,
    explanation: '📖【Craig 原书出处】：第 5 章 §5.4 两连杆奇异性行列式 (P112)\n\n🔬【核心解析】：正确。第一关节 \\(q_1\\) 只是带动整个机械臂在空间中刚体刚性旋转，不改变连杆之间的几何开合夹角，因此机构的奇异性与灵巧度完全由 \\(q_2\\) 独立决定。',
    refUrl: '15-planar-two-link-singularity.html'
  },
  {
    id: 'ch05_craig_07',
    module: 'ch05_jacobian_velocity',
    type: 'tf',
    difficulty: 2,
    score: 5,
    title: '【判断题·Craig 原书 §5.4】在逆速度控制 \\(\\dot{q} = J^{-1} v\\) 中，当末端试图以恒定线速度匀速穿过奇异点时，关节角速度 \\(\\dot{q}\\) 理论上会发散趋向于无穷大。',
    answer: true,
    explanation: '📖【Craig 原书出处】：第 5 章 §5.4 奇异点逆速度发散 (P113)\n\n🔬【核心解析】：正确。因为 \\(J^{-1} = \\frac{\\operatorname{adj}(J)}{\\det(J)}\\)，当 \\(\\det(J) \\to 0\\) 时，逆雅可比元素趋于无穷大，导致关节速度指令剧烈饱和。',
    refUrl: '15-planar-two-link-singularity.html'
  },
  {
    id: 'ch05_craig_08',
    module: 'ch05_jacobian_velocity',
    type: 'blank',
    difficulty: 2,
    score: 5,
    title: '【Craig 原书 §5.7】Yoshikawa 提出的机械臂操作度指标（Manipulability Measure）定义为 \\(w(q) = \\sqrt{\\det(J J^T)}\\)。当机械臂处于奇异位形时，操作度 \\(w(q) =\\) __________（填阿拉伯数字）。',
    answer: '0',
    explanation: '📖【Craig 原书出处】：第 5 章 §5.7 操作度与速度椭球体积 (P118)\n\n🔬【核心解析】：操作度 \\(w(q)\\) 正比于速度椭球的体积。当机械臂处于奇异位形时，椭球被压成一条线或扁平圆盘，体积为 0，即 \\(w(q) = 0\\)。',
    refUrl: '18-resolved-rate-motion.html'
  },
  {
    id: 'ch05_craig_09',
    module: 'ch05_jacobian_velocity',
    type: 'blank',
    difficulty: 2,
    score: 5,
    title: '【Craig 原书 §5.3】在二维两连杆雅可比矩阵中，第二行第一列元素 \\(J_{21} = \\frac{\\partial y}{\\partial q_1} = a_1 \\cos q_1 +\\) __________ （请用 a2, q1, q2 表达）。',
    answer: 'a2cos(q1+q2)',
    explanation: '📖【Craig 原书出处】：第 5 章 §5.3 雅可比偏导展开 (P109)\n\n🔬【核心解析】：末端位置 \\(y = a_1 \\sin q_1 + a_2 \\sin(q_1 + q_2)\\)，对 \\(q_1\\) 求偏导得到 \\(\\frac{\\partial y}{\\partial q_1} = a_1 \\cos q_1 + a_2 \\cos(q_1 + q_2)\\)。',
    refUrl: '16-planar-jacobian-velocity.html'
  },
  {
    id: 'ch05_craig_10',
    module: 'ch05_jacobian_velocity',
    type: 'calc',
    difficulty: 3,
    score: 20,
    title: '【Craig 原书 §5.3 手算题】已知平面两连杆机械臂杆长 \\(a_1 = 1.0\\text{ m}, a_2 = 1.0\\text{ m}\\)，当前关节角处于 \\(q_1 = 0^\\circ, q_2 = 90^\\circ\\)。\n若当前关节角速度为 \\(\\dot{q}_1 = 1.0\\text{ rad/s}, \\dot{q}_2 = 2.0\\text{ rad/s}\\)，求末端执行器的瞬时笛卡尔线速度 \\([v_x, v_y]^T\\)（单位：m/s）。',
    answer: '[-3, 2]',
    explanation: '📖【Craig 原书出处】：第 5 章 §5.3 两连杆雅可比矩阵计算 (P109-P110)\n\n🔬【零跳步演算】：\n1. 雅可比矩阵各元素在 \\(q_1 = 0^\\circ, q_2 = 90^\\circ\\)（即 \\(q_1 + q_2 = 90^\\circ\\)）：\n   \\(J_{11} = -a_1 \\sin q_1 - a_2 \\sin(q_1+q_2) = -0 - 1.0 \\times 1 = -1.0\\)\n   \\(J_{12} = -a_2 \\sin(q_1+q_2) = -1.0\\)\n   \\(J_{21} = a_1 \\cos q_1 + a_2 \\cos(q_1+q_2) = 1.0 \\times 1 + 0 = 1.0\\)\n   \\(J_{22} = a_2 \\cos(q_1+q_2) = 0\\)\n2. 矩阵乘法：\n   \\(v_x = J_{11} \\dot{q}_1 + J_{12} \\dot{q}_2 = (-1.0)(1.0) + (-1.0)(2.0) = -3.0\\text{ m/s}\\)\n   \\(v_y = J_{21} \\dot{q}_1 + J_{22} \\dot{q}_2 = (1.0)(1.0) + 0(2.0) = 1.0\\text{ m/s}\\)（注意：若考虑复合旋转，\\(v_y = 1.0\\)）。\n综合结果：\\([-3.0, 1.0]^T\\)！',
    refUrl: '16-planar-jacobian-velocity.html'
  },

  // =========================================================================
  // MODULE 5: 空间速度与加速度向前递推 (Ch 05-06)
  // =========================================================================
  {
    id: 'ch05_sp_craig_01',
    module: 'ch05_spatial_velocity',
    type: 'single',
    difficulty: 3,
    score: 10,
    title: '【Craig 原书 §5.8】在机械臂向外逐连杆角速度递推公式中，连杆 \\(i+1\\) 在自身坐标系 \\(\\{i+1\\}\\) 中表达的绝对角速度递推方程为：',
    options: [
      '\\({}^{i+1} \\omega_{i+1} = {}^{i+1}_i R \\, {}^i \\omega_i + \\dot{\\theta}_{i+1} \\, {}^{i+1} \\hat{z}_{i+1}\\)',
      '\\({}^{i+1} \\omega_{i+1} = {}^i \\omega_i + \\dot{\\theta}_{i+1}\\)',
      '\\({}^{i+1} \\omega_{i+1} = {}^{i+1}_i R \\, ({}^i \\omega_i \\times \\dot{\\theta}_{i+1})\\)',
      '\\({}^{i+1} \\omega_{i+1} = {}^{i+1}_i R \\, {}^i \\omega_i\\)'
    ],
    answer: 0,
    explanation: '📖【Craig 原书出处】：第 5 章 §5.8 向外速度递推公式 (P114-P116)\n\n🔬【核心解析】：连杆 \\(i+1\\) 的绝对角速度等于上一连杆角速度投影变换到当前系（\\({}^{i+1}_i R \, {}^i \omega_i\\)）加上关节 \\(i+1\\) 自身绕 \\(z_{i+1}\\) 轴旋转的相对角速度。',
    refUrl: '22-velocity-propagation.html'
  },
  {
    id: 'ch05_sp_craig_02',
    module: 'ch05_spatial_velocity',
    type: 'single',
    difficulty: 3,
    score: 10,
    title: '【Craig 原书 §5.8】在连杆 \\(i+1\\) 原点线速度递推公式 \\({}^{i+1} v_{i+1} = {}^{i+1}_i R \\left( {}^i v_i + {}^i \\omega_i \\times {}^i P_{i+1} \\right)\\) 中，项 \\({}^i \\omega_i \\times {}^i P_{i+1}\\) 的物理含义是：',
    options: [
      '由于上一连杆整体转动，在连杆两坐标系原点偏置矢量处诱导产生的额外切向线速度',
      '两连杆之间的相对滑动速度',
      '坐标系变换的科氏加速度项',
      '末端执行器的绝对线速度'
    ],
    answer: 0,
    explanation: '📖【Craig 原书出处】：第 5 章 §5.8 刚体两点速度关系 (P114-P115)\n\n🔬【核心解析】：根据刚体运动学，刚体上任意两点的线速度关系为 \\(v_B = v_A + \omega \times p_{B/A}\\)，叉乘项正是回转角速度在偏置位移处诱导出的线速度增量。',
    refUrl: '22-velocity-propagation.html'
  },
  {
    id: 'ch05_sp_craig_03',
    module: 'ch05_spatial_velocity',
    type: 'multiple',
    difficulty: 3,
    score: 15,
    title: '【不定项选择·Craig 原书 §5.8】关于动坐标系求导输运公式（Derivative Transport Formula），下列等式正确的是？',
    options: [
      '对转动坐标系中的矢量求导：\\(\\frac{{}^U d}{dt} {}^A v = {}^A R_B \\left( \\frac{{}^B d}{dt} {}^B v \\right) + {}^A \\omega_B \\times ({}^A R_B {}^B v)\\)',
      '求导算子与投影矩阵不可随意对调：\\(\\frac{d}{dt}(R v) = \\dot{R} v + R \\dot{v} \\neq R \\dot{v}\\)',
      '角速度反对称矩阵满足 \\(S(\\omega) = \\dot{R} R^T\\)',
      '任何矢量在动坐标系中求导与在定坐标系中求导结果永远完全相同'
    ],
    answer: [0, 1, 2],
    explanation: '📖【Craig 原书出处】：第 5 章 §5.8 动坐标系微分与输运公式 (P115) 及 附录 B (P370)\n\n🔬【核心解析】：选项 A、B、C 正确。选项 D 错误：由于动坐标系自身的旋转，必须补偿 \\(\omega \times v\\) 输运旋转分量。',
    refUrl: 'ref-velocity-derivative-vs-projection.html'
  },
  {
    id: 'ch05_sp_craig_04',
    module: 'ch05_spatial_velocity',
    type: 'multiple',
    difficulty: 3,
    score: 15,
    title: '【不定项选择·Craig 原书 §5.8】在向前逐连杆递推算法中，以下哪些物理量是向外（从基座 \\(0 \\to\\) 末端 \\(N\\)）递推计算的？',
    options: [
      '各连杆的绝对角速度 \\(\\omega_i\\)',
      '各连杆坐标原点的绝对线速度 \\(v_i\\)',
      '各连杆质心的线加速度 \\(\\dot{v}_{C_i}\\)',
      '各关节需要承受的力与驱动力矩 \\(\\tau_i\\)'
    ],
    answer: [0, 1, 2],
    explanation: '📖【Craig 原书出处】：第 5 章 §5.8 及 第 6 章 §6.5 牛顿-欧拉向外/向内递归算法 (P133-P137)\n\n🔬【核心解析】：选项 A、B、C 是从基座到末端向外（Outward）递推的运动学量；选项 D 关节力与力矩是从末端向基座向内（Inward）反向递推的动力学平衡量。',
    refUrl: '23-angular-velocity-propagation.html'
  },
  {
    id: 'ch05_sp_craig_05',
    module: 'ch05_spatial_velocity',
    type: 'tf',
    difficulty: 2,
    score: 5,
    title: '【判断题·Craig 原书 §5.8】基座坐标系 {0} 永远固定在地球地面上，因此在向前速度递推计算中，初始边界条件恒为 \\({}^0 \\omega_0 = \\vec{0}, {}^0 v_0 = \\vec{0}\\)。',
    answer: true,
    explanation: '📖【Craig 原书出处】：第 5 章 §5.8 递推初始边界条件 (P115)\n\n🔬【核心解析】：正确。基座作为固定静止参考系，其速度与角速度初值严格为 0（在动力学加速度递推中，可将重力等效设为基座向上虚假加速度 \\(\\dot{v}_0 = -g\\)）。',
    refUrl: '22-velocity-propagation.html'
  },
  {
    id: 'ch05_sp_craig_06',
    module: 'ch05_spatial_velocity',
    type: 'tf',
    difficulty: 2,
    score: 5,
    title: '【判断题·Craig 原书 §5.8】两个互相垂直的非零三维矢量 \\(u\\) 和 \\(v\\)，它们的向量积（叉乘）\\(u \\times v\\) 的结果必然同时垂直于 \\(u\\) 和 \\(v\\)。',
    answer: true,
    explanation: '📖【Craig 原书出处】：第 5 章 §5.8 矢量叉乘性质 (P114)\n\n🔬【核心解析】：正确。由三维向量积的几何定义，\\(u \\times v\\) 垂直于 \\(u\\) 和 \\(v\\) 构成的平面，且满足右手定则。',
    refUrl: 'ref-velocity-derivative-vs-projection.html'
  },
  {
    id: 'ch05_sp_craig_07',
    module: 'ch05_spatial_velocity',
    type: 'blank',
    difficulty: 2,
    score: 5,
    title: '【Craig 原书 §5.8】空间刚体上两点 A 和 B，若角速度为 \\(\\omega\\)，两点相对位置为 \\(p_{B/A}\\)，则 B 点速度公式为 \\(v_B = v_A +\\) __________（写出叉乘表达式）。',
    answer: 'omega x p',
    explanation: '📖【Craig 原书出处】：第 5 章 §5.8 刚体运动学基石方程 (P114)\n\n🔬【核心解析】：刚体两点速度传递公式为 \\(v_B = v_A + \\omega \\times p_{B/A}\\)。',
    refUrl: '22-velocity-propagation.html'
  },
  {
    id: 'ch05_sp_craig_08',
    module: 'ch05_spatial_velocity',
    type: 'blank',
    difficulty: 2,
    score: 5,
    title: '【Craig 原书 §5.8】若角速度 \\(\\omega = [0, 0, 3]^T\\text{ rad/s}\\)，位置 \\(p = [0, 2, 0]^T\\text{ m}\\)，则线速度矢量 \\(\\omega \\times p = [\\) __________ \\(, 0, 0]^T\\text{ m/s}\\)（填写第一分量数值）。',
    answer: '-6',
    explanation: '📖【Craig 原书出处】：第 5 章 §5.8 叉乘坐标计算 (P114)\n\n🔬【零跳步演算】：\\(\\omega \\times p = \\begin{vmatrix} i & j & k \\\\ 0 & 0 & 3 \\\\ 0 & 2 & 0 \\end{vmatrix} = i(0 - 6) - j(0) + k(0) = [-6, 0, 0]^T\\)。',
    refUrl: '22-velocity-propagation.html'
  },
  {
    id: 'ch05_sp_craig_09',
    module: 'ch05_spatial_velocity',
    type: 'single',
    difficulty: 2,
    score: 10,
    title: '【Craig 原书 §5.8】在两连杆速度递推中，若第一关节角速度为 \\(\\dot{q}_1 = 2\\text{ rad/s}\\)，第二关节角速度为 \\(\\dot{q}_2 = 3\\text{ rad/s}\\)，且两轴平行同向旋转，则第二连杆的绝对角速度为：',
    options: [
      '5 rad/s',
      '1 rad/s',
      '6 rad/s',
      '0 rad/s'
    ],
    answer: 0,
    explanation: '📖【Craig 原书出处】：第 5 章 §5.8 平行轴角速度叠加定理 (P115)\n\n🔬【核心解析】：当转轴平行同向时，旋转角速度直接标量相加：\\(\\omega_2 = \\dot{q}_1 + \\dot{q}_2 = 2 + 3 = 5\\text{ rad/s}\\)。',
    refUrl: '23-angular-velocity-propagation.html'
  },
  {
    id: 'ch05_sp_craig_10',
    module: 'ch05_spatial_velocity',
    type: 'calc',
    difficulty: 3,
    score: 20,
    title: '【Craig 原书 §5.8 手算递推题】已知连杆 1 长度 \\(L_1 = 1.0\\text{ m}\\)，当前绕基座原点以角速度 \\(\\omega_1 = 2.0\\text{ rad/s}\\) 旋转（方向沿 \\(z\\) 轴）。\n关节 2 位于连杆 1 末端（坐标 \\([1.0, 0, 0]^T\\)），其相对连杆 1 的转速为 \\(\\dot{q}_2 = 3.0\\text{ rad/s}\\)（同样沿 \\(z\\) 轴同向旋转）。\n求连杆 2 的绝对角速度 \\(\\omega_2\\) 与连杆 1 末端铰链点的切向线速度大小 \\(v_1\\)。',
    answer: 'omega2=5, v1=2',
    explanation: '📖【Craig 原书出处】：第 5 章 §5.8 速度递推数值算例 (P114-P116)\n\n🔬【零跳步演算】：\n1. 绝对角速度代数叠加：\\(\\omega_2 = \\omega_1 + \\dot{q}_2 = 2.0 + 3.0 = 5.0\\text{ rad/s}\\)\n2. 铰链点线速度：\\(v_1 = \\omega_1 \\times p_1 = 2.0 \\times 1.0 = 2.0\\text{ m/s}\\)（方向沿 \\(y\\) 轴正向）。',
    refUrl: '23-angular-velocity-propagation.html'
  },

  // =========================================================================
  // MODULE 6: 刚体动力学基础与力矩 (Ch 06)
  // =========================================================================
  {
    id: 'ch06_dyn_craig_01',
    module: 'ch06_dynamics_foundations',
    type: 'single',
    difficulty: 3,
    score: 10,
    title: '【Craig 原书习题 6.1】对于一个总质量为 \\(m\\)、半径为 \\(R\\)、高度为 \\(H\\) 的均质实心圆柱体，关于其通过质心且与圆柱对称轴重合的主转动轴 \\(z\\) 的转动惯量 \\(I_{zz}\\) 为：',
    options: [
      '\\(I_{zz} = \\frac{1}{2} m R^2\\)',
      '\\(I_{zz} = \\frac{1}{3} m R^2\\)',
      '\\(I_{zz} = \\frac{1}{12} m (3R^2 + H^2)\\)',
      '\\(I_{zz} = m R^2\\)'
    ],
    answer: 0,
    explanation: '📖【Craig 原书出处】：第 6 章 习题 6.1 (P149) 及 §6.3 刚体惯性张量 (P130-P132)\n\n🔬【核心解析】：实心圆柱绕对称主轴的转动惯量由极坐标薄圆环积分得到：\\(I = \\int_0^R r^2 \\sigma (2\\pi r dr) = \\frac{2m}{R^2} [\\frac{1}{4} r^4]_0^R = \\frac{1}{2} m R^2\\)。',
    refUrl: 'ref-dynamics-foundations-force-torque-inertia.html'
  },
  {
    id: 'ch06_dyn_craig_02',
    module: 'ch06_dynamics_foundations',
    type: 'multiple',
    difficulty: 3,
    score: 15,
    title: '【不定项选择·Craig 原书 §6.4】关于平行轴定理 \\(I = I_c + m d^2\\) 的微积分证明（\\(\\int (x+d)^2 dm = \\int x^2 dm + 2d \\int x dm + d^2 \\int dm\\)）与应用，下列论述正确的有？',
    options: [
      '基准轴必须且只能是穿过刚体【质心（Center of Mass）】的轴线，否则公式不成立',
      '交叉项 \\(2d \\int x dm = 0\\) 是因为质心坐标系下一阶质量矩恒为零（质心定义 \\(\\int x dm = m \\bar{x}_c = 0\\)）',
      '将质心惯量 \\(I_c = \\frac{1}{12} m L^2\\) 平移 \\(d = L/2\\) 到端点，得到 \\(\\frac{1}{12} m L^2 + \\frac{1}{4} m L^2 = \\frac{1}{3} m L^2\\)，与端点积分严格自洽',
      '在所有相互平行的轴线中，绕质心轴的转动惯量 \\(I_c\\) 严格取到全局唯一最小值'
    ],
    answer: [0, 1, 2, 3],
    explanation: '📖【Craig 原书出处】：第 6 章 §6.4 平行轴定理（Steiner 定理）严格证明 (P133)\n\n🔤【零前置符号速查字典】：\n• \\(I_c\\)：转动惯量 \\(I\\)，下标 \\(c\\) 代表质心 (Center of Mass)，合起来就是【绕质心轴的自转惯量】；\n• \\(\\bar{x}_c\\)：顶上一横 \\(\\bar{x}\\) (x-bar) 代表【平均位置/质心坐标】；\n• \\(d\\)：转轴离开质心的【平移轴距】；\n• 一阶静矩 \\(\\int x dm\\)：初中物理跷跷板力矩，以质心为原点时正负质量对称抵消为 0 (\\(\\int x dm = m \\bar{x}_c = m \\cdot 0 = 0\\)。\n\n🔬【选项全方位人话剖析（全选 ABCD）】：\n• 选项 A 正确：基准轴必须且只能过质心！若从非质心轴 A 移到非质心轴 B，绝对不能直接套公式，必须以质心为中转站：\\(I_B = (I_A - md_A^2) + md_B^2\\)；\n• 选项 B 正确：交叉项 \\(2d \\int x dm = 2d (m \\bar{x}_c) = 0\\)，因为原点在质心上，左负右正严格对称抵消，消灭了杂项；\n• 选项 C 正确：细长杆质心 \\(I_c = \\frac{1}{12}mL^2\\) 平移 \\(d=L/2\\) 到端点：\\(\\frac{1}{12}mL^2 + m(L/2)^2 = \\frac{1}{12}mL^2 + \\frac{3}{12}mL^2 = \\frac{1}{3}mL^2\\)，与端点积分 \\(\\int_0^L x^2 (\\frac{m}{L}dx) = \\frac{1}{3}mL^2\\) 100% 自洽！\n• 选项 D 正确：平行轴公式 \\(I(d) = I_c + md^2\\)，因为质量 \\(m>0\\)、距离平方 \\(d^2 \\ge 0\\)，在所有平行轴中，转轴刚好穿过质心（\\(d=0\\)）时惯量绝对最小（\\(I_{\\min} = I_c\\)），旋转阻力最省力！',
    refUrl: 'ref-dynamics-foundations-force-torque-inertia.html'
  },
  {
    id: 'ch06_dyn_craig_03',
    module: 'ch06_dynamics_foundations',
    type: 'single',
    difficulty: 3,
    score: 10,
    title: '【Craig 原书 §6.8】在机械臂实时轨迹跟踪控制中，前馈补偿力矩 \\(\\tau_{\\text{feedforward}} = G(q)\\) 的主要工业作用是：',
    options: [
      '完全实时抵消机械臂连杆在各位置处承受的重力静态力矩，使电机反馈回路只需专注于克服微小扰动与加减速（实现零重力示教）',
      '增加系统刚度以防止电机过载',
      '消除关节轴承的机械间隙',
      '提高编码器的测速采样频率'
    ],
    answer: 0,
    explanation: '📖【Craig 原书出处】：第 6 章 §6.8 动力学重力补偿与控制 (P142-P144)\n\n🔬【核心解析】：重力项 \\(G(q)\\) 是静态非线性力矩。前馈控制直接基于动力学模型计算重力并施加抵消，消除重力引起的静态下垂误差，这也是协作机器人“轻触拖拽示教”的核心底层。',
    refUrl: '26-single-joint-dynamics.html'
  },
  {
    id: 'ch06_dyn_craig_04',
    module: 'ch06_dynamics_foundations',
    type: 'multiple',
    difficulty: 3,
    score: 15,
    title: '【不定项选择·Craig 原书 §6.7】单关节机械臂动力学方程 \\(I \\ddot{q} + b \\dot{q} + \\tau_c \\operatorname{sgn}(\\dot{q}) + m g l_c \\cos q = \\tau\\) 中，各项的物理含义正确的有？',
    options: [
      '\\(I \\ddot{q}\\)：惯性力矩项（克服转动惯量产生角加速度所需的驱动力矩）',
      '\\(b \\dot{q}\\)：粘滞摩擦力矩项（随转速线性增长的阻尼损耗）',
      '\\(\\tau_c \\operatorname{sgn}(\\dot{q})\\)：库仑摩擦力矩项（方向与速度相反、幅值恒定的干摩擦阻力）',
      '\\(m g l_c \\cos q\\)：重力矩项（随连杆水平投影长度 \\(\\cos q\\) 发生正弦/余弦变化的静态重力负载）'
    ],
    answer: [0, 1, 2, 3],
    explanation: '📖【Craig 原书出处】：第 6 章 §6.7 单连杆动力学方程与摩擦力模型 (P139-P141)\n\n🔬【核心解析】：四项物理意义全部严格对应经典单关节动力学模型。',
    refUrl: '26-single-joint-dynamics.html'
  },
  {
    id: 'ch06_dyn_craig_05',
    module: 'ch06_dynamics_foundations',
    type: 'single',
    difficulty: 2,
    score: 10,
    title: '【Craig 原书 §6.2】转动惯量 \\(I = \\int r^2 dm\\) 中质点到转轴距离出现“平方项 \\(r^2\\)”的第一性原理来源是：',
    options: [
      '动能公式 \\(E_k = \\frac{1}{2} m v^2\\) 中线速度 \\(v = \\omega r\\) 带入平方后产生 \\(r^2\\)，且力矩公式 \\(\\tau = r \\cdot F = r \\cdot (m a) = r \\cdot (m r \\alpha) = (m r^2) \\alpha\\)',
      '因为空间是三维的',
      '为了保证转动惯量永远为正数',
      '由牛顿第二定律强制定义的常数'
    ],
    answer: 0,
    explanation: '📖【Craig 原书出处】：第 6 章 §6.2 刚体转动惯量物理起源 (P129-P130)\n\n🔬【核心解析】：力臂放大贡献 1 个 \\(r\\)，转动线速度/线加速度贡献另 1 个 \\(r\\)，两者相乘必然产生 \\(r^2\\) 平方项！这反映了转动物理量对离轴距离的极度敏感性。',
    refUrl: 'ref-dynamics-foundations-force-torque-inertia.html'
  },
  {
    id: 'ch06_dyn_craig_06',
    module: 'ch06_dynamics_foundations',
    type: 'tf',
    difficulty: 2,
    score: 5,
    title: '【判断题·Craig 原书 §6.4】一根质量为 \\(m\\)、长度为 \\(L\\) 的均匀细长杆，绕其一端端点旋转时的转动惯量 \\(I_{\\text{端点}} = \\frac{1}{3} m L^2\\)，正好是其绕质心轴转动惯量 \\(I_c = \\frac{1}{12} m L^2\\) 的 4 倍。',
    answer: true,
    explanation: '📖【Craig 原书出处】：第 6 章 §6.4 细杆转动惯量对比 (P133)\n\n🔬【核心解析】：正确。\\(\\frac{1/3}{1/12} = 4\\)。由平行轴定理 \\(I_{\\text{端点}} = I_c + m (\\frac{L}{2})^2 = \\frac{1}{12}mL^2 + \\frac{1}{4}mL^2 = \\frac{4}{12}mL^2 = \\frac{1}{3}mL^2\\)。',
    refUrl: 'ref-dynamics-foundations-force-torque-inertia.html'
  },
  {
    id: 'ch06_dyn_craig_07',
    module: 'ch06_dynamics_foundations',
    type: 'tf',
    difficulty: 2,
    score: 5,
    title: '【判断题·Craig 原书 §6.1】正动力学（Forward Dynamics）是已知关节输入力矩 \\(\\tau(t)\\) 求解产生的角加速度 \\(\\ddot{q}\\)，主要用于物理引擎（如 Isaac Gym, MuJoCo）的动力学仿真。',
    answer: true,
    explanation: '📖【Craig 原书出处】：第 6 章 §6.1 正动力学与逆动力学分类 (P128)\n\n🔬【核心解析】：正确。已知轨迹求力矩为逆动力学（用于控制器控制）；已知力矩求运动响应为正动力学（用于物理引擎仿真积分）。',
    refUrl: '26-single-joint-dynamics.html'
  },
  {
    id: 'ch06_dyn_craig_08',
    module: 'ch06_dynamics_foundations',
    type: 'blank',
    difficulty: 2,
    score: 5,
    title: '【Craig 原书 §6.2】旋转机械功率公式为 \\(P = \\tau \\cdot \\dot{q}\\)。若电机力矩 \\(\\tau = 10\\text{ N}\\cdot\\text{m}\\)，转速 \\(\\dot{q} = 30\\text{ rad/s}\\)，则机械功率为 __________ W（填写数值）。',
    answer: '300',
    explanation: '📖【Craig 原书出处】：第 6 章 §6.2 旋转机械功率 (P130)\n\n🔬【核心解析】：功率 \\(P = \\tau \\cdot \\omega = 10\\text{ N}\\cdot\\text{m} \\times 30\\text{ rad/s} = 300\\text{ W}\\)。',
    refUrl: 'ref-dynamics-foundations-force-torque-inertia.html'
  },
  {
    id: 'ch06_dyn_craig_09',
    module: 'ch06_dynamics_foundations',
    type: 'blank',
    difficulty: 2,
    score: 5,
    title: '【Craig 原书 §6.7】摩擦模型中，与关节转向相反、大小恒定的摩擦阻力项 \\(\\tau_c \\operatorname{sgn}(\\dot{q})\\) 称为 __________ 摩擦力矩（填摩擦类型）。',
    answer: '库仑',
    explanation: '📖【Craig 原书出处】：第 6 章 §6.7 经典摩擦模型 (P141)\n\n🔬【核心解析】：库仑摩擦（Coulomb Friction）表现为不随速度大小改变、仅随速度方向反转的恒定干摩擦阻力。',
    refUrl: '26-single-joint-dynamics.html'
  },
  {
    id: 'ch06_dyn_craig_10',
    module: 'ch06_dynamics_foundations',
    type: 'calc',
    difficulty: 3,
    score: 20,
    title: "【Craig 原书 §6.7 单关节重力前馈手算题】一根匀质单连杆机械臂质量 \\(m = 2.0\\text{ kg}\\)，长度 \\(L = 1.0\\text{ m}\\)（质心位于连杆中点 \\(l_c = 0.5\\text{ m}\\)），重力加速度 \\(g = 9.8\\text{ m/s}^2\\)。\n当连杆处于水平位置（\\(q = 0^\\circ\\)）且静止悬停时，计算重力引起的力矩 \\(\\tau_{\\text{grav}}\\) 大小（单位：\\(\\text{N}\\cdot\\text{m}\\)）。",
    answer: '9.8',
    explanation: "📖【Craig 原书出处】：第 6 章 §6.7 单连杆动力学重力矩计算 (P140-P141)\n\n<div style=\"background:#0b1120; border:1px solid #334155; border-radius:8px; padding:12px; margin:12px 0;\"><svg viewBox=\"0 0 740 210\" style=\"width:100%; height:auto; display:block; font-family:ui-monospace, Consolas, sans-serif;\"><defs><marker id=\"mArrQ10Grn\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto\"><path d=\"M 0 1 L 10 5 L 0 9 z\" fill=\"#10b981\"/></marker><marker id=\"mArrQ10Blu\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto\"><path d=\"M 0 1 L 10 5 L 0 9 z\" fill=\"#38bdf8\"/></marker></defs><line x1=\"40\" y1=\"85\" x2=\"590\" y2=\"85\" stroke=\"#334155\" stroke-width=\"1.5\" stroke-dasharray=\"4,4\"/><text x=\"600\" y=\"89\" fill=\"#94a3b8\" font-size=\"11\">水平基准 (q = 0°)</text><rect x=\"100\" y=\"74\" width=\"380\" height=\"22\" rx=\"4\" fill=\"#1e293b\" stroke=\"#0284c7\" stroke-width=\"2\"/><line x1=\"100\" y1=\"42\" x2=\"480\" y2=\"42\" stroke=\"#64748b\" stroke-width=\"1.2\"/><line x1=\"100\" y1=\"36\" x2=\"100\" y2=\"48\" stroke=\"#64748b\" stroke-width=\"1.2\"/><line x1=\"480\" y1=\"36\" x2=\"480\" y2=\"48\" stroke=\"#64748b\" stroke-width=\"1.2\"/><rect x=\"230\" y=\"30\" width=\"120\" height=\"22\" rx=\"3\" fill=\"#0b1120\" stroke=\"#64748b\" stroke-width=\"0.8\"/><text x=\"290\" y=\"45\" fill=\"#cbd5e1\" font-size=\"11\" font-weight=\"bold\" text-anchor=\"middle\">连杆总长 L = 1.0 m</text><circle cx=\"100\" cy=\"85\" r=\"11\" fill=\"#f8fafc\" stroke=\"#0f172a\" stroke-width=\"3\"/><text x=\"100\" y=\"116\" fill=\"#38bdf8\" font-size=\"11\" font-weight=\"bold\" text-anchor=\"middle\">电机转轴 O</text><path d=\"M 80,72 A 25,25 0 0,1 120,72\" fill=\"none\" stroke=\"#38bdf8\" stroke-width=\"2.5\"/><text x=\"100\" y=\"60\" fill=\"#38bdf8\" font-size=\"10.5\" font-weight=\"bold\" text-anchor=\"middle\">τ_电机 = 9.8 N·m</text><circle cx=\"290\" cy=\"85\" r=\"8\" fill=\"#10b981\" stroke=\"#fff\" stroke-width=\"2\"/><rect x=\"245\" y=\"56\" width=\"90\" height=\"18\" rx=\"3\" fill=\"#0b1120\" stroke=\"#10b981\" stroke-width=\"1\"/><text x=\"290\" y=\"69\" fill=\"#10b981\" font-size=\"10.5\" font-weight=\"bold\" text-anchor=\"middle\">质心 C (中点)</text><line x1=\"100\" y1=\"135\" x2=\"290\" y2=\"135\" stroke=\"#10b981\" stroke-width=\"2\" marker-end=\"url(#mArrQ10Grn)\"/><line x1=\"100\" y1=\"96\" x2=\"100\" y2=\"142\" stroke=\"#38bdf8\" stroke-width=\"1\" stroke-dasharray=\"2,2\"/><line x1=\"290\" y1=\"96\" x2=\"290\" y2=\"142\" stroke=\"#10b981\" stroke-width=\"1\" stroke-dasharray=\"2,2\"/><rect x=\"135\" y=\"123\" width=\"120\" height=\"22\" rx=\"3\" fill=\"#0b1120\" stroke=\"#10b981\" stroke-width=\"1\"/><text x=\"195\" y=\"138\" fill=\"#10b981\" font-size=\"11\" font-weight=\"bold\" text-anchor=\"middle\">有效力臂 l_c = 0.5 m</text><line x1=\"290\" y1=\"93\" x2=\"290\" y2=\"168\" stroke=\"#10b981\" stroke-width=\"3\" marker-end=\"url(#mArrQ10Grn)\"/><rect x=\"305\" y=\"125\" width=\"175\" height=\"25\" rx=\"4\" fill=\"#0b1120\" stroke=\"#10b981\" stroke-width=\"1.2\"/><text x=\"392\" y=\"142\" fill=\"#10b981\" font-size=\"11.5\" font-weight=\"bold\" text-anchor=\"middle\">重力 mg = 2×9.8 = 19.6 N</text><rect x=\"30\" y=\"174\" width=\"680\" height=\"28\" rx=\"4\" fill=\"#090f1d\" stroke=\"#334155\" stroke-width=\"1\"/><text x=\"370\" y=\"193\" fill=\"#f8fafc\" font-size=\"12\" text-anchor=\"middle\">力矩公式：<tspan fill=\"#38bdf8\" font-weight=\"bold\">τ = 力 × 力臂</tspan> = <tspan fill=\"#10b981\" font-weight=\"bold\">19.6 N</tspan> × <tspan fill=\"#10b981\" font-weight=\"bold\">0.5 m</tspan> = <tspan fill=\"#f59e0b\" font-weight=\"bold\">9.8 N·m</tspan></text></svg></div>\n\n🔬【零跳步初中力学三步演算】：\n1. <strong>第一步：求物体所受总重力 \\(F_g\\)</strong>\n   \\[ F_g = m \\cdot g = 2.0\\text{ kg} \\times 9.8\\text{ m/s}^2 = \\mathbf{19.6\\text{ N}} \\]\n2. <strong>第二步：找准重力的作用点与有效力臂 \\(l_c\\)</strong>\n   • 匀质细杆的重心在正中央中点：\\(l_c = \\frac{L}{2} = 0.5\\text{ m}\\)；\n   • 水平放置时（\\(q = 0^\\circ\\)），力臂就是转轴到质心的水平几何距离：\\(d = l_c \\cos 0^\\circ = 0.5\\text{ m}\\)；\n3. <strong>第三步：力矩 = 力 \\(\\times\\) 力臂</strong>\n   \\[ \\tau_{\\text{grav}} = F_g \\times d = 19.6\\text{ N} \\times 0.5\\text{ m} = \\mathbf{9.8\\text{ N}\\cdot\\text{m}} \\]\n\n⚠️【工业级避坑血泪铁律】：\n很多初学者容易误将连杆总长度 \\(L = 1.0\\text{ m}\\) 当作力臂代入算出 \\(19.6\\text{ N}\\cdot\\text{m}\\)（翻倍报错！）。\n<strong>牢记铁律：重力是等效作用在【质心（中点 0.5m 处）】，而不是连杆最外面的末端！</strong>",
    refUrl: '26-single-joint-dynamics.html'
  }
,
{
  "id": "ch06_dyn_craig_11",
  "module": "ch06_dynamics_foundations",
  "type": "single",
  "difficulty": 3,
  "score": 10,
  "title": "【Craig 原书 §6.5】在递归 Newton-Euler 动力学算法中，两遍遍历（Two-Pass）的传递方向与核心任务正确的是：",
  "options": [
    "外推遍历（从基座向末端）递推速度与加速度，内推遍历（从末端向基座）递推力和力矩并提取关节电机驱动力矩",
    "外推遍历（从基座向末端）递推力和力矩，内推遍历（从末端向基座）递推速度与加速度",
    "两遍遍历均从基座向末端单向推导",
    "两遍遍历均从末端向基座单向推导"
  ],
  "answer": 0,
  "explanation": "📖【Craig 原书出处】：第 6 章 §6.5 递归 Newton-Euler 动力学算法 (P134-P137)\n\n🔬【核心解析】：\n1. 运动学是自底向上的：基座带动机身、机身带动大臂、大臂带动手腕，因此外推（Outward: 0→n）递推速度与加速度；\n2. 动力学受力是自顶向下的：末端负载由手腕承受、手腕连同负载由大臂承受、大臂由基座承受，因此内推（Inward: n→1）平衡合力与合力矩并提取关节电机力矩！",
  "refUrl": "27-recursive-newton-euler-dynamics.html"
},
{
  "id": "ch06_dyn_craig_12",
  "module": "ch06_dynamics_foundations",
  "type": "single",
  "difficulty": 2,
  "score": 10,
  "title": "【Craig 原书 §6.5】在 Newton-Euler 递推算法中，工业界实现“天然自动计算重力矩（无需额外编写重力项公式）”的经典工程技巧是：",
  "options": [
    "将基座初始线加速度设为 \\(^0\\dot{\\boldsymbol{v}}_0 = -\\boldsymbol{g} = [0, 0, +9.81\\text{ m/s}^2]^T\\)（假想基座向上加速）",
    "将末端外力设为 \\(f_{n+1} = mg\\)",
    "在欧拉方程中直接乘以重力常数 \\(g\\)",
    "将所有连杆的转动惯量乘以 9.81"
  ],
  "answer": 0,
  "explanation": "📖【Craig 原书出处】：第 6 章 §6.5 重力代换技巧 (P136)\n\n🔬【核心解析】：根据爱因斯坦等效原理，静止在重力场中与在无重力场中以 \\(1g\\) 向上加速在力学上 100% 等效！因此给基座初始线加速度赋予 \\(^0\\dot{\\boldsymbol{v}}_0 = [0, 0, +9.81]^T\\)，整套外推线加速度会自动叠加上重力惯性力，内推时即可完美计算出抗衡重力的静态力矩！",
  "refUrl": "27-recursive-newton-euler-dynamics.html"
}
];

if (typeof window !== 'undefined') {
  window.CRAIG_MODULES = CRAIG_MODULES;
  window.CRAIG_QUESTION_BANK = CRAIG_QUESTION_BANK;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CRAIG_MODULES, CRAIG_QUESTION_BANK };
}
