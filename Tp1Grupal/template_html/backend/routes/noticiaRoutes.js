const express = require('express');
const multer = require('multer');
const connection = require('../db/connection');
const path = require('path');
const router = express.Router();

// Configurar Multer para guardar imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Crear una nueva noticia (Alta) con imagen
router.post('/noticias', upload.single('imagen'), (req, res) => {
    const { titulo, resumen, contenidoHTML, publicada, fechaPublicacion, idEmpresa } = req.body;
    const imagen = req.file ? req.file.filename : null;
    const query = 'INSERT INTO Noticia (Titulo, Resumen, Imagen, ContenidoHTML, Publicada, FechaPublicacion, idEmpresa) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [titulo, resumen, imagen, contenidoHTML, publicada, fechaPublicacion, idEmpresa], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al agregar la noticia', error: err });
        res.status(201).json({ message: 'Noticia agregada correctamente', id: result.insertId });
    });
});

// Obtener todas las noticias (Consulta)
router.get('/noticias', (req, res) => {
    connection.query('SELECT * FROM Noticia', (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error al obtener las noticias', error: err });
        res.status(200).json(rows);
    });
});

// Actualizar una noticia (Modificación)
router.put('/noticias/porid/:id', upload.single('imagen'), (req, res) => {
    const { id } = req.params;
    const { titulo, resumen, contenidoHTML, publicada, fechaPublicacion, idEmpresa } = req.body;
    const imagen = req.file ? req.file.filename : null;
    const query = 'UPDATE Noticia SET Titulo = ?, Resumen = ?, Imagen = ?, ContenidoHTML = ?, Publicada = ?, FechaPublicacion = ?, idEmpresa = ? WHERE Id = ?';
    connection.query(query, [titulo, resumen, imagen, contenidoHTML, publicada, fechaPublicacion, idEmpresa, id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al actualizar la noticia', error: err });
        res.status(200).json({ message: 'Noticia actualizada correctamente' });
    });
});

// Baja lógica de una noticia (cambiar Publicada de 'Y' a 'N' y viceversa)
router.put('/noticias/baja/:id', (req, res) => {
    const { id } = req.params;
    
    // Obtener el estado actual de la noticia
    connection.query('SELECT Publicada FROM Noticia WHERE Id = ?', [id], (error, results) => {
        if (error) return res.status(500).json({ message: 'Error al obtener la noticia', error });

        if (results.length === 0) return res.status(404).json({ message: 'Noticia no encontrada' });

        const nuevaPublicada = results[0].Publicada === 'Y' ? 'N' : 'Y';

        // Actualizar el estado de la noticia
        const query = 'UPDATE Noticia SET Publicada = ? WHERE Id = ?';
        connection.query(query, [nuevaPublicada, id], (err, result) => {
            if (err) return res.status(500).json({ message: 'Error al actualizar la noticia', error: err });

            res.status(200).json({ message: `Noticia actualizada a estado: ${nuevaPublicada}` });
        });
    });
});

// Eliminar una noticia (Baja)
router.delete('/noticias/delete/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM Noticia WHERE Id = ?';
    connection.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al eliminar la noticia', error: err });
        res.status(200).json({ message: 'Noticia eliminada correctamente' });
    });
});

router.get('/noticias/empresaid/:idEmpresa', (req, res) => {
    const { idEmpresa } = req.params;
    const query = `
        SELECT Id, Titulo, Resumen, Imagen 
        FROM noticia 
        WHERE idEmpresa = ? AND Publicada = 'Y' 
        ORDER BY FechaPublicacion DESC 
        LIMIT 5
    `;

    connection.query(query, [idEmpresa], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Error al obtener las noticias' });
        }
        res.status(200).json(results);
    });
});

// Obtener una noticia por ID
router.get('/noticias/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM noticia WHERE Id = ?';

    connection.query(query, [id], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Error al obtener la noticia' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Noticia no encontrada' });
        }
        res.status(200).json(results[0]); // Enviar la noticia encontrada
    });
});

// Endpoint de búsqueda de noticias (filtrado por título o resumen, orden descendente y paginación)
router.get('/noticia/buscar', (req, res) => {
    const { texto, pagina = 1 } = req.query;
    console.log("🔍 Buscando noticias con:", texto);

    const noticiasPorPagina = 20;
    const offset = (pagina - 1) * noticiasPorPagina;

    const query = `
        SELECT Id, Titulo, Resumen, Imagen, FechaPublicacion 
        FROM Noticia
        WHERE Publicada = 'Y' 
        AND (LOWER(Titulo) LIKE LOWER(?) OR LOWER(Resumen) LIKE LOWER(?))
        ORDER BY FechaPublicacion DESC
        LIMIT ? OFFSET ?
    `;

    const searchText = `%${texto}%`;

    console.log("🛠️ Query ejecutada:", query);
    console.log("🔍 Parámetros:", [searchText, searchText, noticiasPorPagina, offset]);

    connection.query(query, [searchText, searchText, noticiasPorPagina, offset], (error, results) => {
        if (error) {
            console.error("❌ Error en la consulta:", error);
            return res.status(500).json({ message: 'Error al obtener las noticias', error });
        }

        console.log("✅ Resultados obtenidos:", results);
        res.status(200).json(results);
    });
});





// Obtener las últimas 5 noticias publicadas de una empresa específica
router.get('/noticias/empresa/:idEmpresa', (req, res) => {
    const { idEmpresa } = req.params;
    const query = `
        SELECT Id, Titulo, Resumen, Imagen 
        FROM Noticia 
        WHERE idEmpresa = ? AND Publicada = 'Y' 
        ORDER BY FechaPublicacion DESC 
        LIMIT 5
    `;

    connection.query(query, [idEmpresa], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Error al obtener las noticias', error });
        }
        res.status(200).json(results);
    });
});

// Nueva API para buscar noticias con la palabra "tech"
router.get('/noticias/buscar-tech', (req, res) => {
    const query = `
        SELECT Id, Titulo, Resumen, Imagen, FechaPublicacion 
        FROM Noticia
        WHERE Publicada = 'Y' 
        AND (LOWER(Titulo) LIKE '%tech%' OR LOWER(Resumen) LIKE '%tech%')
        ORDER BY FechaPublicacion DESC
    `;

    console.log("🛠️ Ejecutando consulta SQL:", query); // 🔍 Ver qué consulta se ejecuta

    connection.query(query, (error, results) => {
        if (error) {
            console.error("❌ Error en la consulta de noticias con 'tech':", error);
            return res.status(500).json({ message: 'Error al obtener las noticias', error });
        }

        console.log("✅ Resultados obtenidos en la API:", results); // 🔍 Ver qué devuelve MySQL
        res.status(200).json(results);
    });
});


module.exports = router;
