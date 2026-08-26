
/* ============ CATÁLOGO ============ */
let cart=[],currentQV=null,qvSize=null,currentFilter="todos",currentSize="all";

const FILTERS=[["todos","Tudo"],["esporte","Esporte"],["polos","Polos Tech"],["oversized","Streetwear"],["bermudas","Bermudas"],["boneis","Bonés"]];
const catFilters=document.getElementById("catalog-filters");
if(catFilters)catFilters.innerHTML=FILTERS.map(f=>
 '<button onclick="filterCategory(\''+f[0]+'\',event)" class="cat-btn '+(f[0]==="todos"?"active bg-ink text-paper border-ink":"text-mut hover:text-ink bg-white")+' px-5 py-3 mono-tag whitespace-nowrap border border-edge2 rounded-full">'+f[1]+'</button>').join("");

function productCardHTML(p){
 return '<article class="group card-hover bg-card border border-edge flex flex-col rv in rounded-xl overflow-hidden">'
 +'<div class="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden cursor-pointer" onclick="openQuickView('+p.id+')">'
 +'<img src="'+imgSrc(p,600)+'" alt="'+p.name+'" loading="lazy" class="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"/>'
 +'<div class="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent"></div>'
 +'<span class="absolute top-3 left-3 z-[3] bg-white/92 backdrop-blur border border-black/10 px-2 py-0.5 mono-tag !text-ink" style="font-size:9px">'+p.badge+'</span>'
 +'</div>'
 +'<div class="p-3 sm:p-5 flex flex-col flex-1">'
 +'<p class="mono-tag text-gold mb-1.5" style="font-size:9px">'+((CAT_META[p.cat]||{}).label||"")+'</p>'
 +'<h3 class="text-[13px] sm:text-[15px] font-bold uppercase tracking-wide text-ink leading-snug line-clamp-2 min-h-[2.4rem] sm:min-h-[2.9rem] group-hover:text-gold transition-colors">'+p.name+'</h3>'
 +'<div class="mt-auto pt-3 flex items-end justify-between gap-2">'
 +'<div class="flex items-baseline gap-2 min-w-0">'
 +'<span class="font-display text-lg sm:text-xl text-ink tabular-nums truncate">'+brl(p.price)+'</span>'
 +'<span class="text-[10px] sm:text-xs text-faint line-through font-mono tabular-nums hidden min-[420px]:inline">'+brl(p.oldPrice)+'</span></div>'
 +'<button onclick="quickAddToCart('+p.id+',\''+p.sizes[0]+'\')" title="Adicionar '+p.sizes[0]+'"'
 +' class="btn-ink shrink-0 !p-0 w-11 h-11 sm:w-auto sm:h-auto sm:!py-3 sm:!px-5">'
 +'<i data-lucide="plus" class="w-4 h-4"></i><span class="hidden sm:inline text-[12px]">Add</span></button>'
 +'</div>'
 +'</div></article>';
}

function renderProducts(list){
  const c=document.getElementById("products-grid");if(!c)return;
  list=list||products;
  if(currentFilter!=="todos")list=list.filter(p=>p.cat===currentFilter);
  if(currentSize!=="all")list=list.filter(p=>p.sizes.indexOf(currentSize)>-1);
  if(!list.length){
    c.innerHTML='<div class="col-span-full py-16 sm:py-24 text-center border border-dashed border-edge2 rounded-2xl"><i data-lucide="package-search" class="w-10 h-10 mx-auto text-faint mb-4"></i><p class="display-sm">Nenhuma peça encontrada</p><p class="mono-tag text-mut mt-3">AJUSTE A BUSCA OU OS FILTROS</p></div>';
    if(window.lucide)lucide.createIcons();return;
  }
  c.innerHTML=list.map(productCardHTML).join("");
  if(window.lucide)lucide.createIcons();
}
function setFilterActive(btn){
  document.querySelectorAll(".cat-btn").forEach(b=>{
    b.classList.remove("active","bg-ink","text-paper","border-ink");
    b.classList.add("bg-white","border-edge2","text-mut");
  });
  if(btn){btn.classList.add("active","bg-ink","text-paper","border-ink");btn.classList.remove("bg-white","border-edge2","text-mut");}
}
function filterCategory(v,e){currentFilter=v;setFilterActive(e&&e.currentTarget?e.currentTarget:null);renderProducts();}
function filterSize(v,e){
  currentSize=v;
  document.querySelectorAll(".size-filter-btn").forEach(b=>{
    b.classList.remove("active","bg-ink","text-paper","border-ink");b.classList.add("bg-white","border-edge2","text-mut");
  });
  const btn=e&&e.currentTarget?e.currentTarget:null;
  if(btn){btn.classList.add("active","bg-ink","text-paper","border-ink");btn.classList.remove("bg-white","border-edge2","text-mut");}
  renderProducts();
}
function handleSearch(q){
  const t=q.toLowerCase().trim();
  renderProducts(products.filter(p=>p.name.toLowerCase().indexOf(t)>-1||p.desc.toLowerCase().indexOf(t)>-1));
}

/* ============ QUICKVIEW ============ */
function lockScroll(v){document.body.style.overflow=v?"hidden":"";}
function openQuickView(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  currentQV=p;qvSize=p.sizes[0];
  document.getElementById("qv-img").src=imgSrc(p,1100);
  document.getElementById("qv-badge").innerText=p.badge;
  document.getElementById("qv-category").innerText=((CAT_META[p.cat]||{}).label||"").toUpperCase()+" // MENSWEAR";
  document.getElementById("qv-title").innerText=p.name;
  document.getElementById("qv-price").innerText=brl(p.price);
  document.getElementById("qv-oldprice").innerText=brl(p.oldPrice);
  document.getElementById("qv-desc").innerText=p.desc;
  document.getElementById("qv-sizes").innerHTML=p.sizes.map(sz=>
    '<button onclick="qvPick(\''+sz+'\',this)" class="qv-size px-6 py-3.5 mono-tag border '+(sz===qvSize?"bg-ink text-paper border-ink font-bold":"border-edge2 text-ink hover:border-ink bg-white")+' !rounded-full">'+sz+'</button>').join("");
  const m=document.getElementById("quickview-modal");
  m.classList.remove("hidden");m.classList.add("flex");
  lockScroll(true);
}
function qvPick(sz,btn){
  qvSize=sz;
  document.querySelectorAll(".qv-size").forEach(b=>b.className="qv-size px-6 py-3.5 mono-tag border border-edge2 text-ink hover:border-ink bg-white !rounded-full");
  btn.className="qv-size px-6 py-3.5 mono-tag border bg-ink text-paper border-ink font-bold !rounded-full";
}
function closeQuickView(){
  const m=document.getElementById("quickview-modal");
  m.classList.add("hidden");m.classList.remove("flex");lockScroll(false);
}
function addCurrentProductToCart(){if(!currentQV)return;quickAddToCart(currentQV.id,qvSize);closeQuickView();openCartDrawer();}

/* ============ CARRINHO ============ */
function quickAddToCart(id,size){
  size=size||"M";
  const p=products.find(x=>x.id===id);if(!p)return;
  if(p.sizes.indexOf(size)<0)size=p.sizes[0];
  const i=cart.findIndex(it=>it.id===id&&it.size===size);
  if(i>-1)cart[i].quantity++;else cart.push({id:p.id,name:p.name,price:p.price,img:p.img,imgFull:p.imgFull,size:size,quantity:1});
  updateCartUI();
  if(window.confetti)confetti({particleCount:25,spread:55,origin:{y:.9},colors:["#17140F","#9C7500","#EFE7D8"]});
  toastMini("Adicionado à comanda");
}
let toastTimer=null;
function toastMini(msg){
  let t=document.getElementById("__mini-toast");
  if(!t){t=document.createElement("div");t.id="__mini-toast";
    t.style.cssText="position:fixed;bottom:26px;left:50%;transform:translateX(-50%);transition:opacity .3s;z-index:99;background:#17140F;color:#F6F2EA;font-family:'Space Mono';font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:14px 24px;border-radius:999px;box-shadow:0 12px 30px -12px rgba(23,20,15,.5)";
    document.body.appendChild(t);}
  t.textContent=msg;t.style.opacity="1";
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>{t.style.opacity="0";},1800);
}
function getFee(){const s=document.getElementById("delivery-zone-select");const o=s?s.options[s.selectedIndex]:null;return o?parseFloat(o.getAttribute("data-fee")||0):0;}
function updateDeliveryFee(){
  const fee=getFee(),sub=cart.reduce((a,i)=>a+i.price*i.quantity,0);
  const fEl=document.getElementById("cart-delivery-fee");
  fEl.textContent=fee===0?"GRÁTIS":"R$ "+fee.toFixed(2).replace(".",",");
  document.getElementById("cart-subtotal").textContent="R$ "+sub.toFixed(2).replace(".",",");
  document.getElementById("cart-total").textContent="R$ "+(sub+fee).toFixed(2).replace(".",",");
}
function updateCartUI(){
  document.getElementById("cart-counter").textContent=cart.reduce((a,i)=>a+i.quantity,0);
  const c=document.getElementById("cart-items-container");if(!c)return;
  if(!cart.length){
    c.innerHTML='<div class="h-64 flex flex-col items-center justify-center text-center border border-dashed border-edge2 mx-1 rounded-xl"><i data-lucide="shopping-bag" class="w-10 h-10 text-faint mb-4"></i><p class="display-sm">Comanda vazia</p><p class="mono-tag text-mut mt-3">ADICIONE PEÇAS DA ARARA</p></div>';
    document.getElementById("cart-subtotal").textContent="R$ 0,00";
    document.getElementById("cart-total").textContent="R$ 0,00";
    updateDeliveryFee();if(window.lucide)lucide.createIcons();return;
  }
  c.innerHTML=cart.map((it,idx)=>
   '<div class="flex items-center gap-4 p-3.5 bg-white border border-edge rounded-xl">'
   +'<img src="'+imgSrc(it,200)+'" alt="" class="w-20 h-20 object-cover border border-edge rounded-lg"/>'
   +'<div class="flex-1 min-w-0"><h4 class="text-sm font-bold uppercase tracking-wide text-ink truncate">'+it.name+'</h4>'
   +'<p class="mono-tag text-gold mt-1.5" style="font-size:10px">TAM '+it.size+' · R$ '+it.price.toFixed(2).replace(".",",")+'</p>'
   +'<div class="flex items-center gap-2 mt-2.5">'
   +'<button onclick="changeQty('+idx+',-1)" aria-label="Diminuir" class="w-10 h-10 border border-edge2 hover:border-ink text-ink font-mono rounded-full grid place-items-center">−</button>'
   +'<span class="font-mono text-sm text-ink w-5 text-center tabular-nums">'+it.quantity+'</span>'
   +'<button onclick="changeQty('+idx+',1)" aria-label="Aumentar" class="w-10 h-10 border border-edge2 hover:border-ink text-ink font-mono rounded-full grid place-items-center">+</button>'
   +'</div></div>'
   +'<div class="text-right shrink-0"><p class="font-mono text-sm font-bold text-ink tabular-nums">R$ '+(it.price*it.quantity).toFixed(2).replace(".",",")+'</p>'
   +'<button onclick="removeItem('+idx+')" class="mono-tag text-faint hover:text-red-500 mt-3 inline-flex items-center gap-1.5" style="font-size:9px"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i>REMOVER</button>'
   +'</div></div>').join("");
  if(window.lucide)lucide.createIcons();
  updateDeliveryFee();
}
function changeQty(i,d){if(!cart[i])return;cart[i].quantity+=d;if(cart[i].quantity<=0)cart.splice(i,1);updateCartUI();}
function removeItem(i){cart.splice(i,1);updateCartUI();}
function openCartDrawer(){
  const o=document.getElementById("cart-drawer-overlay"),d=document.getElementById("cart-drawer");
  o.classList.remove("hidden");setTimeout(()=>d.classList.remove("translate-x-full"),10);
  lockScroll(true);updateCartUI();
}
function closeCartDrawer(){
  const o=document.getElementById("cart-drawer-overlay"),d=document.getElementById("cart-drawer");
  d.classList.add("translate-x-full");setTimeout(()=>o.classList.add("hidden"),300);lockScroll(false);
}

/* ============ ORDER ============ */
function generateAndSendOrder(){
  if(!cart.length){alert("Sua comanda está vazia!");return;}
  const name=document.getElementById("order-customer-name").value.trim()||"Cliente Estilo Prime";
  const phone=document.getElementById("order-customer-phone").value.trim()||"(88) 99999-9999";
  const sel=document.getElementById("delivery-zone-select");
  const opt=sel.options[sel.selectedIndex],fee=getFee();
  const sub=cart.reduce((a,i)=>a+i.price*i.quantity,0),total=sub+fee;
  const num="#EP-"+Math.floor(1000+Math.random()*9000);
  const now=new Date();
  const dateStr=now.toLocaleDateString("pt-BR")+" às "+now.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
  const items=cart.map(i=>"• "+i.quantity+"x "+i.name+" (Tam: "+i.size+") — R$ "+(i.price*i.quantity).toFixed(2).replace(".",",")).join("\n");
  const txt="COMANDA DE PEDIDO — ESTILO PRIME\n━━━━━━━━━━━━━━━━━━━━\nPedido: "+num+"\nCliente: "+name+" ("+phone+")\nData: "+dateStr+"\n━━━━━━━━━━━━━━━━━━━━\nITENS:\n"+items+"\n━━━━━━━━━━━━━━━━━━━━\nRECEBIMENTO: "+opt.text+"\n━━━━━━━━━━━━━━━━━━━━\nTOTAL: R$ "+total.toFixed(2).replace(".",",")+"\nPix: 88999999999 (Estilo Prime)";
  document.getElementById("success-order-id").textContent=num;
  document.getElementById("formatted-comanda-text").textContent=txt;
  document.getElementById("success-whatsapp-link").href="https://wa.me/5588999999999?text="+encodeURIComponent(txt);
  closeCartDrawer();
  const m=document.getElementById("order-success-modal");
  m.classList.remove("hidden");m.classList.add("flex");lockScroll(true);
  cart=[];updateCartUI();
  if(window.confetti)confetti({particleCount:70,spread:85,origin:{y:.6},colors:["#17140F","#9C7500","#EFE7D8"]});
}
function copyPixKey(){
  navigator.clipboard.writeText(document.getElementById("pix-key-input").value).then(()=>{
    const b=document.getElementById("copy-btn-text");b.textContent="Copiado!";
    setTimeout(()=>b.textContent="Copiar",2500);
  });
}
function closeOrderSuccessModal(){const m=document.getElementById("order-success-modal");m.classList.add("hidden");m.classList.remove("flex");lockScroll(false);}

/* ============ INSTAGRAM REAL ============ */
async function syncInstagram(){
  const feed=document.getElementById("ig-feed");
  const status=document.getElementById("ig-status");
  try{
    const r=await fetch("/api/instagram",{cache:"no-store"});
    const j=await r.json();
    if(j&&j.ok&&j.profile&&j.profile.avatar){
      ["brand-avatar","ig-avatar","footer-avatar"].forEach(id=>{
        const el=document.getElementById(id);if(el)el.src=j.profile.avatar;
      });
      const fav=document.getElementById("favicon");
      if(fav){fav.href=j.profile.avatar;fav.type="image/jpeg";}
      const meta=document.getElementById("ig-meta");
      if(meta)meta.textContent=(j.profile.fullName?j.profile.fullName+" · ":"")+(j.profile.followers?j.profile.followers.toLocaleString("pt-BR")+" seguidores · ":"")+"Itaiçaba — CE";
    }
    if(j&&j.ok&&Array.isArray(j.posts)&&j.posts.length){
      status.textContent="FEED AO VIVO · ÚLTIMOS POSTS";
      status.className="mono-tag text-emerald-600";
      feed.innerHTML=j.posts.slice(0,6).map(p=>
        '<a href="'+p.url+'" target="_blank" rel="noopener" class="relative aspect-square overflow-hidden group/tile border border-edge block rounded-xl">'
        +'<img src="'+p.thumb+'" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover group-hover/tile:scale-105 transition-transform duration-500"/>'
        +'<span class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover/tile:opacity-100 transition-opacity p-4 flex flex-col justify-end text-left">'
        +(p.caption?'<span class="text-xs text-white line-clamp-3 leading-relaxed">'+p.caption.replace(/</g,"&lt;")+'</span>':"")
        +'<span class="mt-2 inline-flex items-center gap-1.5 mono-tag !text-goldl" style="font-size:9px"><i data-lucide="instagram" class="w-3.5 h-3.5"></i> VER POST</span>'
        +'</span></a>').join("");
    }else{
      status.textContent="ABRA O PERFIL PARA O FEED COMPLETO";
      renderIgFallback();
    }
  }catch(e){
    status.textContent="ABRA O PERFIL PARA O FEED COMPLETO";
    renderIgFallback();
  }
  if(window.lucide)lucide.createIcons();
}
function renderIgFallback(){
  const feed=document.getElementById("ig-feed");
  feed.innerHTML=IG_FALLBACK.map(id=>
   '<a href="https://www.instagram.com/estiloprime.store/" target="_blank" rel="noopener"'
   +' class="relative aspect-square overflow-hidden group/tile border border-edge block rounded-xl">'
   +'<img src="'+IMG(id,500)+'" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover group-hover/tile:scale-105 transition-transform duration-500"/>'
   +'<span class="absolute inset-0 grid place-items-center bg-ink/35 opacity-0 group-hover/tile:opacity-100 transition-opacity"><i data-lucide="instagram" class="w-7 h-7 text-white"></i></span>'
   +'</a>').join("");
}

/* ============ BOOT ============ */
function boot(){
  if(window.lucide)lucide.createIcons();
  try{renderChips();renderShowcase();}catch(e){console.error(e);}
  try{renderProducts();}catch(e){console.error(e);}
  try{initHero();}catch(e){console.error(e);}
  try{observeRv();setTimeout(observeRv,400);}catch(e){console.error(e);}
  safetyReveal();
}
document.addEventListener("DOMContentLoaded",()=>{
  boot();
  syncInstagram();
});
if(document.readyState!=="loading"){boot();syncInstagram();}
</script>
</body>
</html>
