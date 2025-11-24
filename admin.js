// ========== FIREBASE ==========
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAis292KQWdOuucwHVcfOPKzMwsZxQT0wU",
  authDomain: "darkstore-e5e95.firebaseapp.com",
  projectId: "darkstore-e5e95",
  storageBucket: "darkstore-e5e95.firebasestorage.app",
  messagingSenderId: "142426749084",
  appId: "1:142426749084:web:e4a01b8f567c7fdf1d9559"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ========== DOM ==========
const adminProductList = document.getElementById("admin-product-list");
const addBtn = document.getElementById("add-product-btn");

// ========== PRODUCTS ARRAY ==========
let products = [];

// ========== FETCH PRODUCTS ==========
async function fetchProducts() {
  const querySnapshot = await getDocs(collection(db, "products"));
  products = [];
  querySnapshot.forEach(docSnap => {
    products.push({ id: docSnap.id, ...docSnap.data() });
  });
  renderAdminProducts();
}

// ========== RENDER ==========
function renderAdminProducts(){
  adminProductList.innerHTML = "";
  products.forEach(p=>{
    adminProductList.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.name_en}</td>
        <td>${p.name_ar}</td>
        <td>${p.category}</td>
        <td>${p.price}</td>
        <td>${p.discount}</td>
        <td>${p.status || ""}</td>
        <td>${p.stock}</td>
        <td>
          <button onclick="editProduct('${p.id}')">Edit</button>
          <button onclick="deleteProduct('${p.id}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

// ========== ADD / UPDATE PRODUCT ==========
addBtn.onclick = async ()=>{
  const name_en = document.getElementById("prod-name-en").value.trim();
  const name_ar = document.getElementById("prod-name-ar").value.trim();
  const price = parseFloat(document.getElementById("prod-price").value);
  const category = document.getElementById("prod-category").value;
  const img = document.getElementById("prod-img").value.trim();
  const discount = parseFloat(document.getElementById("prod-discount").value) || 0;
  const statusInput = document.getElementById("prod-status").value;
  let stock = parseInt(document.getElementById("prod-stock").value) || 0;

  if(!name_en || !name_ar || !price || !category || !img) return alert("Fill all fields!");

  let existing = products.find(p=>p.name_en===name_en);

  const id = existing ? existing.id : Date.now().toString(); // use timestamp for new product ID
  const status = stock === 0 ? "out" : statusInput;

  const productData = { name_en, name_ar, price, category, img, discount, status, stock };

  // Save to Firestore
  await setDoc(doc(db, "products", id), productData);

  // Refresh products
  fetchProducts();
  alert("Product saved!");
  clearForm();
}

// ========== EDIT PRODUCT ==========
function editProduct(id){
  const p = products.find(x=>x.id===id);
  document.getElementById("prod-name-en").value = p.name_en;
  document.getElementById("prod-name-ar").value = p.name_ar;
  document.getElementById("prod-price").value = p.price;
  document.getElementById("prod-category").value = p.category;
  document.getElementById("prod-img").value = p.img;
  document.getElementById("prod-discount").value = p.discount;
  document.getElementById("prod-status").value = p.status || "";
  document.getElementById("prod-stock").value = p.stock || 0;
}

// ========== DELETE PRODUCT ==========
async function deleteProduct(id){
  if(!confirm("Are you sure?")) return;
  await deleteDoc(doc(db, "products", id));
  fetchProducts();
}

// ========== CLEAR FORM ==========
function clearForm(){
  document.getElementById("prod-name-en").value = "";
  document.getElementById("prod-name-ar").value = "";
  document.getElementById("prod-price").value = "";
  document.getElementById("prod-category").value = "";
  document.getElementById("prod-img").value = "";
  document.getElementById("prod-discount").value = "";
  document.getElementById("prod-status").value = "";
  document.getElementById("prod-stock").value = "";
}

// ========== INIT ==========
fetchProducts();