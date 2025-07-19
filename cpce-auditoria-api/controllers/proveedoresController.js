// controllers/proveedoresController.js
const pool = require('../config/database');

// Obtener todos los proveedores con paginación y filtros
const getProveedores = async (req, res) => {
    console.log('GET /api/proveedores - Query params:', req.query);
    
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const tipo = req.query.tipo || '';
        const activo = req.query.activo;

        console.log('Parámetros procesados:', { page, limit, offset, search, tipo, activo });

        // Construir la consulta base
        let whereConditions = ['1=1'];
        let queryParams = [];

        // Agregar condición de búsqueda
        if (search) {
            whereConditions.push('(p.razon_social LIKE ? OR p.cuit LIKE ? OR p.email_general LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Agregar filtro de tipo
        if (tipo && tipo !== '' && tipo !== 'todos') {
            whereConditions.push('p.tipo_proveedor = ?');
            queryParams.push(tipo);
        }

        // Agregar filtro de estado activo
        if (activo !== undefined && activo !== '' && activo !== null) {
            const activoValue = activo === 'true' || activo === true ? 1 : 0;
            whereConditions.push('p.activo = ?');
            queryParams.push(activoValue);
        }

        const whereClause = whereConditions.join(' AND ');
        console.log('WHERE clause:', whereClause);
        console.log('Query params para count:', queryParams);

        // Obtener el total de registros
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM alt_proveedor p
            WHERE ${whereClause}
        `;
        
        const [countResult] = await pool.query(countQuery, queryParams);
        const total = countResult[0].total;
        
        console.log('Total registros:', total);

        // Obtener los proveedores con paginación
        const dataQuery = `
            SELECT 
                p.id_proveedor,
                p.razon_social,
                p.cuit,
                p.tipo_proveedor,
                CONCAT(
                    COALESCE(p.direccion_calle, ''), ' ',
                    COALESCE(p.direccion_numero, ''), ', ',
                    COALESCE(p.localidad, ''), ', ',
                    COALESCE(p.provincia, '')
                ) AS direccion,
                p.telefono_general,
                p.email_general,
                p.activo,
                p.fecha_alta as created_at,
                p.fecha_alta as updated_at,
                (SELECT COUNT(*) FROM alt_contacto_proveedor WHERE id_proveedor = p.id_proveedor) as total_contactos
            FROM alt_proveedor p
            WHERE ${whereClause}
            ORDER BY p.razon_social ASC
            LIMIT ? OFFSET ?
        `;

        // Agregar parámetros de paginación
        const dataParams = [...queryParams, limit, offset];
        console.log('Query params para data:', dataParams);
        
        const [proveedores] = await pool.query(dataQuery, dataParams);
        console.log('Proveedores encontrados:', proveedores.length);

        const response = {
            success: true,
            data: proveedores,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalRecords: total,
            limit
        };

        console.log('Respuesta enviada:', { ...response, data: `${proveedores.length} registros` });
        res.json(response);

    } catch (error) {
        console.error('Error detallado en getProveedores:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error al obtener proveedores',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Obtener un proveedor por ID
const getProveedorById = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                p.id_proveedor,
                p.razon_social,
                p.cuit,
                p.tipo_proveedor,
                CONCAT(
                    COALESCE(p.direccion_calle, ''), ' ',
                    COALESCE(p.direccion_numero, ''), ', ',
                    COALESCE(p.localidad, ''), ', ',
                    COALESCE(p.provincia, '')
                ) AS direccion,
                p.telefono_general,
                p.email_general,
                p.observaciones,
                p.activo,
                p.fecha_alta as created_at
            FROM alt_proveedor p
            WHERE p.id_proveedor = ?
        `;

        const [rows] = await pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Proveedor no encontrado'
            });
        }

        // Obtener los datos con la estructura correcta
        const proveedor = {
            id: rows[0].id_proveedor,
            nombre: rows[0].razon_social,
            razon_social: rows[0].razon_social,
            cuit: rows[0].cuit,
            tipo: rows[0].tipo_proveedor?.toLowerCase() || 'farmacia',
            direccion: rows[0].direccion,
            telefono: rows[0].telefono_general,
            email: rows[0].email_general,
            observaciones: rows[0].observaciones,
            activo: rows[0].activo === 1
        };

        res.json(proveedor);

    } catch (error) {
        console.error('Error al obtener proveedor:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener proveedor',
            error: error.message
        });
    }
};

// Crear un nuevo proveedor
const createProveedor = async (req, res) => {
    try {
        const {
            nombre,
            razon_social,
            cuit,
            tipo,
            direccion,
            telefono,
            email,
            observaciones,
            activo = true
        } = req.body;

        // Usar razon_social o nombre
        const razonSocialFinal = razon_social || nombre;

        // Verificar si ya existe un proveedor con el mismo CUIT
        const [existing] = await pool.query(
            'SELECT id_proveedor FROM alt_proveedor WHERE cuit = ?',
            [cuit]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un proveedor con ese CUIT'
            });
        }

        // Parsear dirección si viene como string
        let direccion_calle = '';
        let direccion_numero = '';
        let localidad = '';
        let provincia = '';
        
        if (direccion) {
            const partes = direccion.split(',').map(p => p.trim());
            if (partes[0]) {
                const calleNumero = partes[0].split(' ');
                direccion_numero = calleNumero.pop() || '';
                direccion_calle = calleNumero.join(' ');
            }
            localidad = partes[1] || '';
            provincia = partes[2] || '';
        }

        const query = `
            INSERT INTO alt_proveedor (
                razon_social, 
                cuit, 
                tipo_proveedor, 
                direccion_calle,
                direccion_numero,
                localidad,
                provincia,
                telefono_general, 
                email_general, 
                observaciones, 
                activo,
                fecha_alta
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const tipoProveedor = tipo === 'farmacia' ? 'Farmacia' : 
                             tipo === 'drogueria' ? 'Droguería' : 
                             'Droguería';

        const [result] = await pool.query(query, [
            razonSocialFinal,
            cuit,
            tipoProveedor,
            direccion_calle,
            direccion_numero,
            localidad,
            provincia,
            telefono,
            email,
            observaciones,
            activo ? 1 : 0
        ]);

        res.status(201).json({
            success: true,
            message: 'Proveedor creado exitosamente',
            data: {
                id_proveedor: result.insertId,
                razon_social: razonSocialFinal,
                cuit
            }
        });

    } catch (error) {
        console.error('Error al crear proveedor:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear proveedor',
            error: error.message
        });
    }
};

// Actualizar un proveedor
const updateProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            razon_social,
            cuit,
            tipo,
            direccion,
            telefono,
            email,
            observaciones,
            activo
        } = req.body;

        // Verificar si el proveedor existe
        const [existing] = await pool.query(
            'SELECT id_proveedor FROM alt_proveedor WHERE id_proveedor = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Proveedor no encontrado'
            });
        }

        // Verificar si el CUIT ya existe en otro proveedor
        if (cuit) {
            const [cuitExists] = await pool.query(
                'SELECT id_proveedor FROM alt_proveedor WHERE cuit = ? AND id_proveedor != ?',
                [cuit, id]
            );

            if (cuitExists.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El CUIT ya está registrado en otro proveedor'
                });
            }
        }

        const updateFields = [];
        const values = [];

        const razonSocialFinal = razon_social || nombre;
        if (razonSocialFinal !== undefined) {
            updateFields.push('razon_social = ?');
            values.push(razonSocialFinal);
        }
        if (cuit !== undefined) {
            updateFields.push('cuit = ?');
            values.push(cuit);
        }
        if (tipo !== undefined) {
            const tipoProveedor = tipo === 'farmacia' ? 'Farmacia' : 
                                 tipo === 'drogueria' ? 'Droguería' : 
                                 'Droguería';
            updateFields.push('tipo_proveedor = ?');
            values.push(tipoProveedor);
        }
        if (direccion !== undefined) {
            // Parsear dirección
            const partes = direccion.split(',').map(p => p.trim());
            if (partes[0]) {
                const calleNumero = partes[0].split(' ');
                const direccion_numero = calleNumero.pop() || '';
                const direccion_calle = calleNumero.join(' ');
                updateFields.push('direccion_calle = ?', 'direccion_numero = ?');
                values.push(direccion_calle, direccion_numero);
            }
            if (partes[1]) {
                updateFields.push('localidad = ?');
                values.push(partes[1]);
            }
            if (partes[2]) {
                updateFields.push('provincia = ?');
                values.push(partes[2]);
            }
        }
        if (telefono !== undefined) {
            updateFields.push('telefono_general = ?');
            values.push(telefono);
        }
        if (email !== undefined) {
            updateFields.push('email_general = ?');
            values.push(email);
        }
        if (observaciones !== undefined) {
            updateFields.push('observaciones = ?');
            values.push(observaciones);
        }
        if (activo !== undefined) {
            updateFields.push('activo = ?');
            values.push(activo ? 1 : 0);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos para actualizar'
            });
        }

        values.push(id);

        const query = `
            UPDATE alt_proveedor 
            SET ${updateFields.join(', ')}
            WHERE id_proveedor = ?
        `;

        await pool.query(query, values);

        res.json({
            success: true,
            message: 'Proveedor actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar proveedor:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar proveedor',
            error: error.message
        });
    }
};

// Eliminar (desactivar) un proveedor
const deleteProveedor = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            'UPDATE alt_proveedor SET activo = 0 WHERE id_proveedor = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Proveedor no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Proveedor desactivado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar proveedor',
            error: error.message
        });
    }
};

// Obtener contactos de un proveedor
const getContactosByProveedor = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                id_contacto,
                CONCAT(COALESCE(nombre, ''), ' ', COALESCE(apellido, '')) as nombre,
                cargo,
                telefono,
                email,
                observaciones,
                fecha_alta as created_at,
                fecha_alta as updated_at
            FROM alt_contacto_proveedor
            WHERE id_proveedor = ?
            ORDER BY nombre ASC
        `;

        const [contactos] = await pool.query(query, [id]);

        res.json({
            success: true,
            data: contactos
        });

    } catch (error) {
        console.error('Error al obtener contactos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener contactos',
            error: error.message
        });
    }
};

// Crear un contacto para un proveedor
const createContacto = async (req, res) => {
    try {
        const {
            proveedor_id,
            nombre,
            cargo,
            telefono,
            email,
            observaciones
        } = req.body;

        // Verificar que el proveedor existe
        const [proveedor] = await pool.query(
            'SELECT id_proveedor FROM alt_proveedor WHERE id_proveedor = ?',
            [proveedor_id]
        );

        if (proveedor.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Proveedor no encontrado'
            });
        }

        // Separar nombre y apellido
        const nombrePartes = nombre.split(' ');
        const apellido = nombrePartes.length > 1 ? nombrePartes.pop() : '';
        const nombreFinal = nombrePartes.join(' ');

        const query = `
            INSERT INTO alt_contacto_proveedor (
                id_proveedor,
                nombre,
                apellido,
                cargo,
                telefono,
                email,
                observaciones,
                fecha_alta
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const [result] = await pool.query(query, [
            proveedor_id,
            nombreFinal,
            apellido,
            cargo,
            telefono,
            email,
            observaciones
        ]);

        res.status(201).json({
            success: true,
            message: 'Contacto creado exitosamente',
            data: {
                id_contacto: result.insertId,
                nombre
            }
        });

    } catch (error) {
        console.error('Error al crear contacto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear contacto',
            error: error.message
        });
    }
};

// Actualizar un contacto
const updateContacto = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            cargo,
            telefono,
            email,
            observaciones
        } = req.body;

        const updateFields = [];
        const values = [];

        if (nombre !== undefined) {
            const nombrePartes = nombre.split(' ');
            const apellido = nombrePartes.length > 1 ? nombrePartes.pop() : '';
            const nombreFinal = nombrePartes.join(' ');
            updateFields.push('nombre = ?', 'apellido = ?');
            values.push(nombreFinal, apellido);
        }
        if (cargo !== undefined) {
            updateFields.push('cargo = ?');
            values.push(cargo);
        }
        if (telefono !== undefined) {
            updateFields.push('telefono = ?');
            values.push(telefono);
        }
        if (email !== undefined) {
            updateFields.push('email = ?');
            values.push(email);
        }
        if (observaciones !== undefined) {
            updateFields.push('observaciones = ?');
            values.push(observaciones);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos para actualizar'
            });
        }

        values.push(id);

        const query = `
            UPDATE alt_contacto_proveedor 
            SET ${updateFields.join(', ')}
            WHERE id_contacto = ?
        `;

        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contacto no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Contacto actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar contacto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar contacto',
            error: error.message
        });
    }
};

// Eliminar un contacto
const deleteContacto = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            'DELETE FROM alt_contacto_proveedor WHERE id_contacto = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contacto no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Contacto eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar contacto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar contacto',
            error: error.message
        });
    }
};

// Exportar proveedores a Excel
const exportProveedoresToExcel = async (req, res) => {
    try {
        const { search = '', tipo = '', activo } = req.query;

        // Construir la consulta
        let whereConditions = ['1=1'];
        let queryParams = [];

        if (search) {
            whereConditions.push('(razon_social LIKE ? OR cuit LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        if (tipo && tipo !== 'todos') {
            whereConditions.push('tipo_proveedor = ?');
            queryParams.push(tipo);
        }

        if (activo !== undefined && activo !== '') {
            whereConditions.push('activo = ?');
            queryParams.push(activo === 'true' ? 1 : 0);
        }

        const whereClause = whereConditions.join(' AND ');

        const query = `
            SELECT 
                razon_social as 'Razón Social',
                cuit as 'CUIT',
                tipo_proveedor as 'Tipo',
                CONCAT(
                    COALESCE(direccion_calle, ''), ' ',
                    COALESCE(direccion_numero, ''), ', ',
                    COALESCE(localidad, ''), ', ',
                    COALESCE(provincia, '')
                ) as 'Dirección',
                telefono_general as 'Teléfono',
                email_general as 'Email',
                CASE WHEN activo = 1 THEN 'Activo' ELSE 'Inactivo' END as 'Estado'
            FROM alt_proveedor
            WHERE ${whereClause}
            ORDER BY razon_social ASC
        `;

        const [proveedores] = await pool.query(query, queryParams);

        // Aquí deberías implementar la generación del Excel
        // Por ahora devolvemos los datos en JSON
        res.json({
            success: true,
            data: proveedores,
            message: 'Funcionalidad de exportación a Excel pendiente de implementación'
        });

    } catch (error) {
        console.error('Error al exportar proveedores:', error);
        res.status(500).json({
            success: false,
            message: 'Error al exportar proveedores',
            error: error.message
        });
    }
};

module.exports = {
    getProveedores,
    getProveedorById,
    createProveedor,
    updateProveedor,
    deleteProveedor,
    getContactosByProveedor,
    createContacto,
    updateContacto,
    deleteContacto,
    exportProveedoresToExcel
};