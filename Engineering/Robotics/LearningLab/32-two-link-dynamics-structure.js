(() => {
  'use strict';
  const ids = ['q1', 'q2', 'dq1', 'dq2', 'ddq1', 'ddq2'];
  const input = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
  const out = Object.fromEntries(ids.map((id) => [id, document.getElementById(`${id}o`)]));
  const resultIds = ['m11', 'm12', 'm22', 'h1', 'h2', 'g1', 'g2', 'dyn1', 'dyn2', 'tau1', 'tau2'];
  const result = Object.fromEntries(resultIds.map((id) => [id, document.getElementById(id)]));
  const number = (id) => Number(input[id].value);
  const rad = (value) => value * Math.PI / 180;
  const f = (value, unit) => `${value.toFixed(2)} ${unit}`;
  function update() {
    const q1Deg = number('q1'); const q2Deg = number('q2');
    const q1 = rad(q1Deg); const q2 = rad(q2Deg);
    const dq1 = number('dq1'); const dq2 = number('dq2');
    const ddq1 = number('ddq1'); const ddq2 = number('ddq2');
    out.q1.textContent = `${q1Deg.toFixed(0)}°`; out.q2.textContent = `${q2Deg.toFixed(0)}°`;
    ['dq1', 'dq2', 'ddq1', 'ddq2'].forEach((id) => { out[id].textContent = number(id).toFixed(1); });
    const l1 = 0.60, r1 = 0.30, r2 = 0.225, mass1 = 2.0, mass2 = 1.4, gravity = 9.81;
    const i1 = mass1 * l1 * l1 / 12; const i2 = mass2 * 0.45 * 0.45 / 12;
    const c2 = Math.cos(q2); const s2 = Math.sin(q2);
    const m11 = i1 + i2 + mass1 * r1 * r1 + mass2 * (l1 * l1 + r2 * r2 + 2 * l1 * r2 * c2);
    const m12 = i2 + mass2 * (r2 * r2 + l1 * r2 * c2); const m22 = i2 + mass2 * r2 * r2;
    const h1 = -mass2 * l1 * r2 * s2 * (2 * dq1 * dq2 + dq2 * dq2);
    const h2 = mass2 * l1 * r2 * s2 * dq1 * dq1;
    const g1 = (mass1 * r1 + mass2 * l1) * gravity * Math.cos(q1) + mass2 * r2 * gravity * Math.cos(q1 + q2);
    const g2 = mass2 * r2 * gravity * Math.cos(q1 + q2);
    const dyn1 = m11 * ddq1 + m12 * ddq2 + h1; const dyn2 = m12 * ddq1 + m22 * ddq2 + h2;
    const values = { m11, m12, m22, h1, h2, g1, g2, dyn1, dyn2, tau1: dyn1 + g1, tau2: dyn2 + g2 };
    for (const [id, value] of Object.entries(values)) result[id].textContent = f(value, id.startsWith('m') ? 'kg·m²' : 'N·m');
  }
  ids.forEach((id) => input[id].addEventListener('input', update));
  update();
})();
