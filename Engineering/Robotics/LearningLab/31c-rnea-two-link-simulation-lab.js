(() => {
  'use strict';
  const canvas = document.getElementById('lab');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const ids = ['q1', 'q2', 'dq1', 'dq2', 'ddq1', 'ddq2', 'm1', 'm2'];
  const inputs = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
  const outputs = Object.fromEntries(ids.map((id) => [id, document.getElementById(`${id}o`)]));
  const metrics = Object.fromEntries(['a1v', 'a2v', 'f1v', 'f2v', 't1v', 't2v'].map((id) => [id, document.getElementById(id)]));
  const L1 = 0.60;
  const L2 = 0.45;
  const origin = { x: 150, y: 382 };
  const pxPerM = 315;

  const read = (id) => Number(inputs[id].value);
  const rad = (deg) => deg * Math.PI / 180;
  const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
  const scale = (v, k) => ({ x: v.x * k, y: v.y * k });
  const mag = (v) => Math.hypot(v.x, v.y);
  const cross = (a, b) => a.x * b.y - a.y * b.x;
  const point = (base, length, theta) => ({ x: base.x + length * Math.cos(theta), y: base.y - length * Math.sin(theta) });
  const accelerationOfRadius = (length, theta, omega, alpha) => ({
    x: -length * Math.cos(theta) * omega * omega - length * Math.sin(theta) * alpha,
    y: length * Math.sin(theta) * omega * omega - length * Math.cos(theta) * alpha
  });
  const format = (value, unit) => `${value.toFixed(2)} ${unit}`;

  function drawArrow(from, vector, color, label, offsetY = 0) {
    const len = mag(vector);
    if (len < 1e-8) return;
    const visualScale = Math.min(82 / len, 58);
    const to = { x: from.x + vector.x * visualScale, y: from.y - vector.y * visualScale };
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - 11 * Math.cos(angle - Math.PI / 6), to.y - 11 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(to.x - 11 * Math.cos(angle + Math.PI / 6), to.y - 11 * Math.sin(angle + Math.PI / 6));
    ctx.closePath(); ctx.fill();
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText(label, to.x + 8, to.y + offsetY - 6);
  }

  function drawLink(a, b, color, label) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.fillStyle = '#f8fafc'; ctx.strokeStyle = color; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(a.x, a.y, 11, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    ctx.fillStyle = color; ctx.font = 'bold 16px system-ui, sans-serif'; ctx.fillText(label, mid.x - 18, mid.y - 16);
  }

  function drawCom(p, label) {
    ctx.fillStyle = '#a78bfa'; ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d8cbff'; ctx.font = 'bold 15px system-ui, sans-serif'; ctx.fillText(label, p.x + 12, p.y + 18);
  }

  function update() {
    const q1 = rad(read('q1'));
    const q2 = rad(read('q2'));
    const dq1 = read('dq1'); const dq2 = read('dq2');
    const ddq1 = read('ddq1'); const ddq2 = read('ddq2');
    const m1 = read('m1'); const m2 = read('m2');
    outputs.q1.textContent = `${read('q1').toFixed(0)}°`;
    outputs.q2.textContent = `${read('q2').toFixed(0)}°`;
    ['dq1', 'dq2'].forEach((id) => { outputs[id].textContent = `${read(id).toFixed(1)}`; });
    ['ddq1', 'ddq2'].forEach((id) => { outputs[id].textContent = `${read(id).toFixed(1)}`; });
    ['m1', 'm2'].forEach((id) => { outputs[id].textContent = `${read(id).toFixed(1)}`; });

    const q12 = q1 + q2;
    const elbowM = point({ x: 0, y: 0 }, L1, q1);
    const c1M = point({ x: 0, y: 0 }, L1 / 2, q1);
    const c2M = add(elbowM, point({ x: 0, y: 0 }, L2 / 2, q12));
    const a1 = accelerationOfRadius(L1 / 2, q1, dq1, ddq1);
    const aElbow = accelerationOfRadius(L1, q1, dq1, ddq1);
    const a2 = add(aElbow, accelerationOfRadius(L2 / 2, q12, dq1 + dq2, ddq1 + ddq2));
    const f1 = scale(a1, m1); const f2 = scale(a2, m2);
    const r1 = L1 / 2; const r2 = L2 / 2;
    const I1 = m1 * L1 * L1 / 12; const I2 = m2 * L2 * L2 / 12;
    const c = Math.cos(q2); const s = Math.sin(q2);
    const M11 = I1 + I2 + m1 * r1 * r1 + m2 * (L1 * L1 + r2 * r2 + 2 * L1 * r2 * c);
    const M12 = I2 + m2 * (r2 * r2 + L1 * r2 * c);
    const M22 = I2 + m2 * r2 * r2;
    const h1 = -m2 * L1 * r2 * s * (2 * dq1 * dq2 + dq2 * dq2);
    const h2 = m2 * L1 * r2 * s * dq1 * dq1;
    const tau1 = M11 * ddq1 + M12 * ddq2 + h1;
    const tau2 = M12 * ddq1 + M22 * ddq2 + h2;
    metrics.a1v.textContent = format(mag(a1), 'm/s²'); metrics.a2v.textContent = format(mag(a2), 'm/s²');
    metrics.f1v.textContent = format(mag(f1), 'N'); metrics.f2v.textContent = format(mag(f2), 'N');
    metrics.t1v.textContent = format(tau1, 'N·m'); metrics.t2v.textContent = format(tau2, 'N·m');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#060b15'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#26354d'; ctx.lineWidth = 1; ctx.setLineDash([5, 7]);
    for (let x = 70; x < canvas.width; x += 80) { ctx.beginPath(); ctx.moveTo(x, 44); ctx.lineTo(x, 460); ctx.stroke(); }
    for (let y = 60; y < 470; y += 80) { ctx.beginPath(); ctx.moveTo(36, y); ctx.lineTo(805, y); ctx.stroke(); }
    ctx.setLineDash([]);
    const elbow = { x: origin.x + elbowM.x * pxPerM, y: origin.y - elbowM.y * pxPerM };
    const c1p = { x: origin.x + c1M.x * pxPerM, y: origin.y - c1M.y * pxPerM };
    const c2p = { x: origin.x + c2M.x * pxPerM, y: origin.y - c2M.y * pxPerM };
    const tipM = add(elbowM, point({ x: 0, y: 0 }, L2, q12));
    const tip = { x: origin.x + tipM.x * pxPerM, y: origin.y - tipM.y * pxPerM };
    drawLink(origin, elbow, '#38bdf8', 'L₁'); drawLink(elbow, tip, '#34d399', 'L₂'); drawCom(c1p, 'C₁'); drawCom(c2p, 'C₂');
    drawArrow(c1p, a1, '#fb7185', 'a₁', -13); drawArrow(c1p, f1, '#fbbf24', 'F₁', 13);
    drawArrow(c2p, a2, '#fb7185', 'a₂', -13); drawArrow(c2p, f2, '#fbbf24', 'F₂', 13);
    ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(origin.x, origin.y, 12, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = '#dceaff'; ctx.font = 'bold 17px system-ui, sans-serif'; ctx.fillText('基座', origin.x - 25, origin.y + 35);
    ctx.fillStyle = '#9aaac0'; ctx.font = '15px system-ui, sans-serif'; ctx.fillText('红：质心加速度    橙：F=m·a', 470, 45);
    ctx.fillText('平面教学模型：g=0，外载=0，摩擦=0', 470, 69);
  }
  ids.forEach((id) => inputs[id].addEventListener('input', update));
  update();
})();
