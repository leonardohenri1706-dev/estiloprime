
/* ============ HELPERS ============ */
const brl=v=>v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
function imgSrc(p,w){return p.imgFull||IMG(p.img,w||800);}
function safeMM(q){try{return !!(window.matchMedia&&window.matchMedia(q).matches)}catch(e){return false}}
const REDUCED=safeMM("(prefers-reduced-motion: reduce)");

/* ============ REVEAL ============ */
const io=("IntersectionObserver" in window)?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}}),{threshold:.08}):null;
function observeRv(){const els=document.querySelectorAll(".rv:not(.in)");if(!io){els.forEach(el=>el.classList.add("in"));return;}els.forEach(el=>io.observe(el));}
function safetyReveal(){setTimeout(function(){document.querySelectorAll(".rv:not(.in)").forEach(function(el){el.classList.add("in");});},1400);}

/* ============ PROGRESSO + PARALLAX ============ */
const progEl=document.getElementById("scroll-progress");
function updProgress(){if(!progEl)return;const h=document.documentElement;const max=h.scrollHeight-h.clientHeight;progEl.style.width=(max>0?(scrollY/max)*100:0)+"%";}
addEventListener("scroll",updProgress,{passive:true});updProgress();

const plxEls=[...document.querySelectorAll("[data-plx]")];
let plxC=[],plxTick=false;
function cachePlx(){plxC=plxEls.map(el=>{el.style.transform="";const r=el.getBoundingClientRect();return{el,top:r.top+scrollY,h:r.height,d:+el.dataset.plx||.1};});runPlx();}
function runPlx(){plxTick=false;const sy=scrollY,vh=innerHeight;for(const o of plxC){const d=(o.top+o.h/2)-(sy+vh/2);o.el.style.transform="translate3d(0,"+(-d*o.d).toFixed(1)+"px,0)";}}
if(!REDUCED&&plxEls.length){
  addEventListener("scroll",()=>{if(plxTick)return;plxTick=true;requestAnimationFrame(runPlx);},{passive:true});
  addEventListener("resize",cachePlx);addEventListener("load",cachePlx);cachePlx();
}

/* ============ TILT ============ */
if(!REDUCED&&safeMM("(pointer: fine)")){
  document.addEventListener("pointermove",e=>{
    const card=e.target.closest?e.target.closest(".card-hover"):null;if(!card)return;
    const r=card.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
    card.classList.add("is-tilting");
    card.style.transform="perspective(900px) rotateX("+(-py*3).toFixed(2)+"deg) rotateY("+(px*3).toFixed(2)+"deg) translateY(-4px)";
  });
  document.addEventListener("pointerout",e=>{
    const card=e.target.closest?e.target.closest(".card-hover"):null;
    if(card&&!card.contains(e.relatedTarget)){card.classList.remove("is-tilting");card.style.transform="";}
  });
}

/* ============ HERO PARALLAX + SLIDER ============ */
let currentSlide=0,slideInterval=null;
(function(){
  let ticking=false;
  addEventListener("scroll",()=>{
    if(ticking)return;ticking=true;
    requestAnimationFrame(()=>{ticking=false;
      const hero=document.getElementById("hero-slider"),tb=document.getElementById("hero-text-block");
      if(!hero||!tb)return;
      const hh=hero.offsetHeight,y=scrollY;
      const img=hero.querySelector(".slide-item.active img");
      if(img)img.style.transform="scale("+(1+Math.min(y/hh,1)*.1)+")";
      const p=Math.max(0,Math.min(1,(y-hh*.15)/(hh*.4)));
      tb.style.opacity=1-p;tb.style.transform="translateY("+(p*-36)+"px)";
    });
  },{passive:true});
})();
function revealHeroText(){
  setTimeout(()=>document.querySelectorAll("#hero-slider .hero-fade").forEach(el=>el.classList.add("revealed")),80);
  document.querySelectorAll("#hero-slider .hero-line-inner").forEach((el,i)=>setTimeout(()=>el.classList.add("revealed"),200+i*130));
}
function startSlideAutoPlay(){clearInterval(slideInterval);slideInterval=setInterval(nextSlide,5800);}
function goToSlide(i){
  const slides=document.querySelectorAll(".slide-item");
  if(!slides.length)return;
  currentSlide=((i%slides.length)+slides.length)%slides.length;
  slides.forEach((s,x)=>s.classList.toggle("active",x===currentSlide));
  const d=slidesData[currentSlide];if(!d)return;
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.innerText=v;};
  set("slide-badge-text",d.badge);
  const t=document.getElementById("slide-title");
  t.innerHTML=d.lines.map((l,k)=>'<span class="hero-line"><span class="hero-line-inner '+l.c+'" style="transition-delay:'+(k*.08)+'s">'+l.t+'</span></span>').join("");
  void t.offsetWidth;
  t.querySelectorAll(".hero-line-inner").forEach(el=>requestAnimationFrame(()=>el.classList.add("revealed")));
  set("slide-desc",d.desc);
  if(d.piece)set("hero-piece-text",d.piece);
  set("slide-cta-text",d.cta);
  set("slide-current-num","0"+(currentSlide+1));
  const bar=document.getElementById("slide-progress-bar");if(bar)bar.style.width=((currentSlide+1)/slides.length*100)+"%";
  set("slide-ghost-num","0"+(currentSlide+1));
}
function nextSlide(){goToSlide(currentSlide+1);}function prevSlide(){goToSlide(currentSlide-1);}
function initHero(){
  revealHeroText();startSlideAutoPlay();
  const s=document.getElementById("hero-slider");if(!s)return;
  s.addEventListener("mouseenter",()=>clearInterval(slideInterval));
  s.addEventListener("mouseleave",startSlideAutoPlay);
  let tx=0,ty=0;
  s.addEventListener("touchstart",e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
  s.addEventListener("touchend",e=>{
    const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))dx<0?nextSlide():prevSlide();
  },{passive:true});
}

/* ============ EXPLORADOR DE CATEGORIAS ============ */
let currentCat="esporte",showcaseOffset=0;
const WINDOW_N=6,STEP=3;

function productsOf(cat){return products.filter(p=>p.cat===cat);}

function priceRow(p,big){
  return '<div class="mt-auto pt-3 border-t border-edge flex items-end justify-between gap-2">'
  +'<div class="flex items-baseline gap-2 min-w-0">'
  +'<span class="'+(big?"font-display text-2xl":"font-display text-lg")+' text-ink tabular-nums truncate">'+brl(p.price)+'</span>'
  +'<span class="text-[10px] sm:text-xs text-faint line-through font-mono tabular-nums">'+brl(p.oldPrice)+'</span></div>'
  +'<button onclick="event.stopPropagation();quickAddToCart('+p.id+',\''+p.sizes[0]+'\')" title="Adicionar '+p.sizes[0]+'"'
  +' class="btn-ink shrink-0 !p-0 w-11 h-11 md:w-auto md:h-auto md:!py-2.5 md:!px-4 !text-[12px]">'
  +'<i data-lucide="plus" class="w-4 h-4"></i><span class="hidden md:inline">Add</span></button>'
  +'</div>';
}

function cardHTML(p,big){
  big=!!big;
  return '<div class="group h-full cursor-pointer" onclick="openQuickView('+p.id+')">'
  +'<div class="frame card-hover bg-card border border-edge h-full flex flex-col rounded-xl overflow-hidden">'
  +(big?'<span class="tick tick-tl"></span><span class="tick tick-tr"></span><span class="tick tick-bl"></span><span class="tick tick-br"></span>':'')
  +'<div class="relative overflow-hidden '+(big?"h-[380px] md:h-[500px]":"aspect-[3/4] sm:aspect-[4/5]")+'">'
  +'<img src="'+imgSrc(p,big?1100:700)+'" alt="'+p.name+'" loading="lazy"'
  +' class="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"/>'
  +'<div class="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent"></div>'
  +'<span class="absolute top-3.5 left-3.5 z-[3] bg-white/92 backdrop-blur border border-black/10 px-2.5 py-1 mono-tag !text-ink" style="font-size:9px">'+p.badge+'</span>'
  +'</div>'
  +'<div class="p-4 sm:p-5 flex flex-col flex-1">'
  +'<p class="mono-tag text-gold mb-1.5" style="font-size:9px">'+((CAT_META[p.cat]||{}).tag||"")+'</p>'
  +'<h3 class="'+(big?"display-sm":"text-[13px] sm:text-[15px] font-bold")+' uppercase tracking-wide text-ink group-hover:text-gold transition-colors line-clamp-2 leading-snug">'+p.name+'</h3>'
  +'<div class="flex items-center gap-1 mt-2.5 flex-wrap">'+p.sizes.map(sz=>'<span class="border border-edge text-mut px-1.5 py-0.5 text-[10px] font-mono rounded-md">'+sz+'</span>').join("")+'</div>'
  +priceRow(p,big)
  +'</div></div></div>';
}

function renderChips(){
  document.getElementById("cat-chips").innerHTML=Object.entries(CAT_META).map(([k,m])=>{
    const n=productsOf(k).length;if(!n)return"";
    return '<button class="chip '+(k===currentCat?"on":"")+'" onclick="setCategory(\''+k+'\')">'+m.label+'<span style="opacity:.55">·'+n+'</span></button>';
  }).join("");
}

function renderShowcase(){
  const list=productsOf(currentCat),n=list.length;
  if(!n){document.getElementById("showcase-hero").innerHTML='<p class="col-span-2 py-24 text-center mono-tag text-mut">EM BREVE</p>';document.getElementById("showcase-grid").innerHTML="";document.getElementById("showcase-dots").innerHTML="";return;}
  const pages=Math.max(1,Math.ceil(n/STEP));
  const win=[];for(let i=0;i<Math.min(WINDOW_N,n);i++)win.push(list[(showcaseOffset+i)%n]);
  document.getElementById("showcase-hero").innerHTML=cardHTML(win[0],true)+cardHTML(win[1],true);
  document.getElementById("showcase-grid").innerHTML=win.slice(2).map(p=>cardHTML(p)).join("");
  const active=Math.round(showcaseOffset/STEP)%pages;
  document.getElementById("showcase-dots").innerHTML=Array.from({length:pages},(_,i)=>'<span class="crs-dot '+(i===active?"on":"")+'" onclick="showcaseGo('+(i*STEP)+')"></span>').join("");
}
function setCategory(cat){currentCat=cat;showcaseOffset=0;renderChips();renderShowcase();if(window.lucide)lucide.createIcons();}
function showcaseNav(dir){const n=productsOf(currentCat).length;if(!n)return;showcaseOffset=((showcaseOffset+dir*STEP)%n+n)%n;renderShowcase();if(window.lucide)lucide.createIcons();}
function showcaseGo(off){showcaseOffset=off;renderShowcase();}
function openCategoryInCatalog(cat){filterCategory(cat,null);document.getElementById("catalogo").scrollIntoView({behavior:"smooth"});}

(function(){
  let x0=null,y0=null;
  addEventListener("touchstart",e=>{
    if(!(e.target.closest&&e.target.closest("#colecoes")))return;
    x0=e.touches[0].clientX;y0=e.touches[0].clientY;
  },{passive:true});
  addEventListener("touchend",e=>{
    if(x0===null)return;
    const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;
    if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4&&e.target.closest&&e.target.closest("#colecoes"))showcaseNav(dx<0?1:-1);
    x0=y0=null;
  },{passive:true});
})();

/* ============ LOOKBOOK CARROSSEL ============ */
try{
document.getElementById("lk-track").innerHTML=LOOKS.map(l=>
 '<article class="crs-card group"><div class="frame card-hover bg-card border border-edge rounded-xl overflow-hidden">'
 +'<span class="tick tick-tl"></span><span class="tick tick-tr"></span><span class="tick tick-bl"></span><span class="tick tick-br"></span>'
 +'<div class="relative h-[440px] sm:h-[520px] overflow-hidden">'
 +'<img src="'+IMG(l.img,900)+'" alt="'+l.title+'" loading="lazy" class="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"/>'
 +'<div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent"></div>'
 +'<span class="absolute top-4 left-4 z-[3] bg-white/92 backdrop-blur border border-black/10 px-2.5 py-1 mono-tag !text-ink" style="font-size:9px">'+l.tag+'</span>'
 +'</div><div class="pt-5 pb-5 px-1"><h3 class="display-sm">'+l.title+'</h3><p class="mt-2 text-sm sm:text-base text-mut leading-relaxed">'+l.desc+'</p></div></div></article>').join("");
}catch(e){console.error(e);}

function initCarousel(rootId,btnPrev,btnNext,dotsId){
  const root=document.getElementById(rootId),track=root.querySelector(".crs-track"),
        cards=[].slice.call(track.children),dotsEl=document.getElementById(dotsId);
  let page=0;
  function perView(){return innerWidth<640?1:innerWidth<1024?2:3;}
  function pages(){return Math.max(1,Math.ceil(cards.length/perView()));}
  function go(p){
    page=Math.max(0,Math.min(pages()-1,p));
    const gap=22,w=cards[0]?cards[0].getBoundingClientRect().width+gap:0;
    track.style.transform="translateX(-"+(page*perView()*w)+"px)";
    dotsEl.querySelectorAll(".crs-dot").forEach((d,i)=>d.classList.toggle("on",i===page));
    const BP=document.querySelector(btnPrev),BN=document.querySelector(btnNext);
    if(BP)BP.disabled=page===0;
    if(BN)BN.disabled=page===pages()-1;
  }
  const bp=document.querySelector(btnPrev),bn=document.querySelector(btnNext);
  if(bp)bp.onclick=()=>go(page-1);
  if(bn)bn.onclick=()=>go(page+1);
  dotsEl.innerHTML=cards.map((_,i)=>'<span class="crs-dot '+(i===0?"on":"")+'" data-p="'+i+'"></span>').join("");
  dotsEl.onclick=e=>{const d=e.target.closest("[data-p]");if(d)go(+d.getAttribute("data-p"));};
  let sx=null,sy=null;
  root.querySelector(".crs-vp").addEventListener("touchstart",e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
  root.querySelector(".crs-vp").addEventListener("touchend",e=>{
    if(sx===null)return;
    const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))go(page+(dx<0?1:-1));
    sx=sy=null;
  },{passive:true});
  addEventListener("resize",()=>go(page));
  go(0);
}
try{initCarousel("crs-lk","[data-crs-prev='lk']","[data-crs-next='lk']","lk-dots");}catch(e){console.error(e);}

/* ============ TECLADO GLOBAL ============ */
function sectionVisibility(el){
  const r=el.getBoundingClientRect(),vh=innerHeight||1;
  const inter=Math.max(0,Math.min(r.bottom,vh)-Math.max(r.top,0));
  return inter/Math.min(r.height,vh);
}
function activeZone(){
  const zones=[["hero",document.getElementById("hero-slider")],["showcase",document.getElementById("colecoes")],["lookbook",document.getElementById("lookbook")]];
  let best="hero",bv=-1;
  zones.forEach(([k,el])=>{if(!el)return;const v=sectionVisibility(el);if(v>bv){bv=v;best=k;}});
  return best;
}
addEventListener("keydown",e=>{
  if(e.key!=="ArrowLeft"&&e.key!=="ArrowRight")return;
  const tag=(e.target&&e.target.tagName)||"";
  if(tag==="INPUT"||tag==="SELECT"||tag==="TEXTAREA")return;
  const dir=e.key==="ArrowRight"?1:-1;
  const zone=activeZone();
  if(zone==="showcase"){showcaseNav(dir);e.preventDefault();}
  else if(zone==="lookbook"){
    const next=document.querySelector("[data-crs-next='lk']"),prev=document.querySelector("[data-crs-prev='lk']");
    const btn=dir>0?(next&&!next.disabled?next:null):(prev&&!prev.disabled?prev:null);
    if(btn){btn.click();e.preventDefault();}
  }else{dir>0?nextSlide():prevSlide();e.preventDefault();}
});
