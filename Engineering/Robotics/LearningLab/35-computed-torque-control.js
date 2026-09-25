(() => {
  const $=id=>document.getElementById(id);
  const ids=['kp','kd','payload','mismatch','limit'];
  const inputs=Object.fromEntries(ids.map(id=>[id,$(id)])), outputs=Object.fromEntries(ids.map(id=>[id,$(id+'o')]));
  const canvas=$('plot'),ctx=canvas.getContext('2d');
  const c={ref:'#a78bfa',pd:'#38bdf8',ctc:'#34d399',grid:'#26354d',text:'#9aaac0'};
  const val=id=>Number(inputs[id].value);
  const fmt=(id,n)=>id==='payload'?n.toFixed(1)+'×':id==='mismatch'?(n>0?'+':'')+n.toFixed(0)+'%':id==='limit'?n.toFixed(0)+' N·m':n.toFixed(0);
  function ref(t){return {q:[.60*Math.sin(1.2*t),.45*Math.cos(1.2*t)],v:[.72*Math.cos(1.2*t),-.54*Math.sin(1.2*t)],a:[-.864*Math.sin(1.2*t),-.648*Math.cos(1.2*t)]};}
  function model(q,v,m2){
    const [q1,q2]=q,[v1,v2]=v,m1=2,l1=.5,r1=.25,r2=.2,I1=.04,I2=.025,g=9.81,co=Math.cos(q2),si=Math.sin(q2);
    const m11=I1+I2+m1*r1*r1+m2*(l1*l1+r2*r2+2*l1*r2*co),m12=I2+m2*(r2*r2+l1*r2*co),m22=I2+m2*r2*r2;
    return {M:[[m11,m12],[m12,m22]],h:[-m2*l1*r2*si*(2*v1*v2+v2*v2),m2*l1*r2*si*v1*v1],g:[(m1*r1+m2*l1)*g*Math.cos(q1)+m2*r2*g*Math.cos(q1+q2),m2*r2*g*Math.cos(q1+q2)]};
  }
  const mv=(M,x)=>[M[0][0]*x[0]+M[0][1]*x[1],M[1][0]*x[0]+M[1][1]*x[1]];
  function solve(M,b){const d=M[0][0]*M[1][1]-M[0][1]*M[1][0];return [(M[1][1]*b[0]-M[0][1]*b[1])/d,(M[0][0]*b[1]-M[1][0]*b[0])/d];}
  function clamp(x,l){return Math.max(-l,Math.min(l,x));}
  function run(kind){
    const kp=val('kp'),kd=val('kd'),mass=1.5*val('payload'),estMass=mass*(1+val('mismatch')/100),limit=val('limit'),dt=.002,steps=2500;
    let r=ref(0),q=[...r.q],v=[...r.v],sat=0,out=[];
    for(let k=0;k<=steps;k++){
      const t=k*dt,d=ref(t),e=[d.q[0]-q[0],d.q[1]-q[1]],ed=[d.v[0]-v[0],d.v[1]-v[1]];
      let tau;
      if(kind==='ctc'){const mm=model(q,v,estMass),virt=[d.a[0]+kd*ed[0]+kp*e[0],d.a[1]+kd*ed[1]+kp*e[1]],ff=mv(mm.M,virt);tau=[ff[0]+mm.h[0]+mm.g[0],ff[1]+mm.h[1]+mm.g[1]];}
      else tau=[kp*e[0]+kd*ed[0],kp*e[1]+kd*ed[1]];
      tau=tau.map(x=>{const y=clamp(x,limit);if(y!==x)sat++;return y;});
      const actual=model(q,v,mass),a=solve(actual.M,[tau[0]-actual.h[0]-actual.g[0]-.55*v[0],tau[1]-actual.h[1]-actual.g[1]-.35*v[1]]);
      out.push({t,q1:q[0],q2:q[1],d1:d.q[0],d2:d.q[1],err:Math.hypot(e[0],e[1])});
      v=[v[0]+a[0]*dt,v[1]+a[1]*dt];q=[q[0]+v[0]*dt,q[1]+v[1]*dt];
    } return {out,sat};
  }
  function bounds(arr){let lo=Math.min(...arr),hi=Math.max(...arr);if(Math.abs(hi-lo)<1e-7){lo-=1;hi+=1;}const p=(hi-lo)*.15;return[lo-p,hi+p];}
  function drawPath(data,key,rect,b,stroke){ctx.beginPath();data.forEach((p,i)=>{const x=rect.x+rect.w*i/(data.length-1),y=rect.y+rect.h*(1-(p[key]-b[0])/(b[1]-b[0]));i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle=stroke;ctx.lineWidth=2.35;ctx.stroke();}
  function chart(rect,label,sets,b){ctx.strokeStyle=c.grid;ctx.lineWidth=1;ctx.strokeRect(rect.x,rect.y,rect.w,rect.h);for(let i=1;i<4;i++){const y=rect.y+rect.h*i/4;ctx.beginPath();ctx.moveTo(rect.x,y);ctx.lineTo(rect.x+rect.w,y);ctx.stroke();}ctx.fillStyle=c.text;ctx.font='13px system-ui';ctx.fillText(label,rect.x+8,rect.y+18);ctx.fillText(b[1].toFixed(2),rect.x+5,rect.y+34);ctx.fillText(b[0].toFixed(2),rect.x+5,rect.y+rect.h-7);sets.forEach(([d,key,stroke])=>drawPath(d,key,rect,b,stroke));}
  function draw(pd,ctc){const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#060b15';ctx.fillRect(0,0,w,h);const l=62,r=24,t=22,b=30,gap=20,cw=w-l-r,ch=(h-t-b-2*gap)/3;const qb=bounds([...pd.out.map(p=>p.q1),...ctc.out.map(p=>p.q1),...pd.out.map(p=>p.d1)]),q2b=bounds([...pd.out.map(p=>p.q2),...ctc.out.map(p=>p.q2),...pd.out.map(p=>p.d2)]),eb=bounds([...pd.out.map(p=>p.err),...ctc.out.map(p=>p.err)]);chart({x:l,y:t,w:cw,h:ch},'关节 1 位置 q₁ (rad)',[[pd.out,'d1',c.ref],[pd.out,'q1',c.pd],[ctc.out,'q1',c.ctc]],qb);chart({x:l,y:t+ch+gap,w:cw,h:ch},'关节 2 位置 q₂ (rad)',[[pd.out,'d2',c.ref],[pd.out,'q2',c.pd],[ctc.out,'q2',c.ctc]],q2b);chart({x:l,y:t+2*(ch+gap),w:cw,h:ch},'两关节误差范数 ‖e‖₂ (rad)',[[pd.out,'err',c.pd],[ctc.out,'err',c.ctc]],eb);ctx.fillStyle=c.text;ctx.font='12px system-ui';ctx.fillText('0 s',l,h-9);ctx.fillText('5 s',l+cw-20,h-9);}
  function update(){ids.forEach(id=>outputs[id].textContent=fmt(id,val(id)));const pd=run('pd'),ctc=run('ctc'),pp=Math.max(...pd.out.map(p=>p.err)),cp=Math.max(...ctc.out.map(p=>p.err));$('pdPeak').textContent=pp.toFixed(3)+' rad';$('ctcPeak').textContent=cp.toFixed(3)+' rad';$('pdSat').textContent=pd.sat+' 次';$('ctcSat').textContent=ctc.sat+' 次';$('hint').textContent=val('mismatch')===0?'模型匹配：看 CTC 先抵消 M/h/g': '模型失配：反馈仍需负责纠错';draw(pd,ctc);}
  ids.forEach(id=>inputs[id].addEventListener('input',update));update();
})();
