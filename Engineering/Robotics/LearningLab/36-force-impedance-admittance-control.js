(() => {
  const $=id=>document.getElementById(id), ids=['wall','ka','ba','kp','kd'];
  const input=Object.fromEntries(ids.map(id=>[id,$(id)])),out=Object.fromEntries(ids.map(id=>[id,$(id+'o')]));
  const canvas=$('plot'),ctx=canvas.getContext('2d');
  const c={nom:'#a78bfa',wall:'#94a3b8',pos:'#38bdf8',adm:'#34d399',grid:'#26354d',text:'#9aaac0'};
  const n=id=>Number(input[id].value);
  const fmt=(id,v)=>id==='wall'||id==='ka'?v.toFixed(0)+' N/m':id==='ba'?v.toFixed(0)+' N·s/m':v.toFixed(0);
  function nominal(t){const u=Math.max(0,Math.min(1,t/.8)),s=10*u*u*u-15*u*u*u*u+6*u*u*u*u*u;return .65*s;}
  function run(admittance){
    const dt=.001,steps=3000,mass=1,damping=14,wall=.4,kEnv=n('wall'),kp=n('kp'),kd=n('kd'),ma=1,ba=n('ba'),ka=n('ka');
    let x=0,v=0,e=0,de=0,maxF=0,arr=[];
    for(let i=0;i<=steps;i++){
      const t=i*dt,xnom=nominal(t),fEnv=x>wall?-kEnv*(x-wall)-35*Math.max(0,v):0;
      let cmd=xnom;
      if(admittance){const ae=(fEnv-ba*de-ka*e)/ma;de+=ae*dt;e+=de*dt;cmd=xnom+e;}
      const a=(kp*(cmd-x)-kd*v+fEnv-damping*v)/mass;v+=a*dt;x+=v*dt;
      maxF=Math.max(maxF,-fEnv);arr.push({t,xnom,x,force:-fEnv,offset:e});
    } return {arr,maxF,offset:e};
  }
  function bounds(values){let lo=Math.min(...values),hi=Math.max(...values);if(Math.abs(hi-lo)<1e-8){lo-=1;hi+=1;}const p=(hi-lo)*.13;return[lo-p,hi+p];}
  function path(data,key,rect,b,stroke,dash=[]){ctx.save();ctx.setLineDash(dash);ctx.beginPath();data.forEach((p,i)=>{const x=rect.x+rect.w*i/(data.length-1),y=rect.y+rect.h*(1-(p[key]-b[0])/(b[1]-b[0]));i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle=stroke;ctx.lineWidth=2.4;ctx.stroke();ctx.restore();}
  function chart(rect,label,sets,b){ctx.strokeStyle=c.grid;ctx.lineWidth=1;ctx.strokeRect(rect.x,rect.y,rect.w,rect.h);for(let i=1;i<4;i++){const y=rect.y+rect.h*i/4;ctx.beginPath();ctx.moveTo(rect.x,y);ctx.lineTo(rect.x+rect.w,y);ctx.stroke();}ctx.fillStyle=c.text;ctx.font='13px system-ui';ctx.fillText(label,rect.x+8,rect.y+18);ctx.fillText(b[1].toFixed(2),rect.x+5,rect.y+34);ctx.fillText(b[0].toFixed(2),rect.x+5,rect.y+rect.h-7);sets.forEach(([data,key,stroke,dash=[]])=>path(data,key,rect,b,stroke,dash));}
  function draw(pos,adm){const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#060b15';ctx.fillRect(0,0,w,h);const l=62,r=24,t=22,b=30,gap=28,cw=w-l-r,ch=(h-t-b-gap)/2;const xb=bounds([...pos.arr.map(p=>p.x),...adm.arr.map(p=>p.x),...pos.arr.map(p=>p.xnom),.4]),fb=bounds([...pos.arr.map(p=>p.force),...adm.arr.map(p=>p.force),0]);chart({x:l,y:t,w:cw,h:ch},'末端位置 x (m)',[[pos.arr,'xnom',c.nom,[6,4]],[pos.arr,'x',c.pos],[adm.arr,'x',c.adm],[pos.arr.map(p=>({...p,wall:.4})),'wall',c.wall,[3,4]]],xb);chart({x:l,y:t+ch+gap,w:cw,h:ch},'接触力大小 |F_contact| (N)',[[pos.arr,'force',c.pos],[adm.arr,'force',c.adm]],fb);ctx.fillStyle=c.text;ctx.font='12px system-ui';ctx.fillText('0 s',l,h-9);ctx.fillText('3 s',l+cw-20,h-9);}
  function update(){ids.forEach(id=>out[id].textContent=fmt(id,n(id)));const pos=run(false),adm=run(true);$('posForce').textContent=pos.maxF.toFixed(1)+' N';$('admForce').textContent=adm.maxF.toFixed(1)+' N';$('offset').textContent=adm.offset.toFixed(3)+' m';$('hint').textContent=n('ka')<100?'虚拟刚度低：更容易让位，留意漂移':'提高 K_a：更硬，也可能增大接触力';draw(pos,adm);}
  ids.forEach(id=>input[id].addEventListener('input',update));update();
})();
