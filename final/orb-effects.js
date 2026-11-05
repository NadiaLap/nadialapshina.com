(() => {
 const letters=document.createElement('div'),content=document.createElement('div');
 letters.className='orb-white-letters';content.className='orb-text-layout';
 letters.setAttribute('aria-hidden','true');letters.setAttribute('inert','');document.body.append(letters);
 letters.append(content);
 const cursor = document.querySelector('#cursor');
 const headerInk = document.createElement('div');
 headerInk.className = 'cursor-header-ink';
 headerInk.setAttribute('inert', '');
 cursor.append(headerInk);

 function syncCursorHeader() {
   const header = document.querySelector('body > header');
   const copy = header.cloneNode(true);
   headerInk.replaceChildren(copy);
   const bounds = header.getBoundingClientRect();
   headerInk.style.width = bounds.width + 'px';
   headerInk.style.setProperty('--header-left', bounds.left + 'px');
   headerInk.style.setProperty('--header-top', bounds.top + 'px');
 }
 window.addEventListener('resize', syncCursorHeader);
 window.addEventListener('scroll', syncCursorHeader, { passive: true });
 function cloneText(){content.replaceChildren();for(const selector of ['header','main','footer']){const copy=document.querySelector('body > '+selector).cloneNode(true);copy.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));copy.querySelectorAll('a,button,[tabindex]').forEach(el=>el.setAttribute('tabindex','-1'));content.append(copy);}syncCursorHeader();}
 cloneText();document.querySelectorAll('body > header [data-lang]').forEach(button=>button.addEventListener('click',cloneText));
 window.renderOrbEffects=()=>{
  const orb=window.portraitOrb;if(!orb)return;
  letters.style.clipPath=`circle(${orb.radius}px at ${orb.x}px ${orb.y}px)`;
  content.style.transform=`translateY(${-scrollY}px)`;
 };
})();
