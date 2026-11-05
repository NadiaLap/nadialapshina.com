(() => {
 'use strict';
 const canvas=document.querySelector('#flock'),ctx=canvas.getContext('2d'),orb=document.querySelector('#orb'),cursor=document.querySelector('#cursor');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer: fine)');
 let w=innerWidth,h=innerHeight,dpr=1,time=0,previous=0,paused=reduced.matches,lang='en',raf=0;
 let orbAngle=0, wander=null;
 const portraitBox=document.querySelector('.portrait-window');
 const mouse={x:-5000,y:-5000},particles=[];
 // A seeded, thick ribbon folds through a moving 3D flow. Each point has
 // independent inertia and pointer displacement; the ribbon is never a grid.
 let seed=24671;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
 const count=innerWidth<700?2400:7600;
 for(let i=0;i<count;i++){let u=random()*Math.PI*2,v=random()*Math.PI*2,r=Math.sqrt(random());particles.push({u,v,r,phase:random()*6.28,size:.45+random()*.7,dx:0,dy:0,vx:0,vy:0});}
 function resize(){w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,1.6);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);if(paused)draw(0);}
 function draw(dt){
  if(!ctx)return;
  ctx.clearRect(0,0,w,h);const scale=Math.min(w*.38,h*.66),cx=w*(w<700?.5:.43),cy=h*.49,t=time;
  const diameter=w<700?72:112;
  const rect=portraitBox.getBoundingClientRect();
  // A continuous, slow orbit, starting on the right. Arc-length stepping
  // keeps the travel speed constant instead of accelerating toward a target.
  const rx=w*.36,ry=Math.min(h*.14,Math.max(35,rect.height*.16));
  const centerX=w*.54;
  const centerY=Math.min(h-diameter/2-ry-20,rect.top+rect.height*.68);
  const speed=w<700?28:45;
  if(dt){for(let step=0;step<4;step++){
   const tangent=Math.hypot(rx*Math.sin(orbAngle),ry*Math.cos(orbAngle));
   orbAngle+=speed*(dt/60/4)/Math.max(tangent,1);
  }}
  let orbX=centerX+rx*Math.cos(orbAngle),orbY=centerY+ry*Math.sin(orbAngle);
  if(time>4){
   if(!wander)wander={x:orbX,y:orbY,heading:Math.atan2(ry*Math.cos(orbAngle),-rx*Math.sin(orbAngle)),tx:w*.35,ty:h*.4,until:time+8};
   const margin=diameter/2+30;
   if(time>wander.until||Math.hypot(wander.tx-wander.x,wander.ty-wander.y)<90){
    wander.tx=margin+Math.random()*Math.max(1,w-2*margin);wander.ty=margin+Math.random()*Math.max(1,h-2*margin);wander.until=time+8+Math.random()*8;
   }
   if(wander.x<margin||wander.x>w-margin||wander.y<margin||wander.y>h-margin){wander.tx=w*.5;wander.ty=h*.5;}
   const desired=Math.atan2(wander.ty-wander.y,wander.tx-wander.x);
   const delta=Math.atan2(Math.sin(desired-wander.heading),Math.cos(desired-wander.heading));
   wander.heading+=Math.max(-.8*dt/60,Math.min(.8*dt/60,delta));
   wander.x+=Math.cos(wander.heading)*speed*dt/60;wander.y+=Math.sin(wander.heading)*speed*dt/60;
   orbX=wander.x;orbY=wander.y;
  }
  const ox=orbX-diameter/2,oy=orbY-diameter/2;
  orb.style.transform=`translate3d(${ox}px,${oy}px,0)`;
  window.portraitOrb={x:orbX,y:orbY,radius:diameter/2};
  window.renderOrbEffects?.(mouse);
  for(const p of particles){
   const u=p.u+t*.095, v=p.v+t*.11;
   const fold=Math.sin(u*2+t*.22),flow=Math.sin(u*3-t*.16);
   const width=.13+.12*(.5+.5*Math.sin(u*3+t*.28));
   let x=Math.cos(u)*(.83+.15*flow)+Math.cos(v)*p.r*width;
   let y=Math.sin(u*2+t*.2)*.34+Math.sin(v)*p.r*(width+.06)+.11*Math.cos(u*3-t*.12);
   let z=Math.sin(u)*.47+Math.cos(v)*p.r*.2+fold*.17;
   const angle=.25*Math.sin(t*.12);const yy=y*Math.cos(angle)-z*Math.sin(angle);z=y*Math.sin(angle)+z*Math.cos(angle);y=yy;
   const perspective=1/(1-z*.22);let sx=cx+x*scale*perspective,sy=cy+y*scale*perspective;
   const mx=sx+p.dx-mouse.x,my=sy+p.dy-mouse.y,dist=Math.hypot(mx,my),radius=w<700?95:155;
   if(dt){
    // The blue orb pushes and curls the same particles as the pointer.
    const bx=sx+p.dx-orbX,by=sy+p.dy-orbY,bd=Math.hypot(bx,by),br=diameter*1.65;
    if(bd<br&&bd>.1){const force=Math.pow(1-bd/br,2)*2.7;p.vx+=(bx/bd-by/bd*.45)*force*dt;p.vy+=(by/bd+bx/bd*.45)*force*dt;}
    if(dist<radius&&dist>1){const force=(1-dist/radius)*.85;p.vx+=(mx/dist-my/dist*.35)*force*dt;p.vy+=(my/dist+mx/dist*.35)*force*dt;}
    p.vx-=p.dx*.012*dt;p.vy-=p.dy*.012*dt;p.vx*=Math.pow(.9,dt);p.vy*=Math.pow(.9,dt);p.dx+=p.vx*dt;p.dy+=p.vy*dt;
   }
   sx+=p.dx;sy+=p.dy;
   // Quiet contrast allows the typography to remain the first reading layer.
   const alpha=.085+(z+.8)*.075;
   ctx.fillStyle=`rgba(64,69,74,${alpha.toFixed(3)})`;const size=p.size*(1.2+z*.5);ctx.beginPath();ctx.arc(sx,sy,Math.max(.35,size),0,Math.PI*2);ctx.fill();
  }

 }
 function frame(now){if(paused||document.hidden){raf=0;return}const dt=previous?Math.min((now-previous)/16.667,2):1;previous=now;time+=dt/60;draw(dt);raf=requestAnimationFrame(frame)}
 function run(){previous=0;if(!paused&&!document.hidden&&!raf)raf=requestAnimationFrame(frame)}
 function updateMotion(){if(paused){cancelAnimationFrame(raf);raf=0}else run();}
 function resetCursor(){cursor.style.opacity='0';document.body.classList.remove('custom-cursor');mouse.x=mouse.y=-5000;window.renderOrbEffects?.(mouse)}
 window.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;mouse.x=e.clientX;mouse.y=e.clientY;if(!fine.matches||reduced.matches)return;cursor.style.setProperty('--pointer-x',e.clientX+'px');cursor.style.setProperty('--pointer-y',e.clientY+'px');cursor.style.opacity='1';cursor.classList.toggle('over-link',Boolean(e.target.closest('a, button, .cv-label')));cursor.classList.toggle('over-text',!!e.target.closest('h1,h2,p,li'));document.body.classList.add('custom-cursor');window.renderOrbEffects?.(mouse)},{passive:true});
 document.addEventListener('pointerleave',resetCursor);window.addEventListener('blur',resetCursor);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;resetCursor()}else run()});
 reduced.addEventListener('change',()=>{paused=reduced.matches;resetCursor();updateMotion()});
 document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>{lang=button.dataset.lang;document.documentElement.lang=lang;document.querySelector('#role').textContent=siteContent[lang].role;document.querySelector('#biography').textContent=siteContent[lang].bio;document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));updateMotion()}));
 document.querySelectorAll('[data-contact]').forEach(link=>{const key=link.dataset.contact,url=siteContent.links[key];if(url)link.href=key==='email'?'mailto:'+url:url;});
 window.addEventListener('resize',resize,{passive:true});resize();draw(0);updateMotion();
})();
