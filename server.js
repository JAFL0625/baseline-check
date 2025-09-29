// server.js
const express = require('express');
const app = express();
const routes = require('./src/routes');

// Middleware para interpretar JSON
app.use(express.json());

// ✅ Servir archivos estáticos de la carpeta public
app.use(express.static('public'));


// Rutas de la API en /api
app.use('/api', routes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
