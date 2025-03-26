const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connection = require('./db/connection');
const empresaRoutes = require('./routes/empresaRoutes');
const noticiaRoutes = require('./routes/noticiaRoutes');

// Inicializar dotenv
dotenv.config();

// Crear la aplicación express
const app = express();

// Configurar el puerto y la conexión a la base de datos
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('uploads')); // Para las imágenes subidas


// Usar las rutas de Empresa y Noticia
app.use('/api/', empresaRoutes);  
app.use('/api/', noticiaRoutes);  
app.use('/uploads', express.static('uploads')); // Para las imágenes subidas
// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
