'use strict';
const TEST_W=1120, TEST_H=660;
const TRACK={cx:560,cy:330, outerRX:504,outerRY:278,innerRX:300,innerRY:114, lineRX:402,lineRY:196};
const GATES=[
 {x:905,y:427,label:'Сектор 1'}, {x:560,y:136,label:'Сектор 2'},
 {x:171,y:326,label:'Сектор 3'}, {x:560,y:530,label:'Финиш'}
];
const CONES=[{x:806,y:497},{x:969,y:279},{x:400,y:166},{x:242,y:460},{x:629,y:512}];
const $drive=id=>document.getElementById(id);
const drivingCanvas=$drive('track-canvas'), ctx=drivingCanvas.getContext('2d');
let car=null, config=null, profile=null, stats=null, keys=new Set(), touchKeys=new Set();
let frameId=0, previousTime=0, elapsed=0, lastHudUpdate=0;
const savedBest={};
function isDown(...names){return names.some(k=>keys.has(k)||touchKeys.has(k));}
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function formatTime(t){return !Number.isFinite(t)||t<=0?'—':`${Math.floor(t/60).toString().padStart(2,'0')}:${(t%60).toFixed(2).padStart(5,'0')}`;}
function readBest(model) {
 if(Object.hasOwn(savedBest,model))return savedBest[model];
 try{savedBest[model]=Number(localStorage.getItem('drive-best-'+model))||0;}catch(_){savedBest[model]=0;}
 return savedBest[model];
}
function resetCar(){
 if(!config)return;
 CONES.forEach(cone=>{cone.down=false;});
 car={x:557,y:526,angle:0,vx:0,vy:0,lap:1,nextGate:0,lapStart:elapsed,lastLap:0,hits:0,skids:[],drift:0,steer:0};
 $drive('drive-status').textContent='Тормози перед поворотами • круг начинается с первого сектора';
}
function onTrack(x,y){
 const outer=((x-TRACK.cx)/TRACK.outerRX)**2+((y-TRACK.cy)/TRACK.outerRY)**2;
 const inner=((x-TRACK.cx)/TRACK.innerRX)**2+((y-TRACK.cy)/TRACK.innerRY)**2;
 return outer<.975 && inner>1.045;
}
function startDrive(newConfig,newProfile,newStats){
 if(!ctx){alert('Твой браузер не поддерживает Canvas 2D');return;}
 config={...newConfig}; profile=newProfile;stats={...newStats};
 elapsed=0;lastHudUpdate=0;keys.clear();touchKeys.clear();
 resetCar();
 $drive('drive-car-name').textContent=profile.name;
 $drive('drive-overlay').classList.add('open');
 $drive('drive-overlay').setAttribute('aria-hidden','false');
 $drive('drive-best').textContent=formatTime(readBest(config.model));
 previousTime=0;
 cancelAnimationFrame(frameId);
 frameId=requestAnimationFrame(frame);
 $drive('drive-close').focus({preventScroll:true});
}
function closeDrive(){
 $drive('drive-overlay').classList.remove('open');
 $drive('drive-overlay').setAttribute('aria-hidden','true');
 keys.clear();touchKeys.clear();cancelAnimationFrame(frameId);frameId=0;car=null;
 $drive('drive-car').focus({preventScroll:true});
}
function updatePhysics(dt){
 const forward={x:Math.cos(car.angle),y:Math.sin(car.angle)};
 const forwardVelocity=car.vx*forward.x+car.vy*forward.y;
 const throttle=isDown('KeyW','ArrowUp'),brake=isDown('KeyS','ArrowDown');
 const left=isDown('KeyA','ArrowLeft'),right=isDown('KeyD','ArrowRight');
 const drifting=isDown('Space');
 const asphalt=onTrack(car.x,car.y);
 const maxSpeed=(65+stats.speed*2.25)*.68;
 let accel=0;
 if(throttle)accel=54+stats.power*.94;
 if(brake)accel=forwardVelocity>6?-230:-47;
 car.vx+=forward.x*accel*dt;car.vy+=forward.y*accel*dt;
 const speed=Math.hypot(car.vx,car.vy);
 const steer=(right?1:0)-(left?1:0);
 car.steer=steer;
 const turning=(1.45+stats.handling*.014)*Math.min(1,Math.abs(forwardVelocity)/62)
      *(1-.42*Math.min(1,speed/maxSpeed))*(forwardVelocity>=0?1:-1);
 car.angle+=steer*turning*dt;
 const lateral={x:-Math.sin(car.angle),y:Math.cos(car.angle)};
 const sideVelocity=car.vx*lateral.x+car.vy*lateral.y;
 const grip=(asphalt?7.5+stats.handling*.09:2.2)*(drifting?.24:1);
 const gripAmount=1-Math.exp(-dt*grip);
 car.vx-=lateral.x*sideVelocity*gripAmount;
 car.vy-=lateral.y*sideVelocity*gripAmount;
 const roll=asphalt?.36:2.3;
 const resistance=Math.exp(-dt*(roll+(speed/maxSpeed)**2*.65));
 car.vx*=resistance;car.vy*=resistance;
 const effectiveLimit=asphalt?maxSpeed:maxSpeed*.49;
 const v=Math.hypot(car.vx,car.vy);
 if(v>effectiveLimit){const k=1-(1-effectiveLimit/v)*Math.min(1,dt*3.2);car.vx*=k;car.vy*=k;}
 car.x+=car.vx*dt;car.y+=car.vy*dt;
 if(car.x<45||car.x>1075){car.x=clamp(car.x,45,1075);car.vx*=-.18;}
 if(car.y<40||car.y>620){car.y=clamp(car.y,40,620);car.vy*=-.18;}
 for(const cone of CONES){
  const dx=car.x-cone.x,dy=car.y-cone.y,dist=Math.hypot(dx,dy);
  if(!cone.down&&dist<24&&dist>0){
   // Конус сбивается машиной, а не становится непреодолимым препятствием.
   cone.down=true;car.vx*=.8;car.vy*=.8;car.hits++;
  }
 }
 const gate=GATES[car.nextGate],d=Math.hypot(car.x-gate.x,car.y-gate.y);
 if(d<76){
  const prev=car.nextGate;
  car.nextGate=(car.nextGate+1)%GATES.length;
  if(prev===GATES.length-1){
   const duration=elapsed-car.lapStart;
   if(duration>5){
    car.lastLap=duration;car.lap++;car.lapStart=elapsed;
    const old=readBest(config.model);
    if(!old||duration<old){
      savedBest[config.model]=duration;
      try{localStorage.setItem('drive-best-'+config.model,String(duration));}catch(_){}
      $drive('drive-status').textContent='🏁 Новый лучший круг!';
    }else{$drive('drive-status').textContent='🏁 Круг завершён!';}
   }
  }else $drive('drive-status').textContent=`✓ ${GATES[prev].label} пройден`;
 }
 if(Math.abs(sideVelocity)>35&&speed>55){
  car.skids.push({x:car.x,y:car.y,life:1});
  if(car.skids.length>240)car.skids.shift();
 }
 for(const skid of car.skids)skid.life-=dt*.16;
 car.skids=car.skids.filter(s=>s.life>0);
}
function rectRound(x,y,w,h,r,fill,stroke){
 ctx.beginPath();ctx.roundRect(x,y,w,h,r);
 ctx.fillStyle=fill;ctx.fill();
 if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
}
function drawTrack(){
 const bg=ctx.createLinearGradient(0,0,0,TEST_H);
 bg.addColorStop(0,'#183e30');bg.addColorStop(.55,'#1c4935');bg.addColorStop(1,'#143628');
 ctx.fillStyle=bg;ctx.fillRect(0,0,TEST_W,TEST_H);
 // Текстура травы вокруг асфальта и внутри кольца
 for(let i=0;i<105;i++){
  let x=(i*173+51)%TEST_W,y=(i*241+137)%TEST_H;
  ctx.fillStyle=i%3===0?'#295643':'#23503d';
  ctx.fillRect(x,y,6+(i%4)*4,2);
 }
 ctx.fillStyle='#142b27';ctx.beginPath();
 ctx.ellipse(TRACK.cx+5,TRACK.cy+7,TRACK.outerRX+10,TRACK.outerRY+10,0,0,Math.PI*2);ctx.fill();
 const trackPaint=ctx.createLinearGradient(0,70,0,603);
 trackPaint.addColorStop(0,'#454e54');trackPaint.addColorStop(.5,'#323c43');trackPaint.addColorStop(1,'#4d555c');
 ctx.fillStyle=trackPaint;ctx.beginPath();
 ctx.ellipse(TRACK.cx,TRACK.cy,TRACK.outerRX,TRACK.outerRY,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#e4dfc7';ctx.lineWidth=5;ctx.stroke();
 ctx.fillStyle='#234b38';ctx.beginPath();
 ctx.ellipse(TRACK.cx,TRACK.cy,TRACK.innerRX,TRACK.innerRY,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#dce0d9';ctx.lineWidth=5;ctx.stroke();
 ctx.strokeStyle='#c9c2a0';ctx.lineWidth=2;ctx.setLineDash([14,24]);
 ctx.beginPath();ctx.ellipse(TRACK.cx,TRACK.cy,TRACK.lineRX,TRACK.lineRY,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
 // Кербы по краям трассы
 for(const sign of [1,-1]){
  for(let i=0;i<54;i++){
   const a=i*Math.PI*2/54;
   const rx=sign===1?TRACK.outerRX-6:TRACK.innerRX+6;
   const ry=sign===1?TRACK.outerRY-6:TRACK.innerRY+6;
   const nx=TRACK.cx+Math.cos(a)*rx,ny=TRACK.cy+Math.sin(a)*ry;
   ctx.fillStyle=i%2?'#ededdf':'#cc5345';
   ctx.save();ctx.translate(nx,ny);ctx.rotate(a+Math.PI/2);ctx.fillRect(-9,-4,18,8);ctx.restore();
  }
 }
 // Стартовая клетчатая полоса поперёк дорожки
 for(let i=0;i<10;i++)for(let j=0;j<2;j++){
  ctx.fillStyle=(i+j)%2?'#1a222b':'#eae7db';
  ctx.fillRect(550+j*10,448+i*15,10,15);
 }
 // Пит-зона и объекты в центре
 rectRound(414,274,287,98,14,'#162f28','#3b6752');
 rectRound(435,290,247,66,8,'#263c38','#487664');
 ctx.textAlign='center';ctx.fillStyle='#d5e5dd';ctx.font='bold 23px system-ui';
 ctx.fillText('TEST TRACK',560,317);ctx.font='12px system-ui';ctx.fillStyle='#89b09d';
 ctx.fillText('GARAGE • HANDLING • BRAKING',560,341);
 // Контрольные точки: маркер следующей крупнее
 GATES.forEach((gate,i)=>{
  const active=i===car.nextGate;
  ctx.beginPath();ctx.arc(gate.x,gate.y,active?27:13,0,2*Math.PI);
  ctx.fillStyle=active?'rgba(89,223,171,.19)':'rgba(255,255,255,.08)';ctx.fill();
  ctx.strokeStyle=active?'#7cf8c2':'rgba(206,216,218,.38)';ctx.lineWidth=active?3:1.5;ctx.stroke();
  if(active){ctx.font='bold 12px system-ui';ctx.fillStyle='#b6ffdf';ctx.fillText('CHECKPOINT',gate.x,gate.y-38);}
 });
 CONES.forEach(cone=>{
  ctx.save();ctx.translate(cone.x,cone.y);ctx.rotate(cone.down?Math.PI/2:Math.PI/6);
  ctx.fillStyle='#16211c';ctx.beginPath();ctx.ellipse(2,4,12,8,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=cone.down?'#a34c2b':'#f97336';ctx.beginPath();ctx.moveTo(0,cone.down?-6:-11);ctx.lineTo(9,8);ctx.lineTo(-9,8);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#f8d8be';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-4,-1);ctx.lineTo(5,-1);ctx.stroke();
  ctx.restore();
 });
 // Следы шин со временем исчезают
 for(const mark of car.skids){
  ctx.fillStyle=`rgba(13,20,23,${mark.life*.22})`;
  ctx.beginPath();ctx.arc(mark.x,mark.y,2.2,0,Math.PI*2);ctx.fill();
 }
}
function drawCar(){
 const base=config.color;
 ctx.save();ctx.translate(car.x,car.y);ctx.rotate(car.angle+Math.PI/2);
 ctx.shadowColor='#030a0d';ctx.shadowBlur=18;ctx.shadowOffsetY=7;
 rectRound(-26,-50,52,100,14,adjustColorDrive(base,-48),'#19252d');
 ctx.shadowBlur=0;ctx.shadowOffsetY=0;
 // Колёса и направление передней оси
 for(const y of [-32,32])for(const x of [-28,28]){
  ctx.save();ctx.translate(x,y);
  if(y<0)ctx.rotate(car.steer*.22);
  rectRound(-6,-13,12,26,4,'#0b0e14','#59606a');ctx.restore();
 }
 // Блики кузова
 rectRound(-23,-48,46,95,11,base,'#e5e5e755');
 const reflected=ctx.createLinearGradient(-24,0,24,0);
 reflected.addColorStop(0,'rgba(255,255,255,.19)');reflected.addColorStop(.25,'rgba(255,255,255,0)');
 reflected.addColorStop(.72,'rgba(0,0,0,.1)');reflected.addColorStop(1,'rgba(0,0,0,.35)');
 rectRound(-21,-47,42,94,10,reflected);
 // Лобовое стекло / салон / заднее стекло
 rectRound(-21,-15,42,38,8,'#182e3f','#99b3bd');
 rectRound(-19,-30,38,13,5,'#5d8292','#c0d2d6');
 rectRound(-19,25,38,11,4,'#254357','#9aadb6');
 ctx.strokeStyle='#dcebf477';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(-18,-20);ctx.lineTo(18,-20);ctx.moveTo(-18,24);ctx.lineTo(18,24);ctx.stroke();
 ctx.fillStyle='#ecebcf';ctx.fillRect(-19,-48,13,4);ctx.fillRect(6,-48,13,4);
 ctx.fillStyle='#9e2631';ctx.fillRect(-18,45,36,4);
 if(config.model==='bugatti'){
  ctx.strokeStyle='#121f2f';ctx.lineWidth=5;
  ctx.beginPath();ctx.moveTo(-23,-5);ctx.quadraticCurveTo(0,19,-22,36);ctx.stroke();
 }
 if(config.model==='porsche'){
  ctx.fillStyle='#182731';ctx.fillRect(-21,36,42,4);
 }
 ctx.restore();
}
function adjustColorDrive(hex,delta){
 const h=parseInt(hex.replace('#',''),16);
 return '#'+[h>>16,(h>>8)&255,h&255].map(n=>clamp(n+delta,0,255).toString(16).padStart(2,'0')).join('');
}
function updateDashboard(){
 const speed=Math.round(Math.hypot(car.vx,car.vy)/.68);
 $drive('drive-speed').textContent=speed;
 const fw=car.vx*Math.cos(car.angle)+car.vy*Math.sin(car.angle);
 $drive('drive-gear').textContent=Math.abs(fw)<3?'N':fw>=0?'D':'R';
 $drive('drive-lap').textContent=car.lap;
 $drive('drive-time').textContent=formatTime(elapsed-car.lapStart);
 $drive('drive-best').textContent=formatTime(readBest(config.model));
 $drive('drive-checkpoint').textContent=`${car.nextGate+1} / ${GATES.length}`;
}
function frame(timestamp){
 if(!car)return;
 const dt=previousTime?clamp((timestamp-previousTime)/1000,0,.035):0;
 previousTime=timestamp;elapsed+=dt;
 if(dt)updatePhysics(dt);
 ctx.clearRect(0,0,TEST_W,TEST_H);
 drawTrack();drawCar();
 if(timestamp-lastHudUpdate>90){updateDashboard();lastHudUpdate=timestamp;}
 frameId=requestAnimationFrame(frame);
}
window.addEventListener('keydown',event=>{
 if(!$drive('drive-overlay').classList.contains('open'))return;
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(event.code))event.preventDefault();
 if(event.code==='Escape'){closeDrive();return;}
 if(event.code==='KeyR'){resetCar();return;}
 keys.add(event.code);
});
window.addEventListener('keyup',event=>keys.delete(event.code));
window.addEventListener('blur',()=>{keys.clear();touchKeys.clear();});
$drive('drive-close').addEventListener('click',closeDrive);
$drive('drive-reset').addEventListener('click',resetCar);
document.querySelectorAll('[data-drive-key]').forEach(button=>{
 const key=button.dataset.driveKey;
 const release=()=>{touchKeys.delete(key);button.classList.remove('pressed');};
 button.addEventListener('pointerdown',e=>{e.preventDefault();touchKeys.add(key);button.classList.add('pressed');button.setPointerCapture(e.pointerId);});
 ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>button.addEventListener(ev,release));
});
window.TestDrive={open:startDrive,close:closeDrive};
