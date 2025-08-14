// cake.id interactions (slider, filters, cart, checkout)
const $ = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));

const products = [
  {id:'c1', name:'Floral Drip', img:'assets/prod1.png', price:450000, tags:['custom']},
  {id:'c2', name:'Buttercream Minimal', img:'assets/prod2.png', price:380000, tags:['custom']},
  {id:'c3', name:'Unicorn Surprise', img:'assets/prod3.png', price:520000, tags:['custom']},
  {id:'c4', name:'Number Cake', img:'assets/prod4.png', price:300000, tags:['custom']},
  {id:'c5', name:'Chocolate Dream', img:'assets/prod5.png', price:400000, tags:['custom']},
  {id:'c6', name:'Photo Cake', img:'assets/prod6.png', price:600000, tags:['photo']},
  {id:'c7', name:'BFF Set (2pcs)', img:'assets/prod7.png', price:750000, tags:['mini']},
  {id:'c8', name:'Mini Cupcake Box', img:'assets/prod8.png', price:120000, tags:['mini']},
];

const formatIDR = n => n.toLocaleString('id-ID', {style:'currency', currency:'IDR'});
document.getElementById('year').textContent = new Date().getFullYear();

// Slider setup
const slides = $$('.slide');
const dotsWrap = $('.dots');
let idx = 0;
slides.forEach((_, i) => { const b = document.createElement('button'); b.addEventListener('click', ()=>go(i)); dotsWrap.appendChild(b); });
const dots = $$('.dots button');
const go = (i) => {
  slides[idx].classList.remove('active'); if(dots[idx]) dots[idx].classList.remove('active');
  idx = (i + slides.length) % slides.length;
  slides[idx].classList.add('active'); if(dots[idx]) dots[idx].classList.add('active');
};
go(0);
$('.next').addEventListener('click', ()=>go(idx+1));
$('.prev').addEventListener('click', ()=>go(idx-1));
let auto = setInterval(()=>go(idx+1), 5000);
$('.slider').addEventListener('mouseenter', ()=>clearInterval(auto));
$('.slider').addEventListener('mouseleave', ()=>auto = setInterval(()=>go(idx+1), 5000));

// Render products with filters
const grid = $('#productGrid');
function render(filter='all'){
  grid.innerHTML = '';
  products.filter(p => filter==='all' || p.tags.includes(filter)).forEach(p => {
    const card = document.createElement('article'); card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <div class="info"><h3>${p.name}</h3><p class="muted">Custom size & flavor tersedia</p><div class="price">${formatIDR(p.price)}</div></div>
      <div class="actions" style="display:flex;gap:8px;padding:12px;">
        <div style="display:flex;gap:6px;align-items:center;">
          <input type="number" min="1" value="1" style="width:64px;padding:.4rem;border-radius:8px;border:1px solid rgba(0,0,0,.06)">
        </div>
        <button class="btn primary" data-add>Tambah</button>
      </div>
    `;
    const input = $('input', card);
    $('[data-add]', card).addEventListener('click', ()=> addToCart(p.id, +input.value || 1));
    grid.appendChild(card);
  });
}
render();
$$('.chip').forEach(ch => ch.addEventListener('click', ()=>{ $$('.chip').forEach(c=>c.classList.remove('active')); ch.classList.add('active'); render(ch.dataset.filter); }));

// Cart (localStorage)
const cartBtn = $('#cartBtn'), drawer = $('#cartDrawer'), closeCart = $('#closeCart'), cartCount = $('#cartCount'), cartItems = $('#cartItems'), cartTotal = $('#cartTotal'), checkoutBtn = $('#checkoutBtn');
const loadCart = () => JSON.parse(localStorage.getItem('cake_cart')||'{}');
const saveCart = c => localStorage.setItem('cake_cart', JSON.stringify(c));
function addToCart(id, qty=1){ const c = loadCart(); c[id] = (c[id]||0) + qty; saveCart(c); bump(); renderCart(); openCart(); }
function removeFromCart(id){ const c = loadCart(); delete c[id]; saveCart(c); bump(); renderCart(); }
function setQty(id, qty){ const c = loadCart(); if(qty<=0) delete c[id]; else c[id]=qty; saveCart(c); bump(); renderCart(); }
function bump(){ const c = loadCart(); cartCount.textContent = Object.values(c).reduce((a,b)=>a+b,0); }
function renderCart(){ const c = loadCart(); cartItems.innerHTML=''; let total=0; Object.entries(c).forEach(([id,qty])=>{ const p = products.find(x=>x.id===id); if(!p) return; total += p.price * qty; const el = document.createElement('div'); el.className='cart-item'; el.innerHTML = `<img src="${p.img}"><div><h4>${p.name}</h4><div class="muted">${formatIDR(p.price)} × ${qty}</div></div><div style="display:grid;justify-items:end;gap:6px"><div><button class="btn ghost" data-dec>−</button><input type="number" min="1" value="${qty}" style="width:52px;padding:.3rem;border-radius:6px"><button class="btn ghost" data-inc>+</button></div><button class="btn ghost" data-remove>Hapus</button></div>`; const input = $('input', el); $('[data-dec]', el).addEventListener('click', ()=> setQty(id, Math.max(1, (+input.value||1)-1))); $('[data-inc]', el).addEventListener('click', ()=> setQty(id, (+input.value||1)+1)); input.addEventListener('change', ()=> setQty(id, Math.max(1, +input.value||1))); $('[data-remove]', el).addEventListener('click', ()=> removeFromCart(id)); cartItems.appendChild(el); }); cartTotal.textContent = formatIDR(total); }
function openCart(){ drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); }
function closeCartDrawer(){ drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); }
cartBtn.addEventListener('click', ()=>{ renderCart(); openCart(); }); closeCart.addEventListener('click', closeCartDrawer); bump(); renderCart();

// Checkout modal
const checkoutModal = $('#checkoutModal'), closeCheckout = $('#closeCheckout'), checkoutForm = $('#checkoutForm');
checkoutBtn.addEventListener('click', ()=>{ if(Object.keys(loadCart()).length===0){ alert('Keranjang kosong'); return; } checkoutModal.classList.add('show'); checkoutModal.setAttribute('aria-hidden','false'); });
closeCheckout.addEventListener('click', ()=>{ checkoutModal.classList.remove('show'); checkoutModal.setAttribute('aria-hidden','true'); });
checkoutForm.addEventListener('submit', (e)=>{ e.preventDefault(); const data = Object.fromEntries(new FormData(checkoutForm).entries()); const c = loadCart(); const total = Object.entries(c).reduce((s,[id,q])=>{ const p = products.find(x=>x.id===id); return s + (p?p.price*q:0); }, 0); const order = { id: 'CK' + Math.random().toString(36).slice(2,8).toUpperCase(), items:c, data, total, time: new Date().toISOString() }; localStorage.setItem('cake_last_order', JSON.stringify(order)); localStorage.removeItem('cake_cart'); bump(); renderCart(); checkoutModal.classList.remove('show'); alert('Pesanan sukses!\nNomor Order: ' + order.id + '\nTotal: ' + formatIDR(total)); });

// smooth scroll
$$('a[href^="#"]').forEach(a=> a.addEventListener('click', e=>{ const id = a.getAttribute('href').slice(1); const t = document.getElementById(id); if(t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth'}); } }));
