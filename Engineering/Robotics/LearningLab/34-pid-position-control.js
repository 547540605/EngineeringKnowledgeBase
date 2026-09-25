(() => {
  const $ = id => document.getElementById(id);
  const ids = ['kp', 'kd', 'ki', 'limit', 'target', 'disturb', 'inertia'];
  const fields = Object.fromEntries(ids.map(id => [id, $(id)]));
  const outputs = Object.fromEntries(ids.map(id => [id, $(id + 'o')]));
  const canvas = $('plot'), ctx = canvas.getContext('2d');
  const color = { target:'#a78bfa', actual:'#38bdf8', error:'#fb7185', torque:'#fbbf24', grid:'#26354d', text:'#9aaac0' };

  function value(id) { return Number(fields[id].value); }
  function format(id, n) {
    if (id === 'limit' || id === 'disturb') return n.toFixed(1) + ' N·m';
    if (id === 'inertia') return n.toFixed(1) + ' kg·m²';
    if (id === 'target') return n.toFixed(1) + ' rad';
    return n.toFixed(id === 'kp' ? 0 : 1);
  }
  function series() {
    const kp=value('kp'), kd=value('kd'), ki=value('ki'), limit=value('limit');
    const target=value('target'), disturbance=value('disturb'), inertia=value('inertia');
    const dt=.002, steps=2500, damping=.8, integralLimit=3;
    let q=0, v=0, integral=0, saturated=false;
    const out=[];
    for(let i=0;i<=steps;i++) {
      const t=i*dt, e=target-q, edot=-v;
      const unsat=kp*e+kd*edot+ki*integral;
      const tau=Math.max(-limit, Math.min(limit, unsat));
      const atLimit=Math.abs(unsat-tau)>1e-8;
      if (ki !== 0 && (!atLimit || Math.sign(e)!==Math.sign(unsat))) integral=Math.max(-integralLimit,Math.min(integralLimit,integral+e*dt));
      saturated ||= atLimit;
      const a=(tau-disturb-damping*v)/inertia;
      out.push({t,target,q,e,tau});
      v+=a*dt; q+=v*dt;
    }
    return {out, integral, saturated};
  }
  function range(data, key, extras=[]) {
    const vals=data.map(p=>p[key]).concat(extras);
    let lo=Math.min(...vals), hi=Math.max(...vals);
    if (Math.abs(hi-lo)<1e-7) { lo-=1; hi+=1; }
    const pad=(hi-lo)*.15; return [lo-pad,hi+pad];
  }
  function path(data, key, rect, bounds, stroke) {
    const [lo,hi]=bounds, n=data.length-1;
    ctx.beginPath();
    data.forEach((p,i)=>{
      const x=rect.x+rect.w*i/n, y=rect.y+rect.h*(1-(p[key]-lo)/(hi-lo));
      i?ctx.lineTo(x,y):ctx.moveTo(x,y);
    });
    ctx.strokeStyle=stroke;ctx.lineWidth=2.5;ctx.stroke();
  }
  function chart(data, rect, label, keys, bounds) {
    ctx.strokeStyle=color.grid;ctx.lineWidth=1;ctx.strokeRect(rect.x,rect.y,rect.w,rect.h);
    for(let i=1;i<4;i++){const y=rect.y+rect.h*i/4;ctx.beginPath();ctx.moveTo(rect.x,y);ctx.lineTo(rect.x+rect.w,y);ctx.stroke();}
    ctx.fillStyle=color.text;ctx.font='13px system-ui';ctx.fillText(label,rect.x+8,rect.y+18);
    ctx.fillText(bounds[1].toFixed(2),rect.x+5,rect.y+34);ctx.fillText(bounds[0].toFixed(2),rect.x+5,rect.y+rect.h-7);
    keys.forEach(([key,stroke])=>path(data,key,rect,bounds,stroke));
  }
  function draw(data) {
    const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#060b15';ctx.fillRect(0,0,w,h);
    const pad={l:62,r:24,t:22,b:30}, gap=28, ch=(h-pad.t-pad.b-gap)/2, cw=w-pad.l-pad.r;
    const qBounds=range(data,'q',data.map(p=>p.target)); const lower=range(data,'tau',data.map(p=>p.e));
    chart(data,{x:pad.l,y:pad.t,w:cw,h:ch},'位置 (rad)',[['target',color.target],['q',color.actual]],qBounds);
    chart(data,{x:pad.l,y:pad.t+ch+gap,w:cw,h:ch},'误差 e (粉) / 力矩 τ_cmd (黄)',[['e',color.error],['tau',color.torque]],lower);
    ctx.fillStyle=color.text;ctx.font='12px system-ui';ctx.fillText('0 s',pad.l,pad.t+2*ch+gap+20);ctx.fillText('5 s',pad.l+cw-20,pad.t+2*ch+gap+20);
  }
  function update() {
    ids.forEach(id=>outputs[id].textContent=format(id,value(id)));
    const s=series(), data=s.out, final=data.at(-1), max=Math.max(...data.map(p=>Math.abs(p.e)));
    $('finalError').textContent=final.e.toFixed(3)+' rad';
    $('maxError').textContent=max.toFixed(3)+' rad';
    $('saturated').textContent=s.saturated?'是：检查限幅与积分':'否';
    $('integral').textContent=s.integral.toFixed(3)+' rad·s';
    $('hint').textContent=value('ki')===0&&value('disturb')>0?'Ki=0：留意持续误差':value('ki')>0&&s.saturated?'有 I 且饱和：留意 windup':'改变一个参数，观察因果';
    draw(data);
  }
  ids.forEach(id=>fields[id].addEventListener('input',update));
  update();
})();
