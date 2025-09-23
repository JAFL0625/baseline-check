// src/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Creamos o abrimos el archivo de base de datos
const dbPath = path.resolve(__dirname, '../data/app.db');
const db = new sqlite3.Database(dbPath);

// Crear tabla de ejemplo (puedes ampliarla)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE
    )
  `);
});

module.exports = db;
