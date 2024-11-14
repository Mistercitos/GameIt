const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = './data/carts.json';

const readData = () => JSON.parse(fs.readFileSync(path, 'utf-8'));
const writeData = (data) => fs.writeFileSync(path, JSON.stringify(data, null, 2));

// POST / - Crear un nuevo carrito
router.post('/', (req, res) => {
    const carts = readData();
    const newCart = {
        id: String(Date.now()), // ID único
        products: []
    };

    carts.push(newCart);
    writeData(carts);
    res.status(201).json(newCart);
});

// GET /:cid - Listar los productos de un carrito específico
router.get('/:cid', (req, res) => {
    const carts = readData();
    const cart = carts.find(c => c.id === req.params.cid);

    cart ? res.json(cart.products) : res.status(404).json({ error: 'Carrito no encontrado' });
});

// POST /:cid/product/:pid - Agregar un producto a un carrito
router.post('/:cid/product/:pid', (req, res) => {
    const carts = readData();
    const cart = carts.find(c => c.id === req.params.cid);

    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    const product = cart.products.find(p => p.product === req.params.pid);

    if (product) {
        product.quantity += 1; // Incrementa la cantidad si ya existe
    } else {
        cart.products.push({ product: req.params.pid, quantity: 1 });
    }

    writeData(carts);
    res.status(200).json(cart);
});

module.exports = router;
