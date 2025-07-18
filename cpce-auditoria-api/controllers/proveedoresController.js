// controllers/proveedoresController.js
const { executeQuery } = require('../config/database');

const proveedoresController = {

    // ==========================================
    // CRUD PROVEEDORES
    // ==========================================

    // GET /api/proveedores - Listar todos los proveedores con paginación
    getProveedores: async (req, res) => {
        try {
            const { search = '', page = 1, limit = 10, activo = null, tipo = null } = req.query;

            // Construir query base para contar
            let countQuery = `
                SELECT COUNT(*) as total 
                FROM alt_proveedor p 
                WHERE 1=1
            `;

            // Construir query principal
            let dataQuery = `
                SELECT 
                    p.id_proveedor,
                    p.razon_social,
                    p.cuit,
                    p.tipo_proveedor,
                    p.email_general,
                    p.telefono_general,
                    CONCAT(
                        COALESCE(p.direccion_calle, ''), ' ',
                        COALESCE(p.direccion_numero, ''), ', ',
                        COALESCE(p.barrio, ''), ', ',
                        COALESCE(p.localidad, ''), ', ',
                        COALESCE(p.provincia, '')
                    ) AS direccion_completa,
                    p.activo,
                    p.fecha_alta,
                    COUNT(c.id_contacto) AS total_contactos,
                    CONCAT(
                        COALESCE(cp.nombre, ''), ' ',
                        COALESCE(cp.apellido, '')
                    ) AS contacto_principal
                FROM alt_proveedor p
                LEFT JOIN alt_contacto_proveedor c ON p.id_proveedor = c.id_proveedor
                LEFT JOIN alt_contacto_proveedor cp ON p.id_proveedor = cp.id_proveedor AND cp.principal = TRUE
                WHERE 1=1
            `;

            const params = [];

            // Filtro de búsqueda
            if (search && search.trim()) {
                const searchCondition = ` AND (
                    p.razon_social LIKE ? OR 
                    p.cuit LIKE ? OR 
                    p.email_general LIKE ? OR
                    p.localidad LIKE ?
                )`;
                countQuery += searchCondition;
                dataQuery += searchCondition;
                const searchPattern = `%${search.trim()}%`;
                params.push(searchPattern, searchPattern, searchPattern, searchPattern);
            }

            // Filtro por estado activo
            if (activo !== null) {
                const activoCondition = ` AND p.activo = ?`;
                countQuery += activoCondition;
                dataQuery += activoCondition;
                params.push(activo === 'true' ? 1 : 0);
            }

            // Filtro por tipo de proveedor
            if (tipo && tipo !== 'todos') {
                const tipoCondition = ` AND p.tipo_proveedor = ?`;
                countQuery += tipoCondition;
                dataQuery += tipoCondition;
                params.push(tipo);
            }

            // Obtener total de registros
            const countResult = await executeQuery(countQuery, params);
            const total = countResult[0]?.total || 0;

            // Agregar GROUP BY, ORDER BY y paginación
            dataQuery += `
                GROUP BY p.id_proveedor
                ORDER BY p.razon_social ASC
                LIMIT ? OFFSET ?
            `;

            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const offset = (pageNum - 1) * limitNum;
            params.push(limitNum, offset);

            const proveedores = await executeQuery(dataQuery, params);
            const totalPages = Math.ceil(total / limitNum);

            res.json({
                success: true,
                data: proveedores,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages
                }
            });

        } catch (error) {
            console.error('Error obteniendo proveedores:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener proveedores',
                error: error.message
            });
        }
    },

    // GET /api/proveedores/:id - Obtener un proveedor específico con sus contactos
    getProveedorById: async (req, res) => {
        try {
            const { id } = req.params;

            // Obtener datos del proveedor
            const proveedorQuery = `
                SELECT * FROM alt_proveedor 
                WHERE id_proveedor = ?
            `;
            const [proveedor] = await executeQuery(proveedorQuery, [id]);

            if (!proveedor) {
                return res.status(404).json({
                    success: false,
                    message: 'Proveedor no encontrado'
                });
            }

            // Obtener contactos del proveedor
            const contactosQuery = `
                SELECT * FROM alt_contacto_proveedor 
                WHERE id_proveedor = ?
                ORDER BY principal DESC, nombre ASC
            `;
            const contactos = await executeQuery(contactosQuery, [id]);

            res.json({
                success: true,
                data: {
                    ...proveedor,
                    contactos
                }
            });

        } catch (error) {
            console.error('Error obteniendo proveedor:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener proveedor',
                error: error.message
            });
        }
    },

    // POST /api/proveedores - Crear nuevo proveedor
    createProveedor: async (req, res) => {
        try {
            const {
                razon_social,
                cuit,
                tipo_proveedor = 'Laboratorio',
                email_general,
                telefono_general,
                direccion_calle,
                direccion_numero,
                barrio,
                localidad,
                provincia,
                contactos = []
            } = req.body;

            // Validaciones básicas
            if (!razon_social || !cuit) {
                return res.status(400).json({
                    success: false,
                    message: 'Razón social y CUIT son obligatorios'
                });
            }

            // Verificar si ya existe el CUIT
            const existeQuery = 'SELECT id_proveedor FROM alt_proveedor WHERE cuit = ?';
            const existe = await executeQuery(existeQuery, [cuit]);

            if (existe.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un proveedor con ese CUIT'
                });
            }

            // Insertar proveedor
            const insertProveedorQuery = `
                INSERT INTO alt_proveedor (
                    razon_social, cuit, tipo_proveedor, email_general, telefono_general,
                    direccion_calle, direccion_numero, barrio, localidad, provincia
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const result = await executeQuery(insertProveedorQuery, [
                razon_social, cuit, tipo_proveedor, email_general, telefono_general,
                direccion_calle, direccion_numero, barrio, localidad, provincia
            ]);

            const proveedorId = result.insertId;

            // Insertar contactos si se proporcionaron
            if (contactos && contactos.length > 0) {
                for (const contacto of contactos) {
                    await executeQuery(`
                        INSERT INTO alt_contacto_proveedor (
                            id_proveedor, nombre, apellido, cargo, email, telefono, principal
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    `, [
                        proveedorId,
                        contacto.nombre,
                        contacto.apellido,
                        contacto.cargo,
                        contacto.email,
                        contacto.telefono,
                        contacto.principal || false
                    ]);
                }
            }

            res.status(201).json({
                success: true,
                message: 'Proveedor creado exitosamente',
                data: { id_proveedor: proveedorId }
            });

        } catch (error) {
            console.error('Error creando proveedor:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear proveedor',
                error: error.message
            });
        }
    },

    // PUT /api/proveedores/:id - Actualizar proveedor
    updateProveedor: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                razon_social,
                cuit,
                tipo_proveedor,
                email_general,
                telefono_general,
                direccion_calle,
                direccion_numero,
                barrio,
                localidad,
                provincia,
                activo
            } = req.body;

            // Verificar si el proveedor existe
            const existeQuery = 'SELECT id_proveedor FROM alt_proveedor WHERE id_proveedor = ?';
            const existe = await executeQuery(existeQuery, [id]);

            if (existe.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Proveedor no encontrado'
                });
            }

            // Verificar CUIT duplicado (excluyendo el actual)
            if (cuit) {
                const cuitQuery = 'SELECT id_proveedor FROM alt_proveedor WHERE cuit = ? AND id_proveedor != ?';
                const cuitExiste = await executeQuery(cuitQuery, [cuit, id]);

                if (cuitExiste.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Ya existe otro proveedor con ese CUIT'
                    });
                }
            }

            // Actualizar proveedor
            const updateQuery = `
                UPDATE alt_proveedor SET
                    razon_social = COALESCE(?, razon_social),
                    cuit = COALESCE(?, cuit),
                    tipo_proveedor = COALESCE(?, tipo_proveedor),
                    email_general = ?,
                    telefono_general = ?,
                    direccion_calle = ?,
                    direccion_numero = ?,
                    barrio = ?,
                    localidad = ?,
                    provincia = ?,
                    activo = COALESCE(?, activo),
                    fecha_modificacion = CURRENT_TIMESTAMP
                WHERE id_proveedor = ?
            `;

            await executeQuery(updateQuery, [
                razon_social, cuit, tipo_proveedor, email_general, telefono_general,
                direccion_calle, direccion_numero, barrio, localidad, provincia,
                activo, id
            ]);

            res.json({
                success: true,
                message: 'Proveedor actualizado exitosamente'
            });

        } catch (error) {
            console.error('Error actualizando proveedor:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar proveedor',
                error: error.message
            });
        }
    },

    // DELETE /api/proveedores/:id - Eliminar proveedor (soft delete)
    deleteProveedor: async (req, res) => {
        try {
            const { id } = req.params;

            // Verificar si el proveedor existe
            const existeQuery = 'SELECT id_proveedor FROM alt_proveedor WHERE id_proveedor = ?';
            const existe = await executeQuery(existeQuery, [id]);

            if (existe.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Proveedor no encontrado'
                });
            }

            // Marcar como inactivo en lugar de eliminar
            const deleteQuery = 'UPDATE alt_proveedor SET activo = FALSE WHERE id_proveedor = ?';
            await executeQuery(deleteQuery, [id]);

            res.json({
                success: true,
                message: 'Proveedor desactivado exitosamente'
            });

        } catch (error) {
            console.error('Error eliminando proveedor:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar proveedor',
                error: error.message
            });
        }
    },

    // ==========================================
    // CRUD CONTACTOS
    // ==========================================

    // GET /api/proveedores/:id/contactos - Obtener contactos de un proveedor
    getContactosProveedor: async (req, res) => {
        try {
            const { id } = req.params;

            const contactosQuery = `
                SELECT 
                    c.*,
                    p.razon_social
                FROM alt_contacto_proveedor c
                INNER JOIN alt_proveedor p ON c.id_proveedor = p.id_proveedor
                WHERE c.id_proveedor = ?
                ORDER BY c.principal DESC, c.nombre ASC
            `;

            const contactos = await executeQuery(contactosQuery, [id]);

            res.json({
                success: true,
                data: contactos
            });

        } catch (error) {
            console.error('Error obteniendo contactos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener contactos',
                error: error.message
            });
        }
    },

    // POST /api/proveedores/:id/contactos - Agregar contacto a proveedor
    createContacto: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, apellido, cargo, email, telefono, principal = false } = req.body;

            // Validaciones
            if (!nombre || !apellido) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre y apellido son obligatorios'
                });
            }

            // Verificar si el proveedor existe
            const proveedorExiste = await executeQuery(
                'SELECT id_proveedor FROM alt_proveedor WHERE id_proveedor = ?',
                [id]
            );

            if (proveedorExiste.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Proveedor no encontrado'
                });
            }

            // Si se marca como principal, desmarcar otros contactos principales
            if (principal) {
                await executeQuery(
                    'UPDATE alt_contacto_proveedor SET principal = FALSE WHERE id_proveedor = ?',
                    [id]
                );
            }

            // Insertar contacto
            const insertQuery = `
                INSERT INTO alt_contacto_proveedor (
                    id_proveedor, nombre, apellido, cargo, email, telefono, principal
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const result = await executeQuery(insertQuery, [
                id, nombre, apellido, cargo, email, telefono, principal
            ]);

            res.status(201).json({
                success: true,
                message: 'Contacto agregado exitosamente',
                data: { id_contacto: result.insertId }
            });

        } catch (error) {
            console.error('Error creando contacto:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear contacto',
                error: error.message
            });
        }
    },

    // PUT /api/proveedores/:id/contactos/:contactoId - Actualizar contacto
    updateContacto: async (req, res) => {
        try {
            const { id, contactoId } = req.params;
            const { nombre, apellido, cargo, email, telefono, principal } = req.body;

            // Verificar si el contacto existe y pertenece al proveedor
            const contactoExiste = await executeQuery(
                'SELECT id_contacto FROM alt_contacto_proveedor WHERE id_contacto = ? AND id_proveedor = ?',
                [contactoId, id]
            );

            if (contactoExiste.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Contacto no encontrado'
                });
            }

            // Si se marca como principal, desmarcar otros contactos principales
            if (principal) {
                await executeQuery(
                    'UPDATE alt_contacto_proveedor SET principal = FALSE WHERE id_proveedor = ? AND id_contacto != ?',
                    [id, contactoId]
                );
            }

            // Actualizar contacto
            const updateQuery = `
                UPDATE alt_contacto_proveedor SET
                    nombre = COALESCE(?, nombre),
                    apellido = COALESCE(?, apellido),
                    cargo = ?,
                    email = ?,
                    telefono = ?,
                    principal = COALESCE(?, principal),
                    fecha_modificacion = CURRENT_TIMESTAMP
                WHERE id_contacto = ?
            `;

            await executeQuery(updateQuery, [
                nombre, apellido, cargo, email, telefono, principal, contactoId
            ]);

            res.json({
                success: true,
                message: 'Contacto actualizado exitosamente'
            });

        } catch (error) {
            console.error('Error actualizando contacto:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar contacto',
                error: error.message
            });
        }
    },

    // DELETE /api/proveedores/:id/contactos/:contactoId - Eliminar contacto
    deleteContacto: async (req, res) => {
        try {
            const { id, contactoId } = req.params;

            // Verificar si el contacto existe y pertenece al proveedor
            const contactoExiste = await executeQuery(
                'SELECT id_contacto FROM alt_contacto_proveedor WHERE id_contacto = ? AND id_proveedor = ?',
                [contactoId, id]
            );

            if (contactoExiste.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Contacto no encontrado'
                });
            }

            // Eliminar contacto
            await executeQuery(
                'DELETE FROM alt_contacto_proveedor WHERE id_contacto = ?',
                [contactoId]
            );

            res.json({
                success: true,
                message: 'Contacto eliminado exitosamente'
            });

        } catch (error) {
            console.error('Error eliminando contacto:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar contacto',
                error: error.message
            });
        }
    },

    // ==========================================
    // ENDPOINTS ADICIONALES
    // ==========================================

    // GET /api/proveedores/tipos - Obtener tipos de proveedores disponibles
    getTiposProveedores: async (req, res) => {
        try {
            const tipos = [
                { value: 'Laboratorio', label: 'Laboratorio' },
                { value: 'Droguería', label: 'Droguería' },
                { value: 'Ambos', label: 'Ambos' }
            ];

            res.json({
                success: true,
                data: tipos
            });

        } catch (error) {
            console.error('Error obteniendo tipos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener tipos de proveedores'
            });
        }
    },

    // GET /api/proveedores/estadisticas - Obtener estadísticas de proveedores
    getEstadisticas: async (req, res) => {
        try {
            const estadisticasQuery = `
                SELECT 
                    COUNT(*) as total_proveedores,
                    SUM(CASE WHEN activo = TRUE THEN 1 ELSE 0 END) as proveedores_activos,
                    SUM(CASE WHEN activo = FALSE THEN 1 ELSE 0 END) as proveedores_inactivos,
                    SUM(CASE WHEN tipo_proveedor = 'Laboratorio' THEN 1 ELSE 0 END) as laboratorios,
                    SUM(CASE WHEN tipo_proveedor = 'Droguería' THEN 1 ELSE 0 END) as droguerias,
                    SUM(CASE WHEN tipo_proveedor = 'Ambos' THEN 1 ELSE 0 END) as ambos
                FROM alt_proveedor
            `;

            const contactosQuery = `
                SELECT COUNT(*) as total_contactos
                FROM alt_contacto_proveedor
            `;

            const [estadisticas] = await executeQuery(estadisticasQuery);
            const [contactos] = await executeQuery(contactosQuery);

            res.json({
                success: true,
                data: {
                    ...estadisticas,
                    total_contactos: contactos.total_contactos
                }
            });

        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    },

    // GET /api/proveedores/buscar - Búsqueda rápida para autocompletar
    buscarProveedores: async (req, res) => {
        try {
            const { q = '', limit = 10 } = req.query;

            if (!q || q.trim().length < 2) {
                return res.json({
                    success: true,
                    data: []
                });
            }

            const buscarQuery = `
                SELECT 
                    id_proveedor,
                    razon_social,
                    cuit,
                    tipo_proveedor,
                    email_general,
                    telefono_general
                FROM alt_proveedor
                WHERE activo = TRUE
                AND (
                    razon_social LIKE ? OR 
                    cuit LIKE ? OR 
                    email_general LIKE ?
                )
                ORDER BY razon_social ASC
                LIMIT ?
            `;

            const searchPattern = `%${q.trim()}%`;
            const resultados = await executeQuery(buscarQuery, [
                searchPattern, searchPattern, searchPattern, parseInt(limit)
            ]);

            res.json({
                success: true,
                data: resultados
            });

        } catch (error) {
            console.error('Error en búsqueda:', error);
            res.status(500).json({
                success: false,
                message: 'Error en la búsqueda',
                error: error.message
            });
        }
    }
};

module.exports = proveedoresController;