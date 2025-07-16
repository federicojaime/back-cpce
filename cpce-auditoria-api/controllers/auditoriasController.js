const { executeQuery } = require('../config/database');

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

    // HISTORIAL DE PACIENTE - Reemplaza historialpaciente_s.php - CORREGIDO
    getHistorialPaciente: async (req, res) => {
        try {
            const { dni, fechaDesde, fechaHasta } = req.body;

            if (!dni || dni.length < 5) {
                return res.status(400).json({
                    error: true,
                    message: 'DNI inválido o muy corto'
                });
            }

            // CONSULTA CORREGIDA - removido e.estado y e.observacion que no existen
            let sql = `SELECT DISTINCT 
                       CONCAT(
                           CONCAT(UPPER(SUBSTRING(b.apellido, 1, 1)), LOWER(SUBSTRING(b.apellido, 2))), ' ',
                           CONCAT(UPPER(SUBSTRING(b.nombre, 1, 1)), LOWER(SUBSTRING(b.nombre, 2)))
                       ) AS pac_apnom,
                       b.dni, b.sexo, b.fecnac, b.talla, b.peso, b.telefono, b.email,
                       a.id, e.nro_orden,
                       DATE_FORMAT(e.fecha_auditoria, '%d-%m-%Y') AS fecha_auditoria,
                       e.estado_auditoria, 
                       CONCAT(
                           CONCAT(UPPER(SUBSTRING(c.nombre, 1, 1)), LOWER(SUBSTRING(c.nombre, 2))), ' ',
                           CONCAT(UPPER(SUBSTRING(c.apellido, 1, 1)), LOWER(SUBSTRING(c.apellido, 2))), ' MP-', c.matricula
                       ) AS medico,
                       DATE_FORMAT(a.fecha_origen, '%d-%m-%Y') AS fecha,
                       a.renglones, a.cantmeses AS meses,
                       CONCAT(
                           CONCAT(UPPER(SUBSTRING(f.nombre, 1, 1)), LOWER(SUBSTRING(f.nombre, 2))), ' ',
                           CONCAT(UPPER(SUBSTRING(f.apellido, 1, 1)), LOWER(SUBSTRING(f.apellido, 2)))
                       ) AS auditor
                       FROM rec_auditoria a 
                       INNER JOIN rec_paciente b ON a.idpaciente = b.id 
                       INNER JOIN tmp_person c ON a.idprescriptor = c.matricula 
                       INNER JOIN rec_receta d ON a.idreceta1 = d.idreceta 
                       INNER JOIN rec_prescrmedicamento e ON a.idreceta1 = e.idreceta 
                       LEFT JOIN user_au f ON a.auditadopor = f.id 
                       WHERE a.renglones > 0 AND b.dni = ? AND idobrasoc = 20`;

            const params = [dni];

            if (fechaDesde && fechaHasta) {
                sql += " AND a.fecha_origen BETWEEN ? AND ?";
                params.push(fechaDesde, fechaHasta);
            }

            sql += " ORDER BY e.fecha_auditoria DESC";

            const resultados = await executeQuery(sql, params);

            res.json({
                success: true,
                data: resultados
            });

        } catch (error) {
            console.error('Error obteniendo historial del paciente:', error);
            res.status(500).json({
                error: true,
                message: 'Error interno del servidor',
                details: error.message
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
    }
};

module.exports = auditoriasController;