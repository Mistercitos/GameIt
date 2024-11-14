const express = require('express');
const app = express();
const PORT = 8080;

// Middleware para analizar JSON
app.use(express.json());

// Importa los routers
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

// Configura las rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
