// beadsy.id — Interactions
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

const products = [
  {id:'g1', name:'Candy Pastel', img:'assets/p1.png', price:15000, desc:'Gelang manik pastel warna-warni, vibes sweet.'},
  {id:'g2', name:'Pearl Charm', img:'assets/p2.png', price:22000, desc:'Sentuhan mutiara mini, elegan tapi cute.'},
  {id:'g3', name:'Glow Beads', img:'assets/p3.png', price:18000, desc:'Manik glow-in-the-dark, seru di malam hari!'},
  {id:'g4', name:'Initial Bracelet', img:'assets/p4.png', price:20000, desc:'Custom inisial favoritmu.'},
];

const formatIDR = n => n.toLocaleString('id-ID', {style:'currency', currency:'IDR'});

// YEAR
$('#year').textContent = new Date().getFullYear();

// SLIDER
const slides = $$('.slide');
const dotsWrap = $('.dots');
let idx = 0;
slides.forEach((_, i) => {
  const b = document.createElement('button');
  b.setAttribute('aria-label', 'Pergi ke slide ' + (i+1));
  b.addEventListener('click', () => go(i));
  dotsWrap.appendChild(b);
});
const dots = $$('.dots button');
const go = (i) => {
  slides[idx].classList.remove('active');
  dots[idx].classList.remove('active');
  idx = (i + slides.length) % slides.length;
  slides[idx].classList.add('active');
  dots[idx].classList.add('active');
}
go(0);
$('.next').addEventListener('click', () => go(idx+1));
$('.prev').addEventListener('click', () => go(idx-1));
let auto = setInterval(()=>go(idx+1), 4500);
$('.slider').addEventListener('mouseenter', ()=>clearInterval(auto));
$('.slider').addEventListener('mouseleave', ()=>auto=setInterval(()=>go(idx+1), 4500));

// CATALOG
const grid = $('#catalogGrid');
function renderCatalog(){
  grid.innerHTML = '';
  products.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <div class="info">
        <h3>${p.name}</h3>
        <p class="muted">${p.desc}</p>
        <div class="price">${formatIDR(p.price)}</div>
      </div>
      <div class="actions">
        <div class="qty">
          <button class="btn ghost" data-dec>−</button>
          <input type="number" min="1" value="1" />
          <button class="btn ghost" data-inc>+</button>
        </div>
        <button class="btn primary" data-add>Tambah</button>
      </div>
    `;
    const input = $('input', card);
    $('[data-dec]', card).addEventListener('click', ()=> input.value = Math.max(1, (+input.value||1)-1));
    $('[data-inc]', card).addEventListener('click', ()=> input.value = (+input.value||1)+1);
    $('[data-add]', card).addEventListener('click', ()=> addToCart(p.id, +input.value||1));
    grid.appendChild(card);
  });
}
renderCatalog();

// CART
const cartBtn = $('#cartBtn');
const drawer = $('#cartDrawer');
const closeCart = $('#closeCart');
const cartCount = $('#cartCount');
const cartItems = $('#cartItems');
const cartTotal = $('#cartTotal');
const checkoutBtn = $('#checkoutBtn');

const loadCart = () => JSON.parse(localStorage.getItem('cart_beadsy')||'{}');
const saveCart = (c) => localStorage.setItem('cart_beadsy', JSON.stringify(c));

function addToCart(id, qty=1){
  const c = loadCart();
  c[id] = (c[id]||0)+qty;
  saveCart(c);
  bumpCount();
  openCart();
  renderCart();
  pulse(drawer);
}
function removeFromCart(id){
  const c = loadCart(); delete c[id]; saveCart(c);
  bumpCount(); renderCart();
}
function setQty(id, qty){
  const c = loadCart();
  if(qty<=0) delete c[id]; else c[id]=qty;
  saveCart(c); bumpCount(); renderCart();
}
function bumpCount(){
  const c = loadCart();
  const count = Object.values(c).reduce((a,b)=>a+b,0);
  cartCount.textContent = count;
}
function renderCart(){
  const c = loadCart();
  cartItems.innerHTML = '';
  let total = 0;
  Object.entries(c).forEach(([id, qty])=>{
    const p = products.find(x=>x.id===id);
    if(!p) return;
    const line = p.price * qty; total += line;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img src="\${p.img}" alt="\${p.name}">
      <div>
        <h4>\${p.name}</h4>
        <div class="muted">\${formatIDR(p.price)} × \${qty}</div>
      </div>
      <div style="display:grid; gap:6px; justify-items:end">
        <div class="qty">
          <button class="btn ghost" data-dec>−</button>
          <input type="number" min="1" value="\${qty}" />
          <button class="btn ghost" data-inc>+</button>
        </div>
        <button class="btn ghost" data-remove>Hapus</button>
      </div>
    `;
    const input = $('input', el);
    $('[data-dec]', el).addEventListener('click', ()=> setQty(id, Math.max(1,(+input.value||1)-1)));
    $('[data-inc]', el).addEventListener('click', ()=> setQty(id, (+input.value||1)+1));
    input.addEventListener('change', ()=> setQty(id, Math.max(1, +input.value||1)));
    $('[data-remove]', el).addEventListener('click', ()=> removeFromCart(id));
    cartItems.appendChild(el);
  });
  cartTotal.textContent = formatIDR(total);
}
function openCart(){ drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); }
function closeCartDrawer(){ drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); }
cartBtn.addEventListener('click', ()=> { renderCart(); openCart(); });
closeCart.addEventListener('click', closeCartDrawer);
bumpCount();

// CHECKOUT
const checkoutModal = $('#checkoutModal');
const closeCheckout = $('#closeCheckout');
const checkoutForm = $('#checkoutForm');

checkoutBtn.addEventListener('click', ()=>{
  if(Object.keys(loadCart()).length===0){ alert('Keranjang masih kosong.'); return; }
  checkoutModal.classList.add('show');
  checkoutModal.setAttribute('aria-hidden','false');
});
closeCheckout.addEventListener('click', ()=> {
  checkoutModal.classList.remove('show');
  checkoutModal.setAttribute('aria-hidden','true');
});

checkoutForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(checkoutForm).entries());
  const c = loadCart();
  const total = Object.entries(c).reduce((sum,[id,qty])=>{
    const p = products.find(x=>x.id===id); return sum + (p?p.price*qty:0);
  }, 0);
  const order = {
    id: 'BDSY-' + Math.random().toString(36).slice(2,8).toUpperCase(),
    items: c, data, total, time: new Date().toISOString()
  };
  localStorage.setItem('beadsy_last_order', JSON.stringify(order));
  localStorage.removeItem('cart_beadsy');
  bumpCount(); renderCart();
  checkoutModal.classList.remove('show');
  alert('Pesanan berhasil dibuat!\nNomor Order: ' + order.id + '\nTotal: ' + formatIDR(total));
});

// micro animation
function pulse(el){
  el.animate([{transform:'scale(1)'},{transform:'scale(1.02)'},{transform:'scale(1)'}], {duration:400});
}

// smooth scroll
$$('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth'}); }
  });
});
