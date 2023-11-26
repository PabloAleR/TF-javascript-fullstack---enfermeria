const mongoose = require('mongoose');
const { Schema } = mongoose;

const ValorationSchema = new Schema({
    fechaYHoraRecoleccionDatos: { type: Date, default: Date.now },
    paciente: {
        apellido: { type: String, required: false },
        nombre: { type: String, required: false },
        dni: { type: Number, required: false },
        fechaNacimiento: {type: Date, required: false},
        sexo: { type: String, required: true },
        estadoCivil: { type: String, required: false },
        domicilioActual: { type: String, required: false },
        coberturaSalud: { type: String, required: false },
        nacionalidad: { type: String, required: false },
        procedencia: { type: String, required: false }
    },
    ingreso: {
        motivoIngreso: { type: String, required: true },
        cama: { type: Schema.Types.ObjectId, ref: 'Bed' },
        fechaYHoraIngreso: {type: Date, required: false},
        tipoIngreso: { type: String, required: true },
        fechaYHoraAltaPaciente: { type: Date, default: null },
        apellidoResponsableAltaPaciente: { type: String, required: false },
        nombreResponsableAltaPaciente: { type: String, required: false },
        matriculaResponsableAltaPaciente: { type: String, required: false },
        estadoInternacion: { type: String, default: 'No finalizada' }
    },
    diagnostico: { type: String, required: true },
    otrosProblemas: {
        antecedenteAlergias: { type: Boolean, required: false },
        antecedenteDbt: { type: Boolean, required: false },
        antecedenteHta: { type: Boolean, required: false },
        antecedenteObesidad: { type: Boolean, required: false },
        antecedenteChagas: { type: Boolean, required: false },
        antecedenteIrregularidadCicloMenstrual: { type: Boolean, required: false },
        antecedenteAsma: { type: Boolean, required: false }
    },
    indicaciones: {
        descripcion: { type: String, required: true },
        examenesComplementarios: { type: String, required: false },
        otros: { type: String, required: false }
    },
    situacionActual : {
        observacionGeneral: { type: Boolean, required: false },
        entrevista: { type: Boolean, required: false },
        examenInspeccion: { type: Boolean, required: false },
        examenAuscultacion: { type: Boolean, required: false },
        examenPalpacion: { type: Boolean, required: false },
        examenPercusion: { type: Boolean, required: false }
    },
    oxigenacion: {
        respiracion: {
            frecuenciaRespiratoria: { type: Number, required: true},
            ritmoRespiratorio: { type: String, required: true, enum: ['Regular', 'Irregular'] },
            profundidad: { type: String, required: true, enum: ['Superficial', 'Normal', 'Profunda'] },
            simetria: { type: String, required: true, enum: ['Simétrica', 'Asimétrica'] },           
            viaAerPerm: { type: String, required: true},
            secreciones: { type: String, required: false },
            color: { type: String, required: false },
            tos: { type: String, required: false },
            expectoracion: { type: String, required: false },
            hipoventilacion: { type: String, required: false },
            //Uso musc acc.: Intercostales, Diafragmatico, accesorios del tronco
            disnea: { type: String, required: false },
            auscMurmulloVesicular: { type: Boolean, required: false },
            auscSibilancias: { type: Boolean, required: false },
            auscCrepitantes: { type: Boolean, required: false },
            auscRoncus: { type: Boolean, required: false },
            auscGorgoteos: { type: Boolean, required: false },
        },
        circulacion: {
            frecuenciaCardiaca: { type: Number, required: true }, //0 a 300 L.P.M.
            ritmoCirculacion : { type: String, required: true, enum: ['Regular', 'Irregular'] },
            intensidad: { type: String, required: true, enum: ['Débil', 'Normal', 'Fuerte'] },
            tension: { type: Number, required: true },
            //monitor si o no
            //ECG
            amplitud: { type: String, required: true, enum: ['Débil', 'Normal', 'Fuerte'] },
            pulsosPerifericos: { type: String, required: true },
            ruidosCardiacos: { type: String, required: false },
            latidoDePunta: { type: String, required: false },
            tensionArterial: { type: String, required: true },
            ingurgitacionYugular: { type: String, required: false },
            coloracionPielYMucRosada: { type: Boolean, required: false },
            coloracionPielYMucPalida: { type: Boolean, required: false },
            coloracionPielYMucCianosis: { type: Boolean, required: false },
            coloracionPielYMucLivideces: { type: Boolean, required: false },
            coloracionPielYMucIctericia: { type: Boolean, required: false },
            coloracionPielYMucOtra: { type: Boolean, required: false },
            temperaturaAxilar: { type: Number, required: true },
            temperaturaRectal: { type: Number, required: false },
            edemas: { type: String, required: false }
        }
    },  
    sensopercepcion:{
        nivelConcienciaLucido: { type: Boolean, required: false },
        nivelConcienciaConfuso: { type: Boolean, required: false },
        nivelConcienciaDelirante: { type: Boolean, required: false },
        nivelConcienciaEstuporoso: { type: Boolean, required: false },
        nivelConcienciaComa: { type: Boolean, required: false },
        aperturaOcular: { type: Number, required: true },
        respuestaMotora: { type: Number, required: true },
        respuestaVerbal: { type: Number, required: true },
        tamanioPupilas: { type: String, required: false },
        simetriaPupilas: { type: String, required: false, enum: ['Simétrica', 'Asimétrica'] },
        reactividad: { type: String, required: false },
        babinsky: { type: String, required: false },
        otrosPupilas: { type: String, required: false },
        afasias: {type: String, required: false }, //afasias es check input radio con opciones Si y No
        dolorSensopercepcion: { type: String, required: false },
        caracteristicasDolor: { type: String, required: false },
        localizacionDolor: { type: String, required: false }
    },
    nutricion: {
        peso: { type: Number, required: false },
        talla: { type: Number, required: false },
        obesidad: { type: String, required: false }, //obesidad es check input radio con opciones Si y No
        hidratacion: { type: String, required: false },
        signoPliegue: { type: String, required: false }, //signoPliegue es check input radio con opciones Positivo y Negativo
        autonomiaParaAlimentarse: { type: String, required: false }, //autonomiaParaAlimentarse es check input radio con tres opciones que son: Total, Parcial y Ninguna
        alimentacionEnteralOral: { type: Boolean, required: false }, //alimentacionEnteralOral será check input checkbox junto con alimentacionEnteralSNG
        alimentacionEnteralSNG: { type: Boolean, required: false },
        ingresosViaOral: { type: Number, required: false },
        ingresosViaParenteral: { type: Number, required: false }
    },
    eliminacion: {
        ruidosHidroaereos: { type: String, required: false },
        distencionAbdominal: { type: String, required: false },//distucionAbdominal es check input radio con opciones Si y No
        colorDeposiciones: { type: String, required: false }, //Puede ser verde, amarillo, blanc o gris, oscura, anaranjada, rojiza
        consistenciaDeposiciones: { type: String, required: false }, //solida, semisolida, liquida
        otrasCaracteristicasDeposiciones: { type: String, required: false },
        //ostomias: si o no
        //orina color: ambar, rojiza, traslucida,anarajnada, cafe, azul verdosa
        //sonda vesical si o no
        //colector si o no
        //incontinencia
        //retencion si o no
        //dif para orinar si o no
        //drenjes tipo texto para escribir
        //localizacion para escribir
        //caracterisitcas para escribir
        sudoracion: { type: String, required: false },
        totalEgresosSudoracion: { type: Number, required: false },
        perdidaInsensibleSudoracion: { type: Number, required: false },
        totalIngresosBalanceHidrico:  { type: Number, required: false },
        totalEgresosBalanceHidrico:  { type: Number, required: false },
    },
    aseoYPiel: {
        lesiones: { type: String, required: false },
        localizacionLesiones:  { type: String, required: false },
        cicatrices: { type: String, required: false },
        localizacionCicatrices: { type: String, required: false },
        mudaDeRopa: { type: Boolean, required: false }, //mudaDeRopa será check input checkbox junto con elementosDeHigiene
        elementosDeHigiene: { type: Boolean, required: false },
        higienePorSiMismo: { type: String, required: false }, //higienePorSiMismo es check input radio con opciones Si y No
    },
    reposoYSuenio: {
        posicionEnCama: { type: String, required: false },
        habitosDescansoNocturno: { type: String, required: false },
        horas: { type: Number, required: false },
        alteracionSuenio: { type: String, required: false },
        sedantes: { type: String, required: false }
        //hab para ind si o no
    },
    psicosocial: {
        estadoMiedo: { type: Boolean, required: false }, //estadoMiedo será check input checkbox junto con estadoNegativismo, estadoInquietud, estadoDepresion, estadoApatia, estadoAnsiedad, estadoAgresividad y estadoLlanto
        estadoNegativismo: { type: Boolean, required: false },
        estadoInquietud: { type: Boolean, required: false },
        estadoDepresion: { type: Boolean, required: false },
        estadoApatia: { type: Boolean, required: false },
        estadoAnsiedad: { type: Boolean, required: false },
        estadoAgresividad: { type: Boolean, required: false },
        estadoLlanto: { type: Boolean, required: false },
        creenciasReligion: { type: String, required: false },
        trabajaActualmente: { type: String, required: false }, //trabajaActualmente es check input radio con opciones Si y No
        ocupacion: { type: String, required: false },
        desdeCuandoTrabaja: { type: String, required: false },
        sentimientoEnTrabajo: { type: String, required: false },
        escolaridad: { type: String, required: false, enum: ['Incompleta', 'Primaria', 'Secundaria', 'Terciaria', 'Universitaria'] },
        aprendizajeDeseaAprender: { type: Boolean, required: false }, //aprendizajeDeseaAprender será check input checkbox junto con aprendizajeNegacionAlTratamiento y aprendizajeAceptacionAlTratamiento
        aprendizajeNegacionAlTratamiento : { type: Boolean, required: false },
        aprendizajeAceptacionAlTratamiento : { type: Boolean, required: false },
    },
    riesgo: {
        tabaquismo: { type: String, required: false }, //tabaquismo es check input radio con opciones Si y No
        tabaquismoCuantos: { type: Number, required: false },
        consumoAlcohol: { type: String, required: false },
        enfermedadesPreexistentes: { type: String, required: false },
        motivoFallecimientoPadres: { type: String, required: false },
        motivoFallecimientoHermanos: { type: String, required: false },
        motivoFallecimientoAbuelos: { type: String, required: false }
    },
    apellidoCargador: { type: String, required: true },
    nombreCargador: { type: String, required: true },
    matriculaCargador: { type: String, required: true }
});

module.exports = mongoose.model('Valoration', ValorationSchema);