// ========= FIREBASE =========
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAis292KQWdOuucwHVcfOPKzMwsZxQT0wU",
  authDomain: "darkstore-e5e95.firebaseapp.com",
  projectId: "darkstore-e5e95",
  storageBucket: "darkstore-e5e95.firebasestorage.app",
  messagingSenderId: "142426749084",
  appId: "1:142426749084:web:e4a01b8f567c7fdf1d9559"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ========= VARIABLES =========
let products = [];
let cart = [];
let lang = localStorage.getItem("lang") || "en"; // Language still local
let theme = localStorage.getItem("theme") || "dark";

const productGrid = document.getElementById("product-grid");
const cartCount = document.getElementById("cart-count");
const cartBtn = document.getElementById("cart-btn");
const cartPopup = document.getElementById("cart-popup");
const closeCartBtn = document.getElementById("close-cart");
const cartItemsDiv = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const langBtn = document.getElementById("lang-btn");
const themeBtn = document.getElementById("theme-btn");
const search = document.getElementById("search");
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const closeSidebarBtn = document.getElementById("close-sidebar");
const clearCartBtn = document.getElementById("clear-cart");
const orderSummaryDiv = document.getElementById("order-summary");

// ========= INIT =========
applyTheme();
applyLang();
translatePage();
loadProducts();
renderCategories();

// ========= LOAD PRODUCTS =========
async function loadProducts() {
  const querySnapshot = await getDocs(collection(db, "products"));
  products = [];
  querySnapshot.forEach((doc) => {
    products.push({ id: doc.id, ...doc.data() });
  });
  if(productGrid) renderProducts(products);
  updateCart();
  if(cartItemsDiv) renderCartItems();
  if(orderSummaryDiv) renderOrderSummary();
}

// ========= RENDER PRODUCTS =========
function renderProducts(list){
  if(!productGrid) return;
  productGrid.innerHTML = "";

  list.forEach(p=>{
    let badge = "";
    if (p.status === "hot") badge = `<span class="badge hot">HOT</span>`;
    else if (p.status === "new") badge = `<span class="badge new">NEW</span>`;
    else if (p.stock === 0 || p.status === "out") badge = `<span class="badge out">${lang==="en"?"OUT OF STOCK":"غير متوفر"}</span>`;

    productGrid.innerHTML += `
      <div class="product show">
        <div class="img-box">
          ${badge}
          <img src="${p.img}" alt="${lang==="en"?p.name_en:p.name_ar}">
        </div>
        <h3>${lang === "en" ? p.name_en : p.name_ar}</h3>
        <p>$${p.price}</p>
        ${
          (p.stock === 0)
          ? `<button class="add-btn disabled">${lang==="en"?"Out of Stock":"غير متوفر"}</button>`
          : `<button class="add-btn" onclick="addToCart('${p.id}')">${lang === "en" ? "Add to Cart" : "إضافة للسلة"}</button>`
        }
      </div>
    `;
  });
}

// ========= CATEGORIES =========
function renderCategories() {
  const catGrid = document.querySelector(".cat-grid");
  if(!catGrid) return;

  const cats = ["all", ...new Set(products.map(p => p.category))];
  catGrid.innerHTML = "";

  cats.forEach(cat => {
    const name_en = cat.charAt(0).toUpperCase() + cat.slice(1);
    const name_ar = cat; 
    catGrid.innerHTML += `
      <div class="cat-card show" data-cat="${cat}">
        <h3>${lang === "en" ? name_en : name_ar}</h3>
      </div>
    `;
  });

  document.querySelectorAll(".cat-card").forEach(card => {
    card.onclick = () => {
      const cat = card.dataset.cat;
      if(cat === "all") renderProducts(products);
      else renderProducts(products.filter(p => p.category === cat));
    };
  });
}

// ========= CART =========
function addToCart(id){
  const product = products.find(p=>p.id===id);
  if(!product || product.stock === 0){
    alert(lang==="en"?"This product is out of stock":"هذا المنتج غير متوفر");
    return;
  }

  let item = cart.find(x=>x.id===id);
  if(item){
    if(item.qty < product.stock) item.qty++;
    else {
      alert(lang==="en"?"Reached maximum stock":"تم الوصول للكمية المتاحة");
      return;
    }
  } else cart.push({id, qty:1});

  updateCart();
  if(cartItemsDiv) renderCartItems();
  if(orderSummaryDiv) renderOrderSummary();
}

// ========= REMOVE / UPDATE QTY =========
function removeFromCart(id){
  cart = cart.filter(x=>x.id!==id);
  updateCart();
  if(cartItemsDiv) renderCartItems();
  if(orderSummaryDiv) renderOrderSummary();
}

function updateQty(id, value){
  const item = cart.find(x=>x.id===id);
  const product = products.find(p=>p.id===id);
  if(item && product){
    let qty = parseInt(value);
    if(qty<1) qty=1;
    if(qty>product.stock) qty = product.stock;
    item.qty = qty;
  }
  updateCart();
  if(cartItemsDiv) renderCartItems();
  if(orderSummaryDiv) renderOrderSummary();
}

function updateCart(){
  const total = cart.reduce((t,i)=>t+i.qty,0);
  if(cartCount) cartCount.textContent = total;
}

// ========= RENDER CART =========
function renderCartItems(){
  if(!cartItemsDiv) return;
  cartItemsDiv.innerHTML = "";
  if(cart.length===0){
    cartItemsDiv.innerHTML = `<p>${lang==="en"?"Your cart is empty":"السلة فارغة"}</p>`;
    if(cartTotal) cartTotal.textContent = `${lang==="en"?"Total":"المجموع"}: $0`;
    return;
  }

  let totalPrice = 0;
  cart.forEach(item=>{
    const product = products.find(p=>p.id===item.id);
    if(!product) return;
    const name = lang==="en"?product.name_en:product.name_ar;
    totalPrice += product.price*item.qty;
    cartItemsDiv.innerHTML += `
      <div class="cart-product">
        <img src="${product.img}" alt="${name}">
        <div>
          <h4>${name}</h4>
          <p>$${product.price} x 
            <input class="qty-input" type="number" value="${item.qty}" min="1" max="${product.stock}" onchange="updateQty('${item.id}', this.value)">
          </p>
        </div>
        <button class="remove-btn" onclick="removeFromCart('${item.id}')">${lang==="en"?"Remove":"إزالة"}</button>
      </div>
    `;
  });

  if(cartTotal) cartTotal.textContent = `${lang==="en"?"Total":"المجموع"}: $${totalPrice}`;
}

// ========= CHECKOUT =========
const checkoutForm = document.getElementById("checkout-form");
if(checkoutForm){
  checkoutForm.addEventListener("submit", async (e)=>{
    e.preventDefault();
    if(cart.length===0){
      alert(lang==="en"?"Your cart is empty":"السلة فارغة");
      return;
    }

    // ====== خصم المخزون في Firestore ======
    for(const item of cart){
      const productRef = doc(db, "products", item.id);
      const product = products.find(p=>p.id===item.id);
      if(product){
        const newStock = product.stock - item.qty;
        product.stock = newStock < 0 ? 0 : newStock;
        await updateDoc(productRef, { stock: product.stock });
      }
    }

    // ====== حفظ الطلب ======
    const orderItems = cart.map(item=>{
      const p = products.find(x=>x.id===item.id);
      return { id: item.id, name: lang==="en"?p.name_en:p.name_ar, price: p.price, qty: item.qty };
    });

    const orderData = {
      customer: {
        firstName: document.getElementById("first-name").value,
        lastName: document.getElementById("last-name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        country: document.getElementById("country").value,
        state: document.getElementById("state").value,
        city: document.getElementById("city").value,
        street: document.getElementById("street").value,
        postcode: document.getElementById("postcode").value
      },
      items: orderItems,
      notes: document.getElementById("order-notes").value,
      payment: document.querySelector('input[name="payment"]:checked').value,
      date: new Date().toLocaleString()
    };

    await addDoc(collection(db, "orders"), orderData);

    alert(lang==="en"?"Order placed successfully!":"تم تقديم الطلب بنجاح!");
    cart = [];
    updateCart();
    if(cartItemsDiv) renderCartItems();
    if(orderSummaryDiv) renderOrderSummary();
    if(productGrid) renderProducts(products);
    checkoutForm.reset();
  });
}