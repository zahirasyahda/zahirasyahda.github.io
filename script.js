
const products = [
    { id: 1, name: "Gelang Pastel", price: 15000, img: "assets/slide1.png" },
    { id: 2, name: "Gelang Kekinian", price: 20000, img: "assets/slide2.png" },
    { id: 3, name: "Gelang Manis", price: 18000, img: "assets/slide3.png" }
];
let cart = [];

function renderProducts() {
    const list = document.getElementById('product-list');
    products.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product';
        div.innerHTML = `<img src="${p.img}" width="100%">
                         <h3>${p.name}</h3>
                         <p>Rp ${p.price}</p>
                         <button onclick="addToCart(${p.id})">Tambah ke Keranjang</button>`;
        list.appendChild(div);
    });
}
function addToCart(id) {
    const item = products.find(p => p.id === id);
    cart.push(item);
    document.getElementById('cart-count').innerText = cart.length;
    renderCart();
}
function renderCart() {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
        container.innerHTML += `<div>${item.name} - Rp ${item.price} 
                                 <button onclick="removeFromCart(${index})">x</button></div>`;
        total += item.price;
    });
    document.getElementById('cart-total').innerText = total;
}
function removeFromCart(index) {
    cart.splice(index, 1);
    document.getElementById('cart-count').innerText = cart.length;
    renderCart();
}
function toggleCart() {
    document.getElementById('cart').classList.toggle('open');
}
function checkout() {
    document.getElementById('checkout-modal').style.display = 'block';
}
function closeCheckout() {
    document.getElementById('checkout-modal').style.display = 'none';
}
document.getElementById('checkout-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Pesanan berhasil dikirim!');
    cart = [];
    renderCart();
    closeCheckout();
});
renderProducts();
