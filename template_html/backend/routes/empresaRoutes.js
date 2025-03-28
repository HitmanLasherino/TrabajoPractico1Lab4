const express = require('express');
const connection = require('../db/connection');
const router = express.Router();

// Crear una nueva empresa (Alta)
router.post('/empresas', (req, res) => {
    const { denominacion, telefono, horarioAtencion, quienesSomos, latitud, longitud, domicilio, email } = req.body;
    const query = 'INSERT INTO empresa (Denominacion, Telefono, HorarioAtencion, QuienesSomos, Latitud, Longitud, Domicilio, Email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [denominacion, telefono, horarioAtencion, quienesSomos, latitud, longitud, domicilio, email], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al agregar la empresa', error: err });
        res.status(201).json({ message: 'Empresa agregada correctamente', id: result.insertId });
    });
});

// Obtener todas las empresas (Consulta)
router.get('/empresas', async (req, res) => {
    // Lógica para obtener todas las empresas
    connection.query('SELECT * FROM empresa', (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Error al obtener las empresas' });
        }
        res.status(200).json(results);  // Enviar los resultados de la consulta como respuesta
    });
});

// Actualizar una empresa (Modificación)
router.put('/empresas/:id', (req, res) => {
    const { id } = req.params;
    const { denominacion, telefono, horarioAtencion, quienesSomos, latitud, longitud, domicilio, email } = req.body;
    const query = 'UPDATE empresa SET Denominacion = ?, Telefono = ?, HorarioAtencion = ?, QuienesSomos = ?, Latitud = ?, Longitud = ?, Domicilio = ?, Email = ? WHERE Id = ?';
    connection.query(query, [denominacion, telefono, horarioAtencion, quienesSomos, latitud, longitud, domicilio, email, id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al actualizar la empresa', error: err });
        res.status(200).json({ message: 'Empresa actualizada correctamente' });
    });
});

// Eliminar una empresa (Baja)
router.delete('/empresas/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM empresa WHERE Id = ?';
    connection.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al eliminar la empresa', error: err });
        res.status(200).json({ message: 'Empresa eliminada correctamente' });
    });
});

router.get('/empresas/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM empresa WHERE Id = ?';
    
    connection.query(query, [id], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Error al obtener la empresa' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Empresa no encontrada' });
        }
        res.status(200).json(results[0]); // Enviar solo la empresa encontrada
    });
});

module.exports = router;
