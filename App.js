/* ========= PRODUCTS ========= */
let products = JSON.parse(localStorage.getItem("products")) || [
  { id: 1, name_en: "Cargo Pants", name_ar: "بنطال كارغو", price: 45, category: "pants", img:"images/pants.jpg", status: "" },
  { id: 2, name_en: "Slim Jeans", name_ar: "بنطال جينز", price: 60, category: "pants", img:"images/pants.jpg", status: "" },
  { id: 3, name_en: "Running Shoes", name_ar: "حذاء جري", price: 85, category: "footwear", img:"images/footwear.jpg", status: "" },
  { id: 4, name_en: "Winter Boots", name_ar: "جزمة شتوي", price: 95, category: "footwear", img:"images/footwear.jpg", status: "" },
  { id: 5, name_en: "Black Balaclava", name_ar: "بالاكلافا أسود", price: 20, category: "balaclava", img:"images/balaclava.jpg", status: "" },
  { id: 6, name_en: "Thermal Balaclava", name_ar: "بالاكلافا حراري", price: 25, category: "balaclava", img:"images/balaclava.jpg", status: "" }
];

/* ========= LOCAL STORAGE ========= */
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let lang = localStorage.getItem("lang") || "en";
let theme = localStorage.getItem("theme") || "dark";

/* ========= DOM ========= */
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

/* ========= INIT ========= */
applyTheme();
applyLang();
translatePage();
renderCategories();
if(productGrid) renderProducts(products); 
updateCart();
if(cartItemsDiv) renderCartItems();
if(orderSummaryDiv) renderOrderSummary();

/* ========= PRODUCTS ========= */
function renderProducts(list){
  if(!productGrid) return;
  productGrid.innerHTML = "";
  list.forEach(p=>{
    
    // اختيار اللابل حسب الحالة
    let badge = "";
    if (p.status === "hot") {
      badge = `<span class="badge hot">HOT</span>`;
    } else if (p.status === "new") {
      badge = `<span class="badge new">NEW</span>`;
    } else if (p.status === "out") {
      badge = `<span class="badge out">${lang==="en"?"OUT OF STOCK":"غير متوفر"}</span>`;
    }

    productGrid.innerHTML += `
      <div class="product show">
        <div class="img-box">
          ${badge}
          <img src="${p.img}" alt="${lang==="en"?p.name_en:p.name_ar}">
        </div>

        <h3>${lang === "en" ? p.name_en : p.name_ar}</h3>
        <p>$${p.price}</p>

        ${p.status === "out"
          ? `<button class="add-btn disabled">${lang==="en"?"Unavailable":"غير متوفر"}</button>`
          : `<button class="add-btn" onclick="addToCart(${p.id})">${lang === "en" ? "Add to Cart" : "إضافة للسلة"}</button>`}
      </div>
    `;
  });
}

/* ========= CATEGORIES ========= */
function renderCategories() {
  const catGrid = document.querySelector(".cat-grid");
  if(!catGrid) return;

  const cats = ["all", ...new Set(products.map(p => p.category))];
  catGrid.innerHTML = "";

  cats.forEach(cat => {
    const name_en = cat.charAt(0).toUpperCase() + cat.slice(1);
    const name_ar = cat; // لو عايز ترجمة عربية ممكن تحط هنا
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

/* ========= CART ========= */
function addToCart(id){
  let item = cart.find(x=>x.id===id);
  if(item) item.qty++;
  else cart.push({id, qty:1});
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
  if(cartItemsDiv) renderCartItems();
  if(orderSummaryDiv) renderOrderSummary();
}

function removeFromCart(id){
  cart = cart.filter(x=>x.id!==id);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
  if(cartItemsDiv) renderCartItems();
  if(orderSummaryDiv) renderOrderSummary();
}

function updateQty(id, value){
  const item = cart.find(x=>x.id===id);
  if(item){
    item.qty = parseInt(value);
    if(item.qty<1) item.qty=1;
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
  if(cartItemsDiv) renderCartItems();
  if(orderSummaryDiv) renderOrderSummary();
}

function updateCart(){
  const total = cart.reduce((t,i)=>t+i.qty,0);
  if(cartCount) cartCount.textContent = total;
}

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
    const name = lang==="en"?product.name_en:product.name_ar;
    totalPrice += product.price*item.qty;
    cartItemsDiv.innerHTML += `
      <div class="cart-product">
        <img src="${product.img}" alt="${name}">
        <div>
          <h4>${name}</h4>
          <p>$${product.price} x 
            <input class="qty-input" type="number" value="${item.qty}" min="1" onchange="updateQty(${item.id}, this.value)">
          </p>
        </div>
        <button class="remove-btn" onclick="removeFromCart(${item.id})">${lang==="en"?"Remove":"إزالة"}</button>
      </div>
    `;
  });

  if(cartTotal) cartTotal.textContent = `${lang==="en"?"Total":"المجموع"}: $${totalPrice}`;
}

/* ========= ORDER SUMMARY (Checkout) ========= */
function renderOrderSummary(){
  if(!orderSummaryDiv) return;
  if(cart.length===0){
    orderSummaryDiv.innerHTML = `<p>${lang==="en"?"Your cart is empty":"السلة فارغة"}</p>`;
    return;
  }
  let totalPrice = 0;
  orderSummaryDiv.innerHTML = "";
  cart.forEach(item=>{
    const product = products.find(p=>p.id===item.id);
    const name = lang==="en"?product.name_en:product.name_ar;
    totalPrice += product.price*item.qty;
    orderSummaryDiv.innerHTML += `
      <div class="order-item">
        <span>${name} x ${item.qty}</span>
        <span>$${product.price*item.qty}</span>
      </div>
    `;
  });
  orderSummaryDiv.innerHTML += `<div class="order-total">${lang==="en"?"Total":"المجموع"}: $${totalPrice}</div>`;
}

/* ========= CLEAR CART ========= */
if(clearCartBtn){
  clearCartBtn.onclick = ()=>{
    if(cart.length === 0) return;
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
    if(cartItemsDiv) renderCartItems();
    if(orderSummaryDiv) renderOrderSummary();
  };
}

/* ========= CART POPUP ========= */
if(cartBtn && cartPopup && closeCartBtn){
  cartBtn.onclick = () => cartPopup.classList.toggle("show");
  closeCartBtn.onclick = () => cartPopup.classList.remove("show");
  window.onclick = (e)=> { if(e.target==cartPopup) cartPopup.classList.remove("show"); };
}

/* ========= SIDEBAR ========= */
if(menuBtn && sidebar && overlay){
  menuBtn.onclick = ()=>{
    sidebar.classList.add("open");
    overlay.classList.add("show");
  };
}

if(closeSidebarBtn) closeSidebarBtn.onclick = closeSidebar;
if(overlay) overlay.onclick = closeSidebar;

document.querySelectorAll("#sidebar a").forEach(link=>{
  link.onclick = closeSidebar;
});

function closeSidebar(){
  if(sidebar) sidebar.classList.remove("open");
  if(overlay) overlay.classList.remove("show");
}

/* ========= SEARCH ========= */
if(search){
  search.oninput = ()=>{
    const q = search.value.toLowerCase();
    renderProducts(products.filter(p=> p.name_en.toLowerCase().includes(q) || p.name_ar.includes(q) ));
  };
}

/* ========= LANGUAGE ========= */
if(langBtn){
  langBtn.onclick = ()=>{
    lang = lang==="en"?"ar":"en";
    localStorage.setItem("lang", lang);
    applyLang();
    translatePage();
    renderCategories();
    if(productGrid) renderProducts(products);
    if(cartItemsDiv) renderCartItems();
    if(orderSummaryDiv) renderOrderSummary();
  };
}

function applyLang(){
  if(langBtn) langBtn.textContent = lang==="en"?"EN":"عربي";
  const catTitle = document.getElementById("cat-title");
  const prodTitle = document.getElementById("prod-title");
  if(catTitle) catTitle.textContent = lang==="en"?"Categories":"الفئات";
  if(prodTitle) prodTitle.textContent = lang==="en"?"Products":"المنتجات";
  if(search) search.placeholder = lang==="en"?"Search products...":"ابحث عن منتج...";
}

/* ========= TRANSLATE PAGE ========= */
function translatePage(){
  document.querySelectorAll("[data-lang-en]").forEach(el=>{
    if(lang==="en") el.textContent = el.getAttribute("data-lang-en");
    else el.textContent = el.getAttribute("data-lang-ar");
  });
}

/* ========= THEME ========= */
if(themeBtn){
  themeBtn.onclick = ()=>{
    theme = theme==="dark"?"light":"dark";
    localStorage.setItem("theme", theme);
    applyTheme();
  };
}

function applyTheme(){
  if(theme==="light") document.body.classList.remove("dark");
  else document.body.classList.add("dark");
}

/* ========= CONTACT FORM ========= */
const contactForm = document.getElementById("contact-form");
if(contactForm){
  contactForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    alert(lang==="en"?"Thank you! Your message has been sent.":"شكراً! تم إرسال رسالتك.");
    contactForm.reset();
  });
}

/* ========= CHECKOUT FORM ========= */
const checkoutForm = document.getElementById("checkout-form");
if(checkoutForm){
  checkoutForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    if(cart.length===0){
      alert(lang==="en"?"Your cart is empty":"السلة فارغة");
      return;
    }
    alert(lang==="en"?"Order placed successfully!":"تم تقديم الطلب بنجاح!");
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
    if(cartItemsDiv) renderCartItems();
    if(orderSummaryDiv) renderOrderSummary();
    checkoutForm.reset();
  });
}