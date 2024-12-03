const socket = io();

// Actualizar la lista de productos en la vista
socket.on("products", (products) => {
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";
  products.forEach((product) => {
    const li = document.createElement("li");
    li.textContent = `${product.name} - ${product.genre} - ${product.platform} - $${product.price} - ${product.releaseYear}`;
    productList.appendChild(li);
  });
});

// Enviar nuevo producto
const form = document.getElementById("product-form");
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const product = {
    id: Date.now().toString(),
    name: document.getElementById("name").value,
    genre: document.getElementById("genre").value,
    platform: document.getElementById("platform").value,
    price: document.getElementById("price").value,
    releaseYear: document.getElementById("releaseYear").value,
  };

  socket.emit("newProduct", product);
  form.reset();
});