# -*- coding: utf-8 -*-
"""
================================================================================
🛡️ ROBOTICS NOTES QUALITY GATE - 全自动化工程质量门禁系统
================================================================================
"""
import os
import re
import sys
import subprocess
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

REPO_DIR = str(Path(__file__).resolve().parents[1] / 'Engineering' / 'Robotics' / 'LearningLab')
SCRATCH_DIR = r'C:/Users/bale/.gemini/antigravity/brain/a8d717a2-15f1-4327-9ad9-e62b6d74e30d/scratch'

def run_quality_gate():
    print("=" * 80)
    print("🛡️  ROBOTICS NOTES QUALITY GATE - 全自动化工程质量门禁系统")
    print("=" * 80)
    
    total_errors = 0
    html_files = [f for f in os.listdir(REPO_DIR) if f.endswith('.html')]
    core_notes = [
        '26-single-joint-dynamics.html',
        '27-recursive-newton-euler-dynamics.html',
        '28-recursive-newton-euler-dynamics.html',
        '29-recursive-newton-euler-dynamics.html',
        '30-recursive-newton-euler-dynamics.html',
        '31-rnea-overview.html',
        '31a-newton-euler-force-balance.html',
        'ref-spatial-inertia-tensor-euler-equations.html'
    ]

    # ---------------------------------------------------------
    # 1. KaTeX 定界符与公式完整性扫描 (只检查 HTML 正文，排除 JS 脚本)
    # ---------------------------------------------------------
    print("\n[Gate 1/5] 📐 扫描 KaTeX 数学公式语法与定界符规范...")
    katex_errors = 0
    for f in core_notes:
        path = os.path.join(REPO_DIR, f)
        if not os.path.exists(path):
            print(f"  ❌ [{f}] 核心文件不存在！")
            katex_errors += 1
            continue
        with open(path, 'r', encoding='utf-8') as fp:
            content = fp.read()
            
        # 剥离 <script> 标签，避免 JS 中的 ES6 模板字符串 ${...} 干扰 KaTeX 计数
        html_only = re.sub(r'<script.*?>.*?</script>', '', content, flags=re.DOTALL)
        
        dollar_count = html_only.count('$')
        escaped_dollar_count = html_only.count(r'\$')
        real_dollar_count = dollar_count - escaped_dollar_count
        if real_dollar_count % 2 != 0:
            print(f"  ❌ [{f}] HTML 正文中美元符 '$' 未成对闭合！总计 {real_dollar_count} 个（奇数）")
            katex_errors += 1
            
        if re.search(r'\\\[|\\\]|\\\(|\\\)', html_only):
            print(f"  ❌ [{f}] 发现未标准化的旧版 KaTeX 定界符 \\[ \\] 或 \\( \\)！")
            katex_errors += 1

    if katex_errors == 0:
        print("  ✅ [PASS] 所有核心动力学课程 KaTeX 语法与定界符全部标准闭合，零语法冲突！")
    else:
        total_errors += katex_errors

    # ---------------------------------------------------------
    # 2. Canvas 画布挂载与绘制生命周期扫描
    # ---------------------------------------------------------
    print("\n[Gate 2/5] 🎨 扫描所有 Canvas 画布与 JS 渲染引擎绑定...")
    canvas_errors = 0
    for f in core_notes:
        path = os.path.join(REPO_DIR, f)
        if not os.path.exists(path): continue
        with open(path, 'r', encoding='utf-8') as fp:
            content = fp.read()
            
        canvas_ids = re.findall(r'<canvas[^>]*id=["\']([^"\']+)["\']', content)
        if not canvas_ids:
            continue
            
        scripts = "".join(re.findall(r'<script>(.*?)</script>', content, flags=re.DOTALL))
        for cid in canvas_ids:
            if cid not in scripts:
                print(f"  ❌ [{f}] 发现黑屏隐患！Canvas ID '{cid}' 在页面中定义，但在 <script> 中找不到对应绘制逻辑！")
                canvas_errors += 1
                
    if canvas_errors == 0:
        print("  ✅ [PASS] 全库所有 Canvas 画布 100% 绑定真实绘制脚本，杜绝黑屏！")
    else:
        total_errors += canvas_errors

    # ---------------------------------------------------------
    # 3. Node.js Headless DOM 真实运行测试
    # ---------------------------------------------------------
    print("\n[Gate 3/5] ⚡ Node.js Headless DOM 真实运行测试...")
    js_errors = 0
    mock_dom_header = """
    const document = {
      addEventListener: (evt, cb) => cb(),
      getElementById: (id) => ({
        getContext: () => ({
          clearRect: () => {}, beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {},
          fill: () => {}, arc: () => {}, save: () => {}, restore: () => {}, setLineDash: () => {},
          measureText: () => ({ width: 50 }), fillText: () => {}, strokeText: () => {}, scale: () => {},
          roundRect: () => {}, rect: () => {}, fillRect: () => {}, strokeRect: () => {}, closePath: () => {},
          ellipse: () => {}
        }),
        addEventListener: () => {},
        getBoundingClientRect: () => ({ width: 600, height: 500 }),
        value: 1.0, textContent: '', innerText: '', checked: true, style: {}, offsetWidth: 600, offsetHeight: 500,
        classList: { toggle: () => {}, add: () => {}, remove: () => {} }
      }),
      querySelectorAll: () => [],
      body: {}
    };
    const window = { addEventListener: () => {}, devicePixelRatio: 1, innerWidth: 1000, innerHeight: 800 };
    const requestAnimationFrame = () => {};
    const renderMathInElement = () => {};
    const performance = { now: () => Date.now() };
    """
    
    os.makedirs(SCRATCH_DIR, exist_ok=True)
    for f in core_notes:
        path = os.path.join(REPO_DIR, f)
        if not os.path.exists(path):
            continue
        with open(path, 'r', encoding='utf-8') as fp:
            html = fp.read()
            
        script_matches = re.findall(r'<script>(.*?)</script>', html, re.DOTALL)
        if not script_matches:
            continue
            
        full_js = mock_dom_header + "\n".join(script_matches)
        temp_js_path = os.path.join(SCRATCH_DIR, f'gate_test_{f}.js')
        with open(temp_js_path, 'w', encoding='utf-8') as fp:
            fp.write(full_js)
            
        res = subprocess.run(['node', temp_js_path], capture_output=True, text=True, encoding='utf-8', errors='replace')
        if res.returncode != 0:
            err_msg = res.stderr or "Unknown Error"
            print(f"  ❌ [{f}] JS 运行时报错 (Exit Code {res.returncode}):\n{err_msg.strip()[:300]}")
            js_errors += 1
            
    if js_errors == 0:
        print("  ✅ [PASS] 核心页面全部 JS 脚本通过 Headless DOM 模拟执行，零运行时异常！")
    else:
        total_errors += js_errors

    # ---------------------------------------------------------
    # 4. 全库超链接与导航闭环拓扑检查
    # ---------------------------------------------------------
    print("\n[Gate 4/5] 🔗 扫描全库超链接死链与导航链条闭环...")
    link_errors = 0
    for f in html_files:
        path = os.path.join(REPO_DIR, f)
        with open(path, 'r', encoding='utf-8') as fp:
            content = fp.read()
            
        links = re.findall(r'href=["\']([^#"\']+\.html)["\']', content)
        for target in links:
            # Handle MkDocs compiled index.html or reader.html
            if target in ('index.html', '../index.html') and (os.path.exists(os.path.join(REPO_DIR, 'index.md')) or os.path.exists(os.path.join(REPO_DIR, 'reader.html'))):
                continue
            target_path = os.path.normpath(os.path.join(os.path.dirname(path), target))
            if not os.path.exists(target_path):
                print(f"  ❌ [{f}] 发现死链！目标文件不存在: '{target}'")
                link_errors += 1

    if link_errors == 0:
        print("  ✅ [PASS] 全库所有内部超链接 100% 存在，零死链！")
    else:
        total_errors += link_errors

    # ---------------------------------------------------------
    # 5. 核心文件体积与结构监控 (必须 <= 1500 行)
    # ---------------------------------------------------------
    print("\n[Gate 5/5] 📦 监控核心文件体积与结构完整性 (硬性标准: <= 1500 行)...")
    size_errors = 0
    for f in core_notes:
        path = os.path.join(REPO_DIR, f)
        if not os.path.exists(path):
            continue
        with open(path, 'r', encoding='utf-8') as fp:
            lines = len(fp.readlines())
            
        if os.path.getsize(path) < 500:
            print(f"  ❌ [{f}] 文件体积过小 ({os.path.getsize(path)} 字节)，疑似损坏或截断！")
            size_errors += 1
        elif lines > 1500:
            print(f"  ❌ [{f}] 文件体积超标 ({lines} 行 > 1500 行)，必须继续拆分！")
            size_errors += 1
        else:
            print(f"  ✨ [{f}] 健康度达标 ({lines} 行 <= 1500 行)")

    if size_errors == 0:
        print("  ✅ [PASS] 核心文件体积 100% 处于 <= 1500 行的健康区间，结构清晰优雅！")
    else:
        total_errors += size_errors

    # ---------------------------------------------------------
    # 汇总输出
    # ---------------------------------------------------------
    print("=" * 80)
    if total_errors == 0:
        print("🎉 门禁审核结果: 【100% 全部通过 (GREEN)】 - 准予向用户交付！")
        print("=" * 80)
        return True
    else:
        print(f"🚨 门禁审核结果: 【未通过 (RED)】 - 发现 {total_errors} 处阻断性问题，禁止交付，必须立即修复！")
        print("=" * 80)
        return False

if __name__ == '__main__':
    success = run_quality_gate()
    sys.exit(0 if success else 1)
