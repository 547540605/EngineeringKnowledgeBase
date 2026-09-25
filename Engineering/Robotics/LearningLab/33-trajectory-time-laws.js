(() => {
  'use strict';
  const ids = ['q0', 'qf', 'time', 'blend'];
  const input = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
  const output = { q0: document.getElementById('q0o'), qf: document.getElementById('qfo'), time: document.getElementById('timeout'), blend: document.getElementById('blendo') };
  const metric = Object.fromEntries(['v5', 'a5', 'vl', 'al', 'dq', 'hint'].map((id) => [id, document.getElementById(id)]));
  const canvas = document.getElementById('plot'); const ctx = canvas.getContext('2d');
  const read = (id) => Number(input[id].value); const f = (n, u) => `${n.toFixed(2)} ${u}`;
  function cubic(u) { return { s: 3*u*u-2*u*u*u, ds: 6*u-6*u*u, dds: 6-12*u }; }
  function quintic(u) { return { s: 10*u**3-15*u**4+6*u**5, ds: 30*u*u-60*u**3+30*u**4, dds: 60*u-180*u*u+120*u**3 }; }
  function lspb(t, T, tb) { const a = 1 / (tb * (T - tb)); if (t <= tb) return { s: .5*a*t*t, ds: a*t, dds: a }; if (t < T-tb) return { s: .5*a*tb*tb + a*tb*(t-tb), ds: a*tb, dds: 0 }; const r=T-t; return { s: 1-.5*a*r*r, ds: a*r, dds: -a }; }
  function curve(sample, q0, delta, T, type, tb) { const v=sample.ds*delta/T, a=sample.dds*delta/(T*T); return { q:q0+delta*sample.s, v, a }; }
  function drawLine(points, color, panel, maxAbs) { const {x,y,w,h}=panel; ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();points.forEach((p,i)=>{const px=x+p.u*w;const py=y+h/2-(p.value/maxAbs)*(h*.42);if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);});ctx.stroke(); }
  function update() {
    const q0=read('q0'), qf=read('qf'), T=read('time'), ratio=read('blend'), delta=qf-q0, tb=T*ratio;
    output.q0.textContent=`${q0.toFixed(1)}`;output.qf.textContent=`${qf.toFixed(1)}`;output.time.textContent=`${T.toFixed(1)}`;output.blend.textContent=`${ratio.toFixed(2)}`;
    const series={q:[],v:[],a:[]}; let maxV5=0,maxA5=0,maxVL=0;
    for(let i=0;i<=160;i++){const u=i/160,t=u*T;const c=curve(cubic(u),q0,delta,T),p=curve(quintic(u),q0,delta,T),lRaw=lspb(t,T,tb),l={q:q0+delta*lRaw.s,v:delta*lRaw.ds,a:delta*lRaw.dds};series.q.push({u,c:c.q,p:p.q,l:l.q});series.v.push({u,c:c.v,p:p.v,l:l.v});series.a.push({u,c:c.a,p:p.a,l:l.a});maxV5=Math.max(maxV5,Math.abs(p.v));maxA5=Math.max(maxA5,Math.abs(p.a));maxVL=Math.max(maxVL,Math.abs(l.v));}
    const aL=Math.abs(delta)/(tb*(T-tb));metric.v5.textContent=f(maxV5,'rad/s');metric.a5.textContent=f(maxA5,'rad/s²');metric.vl.textContent=f(maxVL,'rad/s');metric.al.textContent=f(aL,'rad/s²');metric.dq.textContent=f(Math.abs(delta),'rad');metric.hint.textContent=T<0.8?'T 很短：优先检查峰值':'拖动一类变量观察';
    ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#060b15';ctx.fillRect(0,0,canvas.width,canvas.height);const panels=[{key:'q',title:'位置 q (rad)'},{key:'v',title:'速度 q̇ (rad/s)'},{key:'a',title:'加速度 q̈ (rad/s²)'}];
    panels.forEach((meta,index)=>{const panel={x:68,y:35+index*180,w:690,h:130};const data=series[meta.key];const values=data.flatMap(p=>[p.c,p.p,p.l]);const maxAbs=Math.max(0.2,...values.map(Math.abs));ctx.strokeStyle='#26354d';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(panel.x,panel.y+panel.h/2);ctx.lineTo(panel.x+panel.w,panel.y+panel.h/2);ctx.stroke();ctx.fillStyle='#dceaff';ctx.font='bold 15px system-ui';ctx.fillText(meta.title,panel.x,panel.y-9);drawLine(data.map(p=>({u:p.u,value:p.c})),'#38bdf8',panel,maxAbs);drawLine(data.map(p=>({u:p.u,value:p.p})),'#a78bfa',panel,maxAbs);drawLine(data.map(p=>({u:p.u,value:p.l})),'#fbbf24',panel,maxAbs);[ratio,1-ratio].forEach(u=>{ctx.setLineDash([5,5]);ctx.strokeStyle='#fbbf24';ctx.beginPath();ctx.moveTo(panel.x+u*panel.w,panel.y);ctx.lineTo(panel.x+u*panel.w,panel.y+panel.h);ctx.stroke();ctx.setLineDash([]);});});
  }
  ids.forEach(id=>input[id].addEventListener('input',update));update();
})();
