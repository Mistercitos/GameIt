const express = require('express');
const { create } = require('express-handlebars');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Configuración de Handlebars
const hbs = create({
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    extname: 'handlebars'
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Lista de productos
const products = [];

// Configuración de WebSocket
io.on('connection', (socket) => {
    console.log('Cliente conectado');

    // Enviar la lista actual de productos
    socket.emit('products', products);

    // Agregar un nuevo producto
    socket.on('newProduct', (product) => {
        products.push(product);
        io.emit('products', products); // Enviar productos actualizados a todos los clientes
    });

    // Eliminar un producto
    socket.on('deleteProduct', (id) => {
        const index = products.findIndex(product => product.id === id);
        if (index !== -1) {
            products.splice(index, 1);
            io.emit('products', products); // Enviar productos actualizados a todos los clientes
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

// Rutas
app.get('/', (req, res) => {
    res.render('home', { layout: 'main', products });
});

app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { layout: 'main' });
});

// API de productos
// Obtener todos los productos
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Crear un nuevo producto
app.post('/api/products', (req, res) => {
    const product = {
        id: Date.now().toString(),
        ...req.body,
    };
    products.push(product);
    io.emit('products', products); // Enviar productos actualizados a todos los clientes
    res.status(201).json(product);
});

// Eliminar un producto por ID
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const index = products.findIndex(product => product.id === id);
    if (index !== -1) {
        products.splice(index, 1);
        io.emit('products', products); // Enviar productos actualizados a todos los clientes
        res.status(200).json({ message: 'Producto eliminado' });
    } else {
        res.status(404).json({ message: 'Producto no encontrado' });
    }
});

// Arrancar el servidor
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
