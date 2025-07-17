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
            const { tipo } = req.query; // Para diferenciar entre pendiente e histórica
            
            console.log('=== INICIO getAuditoriaCompleta ===');
            console.log('ID recibido:', id);
            console.log('Tipo:', tipo);

            // 1. Obtener datos de la auditoría
            const sqlAuditoria = `
                SELECT 
                    a.id,
                    a.idpaciente,
                    a.idprescriptor,
                    a.fecha_origen,
                    a.renglones,
                    a.cantmeses,
                    a.auditado,
                    a.bloqueado,
                    a.nota,
                    a.idreceta1,
                    a.idreceta2,
                    a.idreceta3,
                    a.idobrasoc
                FROM rec_auditoria a
                WHERE a.id = ?
            `;
            
            console.log('SQL Auditoría:', sqlAuditoria);
            const auditoriaResult = await executeQuery(sqlAuditoria, [id]);
            
            if (!auditoriaResult || auditoriaResult.length === 0) {
                console.log('No se encontró la auditoría');
                return res.status(404).json({
                    success: false,
                    message: 'Auditoría no encontrada'
                });
            }
            
            const auditoria = auditoriaResult[0];
            console.log('Auditoría encontrada:', auditoria);

            // 2. Obtener datos del paciente
            const sqlPaciente = `
                SELECT 
                    p.id,
                    p.apellido,
                    p.nombre,
                    p.dni,
                    p.sexo,
                    p.fecnac,
                    p.telefono,
                    p.email,
                    p.talla,
                    p.peso,
                    TIMESTAMPDIFF(YEAR, p.fecnac, CURDATE()) as edad
                FROM rec_paciente p
                WHERE p.id = ?
            `;
            
            console.log('SQL Paciente con ID:', auditoria.idpaciente);
            const pacienteResult = await executeQuery(sqlPaciente, [auditoria.idpaciente]);
            const paciente = pacienteResult[0] || null;
            
            console.log('Paciente encontrado:', paciente);

            // 3. Obtener datos del médico desde la primera receta
            const sqlMedico = `
                SELECT 
                    t.matricula,
                    t.nombre,
                    t.apellido,
                    t.especialidad,
                    r.fechaemision,
                    r.diagnostico,
                    r.diagnostico2
                FROM rec_receta r
                INNER JOIN tmp_person t ON r.matricprescr = t.matricula
                WHERE r.idreceta = ?
            `;
            
            console.log('SQL Médico con receta ID:', auditoria.idreceta1);
            const medicoResult = await executeQuery(sqlMedico, [auditoria.idreceta1]);
            const medicoData = medicoResult[0] || null;
            
            console.log('Datos del médico:', medicoData);

            // 4. Obtener medicamentos de todas las recetas
            let medicamentos = [];
            const recetas = [auditoria.idreceta1, auditoria.idreceta2, auditoria.idreceta3].filter(r => r);
            
            console.log('Recetas a buscar:', recetas);
            
            for (let idReceta of recetas) {
                const sqlMedicamentos = `
                    SELECT 
                        pm.idreceta,
                        pm.renglon,
                        pm.idmedicamento,
                        pm.cantprescripta as cantidad,
                        pm.posologia as dosis,
                        pm.porcentajecobertura as cobertura,
                        pm.tipocobertura as tipo,
                        pm.observacion,
                        pm.estado_auditoria,
                        m.nombrecomercial,
                        m.monodroga,
                        m.presentacion
                    FROM rec_prescrmedicamento pm
                    LEFT JOIN medicamento m ON pm.idmedicamento = m.id
                    WHERE pm.idreceta = ?
                    ORDER BY pm.renglon
                `;
                
                const medsResult = await executeQuery(sqlMedicamentos, [idReceta]);
                console.log(`Medicamentos encontrados para receta ${idReceta}:`, medsResult.length);
                medicamentos = medicamentos.concat(medsResult);
            }

       