const { executeQuery } = require('../config/database');

const auditoriasController = {
    // AUDITORÍAS PENDIENTES - Reemplaza auditar.php
    getPendientes: async (req, res) => {
        try {
            const { rol } = req.user; // Del JWT token
            const { search = '', page = 1, limit = 10 } = req.query;

            // Construir consulta base
            let sql = `SELECT a.id, b.apellido, b.nombre, b.dni, 
                   DATE_FORMAT(a.fecha_origen, '%d-%m-%Y') AS fecha, 
                   CONCAT(c.nombre, ' ', c.apellido,' MP-',c.matricula) AS medico, 
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
            const sql = `SELECT DISTINCT a.id, b.apellido, b.nombre, b.dni, 
                         DATE_FORMAT(a.fecha_origen, '%d-%m-%Y') AS fecha, 
                         CONCAT_WS('\n', c.nombre, c.apellido,' MP-',c.matricula) AS medico, 
                         a.renglones, a.cantmeses as meses, a.auditado, 
                         CONCAT_WS('\n', f.nombre, f.apellido) AS auditadoX, 
                         MAX(DATE_FORMAT(e.fecha_auditoria, '%d-%m-%Y')) AS fecha_auditoria, 
                         MAX(e.fecha_auditoria) AS fecha_audOrden 
                         FROM rec_auditoria a 
                         INNER JOIN rec_paciente b ON a.idpaciente = b.id 
                         INNER JOIN tmp_person c ON a.idprescriptor = c.matricula 
                         INNER JOIN rec_receta d ON a.idreceta1 = d.idreceta 
                         INNER JOIN rec_prescrmedicamento e ON a.idreceta1 = e.idreceta 
                         LEFT JOIN user_au f ON a.auditadopor=f.id 
                         WHERE a.renglones > 0 AND a.auditado IS NOT NULL AND idobrasoc = 20 AND a.estado IS NULL 
                         GROUP BY a.id, b.apellido, b.nombre, b.dni, fecha, medico, a.renglones, meses, a.auditado, auditadoX 
                         ORDER BY fecha_audOrden DESC`;

            const resultados = await executeQuery(sql);

            res.json({
                success: true,
                data: resultados
            });

        } catch (error) {
            console.error('Error obteniendo auditorías históricas:', error);
            res.status(500).json({
                error: true,
                message: 'Error interno del servidor'
            });
        }
    },

    // LISTADO COMPLETO CON FILTROS - Reemplaza todoenuno_s.php
    getListado: async (req, res) => {
        try {
            const { dni, fechaDesde, fechaHasta } = req.body;

            let sql = `SELECT DISTINCT a.id, b.apellido, b.nombre, b.dni, 
                       DATE_FORMAT(a.fecha_origen, '%d-%m-%Y') AS fecha, 
                       CONCAT(c.nombre, ' ', c.apellido,' MP-',c.matricula) AS medico, 
                       a.renglones, a.cantmeses as meses, a.auditado, 
                       CONCAT(f.nombre, ' ', f.apellido) AS auditadoX, 
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

    // HISTORIAL DE PACIENTE - Reemplaza historialpaciente_s.php
    getHistorialPaciente: async (req, res) => {
        try {
            const { dni, fechaDesde, fechaHasta } = req.body;

            if (!dni || dni.length < 5) {
                return res.status(400).json({
                    error: true,
                    message: 'DNI inválido o muy corto'
                });
            }

            let sql = `SELECT DISTINCT 
                       CONCAT(b.apellido, ' ', b.nombre) pac_apnom,
                       b.dni, b.sexo, b.fecnac, b.talla, b.peso, b.telefono, b.email,
                       a.id, e.nro_orden,
                       DATE_FORMAT(e.fecha_auditoria, '%d-%m-%Y') AS fecha_audi,
                       CONCAT(f.nombre, ' ', f.apellido) AS auditadoX,
                       CONCAT(c.nombre, ' ', c.apellido,' MP-',c.matricula) AS medico,
                       x.nombre AS nombre_comercial,
                       md.descripcion as monodroga,
                       x.presentacion,
                       a.renglones, 
                       a.cantmeses as meses, 
                       a.auditado, 
                       e.cantprescripta, 
                       e.posologia, 
                       a.idreceta1, 
                       g.estado_auditoria AS estado_auditoria1, 
                       a.idreceta2, 
                       h.estado_auditoria AS estado_auditoria2, 
                       a.idreceta3, 
                       i.estado_auditoria AS estado_auditoria3, 
                       a.idreceta4, 
                       j.estado_auditoria AS estado_auditoria4, 
                       a.idreceta5, 
                       k.estado_auditoria AS estado_auditoria5, 
                       a.idreceta6, 
                       l.estado_auditoria AS estado_auditoria6, 
                       g.porcentajecobertura AS porc1, 
                       h.porcentajecobertura AS porc2, 
                       i.porcentajecobertura AS porc3, 
                       j.porcentajecobertura AS porc4, 
                       k.porcentajecobertura AS porc5, 
                       l.porcentajecobertura AS porc6, 
                       e.cobertura2 
                       FROM rec_auditoria a 
                       INNER JOIN rec_paciente b ON a.idpaciente = b.id 
                       INNER JOIN tmp_person c ON a.idprescriptor = c.matricula 
                       INNER JOIN rec_receta d ON a.idreceta1 = d.idreceta 
                       INNER JOIN rec_prescrmedicamento e ON a.idreceta1 = e.idreceta 
                       INNER JOIN vad_manual x ON e.codigo=x.troquel 
                       LEFT JOIN vad_manextra me ON x.nro_registro=me.nro_registro
                       LEFT JOIN vad_monodro md ON me.cod_droga=md.codigo
                       INNER JOIN rec_prescrmedicamento g ON a.idreceta1= g.idreceta AND e.nro_orden=g.nro_orden 
                       LEFT JOIN rec_prescrmedicamento h ON a.idreceta2= h.idreceta AND e.nro_orden=h.nro_orden 
                       LEFT JOIN rec_prescrmedicamento i ON a.idreceta3= i.idreceta AND e.nro_orden=i.nro_orden 
                       LEFT JOIN rec_prescrmedicamento j ON a.idreceta4= j.idreceta AND e.nro_orden=j.nro_orden 
                       LEFT JOIN rec_prescrmedicamento k ON a.idreceta5= k.idreceta AND e.nro_orden=k.nro_orden 
                       LEFT JOIN rec_prescrmedicamento l ON a.idreceta6= l.idreceta AND e.nro_orden=l.nro_orden 
                       LEFT JOIN user_au f ON a.auditadopor=f.id 
                       WHERE a.renglones > 0 
                       AND idobrasoc = 20 
                       AND a.estado IS NULL 
                       AND a.auditado=1
                       AND b.dni = ?`;

            const params = [dni];

            if (fechaDesde && fechaHasta) {
                sql += " AND DATE(e.fecha_auditoria) BETWEEN ? AND ?";
                params.push(fechaDesde, fechaHasta);
            }

            sql += " ORDER BY id DESC, fecha DESC, e.nro_orden";

            const resultados = await executeQuery(sql, params);

            if (resultados.length === 0) {
                return res.status(404).json({
                    error: true,
                    message: 'No se encontraron datos para este paciente'
                });
            }

            // Datos del paciente (primer registro)
            const paciente = resultados[0];
            const fechaNacimiento = paciente.fecnac;
            const fechaActual = new Date();
            const edad = Math.floor((fechaActual - new Date(fechaNacimiento)) / (365.25 * 24 * 60 * 60 * 1000));

            const datosPaciente = {
                apellidoNombre: paciente.pac_apnom,
                dni: paciente.dni,
                sexo: paciente.sexo,
                edad: edad,
                talla: paciente.talla,
                peso: paciente.peso,
                telefono: paciente.telefono,
                email: paciente.email
            };

            res.json({
                success: true,
                paciente: datosPaciente,
                historial: resultados
            });

        } catch (error) {
            console.error('Error obteniendo historial de paciente:', error);
            res.status(500).json({
                error: true,
                message: 'Error interno del servidor'
            });
        }
    },

    // GENERAR EXCEL POR MES - Reemplaza back_excel1.php
    generarExcel: async (req, res) => {
        try {
            const { fecha } = req.body; // formato yyyy-mm

            if (!fecha) {
                return res.status(400).json({
                    error: true,
                    message: 'Fecha requerida (formato: yyyy-mm)'
                });
            }

            // Calcular rango del mes
            const fechaInicio = new Date(fecha + '-01');
            const fechaDesde = fechaInicio.toISOString().split('T')[0];
            const ultimoDia = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth() + 1, 0).getDate();
            const fechaHasta = fecha + '-' + ultimoDia.toString().padStart(2, '0');

            // Query para auditorías del mes
            const sqlAud = `
                SELECT a.id AS idauditoria,
                       b.dni, b.apellido, b.nombre,
                       a.fecha_origen,
                       a.idreceta1, a.idreceta2, a.idreceta3,
                       a.idreceta4, a.idreceta5, a.idreceta6,
                       a.auditado
                FROM rec_auditoria a
                JOIN rec_paciente b ON a.idpaciente = b.id
                WHERE a.idobrasoc = 20
                  AND a.estado IS NULL
                  AND a.renglones <> 0
                  AND DATE(a.fecha_origen) BETWEEN ? AND ?`;

            const auditorias = await executeQuery(sqlAud, [fechaDesde, fechaHasta]);

            if (auditorias.length === 0) {
                return res.json({
                    success: true,
                    message: 'No hay datos para el período seleccionado',
                    data: []
                });
            }

            // Extraer IDs de recetas
            const idsRecetas = [];
            auditorias.forEach(row => {
                for (let i = 1; i <= 6; i++) {
                    const idReceta = row['idreceta' + i];
                    if (idReceta) {
                        idsRecetas.push(idReceta);
                    }
                }
            });

            if (idsRecetas.length === 0) {
                return res.json({
                    success: true,
                    message: 'No hay recetas para procesar',
                    data: []
                });
            }

            // Query para detalles de medicamentos
            const placeholders = idsRecetas.map(() => '?').join(',');
            const sqlMedicamentos = `
                SELECT p.idauditoria, p.idreceta, p.nro_orden, p.codigo,
                       v.monodroga, v.nombre_comercial, v.presentacion, v.laboratorio,
                       p.cantprescripta, p.estado_auditoria, p.fecha_auditoria,
                       p.id_auditor, p.porcentajecobertura, p.cobertura2,
                       c.dni, c.nombre, c.apellido,
                       r.fechaemision
                FROM rec_prescrmedicamento p
                JOIN vad_020 v ON p.codigo = v.codigo
                JOIN rec_receta r ON p.idreceta = r.idreceta
                JOIN rec_paciente c ON r.idpaciente = c.id
                WHERE p.idreceta IN (${placeholders})
                  AND DATE(r.fechaemision) BETWEEN ? AND ?
                ORDER BY p.idreceta, p.nro_orden`;

            const medicamentos = await executeQuery(sqlMedicamentos, [...idsRecetas, fechaDesde, fechaHasta]);

            res.json({
                success: true,
                message: 'Datos obtenidos correctamente',
                data: medicamentos,
                periodo: {
                    desde: fechaDesde,
                    hasta: fechaHasta,
                    mes: fecha
                }
            });

        } catch (error) {
            console.error('Error generando reporte Excel:', error);
            res.status(500).json({
                error: true,
                message: 'Error interno del servidor'
            });
        }
    },

    // OBTENER DATOS COMPLETOS PARA AUDITAR - Reemplaza audi_trataprolongado.php
    getAuditoriaCompleta: async (req, res) => {
        try {
            const { id } = req.params;
            const { rol } = req.user;

            if (!id) {
                return res.status(400).json({
                    error: true,
                    message: 'ID de auditoría requerido'
                });
            }

            // Verificar bloqueo por médico auditor
            const sqlBloqueo = "SELECT bloqueadaxauditor FROM rec_auditoria WHERE id = ?";
            const bloqueoResult = await executeQuery(sqlBloqueo, [id]);

            const botonesDeshabilitados = rol != 9 && bloqueoResult[0]?.bloqueadaxauditor != null;

            // Datos del paciente - pac_encabezado_s.php
            const sqlEncabezado = `SELECT b.apellido, b.nombre, b.dni, b.sexo, b.fecnac, b.talla, b.peso, b.telefono, b.email, 
                                   CONCAT(c.nombre, ' ', c.apellido) AS medico, 
                                   CONCAT(' MP:', c.matricula) AS mpmed, 
                                   IF(d.matricespec_prescr=99999, ' ', CONCAT(' ME:', d.matricespec_prescr)) AS memed, 
                                   f.denominacion AS especialidad, d.identidadreserv 
                                   FROM rec_auditoria a 
                                   INNER JOIN rec_paciente b ON a.idpaciente = b.id 
                                   INNER JOIN tmp_person c ON a.idprescriptor = c.matricula 
                                   INNER JOIN rec_receta d ON a.idreceta1 = d.idreceta 
                                   LEFT JOIN tmp_especialistas e ON d.matricespec_prescr <> 99999 AND a.idprescriptor = e.matricula AND d.matricespec_prescr = e.matricula_especialista 
                                   LEFT JOIN tmp_especialidades f ON e.especialidad = f.especialidad 
                                   WHERE a.id = ?`;

            const encabezado = await executeQuery(sqlEncabezado, [id]);

            if (encabezado.length === 0) {
                return res.status(404).json({
                    error: true,
                    message: 'Auditoría no encontrada'
                });
            }

            // Datos del diagnóstico - pac_diagnostico_s.php
            const sqlDiagnostico = `SELECT b.idreceta1, c.fechaemision, c.diagnostico, c.diagnostico2 
                                    FROM rec_auditoria b 
                                    INNER JOIN rec_receta c ON b.idreceta1 = c.idreceta 
                                    WHERE b.id = ?`;

            const diagnostico = await executeQuery(sqlDiagnostico, [id]);

            // Medicamentos pendientes - pac_pendiente_s.php
            const sqlMedicamentos = `
                SELECT DISTINCT
                    a.nro_orden AS renglon,
                    c.nombre, 
                    c.troquel, 
                    c.presentacion, 
                    mono.descripcion AS monodroga,
                    a.cantprescripta, 
                    a.posologia, 
                    b.idreceta1, 
                    b.idreceta2,
                    b.idreceta3,
                    b.idreceta4,
                    b.idreceta5,
                    b.idreceta6 
                FROM rec_prescrmedicamento a 
                INNER JOIN rec_auditoria b ON (
                    a.idreceta = b.idreceta1 OR 
                    a.idreceta = b.idreceta2 OR 
                    a.idreceta = b.idreceta3 OR 
                    a.idreceta = b.idreceta4 OR 
                    a.idreceta = b.idreceta5 OR 
                    a.idreceta = b.idreceta6
                )
                INNER JOIN vad_manual c ON a.codigo = c.troquel 
                LEFT JOIN vad_manextra me ON c.nro_registro = me.nro_registro
                LEFT JOIN vad_monodro mono ON me.cod_droga = mono.codigo
                WHERE b.id = ? 
                AND estado_auditoria = 0 
                GROUP BY 
                    a.nro_orden,
                    c.nombre, 
                    c.troquel, 
                    c.presentacion, 
                    mono.descripcion,
                    a.cantprescripta, 
                    a.posologia, 
                    b.idreceta1, 
                    b.idreceta2,
                    b.idreceta3,
                    b.idreceta4,
                    b.idreceta5,
                    b.idreceta6
                ORDER BY a.nro_orden ASC`;

            const medicamentos = await executeQuery(sqlMedicamentos, [id]);

            // Calcular edad del paciente
            const paciente = encabezado[0];
            const fechaNacimiento = new Date(paciente.fecnac);
            const fechaActual = new Date();
            const edad = Math.floor((fechaActual - fechaNacimiento) / (365.25 * 24 * 60 * 60 * 1000));

            res.json({
                success: true,
                auditoria: {
                    id: id,
                    botonesDeshabilitados: botonesDeshabilitados,
                    paciente: {
                        ...paciente,
                        edad: edad
                    },
                    diagnostico: diagnostico[0] || {},
                    medicamentos: medicamentos
                }
            });

        } catch (error) {
            console.error('Error obteniendo auditoría completa:', error);
            res.status(500).json({
                error: true,
                message: 'Error interno del servidor'
            });
        }
    },

    // PROCESAR AUDITORÍA - Reemplaza audi_grabar_s.php
    procesarAuditoria: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                chequedos,
                nochequeados,
                cobert1, cobert2, cobert3, cobert4,
                cobert2_1, cobert2_2, cobert2_3, cobert2_4,
                nota,
                estadoIdentidad
            } = req.body;

            const { idauditor } = req.user;
            const ipauditor = req.ip || req.connection.remoteAddress;
            const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');

            // Iniciar transacción
            const connection = await require('../config/database').pool.getConnection();
            await connection.beginTransaction();

            try {
                // Procesar medicamentos aprobados
                if (chequedos) {
                    const arrayAprobados = chequedos.split(',');

                    for (const elemento of arrayAprobados) {
                        const [nroReceta, renglon] = elemento.split('-');

                        if (!nroReceta || !renglon) continue;

                        // Seleccionar cobertura según renglón
                        let cobertura = '50';
                        let cobertura2 = 'BIAC';

                        switch (renglon) {
                            case '1':
                                cobertura = cobert1 || '50';
                                cobertura2 = cobert2_1 || 'BIAC';
                                break;
                            case '2':
                                cobertura = cobert2 || '50';
                                cobertura2 = cobert2_2 || 'BIAC';
                                break;
                            case '3':
                                cobertura = cobert3 || '50';
                                cobertura2 = cobert2_3 || 'BIAC';
                                break;
                            case '4':
                                cobertura = cobert4 || '50';
                                cobertura2 = cobert2_4 || 'BIAC';
                                break;
                        }

                        const sqlAprobado = `UPDATE rec_prescrmedicamento 
                                           SET estado_auditoria = 1, 
                                               fecha_auditoria = ?, 
                                               id_auditor = ?, 
                                               ip_auditor = ?, 
                                               porcentajecobertura = ?, 
                                               cobertura2 = ?, 
                                               idauditoria = ?,
                                               pendiente_farmalink = 1
                                         WHERE idreceta = ? AND nro_orden = ?`;

                        await connection.execute(sqlAprobado, [
                            fechaActual, idauditor, ipauditor, cobertura,
                            cobertura2, id, nroReceta, renglon
                        ]);
                    }
                }

                // Procesar medicamentos NO aprobados
                if (nochequeados) {
                    const arrayRechazados = nochequeados.split(',');

                    for (const elemento of arrayRechazados) {
                        const [nroReceta, renglon] = elemento.split('-');

                        if (!nroReceta || !renglon) continue;

                        const sqlRechazado = `UPDATE rec_prescrmedicamento 
                                            SET estado_auditoria = 2, 
                                                fecha_auditoria = ?, 
                                                id_auditor = ?, 
                                                ip_auditor = ?, 
                                                porcentajecobertura = '0', 
                                                cobertura2 = '0', 
                                                idauditoria = ?,
                                                pendiente_farmalink = 0  
                                          WHERE idreceta = ? AND nro_orden = ?`;

                        await connection.execute(sqlRechazado, [
                            fechaActual, idauditor, ipauditor, id, nroReceta, renglon
                        ]);
                    }
                }

                // Actualizar la auditoría
                const sqlAuditoria = `UPDATE rec_auditoria 
                                    SET auditado = 1, 
                                        nota = ?, 
                                        auditadopor = ?,
                                        necesita_farmalink = ?,
                                        ultima_modificacion = ?
                                  WHERE id = ?`;

                await connection.execute(sqlAuditoria, [
                    nota || '', idauditor, chequedos ? 1 : 0, fechaActual, id
                ]);

                // Confirmar transacción
                await connection.commit();
                connection.release();

                res.json({
                    success: true,
                    message: 'Auditoría procesada correctamente',
                    idaudi: id,
                    necesita_farmalink: !!chequedos
                });

            } catch (error) {
                await connection.rollback();
                connection.release();
                throw error;
            }

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
            const { idauditor } = req.user;
            const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');

            const sql = `UPDATE rec_auditoria 
                        SET bloqueadaxauditor = ?, 
                            fecha_bloqueo = ?
                      WHERE id = ?`;

            await executeQuery(sql, [idauditor, fechaActual, id]);

            res.json({
                success: true,
                message: 'Auditoría enviada a médico auditor correctamente'
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
            const { accion, nota } = req.body; // accion: 1=revertir, 2=borrar
            const { idauditor, rol } = req.user;

            // Solo roles específicos pueden hacer esto
            if (rol == 9) {
                return res.status(403).json({
                    error: true,
                    message: 'No tiene permisos para esta acción'
                });
            }

            const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');

            if (accion == '1') {
                // Revertir: poner auditoría como no auditada
                const sqlRevertir = `UPDATE rec_auditoria 
                                   SET auditado = NULL, 
                                       nota = ?, 
                                       auditadopor = NULL,
                                       fecha_reversion = ?,
                                       revertido_por = ?
                                 WHERE id = ?`;

                await executeQuery(sqlRevertir, [nota || '', fechaActual, idauditor, id]);

                // Resetear medicamentos
                const sqlMedicamentos = `UPDATE rec_prescrmedicamento 
                                        SET estado_auditoria = 0,
                                            fecha_auditoria = NULL,
                                            id_auditor = NULL,
                                            porcentajecobertura = NULL,
                                            cobertura2 = NULL
                                      WHERE idauditoria = ?`;

                await executeQuery(sqlMedicamentos, [id]);

                res.json({
                    success: true,
                    message: 'Auditoría revertida correctamente',
                    idauditoria: id
                });

            } else if (accion == '2') {
                // Borrar: marcar como eliminada
                const sqlBorrar = `UPDATE rec_auditoria 
                                 SET estado = 'eliminada', 
                                     nota = ?, 
                                     fecha_eliminacion = ?,
                                     eliminado_por = ?
                               WHERE id = ?`;

                await executeQuery(sqlBorrar, [nota || '', fechaActual, idauditor, id]);

                res.json({
                    success: true,
                    message: 'Auditoría marcada como eliminada',
                    idauditoria: id
                });

            } else {
                res.status(400).json({
                    error: true,
                    message: 'Acción no válida'
                });
            }

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