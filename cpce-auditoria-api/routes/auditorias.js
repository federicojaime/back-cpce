const express = require('express');
const router = express.Router();
const auditoriasController = require('../controllers/auditoriasController');
const authMiddleware = require('../middleware/auth');

// Todas las rutas de auditorías requieren autenticación
router.use(authMiddleware);

// GET /api/auditorias/pendientes - Obtener auditorías pendientes
router.get('/pendientes', auditoriasController.getPendientes);

// GET /api/auditorias/historicas - Obtener auditorías históricas
router.get('/historicas', auditoriasController.getHistoricas);

// POST /api/auditorias/listado - Obtener listado con filtros
router.post('/listado', auditoriasController.getListado);

// POST /api/auditorias/paciente - Obtener historial de un paciente
router.post('/paciente', auditoriasController.getHistorialPaciente);

// POST /api/auditorias/excel - Generar reporte Excel por mes
router.post('/excel', auditoriasController.generarExcel);


// GET /api/auditorias/:id - Obtener datos completos para auditar
router.get('/:id', auditoriasController.getAuditoriaCompleta);

// POST /api/auditorias/:id/procesar - Procesar auditoría (aprobar/denegar medicamentos)
router.post('/:id/procesar', auditoriasController.procesarAuditoria);

// POST /api/auditorias/:id/enviar-medico - Enviar a médico auditor
router.post('/:id/enviar-medico', auditoriasController.enviarMedicoAuditor);

// POST /api/auditorias/:id/revertir-borrar - Revertir o borrar auditoría
router.post('/:id/revertir-borrar', auditoriasController.revertirBorrarAuditoria);

module.exports = router;

