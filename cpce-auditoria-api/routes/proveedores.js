// routes/proveedores.js
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const proveedoresController = require('../controllers/proveedoresController');
const auth = require('../middleware/auth');

// Todas las rutas de proveedores requieren autenticación
router.use(auth);

// Validaciones para crear/actualizar proveedor
const proveedorValidation = [
    body('razon_social')
        .notEmpty()
        .withMessage('La razón social es obligatoria')
        .isLength({ max: 255 })
        .withMessage('La razón social no puede exceder 255 caracteres'),

    body('cuit')
        .notEmpty()
        .withMessage('El CUIT es obligatorio')
        .matches(/^\d{2}-\d{8}-\d{1}$/)
        .withMessage('El CUIT debe tener el formato XX-XXXXXXXX-X'),

    body('tipo_proveedor')
        .optional()
        .isIn(['Laboratorio', 'Droguería', 'Ambos'])
        .withMessage('Tipo de proveedor inválido'),

    body('email_general')
        .optional()
        .isEmail()
        .withMessage('Email inválido'),

    body('telefono_general')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Teléfono muy largo'),

    body('localidad')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Localidad muy larga'),

    body('provincia')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Provincia muy larga')
];

// Validaciones para crear/actualizar contacto
const contactoValidation = [
    body('nombre')
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .isLength({ max: 100 })
        .withMessage('El nombre no puede exceder 100 caracteres'),

    body('apellido')
        .notEmpty()
        .withMessage('El apellido es obligatorio')
        .isLength({ max: 100 })
        .withMessage('El apellido no puede exceder 100 caracteres'),

    body('cargo')
        .optional()
        .isLength({ max: 100 })
        .withMessage('El cargo no puede exceder 100 caracteres'),

    body('email')
        .optional()
        .isEmail()
        .withMessage('Email inválido'),

    body('telefono')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Teléfono muy largo'),

    body('principal')
        .optional()
        .isBoolean()
        .withMessage('Principal debe ser verdadero o falso')
];

// Validación para parámetros ID
const idValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID debe ser un número entero positivo'),

    param('contactoId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID de contacto debe ser un número entero positivo')
];

// ==========================================
// RUTAS PRINCIPALES DE PROVEEDORES
// ==========================================

// GET /api/proveedores/tipos - Obtener tipos disponibles (debe ir antes de las rutas con parámetros)
router.get('/tipos', proveedoresController.getTiposProveedores);

// GET /api/proveedores/estadisticas - Obtener estadísticas
router.get('/estadisticas', proveedoresController.getEstadisticas);

// GET /api/proveedores/buscar - Búsqueda rápida
router.get('/buscar', [
    query('q').optional().isLength({ min: 2 }).withMessage('La búsqueda debe tener al menos 2 caracteres'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Límite debe ser entre 1 y 50')
], proveedoresController.buscarProveedores);

// GET /api/proveedores - Listar proveedores con filtros y paginación
router.get('/', [
    query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe ser entre 1 y 100'),
    query('activo').optional().isIn(['true', 'false']).withMessage('Activo debe ser true o false'),
    query('tipo').optional().isIn(['Laboratorio', 'Droguería', 'Ambos', 'todos']).withMessage('Tipo inválido')
], proveedoresController.getProveedores);

// POST /api/proveedores - Crear nuevo proveedor
router.post('/', proveedorValidation, proveedoresController.createProveedor);

// GET /api/proveedores/:id - Obtener proveedor específico
router.get('/:id', idValidation, proveedoresController.getProveedorById);

// PUT /api/proveedores/:id - Actualizar proveedor
router.put('/:id', [
    ...idValidation,
    body('razon_social').optional().isLength({ max: 255 }),
    body('cuit').optional().matches(/^\d{2}-\d{8}-\d{1}$/),
    body('tipo_proveedor').optional().isIn(['Laboratorio', 'Droguería', 'Ambos']),
    body('email_general').optional().isEmail(),
    body('activo').optional().isBoolean()
], proveedoresController.updateProveedor);

// DELETE /api/proveedores/:id - Eliminar proveedor (soft delete)
router.delete('/:id', idValidation, proveedoresController.deleteProveedor);

// ==========================================
// RUTAS DE CONTACTOS
// ==========================================

// GET /api/proveedores/:id/contactos - Obtener contactos del proveedor
router.get('/:id/contactos', idValidation, proveedoresController.getContactosProveedor);

// POST /api/proveedores/:id/contactos - Agregar contacto al proveedor
router.post('/:id/contactos', [
    ...idValidation,
    ...contactoValidation
], proveedoresController.createContacto);

// PUT /api/proveedores/:id/contactos/:contactoId - Actualizar contacto
router.put('/:id/contactos/:contactoId', [
    ...idValidation,
    body('nombre').optional().isLength({ max: 100 }),
    body('apellido').optional().isLength({ max: 100 }),
    body('cargo').optional().isLength({ max: 100 }),
    body('email').optional().isEmail(),
    body('telefono').optional().isLength({ max: 50 }),
    body('principal').optional().isBoolean()
], proveedoresController.updateContacto);

// DELETE /api/proveedores/:id/contactos/:contactoId - Eliminar contacto
router.delete('/:id/contactos/:contactoId', idValidation, proveedoresController.deleteContacto);

module.exports = router;