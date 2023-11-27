const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Valoration = require('../models/Valoration');
const Service = require('../models/Service');
const Bed = require('../models/Bed');
const { isAuthenticated } = require('../helpers/auth');

// Función formatDate
function formatDate(date) {
    let fechaHora = new Date(date);

    // Obtiene la fecha en formato yyyy-mm-dd
    let fecha = fechaHora.getFullYear() + '-' + ('0' + (fechaHora.getMonth() + 1)).slice(-2) + '-' + ('0' + fechaHora.getDate()).slice(-2);

    return fecha;
}

router.get('/valorations/add', isAuthenticated, async (req, res) => {
    req.session.lastVisitedRoute = req.originalUrl; // Guarda la ruta actual en la sesión
    
    const services = await Service.find({}).lean();
    const beds = await Bed.find({}).lean();
    const bedsJson = JSON.stringify(beds); // Convierte 'beds' a una cadena JSON

    //Calcula fecha de hoy para pasarla al render y no dejar que ingrese una fecha mayor a la de hoy
    let today = new Date();
    let maxDate = today.getFullYear()+'-'+('0' + (today.getMonth()+1)).slice(-2)+'-'+('0' + today.getDate()).slice(-2);
    res.render('valorations/new-valoration', { services, beds, bedsJson, maxDate });
});


//Para que con un dni ingresado se devuelvan los datos del paciente lo que permitira a la plantilla poder cargarlos automaticamente
router.get('/paciente/:dni', async (req, res) => {
    const dni = req.params.dni;
    const valoration = await Valoration.findOne({ 'paciente.dni': dni }).sort({'fechaYHoraRecoleccionDatos': -1}).populate({
                path: 'ingreso.cama',
                populate: {
                    path: 'servicio'
                }
            }).lean();
    if (valoration) {
        res.json(valoration);
    } else {
        res.status(404).send('Paciente no encontrado');
    }
});

router.post('/valorations/new-valoration', isAuthenticated, async (req, res) => {
    const {
        apellido,
        nombre,
        dni,
        fechaNacimiento,
        sexo,
        estadoCivil,
        domicilioActual,
        coberturaSalud,
        nacionalidad,
        procedencia,
        motivoIngreso,
        servicio,
        numeroCama,
        tipoIngreso,
        diagnostico,
        antecedenteAlergias,
        antecedenteDbt,
        antecedenteHta,
        antecedenteObesidad,
        antecedenteChagas,
        antecedenteIrregularidadCicloMenstrual,
        antecedenteAsma,
        descripcion,
        examenesComplementarios,
        otros,
        observacionGeneral,
        entrevista,
        examenInspeccion,
        examenAuscultacion,
        examenPalpacion,
        examenPercusion,
        frecuenciaRespiratoria,
        ritmoRespiratorio,
        profundidad,
        simetria,
        viaAerPerm,
        secreciones,
        color,
        tos,
        expectoracion,
        hipoventilacion,
        disnea,
        auscMurmulloVesicular,
        auscSibilancias,
        auscCrepitantes,
        auscRoncus,
        auscGorgoteos,
        frecuenciaCardiaca,
        ritmoCirculacion,
        intensidad,
        tension,
        amplitud,
        pulsosPerifericos,
        ruidosCardiacos,
        latidoDePunta,
        tensionArterial,
        ingurgitacionYugular,
        coloracionPielYMucRosada,
        coloracionPielYMucPalida,
        coloracionPielYMucCianosis,
        coloracionPielYMucLivideces,
        coloracionPielYMucIctericia,
        coloracionPielYMucOtra,
        temperaturaAxilar,
        temperaturaRectal,
        edemas,
        nivelConcienciaLucido,
        nivelConcienciaConfuso,
        nivelConcienciaDelirante,
        nivelConcienciaEstuporoso,
        nivelConcienciaComa,
        aperturaOcular,
        respuestaMotora,
        respuestaVerbal,
        tamanioPupilas,
        simetriaPupilas,
        reactividad,
        babinsky,
        otrosPupilas,
        afasias,
        dolorSensopercepcion,
        caracteristicasDolor,
        localizacionDolor,
        peso,
        talla,
        obesidad,
        hidratacion,
        signoPliegue,
        autonomiaParaAlimentarse,
        alimentacionEnteralOral,
        alimentacionEnteralSNG,
        ingresosViaOral,
        ingresosViaParenteral,
        ruidosHidroaereos,
        distencionAbdominal,
        colorDeposiciones,
        consistenciaDeposiciones,
        otrasCaracteristicasDeposiciones,
        sudoracion,
        totalEgresosSudoracion,
        perdidaInsensibleSudoracion,
        totalIngresosBalanceHidrico,
        totalEgresosBalanceHidrico,
        lesiones,
        localizacionLesiones,
        cicatrices,
        localizacionCicatrices,
        mudaDeRopa,
        elementosDeHigiene,
        higienePorSiMismo,
        posicionEnCama,
        habitosDescansoNocturno,
        horas,
        alteracionSuenio,
        sedantes,
        estadoMiedo,
        estadoNegativismo,
        estadoInquietud,
        estadoDepresion,
        estadoApatia,
        estadoAnsiedad,
        estadoAgresividad,
        estadoLlanto,
        creenciasReligion,
        trabajaActualmente,
        ocupacion,
        desdeCuandoTrabaja,
        sentimientoEnTrabajo,
        escolaridad,
        aprendizajeDeseaAprender,
        aprendizajeNegacionAlTratamiento,
        aprendizajeAceptacionAlTratamiento,
        tabaquismo,
        tabaquismoCuantos,
        consumoAlcohol,
        enfermedadesPreexistentes,
        motivoFallecimientoPadres,
        motivoFallecimientoHermanos,
        motivoFallecimientoAbuelos
    } = req.body;
    console.log("El enrutador recibe esto desde el formulario: ", req.body);
    const errors = [];
    if (!sexo) {
        errors.push({ text: 'Por favor seleccione un Sexo' });
    }
    if (!motivoIngreso) {
        errors.push({ text: 'Por favor ingrese un Motivo de Ingreso' });
    }
    if (!servicio) {
        errors.push({ text: 'Por favor seleccione un Servicio' });
    }
    if (!numeroCama) {
        errors.push({ text: 'Por favor seleccione una Cama' });
    }
    if (!tipoIngreso) {
        errors.push({ text: 'Por favor seleccione un Tipo de Ingreso' });
    }
    if (!diagnostico) {
        errors.push({ text: 'Por favor ingrese un Diagnostico' });
    }
    if (!descripcion) {
        errors.push({ text: 'Por favor ingrese un Diagnostico' });
    }
    if (!observacionGeneral && !entrevista && !examenInspeccion && !examenAuscultacion && !examenPalpacion && !examenPercusion) {
        errors.push({ text: 'Por favor seleccione al menos un Tipo de Evaluación en VI- Situación actual' });
    }
    if (!frecuenciaRespiratoria) {
        errors.push({ text: 'Por favor ingrese una Frecuencia Respiratoria' });
    }
    if (!ritmoRespiratorio) {
        errors.push({ text: 'Por favor seleccione un Ritmo Respiratorio' });
    }
    if (!coloracionPielYMucRosada && !coloracionPielYMucPalida && !coloracionPielYMucCianosis && !coloracionPielYMucLivideces && !coloracionPielYMucIctericia && !coloracionPielYMucOtra) {
        errors.push({ text: 'Por favor seleccione al menos una Coloración de piel y muc. en 1- Datos de oxigenación (Cardio-respiratorio) - Circulación' });
    }
    if (!nivelConcienciaLucido && !nivelConcienciaConfuso && !nivelConcienciaDelirante && !nivelConcienciaEstuporoso && !nivelConcienciaComa) {
        errors.push({ text: 'Por favor seleccione al menos un Nivel de Conciencia 2- Datos de sensopercepción y actividad' });
    }
    if (!aperturaOcular) {
        errors.push({ text: 'Por favor seleccione una Apertura Ocular' });
    }
    if (!respuestaMotora) {
        errors.push({ text: 'Por favor seleccione una Respuesta Motora' });
    }
    if (!respuestaVerbal) {
        errors.push({ text: 'Por favor seleccione una Respuesta Verbal' });
    }
    /*Cuando se renderiza la vista en caso de errores, también se debe pasar los datos del formulario*/
    if (errors.length > 0) {
        const services = await Service.find({}).lean();

        const beds = await Bed.find({}).lean().populate('servicio');

        let numeroCamaString = '';
        if (numeroCama) {
            numeroCamaString = numeroCama.toString();
        }
        res.render('valorations/new-valoration', {
            errors,
            services,
            beds,
            apellido,
            nombre,
            dni,
            fechaNacimiento,
            sexo,
            estadoCivil,
            domicilioActual,
            coberturaSalud,
            nacionalidad,
            procedencia,
            motivoIngreso,
            servicio,
            numeroCama,
            tipoIngreso,
            diagnostico,
            antecedenteAlergias,
            antecedenteDbt,
            antecedenteHta,
            antecedenteObesidad,
            antecedenteChagas,
            antecedenteIrregularidadCicloMenstrual,
            antecedenteAsma,
            descripcion,
            examenesComplementarios,
            otros,
            observacionGeneral,
            entrevista,
            examenInspeccion,
            examenAuscultacion,
            examenPalpacion,
            examenPercusion,
            frecuenciaRespiratoria,
            ritmoRespiratorio,
            profundidad,
            simetria,
            viaAerPerm,
            secreciones,
            color,
            tos,
            expectoracion,
            hipoventilacion,
            disnea,
            auscMurmulloVesicular,
            auscSibilancias,
            auscCrepitantes,
            auscRoncus,
            auscGorgoteos,
            frecuenciaCardiaca,
            ritmoCirculacion,
            intensidad,
            tension,
            amplitud,
            pulsosPerifericos,
            ruidosCardiacos,
            latidoDePunta,
            tensionArterial,
            ingurgitacionYugular,
            coloracionPielYMucRosada,
            coloracionPielYMucPalida,
            coloracionPielYMucCianosis,
            coloracionPielYMucLivideces,
            coloracionPielYMucIctericia,
            coloracionPielYMucOtra,
            temperaturaAxilar,
            temperaturaRectal,
            edemas,
            nivelConcienciaLucido,
            nivelConcienciaConfuso,
            nivelConcienciaDelirante,
            nivelConcienciaEstuporoso,
            nivelConcienciaComa,
            aperturaOcular,
            respuestaMotora,
            respuestaVerbal,
            tamanioPupilas,
            simetriaPupilas,
            reactividad,
            babinsky,
            otrosPupilas,
            afasias,
            dolorSensopercepcion,
            caracteristicasDolor,
            localizacionDolor,
            peso,
            talla,
            obesidad,
            hidratacion,
            signoPliegue,
            autonomiaParaAlimentarse,
            alimentacionEnteralOral,
            alimentacionEnteralSNG,
            ingresosViaOral,
            ingresosViaParenteral,
            ruidosHidroaereos,
            distencionAbdominal,
            colorDeposiciones,
            consistenciaDeposiciones,
            otrasCaracteristicasDeposiciones,
            sudoracion,
            totalEgresosSudoracion,
            perdidaInsensibleSudoracion,
            totalIngresosBalanceHidrico,
            totalEgresosBalanceHidrico,
            lesiones,
            localizacionLesiones,
            cicatrices,
            localizacionCicatrices,
            mudaDeRopa,
            elementosDeHigiene,
            higienePorSiMismo,
            posicionEnCama,
            habitosDescansoNocturno,
            horas,
            alteracionSuenio,
            sedantes,
            estadoMiedo,
            estadoNegativismo,
            estadoInquietud,
            estadoDepresion,
            estadoApatia,
            estadoAnsiedad,
            estadoAgresividad,
            estadoLlanto,
            creenciasReligion,
            trabajaActualmente,
            ocupacion,
            desdeCuandoTrabaja,
            sentimientoEnTrabajo,
            escolaridad,
            aprendizajeDeseaAprender,
            aprendizajeNegacionAlTratamiento,
            aprendizajeAceptacionAlTratamiento,
            tabaquismo,
            tabaquismoCuantos,
            consumoAlcohol,
            enfermedadesPreexistentes,
            motivoFallecimientoPadres,
            motivoFallecimientoHermanos,
            motivoFallecimientoAbuelos
        });
    } else {
        let { fechaNacimiento } = req.body;

        // Verifica si fechaNacimiento no está definido o es una cadena vacía y establecerlo a null
        if (fechaNacimiento === undefined || fechaNacimiento === '') {
            fechaNacimiento = null;
        }
        
        if (fechaNacimiento !== null) {
            /*Ajusto la fecha de nacimiento para que se guarde bien*/
            fechaNacimiento = new Date(fechaNacimiento);
            fechaNacimiento.setDate(fechaNacimiento.getDate() + 1); // Suma un día para guardar en la base de datos porque cuando guarda en la BD se resta 1 día
        }

        try {
            // Obtiene la cama correspondiente usando el ObjectId del servicio
            const bed = await Bed.findOne({ numeroCama, servicio }).populate('servicio');

            if (bed) {
                console.error('Si se encontró la cama correspondiente');
            } else {
                console.error('No se encontró la cama correspondiente');
                throw new Error('Cama no encontrada');
            }

// Buscar si existe una valoración para la misma cama con estadoInternacion igual a "No finalizada"
const existingValoration = await Valoration.findOne({
    'ingreso.cama': bed._id,
    'ingreso.estadoInternacion': 'No finalizada'
});

// Si existe tal valoración, guardar en fechaYHoraIngreso la misma fechaYHoraIngreso de la valoración existente
// Si no existe tal valoración, guardar la fecha y hora del sistema en fechaYHoraIngreso
let fechaYHoraIngreso = existingValoration ? existingValoration.ingreso.fechaYHoraIngreso : Date.now();
            const newValoration = new Valoration({
                paciente: {
                    apellido,
                    nombre,
                    dni,
                    fechaNacimiento,
                    sexo,
                    estadoCivil,
                    domicilioActual,
                    coberturaSalud,
                    nacionalidad,
                    procedencia
                },
                ingreso: {
                    motivoIngreso,
                    cama: bed._id,
                    numeroCama,
                    fechaYHoraIngreso,
                    tipoIngreso
                },
                diagnostico,
                otrosProblemas: {
                    antecedenteAlergias,
                    antecedenteDbt,
                    antecedenteHta,
                    antecedenteObesidad,
                    antecedenteChagas,
                    antecedenteIrregularidadCicloMenstrual,
                    antecedenteAsma
                },
                indicaciones: {
                    descripcion,
                    examenesComplementarios,
                    otros  
                },
                situacionActual: {
                    observacionGeneral,
                    entrevista,
                    examenInspeccion,
                    examenAuscultacion,
                    examenPalpacion,
                    examenPercusion
                },
                oxigenacion: {
                    respiracion: {
                        frecuenciaRespiratoria,
                        ritmoRespiratorio,
                        profundidad,
                        simetria,
                        viaAerPerm,
                        secreciones,
                        color,
                        tos,
                        expectoracion,
                        hipoventilacion,
                        disnea,
                        auscMurmulloVesicular,
                        auscSibilancias,
                        auscCrepitantes,
                        auscRoncus,
                        auscGorgoteos
                    },
                    circulacion: {
                        frecuenciaCardiaca,
                        ritmoCirculacion,
                        intensidad,
                        tension,
                        amplitud,
                        pulsosPerifericos,
                        ruidosCardiacos,
                        latidoDePunta,
                        tensionArterial,
                        ingurgitacionYugular,
                        coloracionPielYMucRosada,
                        coloracionPielYMucPalida,
                        coloracionPielYMucCianosis,
                        coloracionPielYMucLivideces,
                        coloracionPielYMucIctericia,
                        coloracionPielYMucOtra,
                        temperaturaAxilar,
                        temperaturaRectal,
                        edemas
                    }
                },
                sensopercepcion: {
                    nivelConcienciaLucido,
                    nivelConcienciaConfuso,
                    nivelConcienciaDelirante,
                    nivelConcienciaEstuporoso,
                    nivelConcienciaComa,
                    aperturaOcular,
                    respuestaMotora,
                    respuestaVerbal,
                    tamanioPupilas,
                    simetriaPupilas,
                    reactividad,
                    babinsky,
                    otrosPupilas,
                    afasias,
                    dolorSensopercepcion,
                    caracteristicasDolor,
                    localizacionDolor,
                },
                nutricion: {
                    peso,
                    talla,
                    obesidad,
                    hidratacion,
                    signoPliegue,
                    autonomiaParaAlimentarse,
                    alimentacionEnteralOral,
                    alimentacionEnteralSNG,
                    ingresosViaOral,
                    ingresosViaParenteral
                },
                eliminacion: {
                    ruidosHidroaereos,
                    distencionAbdominal,
                    colorDeposiciones,
                    consistenciaDeposiciones,
                    otrasCaracteristicasDeposiciones,
                    sudoracion,
                    totalEgresosSudoracion,
                    perdidaInsensibleSudoracion,
                    totalIngresosBalanceHidrico,
                    totalEgresosBalanceHidrico
                },
                aseoYPiel: {
                    lesiones,
                    localizacionLesiones,
                    cicatrices,
                    localizacionCicatrices,
                    mudaDeRopa,
                    elementosDeHigiene,
                    higienePorSiMismo
                },
                reposoYSuenio: {
                    posicionEnCama,
                    habitosDescansoNocturno,
                    horas,
                    alteracionSuenio,
                    sedantes
                },
                psicosocial: {
                    estadoMiedo,
                    estadoNegativismo,
                    estadoInquietud,
                    estadoDepresion,
                    estadoApatia,
                    estadoAnsiedad,
                    estadoAgresividad,
                    estadoLlanto,
                    creenciasReligion,
                    trabajaActualmente,
                    ocupacion,
                    desdeCuandoTrabaja,
                    sentimientoEnTrabajo,
                    escolaridad,
                    aprendizajeDeseaAprender,
                    aprendizajeNegacionAlTratamiento,
                    aprendizajeAceptacionAlTratamiento
                },
                riesgo: {
                    tabaquismo,
                    tabaquismoCuantos,
                    consumoAlcohol,
                    enfermedadesPreexistentes,
                    motivoFallecimientoPadres,
                    motivoFallecimientoHermanos,
                    motivoFallecimientoAbuelos
                },
                apellidoCargador: req.user.profesional.apellido,
                nombreCargador: req.user.profesional.nombre,
                matriculaCargador: req.user.profesional.matriculaProfesional                
            });
            console.log('SE AGREGO VALORACION: ', newValoration);
            await newValoration.save();
            
            // Cambia el estado de la cama
            await bed.cambiarEstado('No disponible');
 
            req.flash('success_msg', 'Nueva Valoración de Paciente Agregada Exitosamente');
            res.redirect('/valorations');
        } catch (error) {
            console.error('Error al cargar valoración:', error);
            res.status(500).send('Error interno del servidor NO SE CARGO VALORACION');
        }
    }
});

router.get('/valorations', isAuthenticated, async (req, res) => {    
    req.session.lastVisitedRoute = req.originalUrl; // Guarda la ruta actual en la sesión   
    
    try {

        let valorations;

        // Verifica si se proporciona un término de búsqueda
        const search = req.query.search || ''; // Obtiene el valor de search o establece una cadena vacía si es nulo

        if (search) {
                // Busca todas las camas que coincidan con el número de cama
                const bedsB = await Bed.find({ numeroCama: isNaN(search) ? null : parseInt(search) }).lean();

                // Obtiene los IDs de las camas
                const bedIds = bedsB.map(bed => bed._id);

            // Realiza la búsqueda por nombre y/o apellido
            valorations = await Valoration.find({
                $or: [
                    { 'paciente.apellido': { $regex: new RegExp(req.query.search, 'i') } },
                    { 'paciente.nombre': { $regex: new RegExp(req.query.search, 'i') } },
                    //{ 'ingreso.cama.servicio.nombre': { $regex: new RegExp(req.query.search, 'i') } }, //Me está fallando el buscar por nombre de servicio, verlo luego
                    { 'ingreso.cama': { $in: bedIds } } // Busca todas las valoraciones que tenga una de las camas
                ]
            }).populate({
                path: 'ingreso.cama',
                populate: {
                    path: 'servicio'
                }
            }).lean().sort({ fechaYHoraRecoleccionDatos: 'desc' });
        } else {
            // Obtiene todas las valoraciones
            valorations = await Valoration.find().populate({
                path: 'ingreso.cama',
                populate: {
                    path: 'servicio'
                }
            }).lean().sort({ fechaYHoraRecoleccionDatos: 'desc' }).limit(10);
        }

        // Crea un objeto para almacenar la valoración más reciente de cada paciente
        let latestValorationByPatient = {};

        // Itera sobre las valoraciones
        valorations.forEach(valoration => {
            // Usa el DNI del paciente como clave
            let key = valoration.paciente.dni;

            // Si el paciente no tiene una valoración más reciente o si la valoración actual es más reciente, actualiza la valoración más reciente
            if (!latestValorationByPatient[key] || valoration.fechaYHoraRecoleccionDatos > latestValorationByPatient[key].fechaYHoraRecoleccionDatos) {
                latestValorationByPatient[key] = valoration;
            }
        });

        // Itera sobre las valoraciones de nuevo y agregar una propiedad `isLatest` a cada valoración
        valorations = valorations.map(valoration => {
            let key = valoration.paciente.dni;
            valoration.isLatest = valoration === latestValorationByPatient[key];
            return valoration;
        });

        // Verifica si hay coincidencias
        const noResults = search && valorations.length === 0;

        // Procesa cada valoración
        valorations = valorations.map(valoration => {
            // Crea un nuevo objeto Date con la fecha y hora de la valoración
            let fechaHora = new Date(valoration.fechaYHoraRecoleccionDatos);

            // Obtiene la fecha en formato dd/mm/yyyy
            let fecha = ('0' + fechaHora.getDate()).slice(-2) + '/' + ('0' + (fechaHora.getMonth() + 1)).slice(-2) + '/' + fechaHora.getFullYear();

            // Obtiene la hora en formato hh:mm
            let hora = ('0' + fechaHora.getHours()).slice(-2) + ':' + ('0' + fechaHora.getMinutes()).slice(-2);

            // Reemplaza la fecha y hora de la valoración con la fecha y hora procesadas
            valoration.date = fecha;
            valoration.time = hora;

            // Agrega la propiedad isInternacionFinalizada al objeto valoration
            valoration.isInternacionFinalizada = valoration.ingreso.fechaYHoraAltaPaciente !== null;

            return valoration;
        });
        res.render('valorations/all-valorations', { valorations: valorations, search: search, noResults: noResults });
    } catch (error) {
        console.error('Error al obtener las valoraciones:', error);
        res.status(500).send('Error interno del servidor al buscar');
    }
});

router.get('/unfinished-patient-valorations', isAuthenticated, async (req, res) => {
    req.session.lastVisitedRoute = req.originalUrl; // Guarda la ruta actual en la sesión
    
    try {
        let valorations;

        // Verificar si se proporciona un término de búsqueda
        const search = req.query.search || ''; // Obtiene el valor de search o establece una cadena vacía si es nulo

        // Verifica si se proporciona un término de búsqueda
        if (search) {
            
            // Busca todas las camas que coincidan con el número de cama
            const bedsB = await Bed.find({ numeroCama: isNaN(search) ? null : parseInt(search) }).lean();

            // Obtiene los IDs de las camas
            const bedIds = bedsB.map(bed => bed._id);

            // Realiza la búsqueda por nombre o apellido o cama
            valorations = await Valoration.find({
                $and: [
                    {
                        $or: [
                            { 'paciente.apellido': { $regex: new RegExp(req.query.search, 'i') } },
                            { 'paciente.nombre': { $regex: new RegExp(req.query.search, 'i') } },
                            { 'ingreso.cama': { $in: bedIds } } // Buscar todas las valoraciones que tengan una de las camas
                        ]
                    },
                    { 'ingreso.fechaYHoraAltaPaciente': null }
                ]
            }).populate({
                path: 'ingreso.cama',
                populate: {
                    path: 'servicio'
                }
            }).lean().sort({ fechaYHoraRecoleccionDatos: 'desc' });
        } else {
            // Obtiene todas las valoraciones que aún no finalizan su internación
            valorations = await Valoration.find({ 'ingreso.fechaYHoraAltaPaciente': null }).populate({
                path: 'ingreso.cama',
                populate: {
                    path: 'servicio'
                }
            }).lean().sort({ fechaYHoraRecoleccionDatos: 'desc' });
        }
       
        // Crea un objeto para almacenar la valoración más reciente de cada paciente
        let latestValorationByPatient = {};

        // Itera sobre las valoraciones
        valorations.forEach(valoration => {
            // Usa el DNI del paciente como clave
            let key = valoration.paciente.dni;

            // Si el paciente no tiene una valoración más reciente o si la valoración actual es más reciente, actualiza la valoración más reciente
            if (!latestValorationByPatient[key] || valoration.fechaYHoraRecoleccionDatos > latestValorationByPatient[key].fechaYHoraRecoleccionDatos) {
                latestValorationByPatient[key] = valoration;
            }
        });

        // Itera sobre las valoraciones de nuevo y agregar una propiedad `isLatest` a cada valoración
        valorations = valorations.map(valoration => {
            let key = valoration.paciente.dni;
            valoration.isLatest = valoration === latestValorationByPatient[key];
            return valoration;
        });


        // Verifica si hay coincidencias
        const noResults = search && valorations.length === 0;

        // Procesa cada valoración
        valorations = valorations.map(valoration => {
            // Crea un nuevo objeto Date con la fecha y hora de la valoración
            let fechaHora = new Date(valoration.fechaYHoraRecoleccionDatos);

            // Obtiene la fecha en formato dd/mm/yyyy
            let fecha = ('0' + fechaHora.getDate()).slice(-2) + '/' + ('0' + (fechaHora.getMonth() + 1)).slice(-2) + '/' + fechaHora.getFullYear();

            // Obtiene la hora en formato hh:mm
            let hora = ('0' + fechaHora.getHours()).slice(-2) + ':' + ('0' + fechaHora.getMinutes()).slice(-2);

            // Reemplaza la fecha y hora de la valoración con la fecha y hora procesadas
            valoration.date = fecha;
            valoration.time = hora;

            // Agrega la propiedad isInternacionFinalizada al objeto valoration
            valoration.isInternacionFinalizada = valoration.ingreso.fechaYHoraAltaPaciente !== null;

            return valoration;
        });

        res.render('valorations/unfinished-patient-valorations', { valorations: valorations, search: search, noResults: noResults });
    } catch (error) {
        console.error('Error al obtener las valoraciones con internacion no finalizada:', error);
        res.status(500).send('Error interno del servidor');
    }
});

router.get('/my-valorations/:id', isAuthenticated, async (req, res) => {
    req.session.lastVisitedRoute = req.originalUrl; // Guarda la ruta actual en la sesión

    // Obtiene la matrícula profesional desde los parámetros de la ruta
    const currentUserMatricula = req.params.id;

    try {
        let valorations;

        // Verifica si se proporciona un término de búsqueda
        const search = req.query.search || ''; // Obtiene el valor de search o establece una cadena vacía si es nulo

        // Verifica si se proporciona un término de búsqueda
        if (search) {
            
            // Busca todas las camas que coincidan con el número de cama
            const bedsB = await Bed.find({ numeroCama: isNaN(search) ? null : parseInt(search) }).lean();

            // Obtiene los IDs de las camas
            const bedIds = bedsB.map(bed => bed._id);            
            
            // Realiza la búsqueda por nombre o apellido o cama
            valorations = await Valoration.find({
                $and: [
                    {
                        $or: [
                            { 'paciente.apellido': { $regex: new RegExp(req.query.search, 'i') } },
                            { 'paciente.nombre': { $regex: new RegExp(req.query.search, 'i') } },
                            //{ 'ingreso.cama.servicio.nombre': { $regex: new RegExp(req.query.search, 'i') } }, //No me servía la busqueda por nombre del servicio así que lo comenté, para ver luego
                            { 'ingreso.cama': { $in: bedIds } } // Busca todas las valoraciones que tenga una de las camas
                        ]
                    },
                    { 'matriculaCargador': currentUserMatricula }
                ]
            }).populate({
                path: 'ingreso.cama',
                populate: {
                    path: 'servicio'
                }
            }).lean().sort({ fechaYHoraRecoleccionDatos: 'desc' });
        } else {
            // Obtiene todas las valoraciones que aún no finalizan su internación
            valorations = await Valoration.find({ 'matriculaCargador': currentUserMatricula }).populate({
                path: 'ingreso.cama',
                populate: {
                    path: 'servicio'
                }
            }).lean().sort({ fechaYHoraRecoleccionDatos: 'desc' });
        }

        // Crea un objeto para almacenar la valoración más reciente de cada paciente
        let latestValorationByPatient = {};

        // Itera sobre las valoraciones
        valorations.forEach(valoration => {
            // Usa el DNI del paciente como clave
            let key = valoration.paciente.dni;

            // Si el paciente no tiene una valoración más reciente o si la valoración actual es más reciente, actualiza la valoración más reciente
            if (!latestValorationByPatient[key] || valoration.fechaYHoraRecoleccionDatos > latestValorationByPatient[key].fechaYHoraRecoleccionDatos) {
                latestValorationByPatient[key] = valoration;
            }
        });

        // Itera sobre las valoraciones de nuevo y agregar una propiedad `isLatest` a cada valoración
        valorations = valorations.map(valoration => {
            let key = valoration.paciente.dni;
            valoration.isLatest = valoration === latestValorationByPatient[key];
            return valoration;
        });        
        
        // Verifica si hay coincidencias
        const noResults = search && valorations.length === 0;

        // Procesa cada valoración
        valorations = valorations.map(valoration => {
            // Crea un nuevo objeto Date con la fecha y hora de la valoración
            let fechaHora = new Date(valoration.fechaYHoraRecoleccionDatos);

            // Obtiene la fecha en formato dd/mm/yyyy
            let fecha = ('0' + fechaHora.getDate()).slice(-2) + '/' + ('0' + (fechaHora.getMonth() + 1)).slice(-2) + '/' + fechaHora.getFullYear();

            // Obtiene la hora en formato hh:mm
            let hora = ('0' + fechaHora.getHours()).slice(-2) + ':' + ('0' + fechaHora.getMinutes()).slice(-2);

            // Reemplaza la fecha y hora de la valoración con la fecha y hora procesadas
            valoration.date = fecha;
            valoration.time = hora;

            // Agrega la propiedad isInternacionFinalizada al objeto valoration
            valoration.isInternacionFinalizada = valoration.ingreso.fechaYHoraAltaPaciente !== null;

            return valoration;
        });

        res.render('valorations/my-valorations', { valorations: valorations, search: search, noResults: noResults });
    } catch (error) {
        console.error('Error al obtener mis valoraciones:', error);
        res.status(500).send('Error interno del servidor');
    }
});

router.post('/valorations/finalizarInternacion/:id', isAuthenticated, async (req, res) => {
    try {
        const valoration = await Valoration.findById(req.params.id).populate({
            path: 'ingreso.cama',
            populate: {
                path: 'servicio'
            }
        });

        if (!valoration) {
            // Maneja el caso en que no se encuentre la valoración
            res.status(404).send('Valoración no encontrada');
            return;
        }
        if (valoration && valoration.ingreso.estadoInternacion === 'No finalizada') {
            // Solo si la internación no ha sido finalizada entonces

            // Cambia el estado de la internación a 'Finalizada'
            valoration.ingreso.estadoInternacion = 'Finalizada';

            // Asigna la fecha y hora actual como fecha de Alta Paciente
            valoration.ingreso.fechaYHoraAltaPaciente = new Date();

            valoration.ingreso.apellidoResponsableAltaPaciente = req.user.profesional.apellido;
            valoration.ingreso.nombreResponsableAltaPaciente = req.user.profesional.nombre;
            valoration.ingreso.matriculaResponsableAltaPaciente = req.user.profesional.matriculaProfesional;

            // Guarda la valoración actualizada en la base de datos
            await valoration.save();

            const bed = valoration.ingreso.cama;
            await bed.cambiarEstado('Disponible');
            req.flash('success_msg', 'Internación finalizada con éxito y cama actualizada');

             // Busca todas las valoraciones del paciente, que tienen un estado de internación "No finalizada"
             const valorations = await Valoration.find({ 
                'paciente.dni': valoration.paciente.dni, 
                'paciente.apellido': valoration.paciente.apellido, 
                'paciente.nombre': valoration.paciente.nombre, 
                'ingreso.estadoInternacion': 'No finalizada' 
            });

             // Cambia el estado de todas las valoraciones a "Finalizada"
             for (let val of valorations) {
                val.ingreso.fechaYHoraAltaPaciente = new Date();
                val.ingreso.apellidoResponsableAltaPaciente = req.user.profesional.apellido;
                val.ingreso.nombreResponsableAltaPaciente = req.user.profesional.nombre;
                val.ingreso.matriculaResponsableAltaPaciente = req.user.profesional.matriculaProfesional;
                val.ingreso.estadoInternacion = 'Finalizada';
                await val.save();
             }           

        } else {
            req.flash('error_msg', 'La internación ya ha sido finalizada');
        }

        const lastVisitedRoute = req.session.lastVisitedRoute || '/valorations'; // Si no hay última ruta, redirige a /valorations
        res.redirect(lastVisitedRoute);
            
    } catch (error) {
        console.error('Error al finalizar la internación:', error);
        res.status(500).send('Error interno del servidor');
    }
});

router.get('/valorations/edit/:id', isAuthenticated, async (req, res) => {

    try {
        // Obtiene la valoración de la base de datos
        let valoration = await Valoration.findById(req.params.id).populate({
            path: 'ingreso.cama',
            populate: {
                path: 'servicio'
            }
        }).lean();

        // Calculo total de escala Glasgow
        let totalGlasgow = parseInt(valoration.sensopercepcion.aperturaOcular, 10) + parseInt(valoration.sensopercepcion.respuestaMotora, 10) + parseInt(valoration.sensopercepcion.respuestaVerbal, 10);
        valoration.sensopercepcion.totalGlasgow = totalGlasgow;
        
        // Crea un nuevo objeto Date con la fecha y hora de la valoración
        let fechaHora = new Date(valoration.fechaYHoraRecoleccionDatos);

        // Obtiene la fecha de valoración en formato dd/mm/yyyy
        let fecha = ('0' + fechaHora.getDate()).slice(-2) + '/' + ('0' + (fechaHora.getMonth() + 1)).slice(-2) + '/' + fechaHora.getFullYear();

        // Obtiene la hora de valoración en formato hh:mm
        let hora = ('0' + fechaHora.getHours()).slice(-2) + ':' + ('0' + fechaHora.getMinutes()).slice(-2);

        // Reemplaza la fecha y hora de la valoración con la fecha y hora procesadas
        valoration.date = fecha;
        valoration.time = hora;

        // Verifica si fechaYHoraAltaPaciente no es null
        if (valoration.ingreso.fechaYHoraAltaPaciente !== null) {

            // Crea un nuevo objeto Date con la fecha y hora de alta Paciente
            let fechaHoraAltaPaciente = new Date(valoration.ingreso.fechaYHoraAltaPaciente);

            // Obtiene la fecha de alta Paciente en formato dd/mm/yyyy
            let fechaAltaPaciente = ('0' + fechaHoraAltaPaciente.getDate()).slice(-2) + '/' + ('0' + (fechaHoraAltaPaciente.getMonth() + 1)).slice(-2) + '/' + fechaHoraAltaPaciente.getFullYear();

            // Obtiene la hora de alta Paciente en formato hh:mm
            let horaAltaPaciente = ('0' + fechaHoraAltaPaciente.getHours()).slice(-2) + ':' + ('0' + fechaHoraAltaPaciente.getMinutes()).slice(-2);

            // Agrega la fecha y hora de alta Paciente al objeto valoration
            valoration.dateAltaPaciente = fechaAltaPaciente;
            valoration.timeAltaPaciente = horaAltaPaciente;
        }
        
        // Reformatea la fecha antes de pasarla a la vista
        const formattedFechaNacimiento = valoration.paciente.fechaNacimiento
        ? formatDate(valoration.paciente.fechaNacimiento)
        : null;

        //Calcula fecha de hoy para pasarla al render y no dejar que ingrese una fecha mayor a la de hoy
        let today = new Date();
        let maxDate = today.getFullYear()+'-'+('0' + (today.getMonth()+1)).slice(-2)+'-'+('0' + today.getDate()).slice(-2);

        const services = await Service.find({}).lean();
        const beds = await Bed.find({}).lean();

        // Crea un nuevo objeto Date con la fecha y hora de ingreso
        let fechaHoraIngreso = new Date(valoration.ingreso.fechaYHoraIngreso);

        // Obtiene la fecha de ingreso en formato dd/mm/yyyy
        let fechaIngreso = ('0' + fechaHoraIngreso.getDate()).slice(-2) + '/' + ('0' + (fechaHoraIngreso.getMonth() + 1)).slice(-2) + '/' + fechaHoraIngreso.getFullYear();

        // Obtiene la hora de ingreso en formato hh:mm
        let horaIngreso = ('0' + fechaHoraIngreso.getHours()).slice(-2) + ':' + ('0' + fechaHoraIngreso.getMinutes()).slice(-2);

        // Reemplaza la fecha y hora de ingreso con la fecha y hora procesadas
        valoration.ingreso.date = fechaIngreso;
        valoration.ingreso.time = horaIngreso;
        
        res.render('valorations/edit-valoration', { valoration, date: valoration.date, time: valoration.time, formattedFechaNacimiento, dateIngreso: valoration.ingreso.date, timeIngreso: valoration.ingreso.time, dateAltaPaciente: valoration.dateAltaPaciente, timeAltaPaciente: valoration.timeAltaPaciente, totalGlasgow: valoration.sensopercepcion.totalGlasgow, maxDate, services, beds });
    } catch (error) {
        console.error('Error al obtener la valoración:', error);
        res.status(500).send('Error interno del servidor');
    }
});

router.put('/valorations/edit-valoration/:id', isAuthenticated, async (req, res) => {
    const {
        apellido,
        nombre,
        dni,
        fechaNacimiento,
        sexo,
        estadoCivil,
        domicilioActual,
        coberturaSalud,
        nacionalidad,
        procedencia,
        motivoIngreso,
        servicio,
        numeroCama,
        tipoIngreso,
        diagnostico,
        antecedenteAlergias,
        antecedenteDbt,
        antecedenteHta,
        antecedenteObesidad,
        antecedenteChagas,
        antecedenteIrregularidadCicloMenstrual,
        antecedenteAsma,
        descripcion,
        examenesComplementarios,
        otros,
        observacionGeneral,
        entrevista,
        examenInspeccion,
        examenAuscultacion,
        examenPalpacion,
        examenPercusion,
        frecuenciaRespiratoria,
        ritmoRespiratorio,
        profundidad,
        simetria,
        viaAerPerm,
        secreciones,
        color,
        tos,
        expectoracion,
        hipoventilacion,
        disnea,
        auscMurmulloVesicular,
        auscSibilancias,
        auscCrepitantes,
        auscRoncus,
        auscGorgoteos,
        frecuenciaCardiaca,
        ritmoCirculacion,
        intensidad,
        tension,
        amplitud,
        pulsosPerifericos,
        ruidosCardiacos,
        latidoDePunta,
        tensionArterial,
        ingurgitacionYugular,
        coloracionPielYMucRosada,
        coloracionPielYMucPalida,
        coloracionPielYMucCianosis,
        coloracionPielYMucLivideces,
        coloracionPielYMucIctericia,
        coloracionPielYMucOtra,
        temperaturaAxilar,
        temperaturaRectal,
        edemas,
        nivelConcienciaLucido,
        nivelConcienciaConfuso,
        nivelConcienciaDelirante,
        nivelConcienciaEstuporoso,
        nivelConcienciaComa,
        aperturaOcular,
        respuestaMotora,
        respuestaVerbal,
        tamanioPupilas,
        simetriaPupilas,
        reactividad,
        babinsky,
        otrosPupilas,
        afasias,
        dolorSensopercepcion,
        caracteristicasDolor,
        localizacionDolor,
        peso,
        talla,
        obesidad,
        hidratacion,
        signoPliegue,
        autonomiaParaAlimentarse,
        alimentacionEnteralOral,
        alimentacionEnteralSNG,
        ingresosViaOral,
        ingresosViaParenteral,
        ruidosHidroaereos,
        distencionAbdominal,
        colorDeposiciones,
        consistenciaDeposiciones,
        otrasCaracteristicasDeposiciones,
        sudoracion,
        totalEgresosSudoracion,
        perdidaInsensibleSudoracion,
        totalIngresosBalanceHidrico,
        totalEgresosBalanceHidrico,
        lesiones,
        localizacionLesiones,
        cicatrices,
        localizacionCicatrices,
        mudaDeRopa,
        elementosDeHigiene,
        higienePorSiMismo,
        posicionEnCama,
        habitosDescansoNocturno,
        horas,
        alteracionSuenio,
        sedantes,
        estadoMiedo,
        estadoNegativismo,
        estadoInquietud,
        estadoDepresion,
        estadoApatia,
        estadoAnsiedad,
        estadoAgresividad,
        estadoLlanto,
        creenciasReligion,
        trabajaActualmente,
        ocupacion,
        desdeCuandoTrabaja,
        sentimientoEnTrabajo,
        escolaridad,
        aprendizajeDeseaAprender,
        aprendizajeNegacionAlTratamiento,
        aprendizajeAceptacionAlTratamiento,
        tabaquismo,
        tabaquismoCuantos,
        consumoAlcohol,
        enfermedadesPreexistentes,
        motivoFallecimientoPadres,
        motivoFallecimientoHermanos,
        motivoFallecimientoAbuelos
    } = req.body;
    try {
        let { fechaNacimiento } = req.body;

        // Verifica si fechaNacimiento no está definido o es una cadena vacía y establecerlo a null
        if (fechaNacimiento === undefined || fechaNacimiento === '') {
            fechaNacimiento = null;
        }
        
        if (fechaNacimiento !== null) {
            /*Ajusto la fecha de nacimiento para que se guarde bien*/
            fechaNacimiento = new Date(fechaNacimiento);
            fechaNacimiento.setDate(fechaNacimiento.getDate() + 1); // Suma un día para guardar en la base de datos porque cuando guarda en la BD se resta 1 día
        }

        // Establece tabaquismoCuantos en el valor ingresado si tabaquismo es "Si", de lo contrario, establece en null
        const updatedTabaquismoCuantos = tabaquismo === 'Si' ? tabaquismoCuantos : null;      

        const updatedValoration = await Valoration.findByIdAndUpdate(
            req.params.id, {
                'paciente.apellido': apellido,
                'paciente.nombre': nombre,
                'paciente.dni': dni,
                'paciente.fechaNacimiento': fechaNacimiento,
                'paciente.estadoCivil': estadoCivil,
                'paciente.domicilioActual': domicilioActual,
                'paciente.coberturaSalud': coberturaSalud,
                'paciente.nacionalidad': nacionalidad,
                'paciente.procedencia': procedencia,
                'otrosProblemas.antecedenteAlergias': antecedenteAlergias === 'true',
                'otrosProblemas.antecedenteDbt': antecedenteDbt === 'true', 
                'otrosProblemas.antecedenteHta': antecedenteHta === 'true',
                'otrosProblemas.antecedenteObesidad': antecedenteObesidad === 'true',
                'otrosProblemas.antecedenteChagas': antecedenteChagas === 'true',
                'otrosProblemas.antecedenteIrregularidadCicloMenstrual': antecedenteIrregularidadCicloMenstrual === 'true',
                'otrosProblemas.antecedenteAsma': antecedenteAsma === 'true',
                'indicaciones.descripcion': descripcion,
                'indicaciones.examenesComplementarios': examenesComplementarios,
                'indicaciones.otros': otros,
                'oxigenacion.respiracion.secreciones': secreciones,
                'oxigenacion.respiracion.color': color,
                'oxigenacion.respiracion.tos': tos,
                'oxigenacion.respiracion.expectoracion': expectoracion,
                'oxigenacion.respiracion.hipoventilacion': hipoventilacion,
                'oxigenacion.respiracion.disnea': disnea,
                'oxigenacion.respiracion.auscMurmulloVesicular': auscMurmulloVesicular === 'true', 
                'oxigenacion.respiracion.auscSibilancias': auscSibilancias === 'true',
                'oxigenacion.respiracion.auscCrepitantes': auscCrepitantes === 'true',
                'oxigenacion.respiracion.auscRoncus': auscRoncus === 'true',
                'oxigenacion.respiracion.auscGorgoteos': auscGorgoteos === 'true',
                'oxigenacion.circulacion.ruidosCardiacos': ruidosCardiacos,
                'oxigenacion.circulacion.latidoDePunta': latidoDePunta,
                'oxigenacion.circulacion.ingurgitacionYugular': ingurgitacionYugular,
                'oxigenacion.circulacion.coloracionPielYMucRosada': coloracionPielYMucRosada === 'true',
                'oxigenacion.circulacion.coloracionPielYMucPalida': coloracionPielYMucPalida === 'true',
                'oxigenacion.circulacion.coloracionPielYMucCianosis': coloracionPielYMucCianosis === 'true',
                'oxigenacion.circulacion.coloracionPielYMucLivideces': coloracionPielYMucLivideces === 'true',
                'oxigenacion.circulacion.coloracionPielYMucIctericia': coloracionPielYMucIctericia === 'true',
                'oxigenacion.circulacion.coloracionPielYMucOtra': coloracionPielYMucOtra === 'true',
                'oxigenacion.circulacion.temperaturaRectal': temperaturaRectal,
                'oxigenacion.circulacion.edemas': edemas,
                'sensopercepcion.tamanioPupilas': tamanioPupilas,
                'sensopercepcion.simetriaPupilas': simetriaPupilas,
                'sensopercepcion.reactividad': reactividad,
                'sensopercepcion.babinsky': babinsky,
                'sensopercepcion.otrosPupilas': otrosPupilas,
                'sensopercepcion.afasias': afasias,
                'sensopercepcion.dolorSensopercepcion': dolorSensopercepcion,
                'sensopercepcion.caracteristicasDolor': caracteristicasDolor,
                'sensopercepcion.localizacionDolor': localizacionDolor,
                'nutricion.peso': peso,
                'nutricion.talla': talla,
                'nutricion.obesidad': obesidad,
                'nutricion.hidratacion': hidratacion,
                'nutricion.signoPliegue': signoPliegue,
                'nutricion.autonomiaParaAlimentarse': autonomiaParaAlimentarse,
                'nutricion.alimentacionEnteralOral': alimentacionEnteralOral === 'true',
                'nutricion.alimentacionEnteralSNG': alimentacionEnteralSNG === 'true',
                'nutricion.ingresosViaOral': ingresosViaOral,
                'nutricion.ingresosViaParenteral': ingresosViaParenteral,
                'eliminacion.ruidosHidroaereos': ruidosHidroaereos,
                'eliminacion.distencionAbdominal': distencionAbdominal,
                'eliminacion.colorDeposiciones': colorDeposiciones,
                'eliminacion.consistenciaDeposiciones': consistenciaDeposiciones,
                'eliminacion.otrasCaracteristicasDeposiciones': otrasCaracteristicasDeposiciones,
                'eliminacion.sudoracion': sudoracion,
                'eliminacion.totalEgresosSudoracion': totalEgresosSudoracion,
                'eliminacion.perdidaInsensibleSudoracion': perdidaInsensibleSudoracion,
                'eliminacion.totalIngresosBalanceHidrico': totalIngresosBalanceHidrico,
                'eliminacion.totalEgresosBalanceHidrico': totalEgresosBalanceHidrico,
                'aseoYPiel.lesiones': lesiones,
                'aseoYPiel.localizacionLesiones': localizacionLesiones,
                'aseoYPiel.cicatrices': cicatrices,
                'aseoYPiel.localizacionCicatrices': localizacionCicatrices,
                'aseoYPiel.mudaDeRopa': mudaDeRopa === 'true',
                'aseoYPiel.elementosDeHigiene': elementosDeHigiene === 'true',
                'aseoYPiel.higienePorSiMismo': higienePorSiMismo,
                'reposoYSuenio.posicionEnCama': posicionEnCama,
                'reposoYSuenio.habitosDescansoNocturno': habitosDescansoNocturno,
                'reposoYSuenio.horas': horas,
                'reposoYSuenio.alteracionSuenio': alteracionSuenio,
                'reposoYSuenio.sedantes': sedantes,
                'psicosocial.estadoMiedo': estadoMiedo === 'true',
                'psicosocial.estadoNegativismo': estadoNegativismo === 'true',
                'psicosocial.estadoInquietud': estadoInquietud === 'true',
                'psicosocial.estadoDepresion': estadoDepresion === 'true',
                'psicosocial.estadoApatia': estadoApatia === 'true',
                'psicosocial.estadoAnsiedad': estadoAnsiedad === 'true',
                'psicosocial.estadoAgresividad': estadoAgresividad === 'true',
                'psicosocial.estadoLlanto': estadoLlanto === 'true',
                'psicosocial.creenciasReligion': creenciasReligion,
                'psicosocial.trabajaActualmente': trabajaActualmente,
                'psicosocial.ocupacion': ocupacion,
                'psicosocial.desdeCuandoTrabaja': desdeCuandoTrabaja,
                'psicosocial.sentimientoEnTrabajo': sentimientoEnTrabajo,
                'psicosocial.escolaridad': escolaridad,
                'psicosocial.aprendizajeDeseaAprender': aprendizajeDeseaAprender === 'true',
                'psicosocial.aprendizajeNegacionAlTratamiento': aprendizajeNegacionAlTratamiento === 'true',
                'psicosocial.aprendizajeAceptacionAlTratamiento': aprendizajeAceptacionAlTratamiento === 'true',
                'riesgo.tabaquismo': tabaquismo,
                'riesgo.tabaquismoCuantos': updatedTabaquismoCuantos,
                'riesgo.consumoAlcohol': consumoAlcohol,
                'riesgo.enfermedadesPreexistentes': enfermedadesPreexistentes,
                'riesgo.motivoFallecimientoPadres': motivoFallecimientoPadres,
                'riesgo.motivoFallecimientoHermanos': motivoFallecimientoHermanos,
                'riesgo.motivoFallecimientoAbuelos': motivoFallecimientoAbuelos               
            },
            { new: true } // Para devolver el documento actualizado
        );

        if (!updatedValoration) {
            // Si no se encuentra la valoración
            req.flash('error_msg', 'No se encontró la valoración');
            return res.redirect('/valorations');
        }

        req.flash('success_msg', 'Valoración Actualizada Exitosamente');
        // Después de actualizar, redirige al usuario a la última ruta guardada
        const lastVisitedRoute = req.session.lastVisitedRoute || '/valorations'; // Si no hay última ruta, redirige a /valorations
        res.redirect(lastVisitedRoute);        
    } catch (error) {
        console.error('Error al actualizar la valoración:', error);
        req.flash('error_msg', 'Error al actualizar la valoración');
        res.redirect('/valorations');
    }
});

router.delete('/valorations/delete/:id', isAuthenticated, async (req, res) => {
    await Valoration.findByIdAndDelete(req.params.id).lean();
    req.flash('success_msg', 'Valoración Eliminada Exitosamente');
    res.redirect('/valorations');
})

router.get('/valorations/show/:id', isAuthenticated, async (req, res) => {
    try {
        // Obtiene la valoración de la base de datos
        let valoration = await Valoration.findById(req.params.id).populate({
            path: 'ingreso.cama',
            populate: {
                path: 'servicio'
            }
        }).lean();

        // Calculo total de escala Glasgow
        let totalGlasgow = parseInt(valoration.sensopercepcion.aperturaOcular, 10) + parseInt(valoration.sensopercepcion.respuestaMotora, 10) + parseInt(valoration.sensopercepcion.respuestaVerbal, 10);
        valoration.sensopercepcion.totalGlasgow = totalGlasgow;
        
        // Crea un nuevo objeto Date con la fecha y hora de la valoración
        let fechaHora = new Date(valoration.fechaYHoraRecoleccionDatos);

        // Obtiene la fecha de valoración en formato dd/mm/yyyy
        let fecha = ('0' + fechaHora.getDate()).slice(-2) + '/' + ('0' + (fechaHora.getMonth() + 1)).slice(-2) + '/' + fechaHora.getFullYear();

        // Obtiene la hora de valoración en formato hh:mm
        let hora = ('0' + fechaHora.getHours()).slice(-2) + ':' + ('0' + fechaHora.getMinutes()).slice(-2);

        // Reemplaza la fecha y hora de la valoración con la fecha y hora procesadas
        valoration.date = fecha;
        valoration.time = hora;

        // Verifica si fechaYHoraAltaPaciente no es null
        if (valoration.ingreso.fechaYHoraAltaPaciente !== null) {
            // Crea un nuevo objeto Date con la fecha y hora de alta Paciente
            let fechaHoraAltaPaciente = new Date(valoration.ingreso.fechaYHoraAltaPaciente);

            // Obtiene la fecha de alta Paciente en formato dd/mm/yyyy
            let fechaAltaPaciente = ('0' + fechaHoraAltaPaciente.getDate()).slice(-2) + '/' + ('0' + (fechaHoraAltaPaciente.getMonth() + 1)).slice(-2) + '/' + fechaHoraAltaPaciente.getFullYear();

            // Obtiene la hora de alta Paciente en formato hh:mm
            let horaAltaPaciente = ('0' + fechaHoraAltaPaciente.getHours()).slice(-2) + ':' + ('0' + fechaHoraAltaPaciente.getMinutes()).slice(-2);

            // Agrega la fecha y hora de alta Paciente al objeto valoration
            valoration.dateAltaPaciente = fechaAltaPaciente;
            valoration.timeAltaPaciente = horaAltaPaciente;
        }
        
        if (valoration.paciente.fechaNacimiento !== null) {

            // Crea un nuevo objeto Date con la fecha de nacimiento
            let fechaNacimiento = new Date(valoration.paciente.fechaNacimiento);

            // Calcula la edad
            let edad = new Date().getFullYear() - fechaNacimiento.getFullYear();
            let m = new Date().getMonth() - fechaNacimiento.getMonth();
            if (m < 0 || (m === 0 && new Date().getDate() < fechaNacimiento.getDate())) {
                edad--;
            }

            // Agrega la edad al objeto valoration
            valoration.paciente.edad = edad;

            // Obtiene la fecha de nacimiento en formato dd/mm/yyyy
            let fechaNac = ('0' + fechaNacimiento.getDate()).slice(-2) + '/' + ('0' + (fechaNacimiento.getMonth() + 1)).slice(-2) + '/' + fechaNacimiento.getFullYear();

            // Reemplaza la fecha de nacimiento con la fecha procesada
            valoration.paciente.fechaNacimiento = fechaNac;
        } else {
            // Si fechaNacimiento es null, asigna '-' a la propiedad edad
            valoration.paciente.edad = '-';
        }

        const services = await Service.find({}).lean();
        const beds = await Bed.find({}).lean();


        // Crea un nuevo objeto Date con la fecha y hora de ingreso
        let fechaHoraIngreso = new Date(valoration.ingreso.fechaYHoraIngreso);

        // Obtiene la fecha de ingreso en formato dd/mm/yyyy
        let fechaIngreso = ('0' + fechaHoraIngreso.getDate()).slice(-2) + '/' + ('0' + (fechaHoraIngreso.getMonth() + 1)).slice(-2) + '/' + fechaHoraIngreso.getFullYear();

        // Obtiene la hora de ingreso en formato hh:mm
        let horaIngreso = ('0' + fechaHoraIngreso.getHours()).slice(-2) + ':' + ('0' + fechaHoraIngreso.getMinutes()).slice(-2);

        // Reemplaza la fecha y hora de ingreso con la fecha y hora procesadas
        valoration.ingreso.date = fechaIngreso;
        valoration.ingreso.time = horaIngreso;

        res.render('valorations/show-valoration', { valoration, date: valoration.date, time: valoration.time, dateIngreso: valoration.ingreso.date, timeIngreso: valoration.ingreso.time, dateAltaPaciente: valoration.dateAltaPaciente, timeAltaPaciente: valoration.timeAltaPaciente, totalGlasgow: valoration.sensopercepcion.totalGlasgow, beds, services });
    } catch (error) {
        console.error('Error al obtener la valoración:', error);
        res.status(500).send('Error interno del servidor');
    }
});

router.get('/hospitalized-patients', async (req, res) => {
    try {
        const valorations = await Valoration.aggregate([
            {
                $match: {
                    'ingreso.fechaYHoraAltaPaciente': null
                }
            },
            {
                $sort: {
                    'ingreso.fechaYHoraIngreso': -1 // Ordenar por fecha de ingreso en orden descendente
                }
            },
            {
                $group: {
                    _id: '$paciente', // Agrupar por paciente
                    latestValoration: { $first: '$$ROOT' } // Seleccionar la valoración más reciente de cada paciente
                }
            },
            {
                $replaceRoot: { newRoot: '$latestValoration' } // Reemplazar la raíz con las valoraciones más recientes
            },
            {
                $lookup: {
                    from: 'beds',
                    localField: 'ingreso.cama',
                    foreignField: '_id',
                    as: 'ingreso.cama'
                }
            },
            {
                $unwind: '$ingreso.cama'
            },
            {
                $lookup: {
                    from: 'services',
                    localField: 'ingreso.cama.servicio',
                    foreignField: '_id',
                    as: 'ingreso.cama.servicio'
                }
            },
            {
                $unwind: '$ingreso.cama.servicio'
            }
        ]);

        res.render('valorations/hospitalized-patients', { valorations });
    } catch (error) {
        console.error('Error al obtener las valoraciones:', error);
        res.status(500).send('Error interno del servidor');
    }
});

module.exports = router;