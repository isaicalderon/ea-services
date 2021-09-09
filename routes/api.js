const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "admin",
    password: "admin",
    database: "controldeeventos"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected to mysql!");
});

function verifyToken(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send('Unauthorization request');
    }

    let token = req.headers.authorization.split(' ')[1];

    if (token === 'null') {
        return res.status(401).send('Unauthorization request');
    }

    let payload = jwt.verify(token, 'secretKey');

    if (!payload) {
        return res.status(401).send('Unauthorization request');
    }

    req.userId = payload.subject;
    next();
}

router.get('/', (req, res) => {
    res.send('From API route');
});

router.post('/register', function (req, res) {
    //var sql = "INSERT INTO estudiantes("
});

router.post('/login', function (req, res) {
    let user = req.body;

    // checar si existe el usuario
    var sql = "SELECT * FROM administrador WHERE administradorusuario = '" + user.administradorUsuario + "'";

    con.query(sql, function (err, result, fields) {
        if (err) throw err;

        if (result.length > 0) {
            if (user.administradorPassword != result[0].administradorpassword) {
                return res.status(401).send('Invalid Password');
            } else {
                let payload = { subject: result.idadministrador }
                let token = jwt.sign(payload, 'secretKey');
                return res.status(200).send({ token });
            }
        } else {
            return res.status(401).send('Invalid username');
        }
    });
});

router.post('/loginOperador', function (req, res) {
    let user = req.body;

    // TODO checar si existe el usuario
    var sql = "SELECT * FROM operador WHERE usernameoperador = '" + user.administradorUsuario + "'";

    con.query(sql, function (err, result, fields) {
        if (err) throw err;

        if (result.length > 0) {
            if (user.administradorPassword != result[0].passwordoperador) {
                return res.status(401).send('Invalid Password');
            } else {
                let payload = { subject: result.idoperador }
                let token = jwt.sign(payload, 'secretKey');
                return res.status(200).send({ token });
            }
        } else {
            return res.status(401).send('Invalid username');
        }
    });
});

router.post('/loginEstudiante', function (req, res) {
    let user = req.body;

    var sql = "SELECT * FROM estudiantes WHERE matriculaestudiantes = '" + user.administradorUsuario + "'";

    con.query(sql, function (err, result, fields) {
        if (err) throw err;

        if (result.length > 0) {
            if (user.administradorPassword != result[0].passwordestudiante) {
                return res.status(401).send('Invalid Password');
            } else {
                let payload = { subject: result[0].idestudiantes }
                let token = jwt.sign(payload, 'secretKey');
                return res.status(200).send({ token, result });
            }
        } else {
            return res.status(401).send('Invalid username');
        }
    });
});

/* EVENTOS */
router.get('/eventosList', function (req, res) {
    var sql = `SELECT ev1.*, res.pagocompletado FROM controldeeventos.eventos ev1
    LEFT JOIN(
        SELECT ev.ideventos, count(pa.idpaquete) as pagocompletado FROM controldeeventos.eventos ev
        LEFT JOIN controldeeventos.paquetes paq ON paq.idevento = ev.ideventos
        LEFT JOIN controldeeventos.pagos pa ON pa.idpaquete = paq.idpaquetes) 
    res ON res.ideventos = ev1.ideventos;`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.get('/misEventos/:idEstudiante', function (req, res) {

    var idEstudiante = req.params.idEstudiante;
    var sql = `SELECT ev.*, pa.fechapago, paq.* FROM controldeeventos.pagos pa 
            LEFT JOIN controldeeventos.paquetes paq ON pa.idpaquete = paq.idpaquetes
            LEFT JOIN controldeeventos.eventos ev ON paq.idevento = ev.ideventos
        WHERE pa.idestudiante = ${idEstudiante}`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.get('/misEventos/visitas/:idevento', function (req, res) {

    var idevento = req.params.idevento;
    var sql = `SELECT * from visitas where ideventos = ${idevento}`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.get('/misEventos/talleres/:idevento', function (req, res) {

    var idevento = req.params.idevento;
    var sql = `SELECT * from talleres where idevento = ${idevento}`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.get('/misEventos/conferencias/:idevento', function (req, res) {

    var idevento = req.params.idevento;
    var sql = `SELECT * from conferencias where idevento = ${idevento}`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.get('/misPagos/:idEstudiante', function (req, res) {

    var idEstudiante = req.params.idEstudiante;
    var sql = `SELECT * FROM controldeeventos.pagos pa
        LEFT JOIN paquetes paq ON paq.idpaquetes = pa.idpaquete
    WHERE idestudiante = ${idEstudiante}`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});


router.post('/guardarEvento', function (req, res) {
    let evento = req.body;

    let sql = `INSERT INTO eventos(
            nombreevento, 
            descripcionevento, 
            eventosmaxparticipantes, 
            fechainicioevento, 
            fechafinevento,
            fechainicioevento_ts,
            fechafinevento_ts
        )VALUES(
            '${evento.nombreevento}',
            '${evento.descripcionevento}',
            ${evento.eventosmaxparticipantes},
            '${evento.fechainicioevento}',
            '${evento.fechafinevento}',
            '${evento.fechainicioevento_ts}',
            '${evento.fechafinevento_ts}'
        )`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/borrarEvento', function (req, res) {
    let evento = req.body;

    let sql = "DELETE FROM eventos WHERE ideventos = " + evento.id;
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/editarEvento', function (req, res) {
    let evento = req.body;

    let sql = `UPDATE eventos SET
                nombreevento = '${evento.nombreevento}',
                descripcionevento = '${evento.descripcionevento}',
                eventosmaxparticipantes = ${evento.eventosmaxparticipantes},
                fechainicioevento = '${evento.fechainicioevento}',
                fechafinevento = '${evento.fechafinevento}',
                fechainicioevento_ts = '${evento.fechainicioevento_ts}',
                fechafinevento_ts = '${evento.fechafinevento_ts}'
            WHERE ideventos = ${evento.ideventos};
    `;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });

});
/* EVENTOS END*/

/* ESTUDIANTES */
router.get('/estudiantesList', function (req, res) {
    var sql = `SELECT es.*, pa.descripcionpaquete FROM estudiantes es 
        LEFT JOIN  paquetes pa ON pa.idpaquetes = es.idpaquetes`;
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/guardarEstudiante', function (req, res) {
    let estudiante = req.body;

    let sql = `INSERT INTO estudiantes (
            matriculaEstudiantes,
            nombreEstudiantes,
            apellidosEstudiante,
            correoEstudiantes,
            passwordestudiante,
            idpaquetes,
            idgafetes
        ) VALUES(
            '${estudiante.matriculaestudiantes}', 
            '${estudiante.nombreestudiantes}',
            '${estudiante.apellidosestudiante}',
            '${estudiante.correoestudiantes}',
            '${estudiante.passwordestudiante}',
            '${estudiante.idpaquetes}',
            null
        );`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/editarEstudiante', function (req, res) {
    let estudiante = req.body;

    let sql = `UPDATE estudiantes SET
            matriculaestudiantes = '${estudiante.matriculaestudiantes}',
            nombreestudiantes = '${estudiante.nombreestudiantes}',
            apellidosestudiante = '${estudiante.apellidosestudiante}',
            correoestudiantes = '${estudiante.correoestudiantes}',  
            idpaquetes = '${estudiante.idpaquetes}'
        WHERE idestudiantes = ${estudiante.idestudiantes}
    `;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });

});

router.post('/eliminarEstudiante', function (req, res) {
    let estudiante = req.body;

    let sql = "DELETE FROM estudiantes WHERE idestudiantes = " + estudiante.id;
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});
/* ESTUDIANTES END */

/* TALLERISTAS */
router.get('/talleristasList', function (req, res) {
    var sql = `SELECT * FROM tallerista`;
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/guardarTallerista', function (req, res) {
    let tallerista = req.body;

    let sql = `INSERT INTO tallerista (
        talleristanombre,
        talleristacorreo,
        talleristatelefono,
        talleristacurriculo
    ) VALUES (
        '${tallerista.talleristanombre}',
        '${tallerista.talleristacorreo}',
        '${tallerista.talleristatelefono}',
        '${tallerista.talleristacurriculo}'
    );`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/editarTallerista', function (req, res) {
    let tallerista = req.body;

    let sql = `UPDATE tallerista SET
        talleristanombre = '${tallerista.talleristanombre}',
        talleristacorreo = '${tallerista.talleristacorreo}',
        talleristatelefono = '${tallerista.talleristatelefono}',
        talleristacurriculo = '${tallerista.talleristacurriculo}'
    WHERE idtallerista = ${tallerista.idtallerista}`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/eliminarTallerista', function (req, res) {
    let value = req.body;

    let sql = "DELETE FROM tallerista WHERE idtallerista = " + value.id;
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});
/* TALLERISTAS END */

/* TALLERES */
router.get('/talleresList', function (req, res) {
    var sql = `SELECT ta.*, ev.nombreevento, tal.talleristanombre FROM talleres ta 
        LEFT JOIN eventos ev ON ta.idevento = ev.ideventos
        LEFT JOIN tallerista tal ON tal.idtallerista = ta.idtallerista
        `;
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/guardarTaller', function (req, res) {
    var taller = req.body;

    var sql = `INSERT INTO talleres(
        nombretalleres,
        descripciontaller,
        temariotaller,
        tallermaxparticipante,
        requerimientostaller,
        tallerlugar,
        fechainiciotaller,
        idevento,
        idtallerista
    )VALUES(
        '${taller.nombretalleres}',
        '${taller.descripciontaller}',
        '${taller.temariotaller}',
        '${taller.tallermaxparticipante}',
        '${taller.requerimientostaller}',
        '${taller.tallerlugar}',
        '${taller.fechainiciotaller}',
        '${taller.idevento}',
        '${taller.idtallerista}'
    )`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/editarTaller', function (req, res) {
    let taller = req.body;

    let sql = `UPDATE talleres SET
            nombretalleres = '${taller.nombretalleres}',
            descripciontaller = '${taller.descripciontaller}',
            temariotaller = '${taller.temariotaller}',
            tallermaxparticipante = '${taller.tallermaxparticipante}',
            requerimientostaller = '${taller.requerimientostaller}',
            tallerlugar = '${taller.tallerlugar}',
            fechainiciotaller= '${taller.fechainiciotaller}',
            fechainiciotaller= '${taller.fechainiciotaller}',
            idevento = ${taller.idevento},
            idtallerista = ${taller.idtallerista}
        WHERE idtalleres = ${taller.idtalleres}
    `;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/eliminarTaller', function (req, res) {
    let taller = req.body;

    let sql = "DELETE FROM talleres WHERE idtalleres = " + taller.id;
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});
/* TALLERES END */

/* CONFERENCISTA */
router.get('/conferencistaList', function (req, res) {
    var sql = "SELECT * FROM conferencista";
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/guardarConferencista', function (req, res) {
    let confe = req.body;

    let sql = `INSERT INTO conferencista (
        conferencistanombre,
        conferencistacorreo,
        conferencistatelefono,
        conferencistaprofesion,
        conferencistacurriculo
    ) VALUES (
        '${confe.conferencistanombre}',
        '${confe.conferencistacorreo}',
        '${confe.conferencistatelefono}',
        '${confe.conferencistaprofesion}',
        '${confe.conferencistacurriculo}'
    );`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });

});

router.post('/editarConferencista', function (req, res) {
    let confe = req.body;

    let sql = `UPDATE conferencista SET 
        conferencistanombre = '${confe.conferencistanombre}',
        conferencistacorreo = '${confe.conferencistacorreo}',
        conferencistatelefono = '${confe.conferencistatelefono}',
        conferencistaprofesion = '${confe.conferencistaprofesion}',
        conferencistacurriculo = '${confe.conferencistacurriculo}'
    WHERE idconferencista = ${confe.idconferencista};`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/eliminarConferencista', function (req, res) {
    let confe = req.body;

    let sql = "DELETE FROM conferencista WHERE idconferencista = " + confe.id;
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});
/* CONFERENCISTA END */


/* CONFERENCIAS */
router.get('/conferenciasList', function (req, res) {
    var sql = `SELECT cs.*, ev.nombreevento, co.conferencistanombre FROM conferencias cs 
        LEFT JOIN eventos ev ON ev.ideventos = cs.idevento
        LEFT JOIN conferencista co ON co.idconferencista = cs.idconferencista
        
        `;
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/guardarConferencia', function (req, res) {
    let confe = req.body;

    let sql = `INSERT INTO conferencias (
        nombreconferencia,
        descripcionconferencia,
        temarioconferencia,
        conferenciamaxparticipante,
        requerimientosconferencia,
        fechainicioconferencia,
        conferencialugar,
        idevento,
        idconferencista
    ) VALUES (
        '${confe.nombreconferencia}',
        '${confe.descripcionconferencia}',
        '${confe.temarioconferencia}',
        ${confe.conferenciamaxparticipante},
        '${confe.requerimientosconferencia}',
        '${confe.fechainicioconferencia}',
        '${confe.conferencialugar}',
        ${confe.idevento},
        ${confe.idconferencista}
    );`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/editarConferencia', function (req, res) {
    let confe = req.body;

    let sql = `UPDATE conferencias SET 
        nombreconferencia = '${confe.nombreconferencia}',
        descripcionconferencia = '${confe.descripcionconferencia}',
        temarioconferencia = '${confe.temarioconferencia}',
        conferenciamaxparticipante = ${confe.conferenciamaxparticipante},
        requerimientosconferencia = '${confe.requerimientosconferencia}',
        fechainicioconferencia = '${confe.fechainicioconferencia}',
        conferencialugar = '${confe.conferencialugar}',
        idevento = ${confe.idevento},
        idconferencista = ${confe.idconferencista}
    WHERE idconferencias = ${confe.idconferencias}`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });

});

router.post('/eliminarConferencia', function (req, res) {
    let confe = req.body;

    let sql = "DELETE FROM conferencias WHERE idconferencias = " + confe.id;
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});
/* CONFERENCIAS END */

/* PAQUETES */
router.get('/paquetesList', function (req, res) {
    var sql = `SELECT pa.*, ev.nombreevento FROM paquetes pa 
        LEFT JOIN eventos ev ON ev.ideventos = pa.idevento
        
        `;
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/guardarPaquete', function (req, res) {
    let confe = req.body;

    let sql = `INSERT INTO paquetes (
        costopaquete,
        descripcionpaquete,
        contenidopaquete,
        tipopaquetes,
        idevento
    ) VALUES (
        '${confe.costopaquete}',
        '${confe.descripcionpaquete}',
        '${confe.contenidopaquete}',
        '${confe.tipopaquetes}',
        ${confe.idevento}
    );`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/editarPaquete', function (req, res) {
    let paquete = req.body;

    let sql = `UPDATE paquetes SET 
        costopaquete = '${paquete.costopaquete}',
        descripcionpaquete = '${paquete.descripcionpaquete}', 
        contenidopaquete = '${paquete.contenidopaquete}',
        tipopaquetes = '${paquete.tipopaquetes}',
        idevento = ${paquete.idevento}
    WHERE idpaquetes = ${paquete.idpaquetes}
    ;`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/eliminarPaquete', function (req, res) {
    let value = req.body;

    let sql = "DELETE FROM paquetes WHERE idpaquetes = " + value.id;
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});
/* PAQUETES END */

/* VISITAS */
router.get('/visitasList', function (req, res) {
    var sql = `SELECT vi.*, ev.nombreevento FROM visitas vi 
        LEFT JOIN eventos ev ON ev.ideventos = vi.ideventos`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/guardarVisita', function (req, res) {
    let visita = req.body;

    let sql = `INSERT INTO visitas (
        visitanombre,
        visitadescripcion,
        visitafechainicio,
        visitafechafin,
        visitalugar,
        visitamaxparticipante,
        ideventos
    ) VALUES (
        '${visita.visitanombre}',
        '${visita.visitadescripcion}',
        '${visita.visitafechainicio}',
        '${visita.visitafechafin}',
        '${visita.visitalugar}',
        ${visita.visitamaxparticipante},
        ${visita.ideventos}
    );`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/editarVisita', function (req, res) {
    let visita = req.body;

    let sql = `UPDATE visitas SET
        visitanombre = '${visita.visitanombre}',
        visitadescripcion = '${visita.visitadescripcion}',
        visitafechainicio = '${visita.visitafechainicio}',
        visitafechafin = '${visita.visitafechafin}',
        visitalugar = '${visita.visitalugar}',
        visitamaxparticipante = '${visita.visitamaxparticipante}',
        ideventos = ${visita.ideventos}
    WHERE idvisitas = ${visita.idvisitas};`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/eliminarVisita', function (req, res) {
    let value = req.body;

    let sql = "DELETE FROM visitas WHERE idvisitas = " + value.id;
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});
/* VISITAS END */


/* OPERADOR */
router.get('/operadoresList', function (req, res) {
    var sql = `SELECT * FROM operador`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/guardarOperador', function (req, res) {
    let operador = req.body;

    let sql = `INSERT INTO operador (
        usernameoperador,
        passwordoperador,
        nombreoperador
    ) VALUES (
        '${operador.usernameoperador}',
        '${operador.passwordoperador}',
        '${operador.nombreoperador}'
    );`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/editarOperador', function (req, res) {
    let operador = req.body;

    let sql = `UPDATE operador SET
        usernameoperador = '${operador.usernameoperador}',
        passwordoperador = '${operador.passwordoperador}',
        nombreoperador = '${operador.nombreoperador}'
    WHERE idoperador = ${operador.idoperador};`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/eliminarOperador', function (req, res) {
    let value = req.body;

    let sql = "DELETE FROM operador WHERE idoperador = " + value.id;
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});
/* OPERADOR END */

/* PAGOS*/
router.get('/pagosList', function (req, res) {
    var sql = `SELECT * FROM controldeeventos.pagos pa
            LEFT JOIN estudiantes est ON est.idestudiantes = pa.idestudiante
            LEFT JOIN paquetes paq ON paq.idpaquetes = pa.idpaquete
            LEFT JOIN eventos ev ON ev.ideventos = paq.idevento
            `;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.get('/pagosByEvento/completado/:idevento', function (req, res) {
    var idevento = req.params.idevento;
    let sql  = `SELECT * FROM pagos pa
            LEFT JOIN paquetes paq ON paq.idpaquetes = pa.idpaquete
            LEFT JOIN eventos ev ON ev.ideventos = paq.idevento        
        WHERE ev.ideventos = ${idevento} AND pa.estadopago = 'completado'`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.get('/pagosByEvento/pendiente/:idevento', function (req, res) {
    var idevento = req.params.idevento;
    let sql  = `SELECT * FROM pagos pa
            LEFT JOIN paquetes paq ON paq.idpaquetes = pa.idpaquete
            LEFT JOIN eventos ev ON ev.ideventos = paq.idevento        
        WHERE ev.ideventos = ${idevento} AND pa.estadopago = 'pendiente' `;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.get('/pagosByEvento/:idevento', function (req, res) {
    var idevento = req.params.idevento;
    let sql  = `SELECT * FROM pagos pa
            LEFT JOIN estudiantes est ON est.idestudiantes = pa.idestudiante
            LEFT JOIN paquetes paq ON paq.idpaquetes = pa.idpaquete
            LEFT JOIN eventos ev ON ev.ideventos = paq.idevento        
        WHERE ev.ideventos = ${idevento} `;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/guardarPago', function (req, res) {
    let operador = req.body;

    let sql = `INSERT INTO pagos (
        idestudiante,
        idpaquete,
        estadopago,
        fechapago
    ) VALUES (
        '${operador.idestudiante}',
        '${operador.idpaquete}',
        '${operador.estadopago}',
        '${operador.fechapago}'
    );`;

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/eliminarPago', function (req, res) {
    let value = req.body;
    
    let sql = "DELETE FROM pagos WHERE idpagos = " + value.id;
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});

router.post('/cambiarEstado', function (req, res) {
    let pago = req.body;
    
    let sql = `UPDATE pagos SET estadopago = '${pago.estadopago}' WHERE idpagos = ${pago.idpagos}`;
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});
/* PAGOS END*/


module.exports = router;
