import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// ====== Firebase Configuration ======
const firebaseConfig = {
  apiKey: "AIzaSyAis292KQWdOuucwHVcfOPKzMwsZxQT0wU",
  authDomain: "darkstore-e5e95.firebaseapp.com",
  projectId: "darkstore-e5e95",
  storageBucket: "darkstore-e5e95.firebasestorage.app",
  messagingSenderId: "142426749084",
  appId: "1:142426749084:web:e4a01b8f567c7fdf1d9559"
};

// ====== Initialize Firebase ======
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ====== DOM ======
const ordersList = document.getElementById("orders-list");

// ====== Fetch Orders from Firestore ======
async function fetchOrders() {
  if(!ordersList) return;

  const ordersCol = collection(db, "orders");
  const ordersSnapshot = await getDocs(ordersCol);
  const orders = ordersSnapshot.docs.map(doc => doc.data());

  renderOrders(orders);
}

// ====== Render Orders ======
function renderOrders(orders){
  ordersList.innerHTML = "";

  orders.forEach((order, index)=>{
    const customer = order.customer || {};
    const total = order.items.reduce((sum, i)=> sum + i.price*i.qty, 0);

    ordersList.innerHTML += `
      <tr>
        <td>${index+1}</td>
        <td>${order.date || "N/A"}</td>
        <td>${order.payment || "N/A"}</td>
        <td>$${total}</td>
        <td><button onclick="toggleDetails(${index})">View</button></td>
      </tr>
      <tr class="order-details" id="customer-${index}" style="display:none">
        <td colspan="5">
          <strong>Customer Info:</strong><br>
          Name: ${customer.firstName || "N/A"} ${customer.lastName || ""}<br>
          Country: ${customer.country || "N/A"}<br>
          Street: ${customer.street || "N/A"}<br>
          City: ${customer.city || "N/A"}<br>
          State/Region: ${customer.state || "N/A"}<br>
          Postcode/ZIP: ${customer.postcode || "N/A"}<br>
          Phone: ${customer.phone || "N/A"}<br>
          Email: ${customer.email || "N/A"}<br>
        </td>
      </tr>
      <tr class="order-details" id="items-${index}" style="display:none">
        <td colspan="5">
          <strong>Order Items:</strong><br>
          ${order.items.map(i=>`${i.name} x ${i.qty} - $${i.price*i.qty}`).join("<br>")}
          ${order.notes ? `<br><strong>Notes:</strong> ${order.notes}` : ""}
        </td>
      </tr>
    `;
  });
}

// ====== Toggle Details ======
window.toggleDetails = function(index){
  const customerRow = document.getElementById(`customer-${index}`);
  const itemsRow = document.getElementById(`items-${index}`);
  const isVisible = customerRow.style.display === "table-row";
  customerRow.style.display = isVisible ? "none" : "table-row";
  itemsRow.style.display = isVisible ? "none" : "table-row";
}

// ====== Init ======
fetchOrders();