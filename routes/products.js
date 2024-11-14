const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = './data/products.json';

// Helper para leer y escribir en el archivo JSON
const readData = () => JSON.parse(fs.readFileSync(path, 'utf-8'));
const writeData = (data) => fs.writeFileSync(path, JSON.stringify(data, null, 2));

// GET / - Listar todos los productos
router.get('/', (req, res) => {
    const { limit } = req.query;
    const products = readData();
    res.json(limit ? products.slice(0, limit) : products);
});

// GET /:pid - Obtener un producto por ID
router.get('/:pid', (req, res) => {
    const products = readData();
    const product = products.find(p => p.id === req.params.pid);
    product ? res.json(product) : res.status(404).json({ error: 'Producto no encontrado' });
});

// POST / - Agregar un nuevo producto
router.post('/', (req, res) => {
    const { title, description, code, price, stock, category, thumbnails = [] } = req.body;
    if (!title || !description || !code || !price || stock === undefined || !category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios excepto thumbnails' });
    }

    const products = readData();
    const newProduct = {
        id: String(Date.now()), // ID único
        title,
        description,
        code,
        price,
        status: true,
        stock,
        category,
        thumbnails
    };

    products.push(newProduct);
    writeData(products);
    res.status(201).json(newProduct);
});

// PUT /:pid - Actualizar un producto por ID
router.put('/:pid', (req, res) => {
    const products = readData();
    const index = products.findIndex(p => p.id === req.params.pid);

    if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });

    const updatedProduct = { ...products[index], ...req.body };
    delete updatedProduct.id; // No permitir modificar el ID
    products[index] = updatedProduct;

    writeData(products);
    res.json(updatedProduct);
});

// DELETE /:pid - Eliminar un producto por ID
router.delete('/:pid', (req, res) => {
    const products = readData();
    const filteredProducts = products.filter(p => p.id !== req.params.pid);

    if (products.length === filteredProducts.length) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    writeData(filteredProducts);
    res.status(204).send();
});

// DELETE /no-id - Eliminar todos los productos sin ID
router.delete('/no-id', (req, res) => {
    const products = readData();
    const productsWithId = products.filter(product => product.id !== undefined);

    if (products.length === productsWithId.length) {
        return res.status(404).json({ error: 'No hay productos sin ID para eliminar' });
    }

    writeData(productsWithId);
    res.json({
        message: 'Productos sin ID eliminados correctamente',
        deletedCount: products.length - productsWithId.length
    });
});

module.exports = router;
