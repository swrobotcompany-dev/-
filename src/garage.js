'use strict';
const GARAGE_COLORS = ['#aab3bd','#d83a42','#2f79bb','#2f7666','#d49d39','#725db0','#111b28','#e8e5db','#717b8a','#e3682f'];
const CAR_PROFILES = {
  mark2: {
    name:'TOYOTA MARK II', subtitle:'JZX100 · CLASSIC SEDAN',
    body:'M 68 275 L 68 255 Q 71 243 83 239 L 151 226 L 194 174 Q 206 156 228 154 L 391 154 Q 411 156 425 172 L 465 218 L 600 229 Q 633 232 643 246 L 645 275 L 635 293 L 72 293 Z',
    glass:'M 200 219 L 230 168 L 302 166 L 302 219 Z M 313 166 L 387 168 Q 395 168 401 180 L 435 219 L 313 219 Z',
    roof:'M 194 175 Q 205 155 227 154 L 391 154 Q 408 156 423 173',
    belt:'M 80 226 L 192 226 L 449 227 L 611 239',
    doors:'M 304 226 L 302 283 M 438 228 L 441 283 M 196 228 L 189 250',
    accent:'M 82 258 C 195 249 350 249 632 255 M 105 287 L 611 287',
    handles:[260,366], rearX:181, frontX:529, wheelY:279,
    lightFront:'M 610 236 L 640 241 L 638 253 L 605 251 Z',
    lightRear:'M 73 238 L 96 235 L 95 256 L 70 255 Z',
    grille:'M 635 258 L 649 259 L 649 268 L 635 270 Z',
    mirror:'M 427 212 L 451 211 L 452 220 L 431 225 Z',
    vent:'M 568 275 L 616 274',
    stats:{speed:66,handling:63,power:62}, mass:1510
  },
  vesta: {
    name:'LADA VESTA', subtitle:'MODERN SPORT SEDAN',
    body:'M 66 275 L 69 253 Q 73 237 100 232 L 150 221 L 200 180 Q 217 160 240 160 L 393 160 Q 415 161 429 180 L 466 226 L 603 233 Q 633 236 645 252 L 643 278 L 632 292 L 70 292 Z',
    glass:'M 207 218 L 244 173 L 307 172 L 306 219 Z M 316 172 L 386 173 Q 396 175 406 188 L 433 220 L 316 220 Z',
    roof:'M 204 179 Q 218 159 243 160 L 393 160 Q 416 164 429 180',
    belt:'M 87 230 L 196 229 L 463 230 L 608 242',
    doors:'M 309 227 L 311 281 M 436 229 L 443 282 M 190 228 L 176 252',
    accent:'M 88 258 L 148 267 L 222 251 L 411 248 L 485 269 L 621 261 M 115 287 L 602 286',
    handles:[259,370], rearX:178, frontX:525, wheelY:279,
    lightFront:'M 599 240 L 641 246 L 636 254 L 600 250 Z',
    lightRear:'M 72 242 L 98 237 L 93 254 L 69 257 Z',
    grille:'M 632 258 L 649 261 L 648 273 L 632 270 Z',
    mirror:'M 422 212 L 450 215 L 452 222 L 427 225 Z',
    vent:'M 572 266 L 608 274',stats:{speed:57,handling:70,power:53},mass:1310
  },
  porsche: {
    name:'PORSCHE 911',subtitle:'REAR-ENGINE SPORTS COUPE',
    body:'M 65 277 Q 72 246 104 237 L 161 227 Q 186 219 214 190 Q 243 161 288 160 L 369 159 Q 401 162 423 189 L 460 225 Q 544 229 603 231 Q 635 236 644 253 L 646 279 L 633 289 L 70 289 Z',
    glass:'M 228 214 Q 252 175 291 174 L 316 173 L 318 223 L 220 225 Z M 327 173 L 365 173 Q 394 175 412 202 L 436 226 L 328 224 Z',
    roof:'M 212 191 Q 242 162 287 160 L 366 159 Q 397 161 422 189',
    belt:'M 99 238 Q 184 230 216 232 L 460 233 L 615 242',
    doors:'M 320 230 L 329 280 M 447 236 L 448 271',
    accent:'M 88 263 Q 198 249 291 253 Q 470 261 623 254 M 115 284 L 617 284',
    handles:[376],rearX:183,frontX:527,wheelY:279,
    lightFront:'M 612 235 Q 629 231 635 240 L 641 253 L 613 252 Q 602 244 612 235 Z',
    lightRear:'M 68 239 L 111 236 L 105 247 L 68 249 Z',
    grille:'M 628 260 L 646 261 L 644 269 L 627 272 Z',
    mirror:'M 429 216 Q 445 211 459 219 L 458 227 L 433 228 Z',
    vent:'M 140 251 L 159 250 M 144 259 L 161 257',
    stats:{speed:90,handling:94,power:85},mass:1490
  },
  bugatti: {
    name:'BUGATTI VEYRON',subtitle:'MID-ENGINE HYPERCAR',
    body:'M 59 282 L 69 251 Q 85 238 138 236 L 175 229 L 224 187 Q 239 172 270 170 L 388 171 Q 409 174 430 193 L 463 225 L 605 234 Q 639 237 652 249 L 650 280 L 632 291 L 68 291 Z',
    glass:'M 225 221 L 270 183 L 318 182 L 319 224 Z M 329 182 L 380 182 Q 403 185 418 206 L 438 226 L 329 226 Z',
    roof:'M 221 189 Q 239 169 270 170 L 389 171 Q 411 175 429 193',
    belt:'M 95 241 L 221 231 L 470 233 L 625 244',
    doors:'M 320 230 Q 347 271 389 275 Q 415 271 426 238 M 442 234 L 446 274',
    accent:'M 94 264 L 260 255 L 319 255 Q 345 289 390 287 Q 433 283 455 250 L 632 260 M 104 286 L 616 286',
    handles:[364],rearX:181,frontX:526,wheelY:281,
    lightFront:'M 615 239 L 649 245 L 644 250 L 615 248 Z',
    lightRear:'M 64 241 L 103 239 L 102 249 L 62 251 Z',
    grille:'M 628 255 Q 652 257 650 275 L 625 275 Q 624 262 628 255 Z',
    mirror:'M 422 214 L 449 214 L 454 219 L 431 224 Z',
    vent:'M 392 241 Q 408 268 388 279 M 399 245 Q 416 270 396 284',
    stats:{speed:100,handling:87,power:100},mass:1888
  }
};

let currentConfig={model:'mark2',color:'#aab3bd',wheels:'standard'};
try {
 const saved=JSON.parse(localStorage.getItem('tuning-config')||'null');
 if(saved && CAR_PROFILES[saved.model] && GARAGE_COLORS.includes(saved.color) && ['standard','sport','racing'].includes(saved.wheels)) currentConfig=saved;
} catch (_) {}

function adjustColor(hex,amount) {
 const n=parseInt(hex.replace('#',''),16);
 return '#'+[n>>16,(n>>8)&255,n&255].map(v=>Math.max(0,Math.min(255,v+amount)).toString(16).padStart(2,'0')).join('');
}
function tuningStats() {
 const s={...CAR_PROFILES[currentConfig.model].stats};
 if(currentConfig.wheels==='sport')s.handling=Math.min(100,s.handling+5);
 if(currentConfig.wheels==='racing'){s.handling=Math.min(100,s.handling+8);s.speed=Math.min(100,s.speed+3);}
 return s;
}
function wheelSVG(x,y,style) {
 const count=style==='standard'?5:style==='sport'?10:8;
 const rim=style==='racing'?'#b69b60':style==='sport'?'#9da9b6':'#89919a';
 const angleOffset=style==='sport'?Math.PI/10:0;
 let spokes='';
 for(let i=0;i<count;i++){
  const a=2*Math.PI*i/count+angleOffset,angle=a*180/Math.PI;
  const spokeW=style==='sport'?3.3:style==='racing'?5.0:7;
  spokes+=`<rect x="${-spokeW/2}" y="-29" width="${spokeW}" height="25" rx="2" fill="${rim}" transform="rotate(${angle.toFixed(2)})"/>`;
 }
 let lugs='';
 for(let i=0;i<5;i++){const a=2*Math.PI*i/5;lugs+=`<circle cx="${(Math.sin(a)*11).toFixed(2)}" cy="${(Math.cos(a)*11).toFixed(2)}" r="2.2" fill="#e9edf0"/>`;}
 return `<g transform="translate(${x} ${y})">
 <circle r="47" fill="#080c11" stroke="#363e44" stroke-width="2"/>
 <circle r="41" fill="url(#rubber)" stroke="#131b22" stroke-width="6"/>
 <circle r="34.5" fill="#101823" stroke="#495058" stroke-width="1.2"/>
 <circle r="29" fill="url(#disc)" stroke="#c0c9d1" stroke-width="2"/>
 ${spokes}<circle r="16" fill="#252c32" stroke="#929aa3" stroke-width="1.2"/>
 ${lugs}<circle r="6.5" fill="url(#hub)" stroke="#27313b" stroke-width="1.5"/>
 <path d="M -33 7 A 34 34 0 0 1 1 -34" stroke="#aab1b6" stroke-width="2" fill="none" opacity=".25"/>
 </g>`;
}
function renderCar() {
 const p=CAR_PROFILES[currentConfig.model],svg=document.getElementById('car-svg');
 const light=adjustColor(currentConfig.color,45), shade=adjustColor(currentConfig.color,-38), deep=adjustColor(currentConfig.color,-78);
 const ar=(x,r)=>`<path d="M ${x-r} ${p.wheelY} A ${r} ${r} 0 0 1 ${x+r} ${p.wheelY}" fill="none" stroke="#0b1520" stroke-width="3" opacity=".85"/>`;
 const handles=p.handles.map(x=>`<rect x="${x-14}" y="238" width="26" height="4.5" rx="2" fill="#202d36" stroke="${light}" stroke-width=".7"/>`).join('');
 svg.innerHTML=`
 <defs>
 <linearGradient id="paint" x1="0" y1="0" x2=".06" y2="1" gradientUnits="objectBoundingBox">
 <stop offset="0" stop-color="${light}"/><stop offset=".3" stop-color="${currentConfig.color}"/><stop offset=".59" stop-color="${light}"/><stop offset=".68" stop-color="${currentConfig.color}"/><stop offset="1" stop-color="${shade}"/></linearGradient>
 <linearGradient id="glass" x1="0" y1="0" x2=".3" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#9bc1cd"/><stop offset=".32" stop-color="#385c71"/><stop offset="1" stop-color="#101d2d"/></linearGradient>
 <radialGradient id="rubber"><stop stop-color="#40464c"/><stop offset=".72" stop-color="#15191c"/><stop offset="1" stop-color="#060709"/></radialGradient>
 <radialGradient id="disc"><stop stop-color="#aab5c3"/><stop offset=".6" stop-color="#566171"/><stop offset="1" stop-color="#28313d"/></radialGradient>
 <radialGradient id="hub"><stop stop-color="#d5e0e5"/><stop offset=".6" stop-color="#707a85"/><stop offset="1" stop-color="#343d46"/></radialGradient>
 <linearGradient id="lightglass"><stop stop-color="#d2edfc"/><stop offset=".8" stop-color="#f8f9df"/><stop offset="1" stop-color="#7b8d9a"/></linearGradient>
 <mask id="arch-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="700" height="400">
 <rect width="700" height="400" fill="white"/>
 <circle cx="${p.rearX}" cy="${p.wheelY}" r="48" fill="black"/>
 <circle cx="${p.frontX}" cy="${p.wheelY}" r="48" fill="black"/></mask>
 </defs>
 <ellipse cx="350" cy="326" rx="304" ry="18" fill="#000" opacity=".26"/>
 ${wheelSVG(p.rearX,p.wheelY,currentConfig.wheels)}
 ${wheelSVG(p.frontX,p.wheelY,currentConfig.wheels)}
 <path d="${p.body}" fill="url(#paint)" stroke="${deep}" stroke-width="2.2" mask="url(#arch-mask)"/>
 <path d="${p.roof}" fill="none" stroke="${light}" stroke-width="3" opacity=".9"/>
 <path d="${p.glass}" fill="url(#glass)" stroke="#131f2c" stroke-width="6" stroke-linejoin="round"/>
 <path d="${p.glass}" fill="none" stroke="#abb9c2" stroke-width="1.2" opacity=".8"/>
 <path d="${p.belt}" fill="none" stroke="${light}" stroke-width="2.3" opacity=".9"/>
 <path d="${p.doors}" fill="none" stroke="${deep}" stroke-width="1.8" opacity=".75"/>
 <path d="${p.accent}" fill="none" stroke="${shade}" stroke-width="2" opacity=".65"/>
 <path d="${p.vent}" fill="none" stroke="#1b2a34" stroke-width="3" opacity=".7"/>
 ${handles}
 <path d="${p.mirror}" fill="${shade}" stroke="${light}" stroke-width="1.4"/>
 <path d="${p.lightRear}" fill="#b71c28" stroke="#59121c" stroke-width="2"/>
 <path d="${p.lightRear}" fill="none" stroke="#f65c62" stroke-width="1.3" opacity=".85"/>
 <path d="${p.lightFront}" fill="url(#lightglass)" stroke="#334657" stroke-width="2"/>
 <path d="${p.grille}" fill="#121c27" stroke="#8495a4" stroke-width="1.5"/>
 ${ar(p.rearX,49)}${ar(p.frontX,49)}
 <path d="M 92 287 L 132 289 M 574 289 L 626 287" fill="none" stroke="#090f18" stroke-width="2" opacity=".8"/>
 `;
 document.getElementById('model-name').textContent=p.name;
 const tag=document.getElementById('model-subtitle');if(tag)tag.textContent=p.subtitle;
 const stats=tuningStats();
 for(const key of ['speed','handling','power']){
  document.getElementById(`${key}-stat`).style.width=stats[key]+'%';
  const label=document.getElementById(`${key}-value`);if(label)label.textContent=stats[key]+'/100';
 }
}
function syncSelectionUI(){
 document.querySelectorAll('.part-btn').forEach(b=>b.classList.toggle('active',currentConfig[b.dataset.part]===b.dataset.value));
 document.querySelectorAll('.color-btn').forEach(b=>b.classList.toggle('active',b.dataset.color===currentConfig.color));
}
function flashMessage(message){
 const el=document.getElementById('notification');el.textContent=message;el.classList.add('show');
 clearTimeout(flashMessage.timeout);flashMessage.timeout=setTimeout(()=>el.classList.remove('show'),2400);
}
function saveCar(){
 try{localStorage.setItem('tuning-config',JSON.stringify(currentConfig));flashMessage('✓ Конфигурация сохранена');}
 catch(_){flashMessage('Сохранение недоступно в браузере');}
}
function updateCar(){renderCar();}
function setupGarage(){
 const colorPicker=document.getElementById('color-picker');
 GARAGE_COLORS.forEach(color=>{
  const btn=document.createElement('button');btn.type='button';btn.className='color-btn';
  btn.dataset.color=color;btn.style.background=color;btn.title='Цвет '+color;btn.setAttribute('aria-label','Цвет '+color);
  btn.addEventListener('click',()=>{currentConfig.color=color;syncSelectionUI();renderCar();});
  colorPicker.appendChild(btn);
 });
 document.querySelectorAll('.part-btn').forEach(btn=>btn.addEventListener('click',()=>{
  currentConfig[btn.dataset.part]=btn.dataset.value;syncSelectionUI();renderCar();
 }));
 syncSelectionUI();renderCar();
 document.getElementById('save-car').addEventListener('click',saveCar);
 document.getElementById('drive-car').addEventListener('click',()=>window.TestDrive.open(currentConfig,CAR_PROFILES[currentConfig.model],tuningStats()));
}
window.Garage={profiles:CAR_PROFILES,getConfig:()=>({...currentConfig}),getStats:tuningStats,render:renderCar};
setupGarage();
