const { executeQuery, getConnection } = require('../config/database');
const ExcelJS = require('exceljs');

// Función auxiliar para calcular edad
function calculateAge(fechaNacimiento) {
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

const auditoriasController = {
    // AUDITORÍAS PENDIENTES - Reemplaza auditar.php
    getPendientes: async (req, res) => {
        try {
            const { rol } = req.user; // Del JWT token
            const { search = '', page = 1, limit = 10 } = req.query;

            // Construir consulta base con normalización
            let sql = `SELECT a.id, 
                   CONCAT(UPPER(SUBSTRING(b.apellido, 1, 1)), LOWER(SUBSTRING(b.apellido, 2))) AS apellido,
                   CONCAT(UPPER(SUBSTRING(b.nombre, 1, 1)), LOWER(SUBSTRING(b.nombre, 2))) AS nombre,
                   b.dni, 
                   DATE_FORMAT(a.fecha_origen, '%d-%m-%Y') AS fecha, 
                   CONCAT(
                       CONCAT(UPPER(SUBSTRING(c.nombre, 1, 1)), LOWER(SUBSTRING(c.nombre, 2))), ' ',
                       CONCAT(UPPER(SUBSTRING(c.apellido, 1, 1)), LOWER(SUBSTRING(c.apellido, 2))), ' MP-', c.matricula
                   ) AS medico, 
                   a.renglones, a.cantmeses AS meses, a.auditado 
                   FROM rec_auditoria a 
                   INNER JOIN rec_paciente b ON a.idpaciente=b.id 
                   INNER JOIN tmp_person c ON a.idprescriptor=c.matricula 
                   INNER JOIN rec_receta d ON a.idreceta1=d.idreceta 
                   WHERE a.renglones>0 AND a.auditado IS NULL AND idobrasoc = 20`;

            // Si el rol es 9 (médico auditor), solo ver las bloqueadas
            if (rol == 9) {
                sql += " AND a.bloqueadaxauditor IS NOT NULL";
            }

            // Agregar búsqueda si existe
            let params = [];
            if (search && search.trim()) {
                sql += " AND (b.apellido LIKE ? OR b.nombre LIKE ? OR b.dni LIKE ? OR CONCAT(c.nombre, ' ', c.apellido) LIKE ?)";
                const searchParam = `%${search.trim()}%`;
                params.push(searchParam, searchParam, searchParam, searchParam);
            }

            // 1. PRIMERO: Consulta para contar total de registros
            let countSql = `SELECT COUNT(*) as total 
                        FROM rec_auditoria a 
                        INNER JOIN rec_paciente b ON a.idpaciente=b.id 
                        INNER JOIN tmp_person c ON a.idprescriptor=c.matricula 
                        INNER JOIN rec_receta d ON a.idreceta1=d.idreceta 
                        WHERE a.renglones>0 AND a.auditado IS NULL AND idobrasoc = 20`;

            // Si el rol es 9 (médico auditor), agregar también a count
            if (rol == 9) {
                countSql += " AND a.bloqueadaxauditor IS NOT NULL";
            }

            // Agregar búsqueda al count también
            if (search && search.trim()) {
                countSql += " AND (b.apellido LIKE ? OR b.nombre LIKE ? OR b.dni LIKE ? OR CONCAT(c.nombre, ' ', c.apellido) LIKE ?)";
            }

            console.log('Count SQL:', countSql);
            console.log('Params:', params);

            const countResult = await executeQuery(countSql, params);
            const total = countResult[0]?.total || 0;
            const totalPages = Math.ceil(total / limit);

            console.log('Count result:', countResult);
            console.log('Total encontrado:', total);
            console.log('Total páginas:', totalPages);

            // 2. SEGUNDO: Agregar ordenamiento y paginación a la consulta principal
            sql += " ORDER BY d.fechaemision ASC";

            const offset = (page - 1) * limit;
            sql += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

            console.log('Data SQL:', sql);

            const resultados = await executeQuery(sql, params);

            console.log('Resultados encontrados:', resultados.length);

            res.json({
                success: true,
                data: resultados,
                total: total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: totalPages
            });

        } catch (error) {
            console.error('Error obteniendo auditorías pendientes:', error);
            res.status(500).json({
                error: true,
                message: 'Error interno del servidor'
            });
        }
    },

    // AUDITORÍAS HISTÓRICAS - Reemplaza historico_s.php
    getHistoricas: async (req, res) => {
        try {
            const { search = '', page = 1, limit = 10 } = req.query;
            
            // Convertir a números para evitar problemas
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const offset = (pageNum - 1) * limitNum;

            console.log('Parámetros recibidos:', { search, page: pageNum, limit: limitNum, offset });

            // Construir consulta base para contar
            let countSql = `SELECT COUNT(DISTINCT a.id) as total 
                            FROM rec_auditoria a 
                            INNER JOIN rec_paciente b ON a.idpaciente=b.id 
                            INNER JOIN tmp_person c ON a.idprescriptor=c.matricula 
                            INNER JOIN rec_receta d ON a.idreceta1=d.idreceta 
                            INNER JOIN rec_prescrmedicamento e ON a.idreceta1 = e.idreceta
                            LEFT JOIN user_au au ON a.auditadopor = au.id
                            WHERE a.renglones>0 AND a.auditado IS NOT NULL AND a.idobrasoc = 20`;

            // Construir consulta principal con normalización de mayúsculas
            let sql = `SELECT DISTINCT a.id, 
                       CONCAT(UPPER(SUBSTRING(b.apellido, 1, 1)), LOWER(SUBSTRING(b.apellido, 2))) AS apellido,
                       CONCAT(UPPER(SUBSTRING(b.nombre, 1, 1)), LOWER(SUBSTRING(b.nombre, 2))) AS nombre,
                       b.dni,
                       DATE_FORMAT(a.fecha_origen, '%d-%m-%Y') AS fecha,
                       CONCAT(
                           CONCAT(UPPER(SUBSTRING(c.nombre, 1, 1)), LOWER(SUBSTRING(c.nombre, 2))), ' ',
                           CONCAT(UPPER(SUBSTRING(c.apellido, 1, 1)), LOWER(SUBSTRING(c.apellido, 2))), ' MP-', c.matricula
                       ) AS medico,
                       a.renglones, 
                       a.cantmeses AS meses, 
                       a.auditado,
                       a.auditadopor,
                       DATE_FORMAT(MAX(e.fecha_auditoria), '%d-%m-%Y') AS fechaAuditoria,
                       CONCAT(
                           CONCAT(UPPER(SUBSTRING(au.nombre, 1, 1)), LOWER(SUBSTRING(au.nombre, 2))), ' ',
                           CONCAT(UPPER(SUBSTRING(au.apellido, 1, 1)), LOWER(SUBSTRING(au.apellido, 2)))
                       ) AS auditor
                       FROM rec_auditoria a 
                       INNER JOIN rec_paciente b ON a.idpaciente = b.id 
                       INNER JOIN tmp_person c ON a.idprescriptor = c.matricula 
                       INNER JOIN rec_receta d ON a.idreceta1 = d.idreceta 
                       INNER JOIN rec_prescrmedicamento e ON a.idreceta1 = e.idreceta
                       LEFT JOIN user_au au ON a.auditadopor = au.id
                       WHERE a.renglones>0 AND a.auditado IS NOT NULL AND a.idobrasoc = 20`;

            // Agregar búsqueda si existe
            let params = [];
            if (search && search.trim()) {
                const searchCondition = ` AND (b.apellido LIKE ? OR b.nombre LIKE ? OR b.dni LIKE ? OR 
                                        CONCAT(c.nombre, ' ', c.apellido) LIKE ? OR 
                                        CONCAT(au.nombre, ' ', au.apellido) LIKE ?)`;
                countSql += searchCondition;
                sql += searchCondition;
                const searchPattern = `%${search}%`;
                params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
            }

            // Agregar GROUP BY antes del ORDER BY
            sql += ` GROUP BY a.id, b.apellido, b.nombre, b.dni, a.fecha_origen, 
                     c.nombre, c.apellido, c.matricula, a.renglones, a.cantmeses, 
                     a.auditado, a.auditadopor, au.nombre, au.apellido`;

            // Primero obtener el total
            console.log('Count SQL:', countSql);
            const countResult = await executeQuery(countSql, params);
            const total = countResult[0]?.total || 0;
            const totalPages = Math.ceil(total / limitNum);

            console.log('Total registros:', total, 'Total páginas:', totalPages);

            // Agregar ordenamiento y LIMIT/OFFSET con concatenación directa
            sql += ` ORDER BY MAX(e.fecha_auditoria) DESC LIMIT ${limitNum} OFFSET ${offset}`;

            console.log('Data SQL:', sql);
            console.log('Data params:', params);

            const resultados = await executeQuery(sql, params);

            console.log('Registros obtenidos:', resultados.length);

            res.json({
                success: true,
                data: resultados,
                total: total,
                page: pageNum,
                limit: limitNum,
                totalPages: totalPages
            });

        } catch (error) {
            console.error('Error obteniendo auditorías históricas:', error);
            res.status(500).json({
                success: false,
                error: true,
                message: 'Error interno del servidor',
                details: error.message
            });
        }
    },

    // LISTADO COMPLETO CON FILTROS - Reemplaza todoenuno_s.php
    getListado: async (req, res) => {
        try {
            const { dni, fechaDesde, fechaHasta } = req.body;

            let sql = `SELECT DISTINCT a.id, 
                       CONCAT(UPPER(SUBSTRING(b.apellido, 1, 1)), LOWER(SUBSTRING(b.apellido, 2))) AS apellido,
                       CONCAT(UPPER(SUBSTRING(b.nombre, 1, 1)), LOWER(SUBSTRING(b.nombre, 2))) AS nombre,
                       b.dni, 
                       DATE_FORMAT(a.fecha_origen, '%d-%m-%Y') AS fecha, 
                       CONCAT(
                           CONCAT(UPPER(SUBSTRING(c.nombre, 1, 1)), LOWER(SUBSTRING(c.nombre, 2))), ' ',
                           CONCAT(UPPER(SUBSTRING(c.apellido, 1, 1)), LOWER(SUBSTRING(c.apellido, 2))), ' MP-', c.matricula
                       ) AS medico, 
                       a.renglones, a.cantmeses as meses, a.auditado, 
                       CONCAT(
                           CONCAT(UPPER(SUBSTRING(f.nombre, 1, 1)), LOWER(SUBSTRING(f.nombre, 2))), ' ',
                           CONCAT(UPPER(SUBSTRING(f.apellido, 1, 1)), LOWER(SUBSTRING(f.apellido, 2)))
                       ) AS auditadoX, 
                       DATE_FORMAT(e.fecha_auditoria, '%d-%m-%Y') AS fecha_auditoria 
                       FROM rec_auditoria a 
                       INNER JOIN rec_paciente b ON a.idpaciente = b.id 
                       INNER JOIN tmp_person c ON a.idprescriptor = c.matricula 
                       INNER JOIN rec_receta d ON a.idreceta1 = d.idreceta 
                       INNER JOIN rec_prescrmedicamento e ON a.idreceta1 = e.idreceta 
                       LEFT JOIN user_au f ON a.auditadopor=f.id 
                       WHERE a.renglones > 0 AND idobrasoc = 20 AND a.estado IS NULL`;

            const params = [];

            // Filtros opcionales
            if (dni) {
                sql += " AND b.dni = ?";
                params.push(dni);
            }

            if (fechaDesde && fechaHasta) {
                sql += " AND a.fecha_origen BETWEEN ? AND ?";
                params.push(fechaDesde, fechaHasta);
            }

            sql += " ORDER BY fecha DESC";

            const resultados = await executeQuery(sql, params);

            res.json({
                success: true,
                data: resultados
            });

        } catch (error) {
            console.error('Error obteniendo listado:', error);
            res.status(500).json({
                error: true,
                message: 'Error interno del servidor'
            });
        }
    },

    // HISTORIAL DE PACIENTE - GET
    getHistorialPaciente: async (req, res) => {
        try {
            const { dni, page = 1, limit = 10, fechaDesde, fechaHasta, search } = req.query;
            
            // Validar DNI
            if (!dni || dni.length < 7) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'DNI es requerido y debe tener al menos 7 dígitos' 
                });
            }

            // Convertir a números para evitar problemas
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const offset = (pageNum - 1) * limitNum;
            
            // Query base para contar
            let countQuery = `
                SELECT COUNT(DISTINCT pm.idrecetamedic) as total
                FROM rec_auditoria a
                INNER JOIN rec_paciente p ON a.idpaciente = p.id
                INNER JOIN rec_prescrmedicamento pm ON (a.idreceta1 = pm.idreceta OR a.idreceta2 = pm.idreceta OR a.idreceta3 = pm.idreceta)
                INNER JOIN tmp_person c ON a.idprescriptor = c.matricula
                LEFT JOIN user_au au ON a.auditadopor = au.id
                WHERE p.dni = ?
                AND a.auditado IS NOT NULL
                AND pm.estado_auditoria IS NOT NULL
            `;
            
            // Query principal - USANDO CAMPOS CORRECTOS
            let dataQuery = `
                SELECT DISTINCT
                    a.id as idauditoria,
                    DATE_FORMAT(a.fecha_origen, '%d/%m/%Y') as fecha_auditoria,
                    CONCAT(
                        CONCAT(UPPER(SUBSTRING(au.nombre, 1, 1)), LOWER(SUBSTRING(au.nombre, 2))), ' ',
                        CONCAT(UPPER(SUBSTRING(au.apellido, 1, 1)), LOWER(SUBSTRING(au.apellido, 2)))
                    ) as auditor,
                    CASE 
                        WHEN a.auditado = 1 THEN 'APROBADO'
                        WHEN a.auditado = 2 THEN 'RECHAZADO'
                        WHEN a.auditado = 3 THEN 'OBSERVADO'
                        ELSE 'PENDIENTE'
                    END as estado_auditoria,
                    pm.idrecetamedic as idmedicamento,
                    CONCAT(
                        CONCAT(UPPER(SUBSTRING(c.nombre, 1, 1)), LOWER(SUBSTRING(c.nombre, 2))), ' ',
                        CONCAT(UPPER(SUBSTRING(c.apellido, 1, 1)), LOWER(SUBSTRING(c.apellido, 2))), ' MP-', c.matricula
                    ) as medico,
                    CONCAT('Medicamento ID: ', pm.idmedicamento) as nombre_comercial,
                    '-' as monodroga,
                    '-' as presentacion,
                    pm.cantprescripta,
                    COALESCE(pm.posologia, '-') as posologia,
                    CONCAT(COALESCE(pm.porcentajecobertura, '0'), '%') as cobertura,
                    CASE 
                        WHEN pm.estado_auditoria = 1 THEN 'APROBADO'
                        WHEN pm.estado_auditoria = 2 THEN 'RECHAZADO'
                        WHEN pm.estado_auditoria = 3 THEN 'OBSERVADO'
                        WHEN pm.estado_auditoria = 4 THEN 'PEND. MEDICO'
                        ELSE 'PENDIENTE'
                    END as estado_medicamento,
                    pm.observacion as observaciones
                FROM rec_auditoria a
                INNER JOIN rec_paciente p ON a.idpaciente = p.id
                INNER JOIN rec_prescrmedicamento pm ON (a.idreceta1 = pm.idreceta OR a.idreceta2 = pm.idreceta OR a.idreceta3 = pm.idreceta)
                INNER JOIN tmp_person c ON a.idprescriptor = c.matricula
                LEFT JOIN user_au au ON a.auditadopor = au.id
                WHERE p.dni = ?
                AND a.auditado IS NOT NULL
                AND pm.estado_auditoria IS NOT NULL
            `;
            
            // Parámetros base
            const countParams = [dni];
            const dataParams = [dni];
            
            // Filtro de fecha desde
            if (fechaDesde) {
                const dateFilter = ' AND DATE(a.fecha_origen) >= ?';
                countQuery += dateFilter;
                dataQuery += dateFilter;
                countParams.push(fechaDesde);
                dataParams.push(fechaDesde);
            }
            
            // Filtro de fecha hasta
            if (fechaHasta) {
                const dateFilter = ' AND DATE(a.fecha_origen) <= ?';
                countQuery += dateFilter;
                dataQuery += dateFilter;
                countParams.push(fechaHasta);
                dataParams.push(fechaHasta);
            }
            
            // Búsqueda en campos de texto
            if (search && search.trim()) {
                const searchFilter = ` AND (
                    c.nombre LIKE ? OR 
                    c.apellido LIKE ? OR
                    pm.observacion LIKE ?
                )`;
                countQuery += searchFilter;
                dataQuery += searchFilter;
                
                const searchPattern = `%${search.trim()}%`;
                countParams.push(searchPattern, searchPattern, searchPattern);
                dataParams.push(searchPattern, searchPattern, searchPattern);
            }
            
            // Primero contar total de registros
            console.log('Count Query:', countQuery);
            console.log('Count Params:', countParams);
            
            const countResult = await executeQuery(countQuery, countParams);
            const total = countResult[0]?.total || 0;
            
            // Agregar ORDER BY y LIMIT/OFFSET a la consulta de datos
            dataQuery += ` ORDER BY a.fecha_origen DESC, pm.idrecetamedic DESC`;
            dataQuery += ` LIMIT ${limitNum} OFFSET ${offset}`;
            
            console.log('Data Query:', dataQuery);
            console.log('Data Params:', dataParams);
            
            // Ejecutar consulta principal
            const medicamentos = await executeQuery(dataQuery, dataParams);
            
            // Obtener datos del paciente
            const pacienteQuery = `
                SELECT 
                    dni,
                    CONCAT(apellido, ' ', nombre) as apellidoNombre,
                    sexo,
                    TIMESTAMPDIFF(YEAR, fecnac, CURDATE()) as edad,
                    telefono,
                    email,
                    talla,
                    peso
                FROM rec_paciente 
                WHERE dni = ? 
                LIMIT 1
            `;
            const pacienteData = await executeQuery(pacienteQuery, [dni]);
            
            const totalPages = Math.ceil(total / limitNum);
            
            // Si no hay datos, verificar si el paciente existe
            if (medicamentos.length === 0 && !pacienteData[0]) {
                // Buscar solo por DNI para ver si existe el paciente
                const checkPaciente = await executeQuery(
                    'SELECT COUNT(*) as existe FROM rec_paciente WHERE dni = ?',
                    [dni]
                );
                
                if (checkPaciente[0]?.existe === 0) {
                    return res.json({
                        success: false,
                        message: 'No se encontró un paciente con ese DNI',
                        data: [],
                        paciente: null,
                        total: 0,
                        page: pageNum,
                        limit: limitNum,
                        totalPages: 0
                    });
                }
            }
            
            res.json({
                success: true,
                data: medicamentos || [],
                paciente: pacienteData[0] || null,
                total,
                page: pageNum,
                limit: limitNum,
                totalPages,
                message: medicamentos.length === 0 ? 'No se encontraron registros de auditorías para este paciente' : null
            });
            
        } catch (error) {
            console.error('Error en getHistorialPaciente:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error al obtener historial del paciente',
                error: error.message 
            });
        }
    },

    // AUDITORÍAS MÉDICAS PENDIENTES - Para médicos auditores (rol 9)
    getAuditoriasMedicas: async (req, res) => {
        try {
            const { rol } = req.user;

            // Solo médicos auditores pueden acceder
            if (rol != 9) {
                return res.status(403).json({
                    error: true,
                    message: 'Acceso denegado. Solo médicos auditores pueden ver esta información.'
                });
            }

            const sql = `SELECT a.id, 
                        CONCAT(UPPER(SUBSTRING(b.apellido, 1, 1)), LOWER(SUBSTRING(b.apellido, 2))) AS apellido,
                        CONCAT(UPPER(SUBSTRING(b.nombre, 1, 1)), LOWER(SUBSTRING(b.nombre, 2))) AS nombre,
                        b.dni, 
                        DATE_FORMAT(a.fecha_origen, '%d-%m-%Y') AS fecha, 
                        CONCAT(
                            CONCAT(UPPER(SUBSTRING(c.nombre, 1, 1)), LOWER(SUBSTRING(c.nombre, 2))), ' ',
                            CONCAT(UPPER(SUBSTRING(c.apellido, 1, 1)), LOWER(SUBSTRING(c.apellido, 2))), ' MP-', c.matricula
                        ) AS medico, 
                        a.renglones, a.cantmeses AS meses, a.auditado,
                        DATE_FORMAT(a.bloqueadaxauditor, '%d-%m-%Y %H:%i') AS fecha_bloqueo
                        FROM rec_auditoria a 
                        INNER JOIN rec_paciente b ON a.idpaciente=b.id 
                        INNER JOIN tmp_person c ON a.idprescriptor=c.matricula 
                        INNER JOIN rec_receta d ON a.idreceta1=d.idreceta 
                        WHERE a.renglones>0 AND a.auditado IS NULL AND a.idobrasoc = 20
                        AND a.bloqueadaxauditor IS NOT NULL
                        ORDER BY a.bloqueadaxauditor DESC`;

            const resultados = await executeQuery(sql);

            res.json({
                success: true,
                data: resultados,
                message: `Encontradas ${resultados.length} auditorías médicas pendientes`
            });

        } catch (error) {
            console.error('Error obteniendo auditorías médicas:', error);
            res.status(500).json({
                error: true,
                message: 'Error interno del servidor'
            });
        }
    },

    // DESCARGAR EXCEL - Reemplaza descargar_excel.php
    generarExcel: async (req, res) => {
        try {
            const { fecha } = req.body; // formato: YYYY-MM
            
            // Validar formato de fecha
            if (!/^\d{4}-\d{2}$/.test(fecha)) {
                return res.status(400).json({
                    error: true,
                    message: 'Formato de fecha inválido. Use YYYY-MM'
                });
            }

            const [año, mes] = fecha.split('-');
            const fechaInicio = `${año}-${mes}-01`;
            const fechaFin = new Date(año, mes, 0).toISOString().split('T')[0];

            const sql = `SELECT 
                         CONCAT(UPPER(SUBSTRING(b.apellido, 1, 1)), LOWER(SUBSTRING(b.apellido, 2))) AS apellido,
                         CONCAT(UPPER(SUBSTRING(b.nombre, 1, 1)), LOWER(SUBSTRING(b.nombre, 2))) AS nombre,
                         b.dni, b.sexo, 
                         DATE_FORMAT(b.fecnac, '%d-%m-%Y') AS fecha_nacimiento,
                         CONCAT(
                             CONCAT(UPPER(SUBSTRING(c.nombre, 1, 1)), LOWER(SUBSTRING(c.nombre, 2))), ' ',
                             CONCAT(UPPER(SUBSTRING(c.apellido, 1, 1)), LOWER(SUBSTRING(c.apellido, 2)))
                         ) AS medico, c.matricula,
                         e.estado_auditoria,
                         DATE_FORMAT(a.fecha_origen, '%d-%m-%Y') AS fecha_receta,
                         DATE_FORMAT(e.fecha_auditoria, '%d-%m-%Y') AS fecha_auditoria,
                         CONCAT(
                             CONCAT(UPPER(SUBSTRING(f.nombre, 1, 1)), LOWER(SUBSTRING(f.nombre, 2))), ' ',
                             CONCAT(UPPER(SUBSTRING(f.apellido, 1, 1)), LOWER(SUBSTRING(f.apellido, 2)))
                         ) AS auditor
                         FROM rec_auditoria a 
                         INNER JOIN rec_paciente b ON a.idpaciente = b.id 
                         INNER JOIN tmp_person c ON a.idprescriptor = c.matricula 
                         INNER JOIN rec_prescrmedicamento e ON a.idreceta1 = e.idreceta
                         LEFT JOIN user_au f ON a.auditadopor = f.id 
                         WHERE a.fecha_origen BETWEEN ? AND ? 
                         AND a.auditado IS NOT NULL 
                         AND idobrasoc = 20 
                         ORDER BY b.apellido, b.nombre, a.fecha_origen`;

            const resultados = await executeQuery(sql, [fechaInicio, fechaFin]);

            // Aquí implementarías la generación del Excel con una librería como exceljs
            // Por ahora retornamos los datos en JSON
            res.json({
                success: true,
                data: resultados,
                periodo: `${mes}/${año}`,
                total: resultados.length
            });

        } catch (error) {
            console.error('Error generando Excel:', error);
            res.status(500).json({
                error: true,
                message: 'Error interno del servidor'
            });
        }
    },

    // VADEMECUM - Reemplaza vademecum_s.php
    getVademecum: async (req, res) => {
        try {
            const { search = '' } = req.query;

            let sql = `SELECT id, nombrecomercial, nombregenerico, presentacion, laboratorio 
                       FROM rec_medicamento 
                       WHERE estado = 1`;

            const params = [];
            
            if (search && search.trim()) {
                sql += " AND (nombrecomercial LIKE ? OR nombregenerico LIKE ? OR laboratorio LIKE ?)";
                const searchParam = `%${search.trim()}%`;
                params.push(searchParam, searchParam, searchParam);
            }

            sql += " ORDER BY nombrecomercial ASC";

            const resultados = await executeQuery(sql, params);

            res.json({
                success: true,
                data: resultados
            });

        } catch (error) {
            console.error('Error obteniendo vademécum:', error);
            res.status(500).json({
                error: true,
                message: 'Error interno del servidor'
            });
        }
    },

    // OBTENER AUDITORÍA COMPLETA - Para ver detalles y procesar
    getAuditoriaCompleta: async (req, res) => {
        try {
            const { id } = req.params;
            const { tipo = 'pendiente' } = req.query; // 'pendiente' o 'historica'

            // 1. Obtener datos básicos de la auditoría
            const sqlAuditoria = `
                SELECT 
                    a.id,
                    a.idpaciente,
                    a.idprescriptor,
                    a.idreceta1,
                    a.idreceta2,
                    a.idreceta3,
                    a.renglones,
                    a.cantmeses,
                    a.auditado,
                    a.auditadopor,
                    a.nota,
                    DATE_FORMAT(a.fecha_origen, '%d-%m-%Y') AS fecha_origen,
                    -- Datos del paciente
                    CONCAT(UPPER(SUBSTRING(b.apellido, 1, 1)), LOWER(SUBSTRING(b.apellido, 2))) AS paciente_apellido,
                    CONCAT(UPPER(SUBSTRING(b.nombre, 1, 1)), LOWER(SUBSTRING(b.nombre, 2))) AS paciente_nombre,
                    b.dni AS paciente_dni,
                    b.sexo AS paciente_sexo,
                    DATE_FORMAT(b.fecnac, '%d-%m-%Y') AS paciente_fechanac,
                    b.talla AS paciente_talla,
                    b.peso AS paciente_peso,
                    b.telefono AS paciente_telefono,
                    b.email AS paciente_email,
                    -- Datos del médico
                    CONCAT(
                        CONCAT(UPPER(SUBSTRING(c.nombre, 1, 1)), LOWER(SUBSTRING(c.nombre, 2))), ' ',
                        CONCAT(UPPER(SUBSTRING(c.apellido, 1, 1)), LOWER(SUBSTRING(c.apellido, 2)))
                    ) AS medico_nombre,
                    c.matricula AS medico_matricula,
                    -- Datos del auditor (si existe)
                    CONCAT(
                        CONCAT(UPPER(SUBSTRING(au.nombre, 1, 1)), LOWER(SUBSTRING(au.nombre, 2))), ' ',
                        CONCAT(UPPER(SUBSTRING(au.apellido, 1, 1)), LOWER(SUBSTRING(au.apellido, 2)))
                    ) AS auditor_nombre
                FROM rec_auditoria a
                INNER JOIN rec_paciente b ON a.idpaciente = b.id
                INNER JOIN tmp_person c ON a.idprescriptor = c.matricula
                LEFT JOIN user_au au ON a.auditadopor = au.id
                WHERE a.id = ?
            `; 

            const [auditoria] = await executeQuery(sqlAuditoria, [id]);

            if (!auditoria) {
                return res.status(404).json({
                    success: false,
                    message: 'Auditoría no encontrada'
                });
            }

            // 2. Obtener medicamentos de las recetas
            let medicamentos = [];
            const recetas = [];
            let fechaAuditoriaMax = null;
            
            // Agregar las recetas que existan
            if (auditoria.idreceta1) recetas.push(auditoria.idreceta1);
            if (auditoria.idreceta2) recetas.push(auditoria.idreceta2);
            if (auditoria.idreceta3) recetas.push(auditoria.idreceta3);

            if (recetas.length > 0) {
                const placeholders = recetas.map(() => '?').join(',');
                const sqlMedicamentos = `
                    SELECT 
                        pm.idrecetamedic,
                        pm.idreceta,
                        pm.idmedicamento,
                        pm.cantprescripta AS cantidad,
                        pm.nro_orden,
                        pm.estado_auditoria AS estado,
                        DATE_FORMAT(pm.fecha_auditoria, '%d-%m-%Y') AS fecha_auditoria_simple
                    FROM rec_prescrmedicamento pm
                    WHERE pm.idreceta IN (${placeholders})
                    ORDER BY pm.idreceta, pm.nro_orden
                `;
                
                medicamentos = await executeQuery(sqlMedicamentos, recetas);
                
                // Obtener la fecha de auditoría más reciente
                if (medicamentos.length > 0 && medicamentos[0].fecha_auditoria_simple) {
                    fechaAuditoriaMax = medicamentos[0].fecha_auditoria_simple;
                }
            }

            // 3. Agrupar medicamentos por receta
            const medicamentosPorReceta = {};
            medicamentos.forEach(med => {
                if (!medicamentosPorReceta[med.idreceta]) {
                    medicamentosPorReceta[med.idreceta] = {
                        idreceta: med.idreceta,
                        medicamentos: []
                    };
                }
                medicamentosPorReceta[med.idreceta].medicamentos.push({
                    id: med.idrecetamedic,
                    idmedicamento: med.idmedicamento,
                    nombrecomercial: `Medicamento ${med.idmedicamento}`, // Por ahora mostrar el ID
                    cantidad: med.cantidad,
                    estado: med.estado
                });
            });

            // 4. Construir respuesta
            const response = {
                success: true,
                data: {
                    auditoria: {
                        id: auditoria.id,
                        fecha_origen: auditoria.fecha_origen,
                        fecha_auditoria: fechaAuditoriaMax,
                        renglones: auditoria.renglones,
                        cantmeses: auditoria.cantmeses,
                        auditado: auditoria.auditado,
                        nota: auditoria.nota
                    },
                    paciente: {
                        apellido: auditoria.paciente_apellido,
                        nombre: auditoria.paciente_nombre,
                        dni: auditoria.paciente_dni,
                        sexo: auditoria.paciente_sexo,
                        fecha_nacimiento: auditoria.paciente_fechanac,
                        talla: auditoria.paciente_talla,
                        peso: auditoria.paciente_peso,
                        telefono: auditoria.paciente_telefono,
                        email: auditoria.paciente_email
                    },
                    medico: {
                        nombre: auditoria.medico_nombre,
                        matricula: auditoria.medico_matricula
                    },
                    auditor: auditoria.auditor_nombre || null,
                    recetas: medicamentosPorReceta,
                    tipo: tipo
                }
            };

            res.json(response);

        } catch (error) {
            console.error('Error obteniendo auditoría completa:', error);
            res.status(500).json({
                success: false,
                error: true,
                message: 'Error interno del servidor',
                details: error.message
            });
        }
    },

    // PROCESAR AUDITORÍA - Aprobar/denegar medicamentos
    procesarAuditoria: async (req, res) => {
        try {
            const { id } = req.params;
            const { medicamentos } = req.body;

            // Implementar lógica para procesar auditoría
            res.json({
                success: true,
                message: 'Función procesarAuditoria pendiente de implementar'
            });

        } catch (error) {
            console.error('Error procesando auditoría:', error);
            res.status(500).json({
                error: true,
                message: 'Error interno del servidor'
            });
        }
    },

    // ENVIAR A MÉDICO AUDITOR
    enviarMedicoAuditor: async (req, res) => {
        try {
            const { id } = req.params;

            // Implementar lógica para enviar a médico auditor
            res.json({
                success: true,
                message: 'Función enviarMedicoAuditor pendiente de implementar'
            });

        } catch (error) {
            console.error('Error enviando a médico auditor:', error);
            res.status(500).json({
                error: true,
                message: 'Error interno del servidor'
            });
        }
    },

    // REVERTIR O BORRAR AUDITORÍA
    revertirBorrarAuditoria: async (req, res) => {
        try {
            const { id } = req.params;
            const { accion } = req.body;

            // Implementar lógica para revertir o borrar
            res.json({
                success: true,
                message: 'Función revertirBorrarAuditoria pendiente de implementar'
            });

        } catch (error) {
            console.error('Error en revertir/borrar auditoría:', error);
            res.status(500).json({
                error: true,
                message: 'Error interno del servidor'
            });
        }
    },

    // EXPORTAR HISTORIAL A EXCEL
    exportarHistorialPaciente: async (req, res) => {
        try {
            const { dni, fechaDesde, fechaHasta } = req.body;
            
            if (!dni) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'DNI es requerido' 
                });
            }

            // Consulta para obtener todos los datos sin paginación
            let query = `
                SELECT 
                    a.id as idauditoria,
                    DATE_FORMAT(a.fecha_origen, '%d/%m/%Y') as fecha_auditoria,
                    CONCAT(
                        CONCAT(UPPER(SUBSTRING(au.nombre, 1, 1)), LOWER(SUBSTRING(au.nombre, 2))), ' ',
                        CONCAT(UPPER(SUBSTRING(au.apellido, 1, 1)), LOWER(SUBSTRING(au.apellido, 2)))
                    ) as auditor,
                    a.auditado as estado_auditoria,
                    CONCAT(
                        CONCAT(UPPER(SUBSTRING(c.nombre, 1, 1)), LOWER(SUBSTRING(c.nombre, 2))), ' ',
                        CONCAT(UPPER(SUBSTRING(c.apellido, 1, 1)), LOWER(SUBSTRING(c.apellido, 2))), ' MP-', c.matricula
                    ) as medico,
                    'Medicamento' as nombre_comercial,
                    'Monodroga' as monodroga,
                    'Presentación' as presentacion,
                    pm.cantprescripta,
                    '-' as posologia,
                    '-' as cobertura,
                    pm.estado_auditoria as estado_medicamento
                FROM rec_auditoria a
                INNER JOIN rec_paciente p ON a.idpaciente = p.id
                INNER JOIN rec_prescrmedicamento pm ON (a.idreceta1 = pm.idreceta OR a.idreceta2 = pm.idreceta OR a.idreceta3 = pm.idreceta)
                INNER JOIN tmp_person c ON a.idprescriptor = c.matricula
                LEFT JOIN user_au au ON a.auditadopor = au.id
                WHERE p.dni = ?
                AND a.auditado IS NOT NULL
            `;
            
            const params = [dni];
            
            if (fechaDesde) {
                query += ' AND DATE(a.fecha_origen) >= ?';
                params.push(fechaDesde);
            }
            
            if (fechaHasta) {
                query += ' AND DATE(a.fecha_origen) <= ?';
                params.push(fechaHasta);
            }
            
            query += ' ORDER BY a.fecha_origen DESC, pm.idrecetamedic DESC';
            
            const medicamentos = await executeQuery(query, params);
            
            // Obtener datos del paciente
            const [pacienteData] = await executeQuery(
                'SELECT * FROM rec_paciente WHERE dni = ? LIMIT 1',
                [dni]
            );
            
            // Crear Excel con los datos
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Historial Paciente');
            
            // Información del paciente
            const paciente = pacienteData;
            worksheet.addRow(['HISTORIAL DE PACIENTE']);
            worksheet.addRow(['']);
            worksheet.addRow(['DNI:', paciente?.dni || dni]);
            worksheet.addRow(['Paciente:', paciente ? `${paciente.apellido} ${paciente.nombre}` : 'N/A']);
            worksheet.addRow(['Edad:', paciente ? `${calculateAge(paciente.fecnac)} años` : 'N/A']);
            worksheet.addRow(['']);
            
            // Encabezados de la tabla
            const headers = [
                'Fecha',
                'Auditor',
                'Médico',
                'Medicamento',
                'Monodroga',
                'Presentación',
                'Cantidad',
                'Posología',
                'Cobertura',
                'Estado'
            ];
            
            worksheet.addRow(headers);
            
            // Agregar datos
            medicamentos.forEach(med => {
                worksheet.addRow([
                    med.fecha_auditoria,
                    med.auditor,
                    med.medico,
                    med.nombre_comercial,
                    med.monodroga,
                    med.presentacion,
                    med.cantprescripta,
                    med.posologia,
                    med.cobertura,
                    med.estado_medicamento
                ]);
            });
            
            // Estilizar encabezados
            worksheet.getRow(7).font = { bold: true };
            worksheet.getRow(7).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };
            
            // Ajustar anchos de columna
            worksheet.columns = [
                { width: 12 }, { width: 20 }, { width: 30 },
                { width: 30 }, { width: 25 }, { width: 30 },
                { width: 10 }, { width: 15 }, { width: 10 },
                { width: 15 }
            ];
            
            // Generar archivo
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=historial_paciente_${dni}.xlsx`);
            
            await workbook.xlsx.write(res);
            res.end();
            
        } catch (error) {
            console.error('Error exportando historial:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error al generar el archivo Excel' 
            });
        }
    },

    // Compatibilidad con POST
    getHistorialPacientePOST: async (req, res) => {
        // Convertir body a query params y llamar a getHistorialPaciente
        req.query = { ...req.query, ...req.body };
        return auditoriasController.getHistorialPaciente(req, res);
    }
};

// Exportar el controlador completo
module.exports = auditoriasController;