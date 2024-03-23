const { ObjectId } = require('mongoose').Types;

const { Usuario, Role, Concentrador, Medidor, TipoPago, Region, GrupoConsumo, Empresa, Cliente, Provincia, Parroquia, Canton, Barrio, Ciudad, Transformador, Frecuencia, ModeloMedidores, Vivienda, MedidorTapaAperturaHistroico } = require('../models');

const mediumRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const emailExistente = async(correo) => {
    existeEmail = await Usuario.findOne({ correo })
    if (existeEmail) {
        throw new Error(`El correo: ${correo}, ya está registrado`);
    }
}
const cedulaExiste = async(cedula) => {
    existe = await Cliente.findOne({ cedula })
    if (existe) {
        throw new Error(`El usuasrio con cédula: ${cedula}, ya está registrado`);
    }
}
const cedulaCliente = async(cedula) => {
    existe = await Cliente.findOne({ cedula })
    if (!existe) {
        throw new Error(`El usuasrio con cédula: ${cedula}, no existe`);
    }
}

const esPasswordCorrecto = (password) => {
    if (!mediumRegex.test(password)) {
        throw new Error('La contraseña debe tener al menos 8 caracteres, una letra mayuscula y minuscula, un número, un caracter especial y no puede contener espacios.');
    } else {
        return true;
    }
}

const esEmpresaValida = (id) => {
    if (!id) return true
    empresaExiste(id)
}

const rolNombreExistente = async(role = '') => {
    const existeRol = await Role.findOne({ role });
    if (!existeRol) {
        throw new Error(`El rol ${role} no existe`)

    }
}

const rolExistente = async(id) => {
    const existeRol = await Role.findById(id);
    if (!existeRol) {
        throw new Error(`El rol: ${role} no existe`)

    }
}

const usuarioExiste = async(id) => {
    existeUser = await Usuario.findById(id)
    if (!existeUser) {
        throw new Error(`El usuario con id: ${id} no existe`)
    }

}
const clienteExiste = async(id) => {
    existeUser = await Cliente.findById(id)
    if (!existeUser) {
        throw new Error(`El id: ${id} no existe`)
    }

}

const transformadorExiste = async(id) => {
    existe = await Transformador.findById(id)
    if (!existe) {
        throw new Error(`El id: ${id} no existe`)
    }

}
const transformadorOpcionalExiste = async(id) => {
    const isMongoId = ObjectId.isValid(id)
    if (!id || !isMongoId) return;
    existe = await Transformador.findById(id)
    if (!existe) {
        throw new Error(`El id: ${id} no existe`)
    }

}
const concentradorExiste = async(id) => {
    existeConcentrador = await Concentrador.findById(id)
    if (!existeConcentrador) {
        throw new Error(`El id: ${id} no existe`)
    }

}
const medidorExiste = async(id) => {
    existeMedidor = await Medidor.findById(id)
    if (!existeMedidor) {
        throw new Error(`El id: ${id} no existe`)
    }
}

const serialMedidorExiste = async(serial) => {
    existeMedidor = await Medidor.findOne({ serial: serial })
    if (!existeMedidor) {
        throw new Error(`El serial: ${id} no existe`)
    }
}

const tipoPagoExiste = async(id) => {
    existeTipoPago = await TipoPago.findById(id)
    if (!existeTipoPago) {
        throw new Error(`El id: ${id} no existe`)
    }

}
const regionExiste = async(id) => {
    existe = await Region.findById(id)
    if (!existe) {
        throw new Error(`El id: ${id} no existe`)
    }

}
const provinciaExiste = async(id) => {
    existe = await Provincia.findById(id)
    if (!existe) {
        throw new Error(`El id: ${id} no existe`)
    }
}
const viviendaExiste = async(id) => {
    existe = await Vivienda.findById(id)
    if (!existe) {
        throw new Error(`El id: ${id} no existe`)
    }
}
const ciudadExiste = async(id) => {
    existe = await Ciudad.findById(id)
    if (!existe) {
        throw new Error(`El id: ${id} no existe`)
    }
}
const parroquiaExiste = async(id) => {
    existe = await Parroquia.findById(id)
    if (!existe) {
        throw new Error(`El id: ${id} no existe`)
    }
}
const cantonExiste = async(id) => {
    existe = await Canton.findById(id)
    if (!existe) {
        throw new Error(`El id: ${id} no existe`)
    }
}
const barrioExiste = async(id) => {
    existe = await Barrio.findById(id)
    if (!existe) {
        throw new Error(`El id: ${id} no existe`)
    }
}
const frecuenciaExiste = async(id) => {
    existe = await Frecuencia.findById(id)
    if (!existe) {
        throw new Error(`El id: ${id} no existe`)
    }
}



const grupoConsumoExiste = async(id) => {
    existe = await GrupoConsumo.findById(id)
    if (!existe) {
        throw new Error(`El id: ${id} no existe`)
    }

}
const empresaExiste = async(id) => {
    existe = await Empresa.findById(id)
    if (!existe) {
        throw new Error(`El id: ${id} no existe`)
    }
}
const modeloExiste = async(id) => {
    existe = await ModeloMedidores.findById(id)
    if (!existe) {
        throw new Error(`El id: ${id} no existe`)
    }
}

const empresaOpcionalExiste = async(id) => {
    const isMongoId = ObjectId.isValid(id)
    if (!id || !isMongoId) return;
    existe = await Empresa.findById(id)
    if (!existe) {
        throw new Error(`El id: ${id} no existe`)
    }
}

const verificarCedula = (cedula) => {
    if (typeof cedula == "string" && cedula.length == 10 && /^\d+$/.test(cedula)) {
        var digitos = cedula.split("").map(Number);
        var codigo_provincia = digitos[0] * 10 + digitos[1];

        //if (codigo_provincia >= 1 && (codigo_provincia <= 24 || codigo_provincia == 30) && digitos[2] < 6) {

        if (codigo_provincia >= 1 && (codigo_provincia <= 24 || codigo_provincia == 30)) {
            var digito_verificador = digitos.pop();

            var digito_calculado =
                digitos.reduce(function(valorPrevio, valorActual, indice) {
                    return valorPrevio - ((valorActual * (2 - (indice % 2))) % 9) - (valorActual == 9) * 9;
                }, 1000) % 10;
            if (digito_calculado !== digito_verificador) {
                throw new Error(`La cedula: ${cedula} es incorrecta`);
            }
            return true;
        }
    }
    throw new Error(`La cedula: ${cedula} debe tener 10 numeros`);
};

const aperturaTapasExiste = async(id) => {
    existe = await MedidorTapaAperturaHistroico.findById(id)
    if (!existe) {
        throw new Error(`El id: ${id} no existe`)
    }
}

const validarMes = (mes) => {
    const numeroMes = parseInt(mes, 10);
    if (numeroMes >= 1 && numeroMes <= 12) {
        // El mes es válido
        return true;
    } else {
        // El mes no es válido, lanzar un error
        throw new Error(`El mes ${numeroMes} no válido. Debe estar entre 1 y 12.`);
    }
}

module.exports = {
    emailExistente,
    esPasswordCorrecto,
    rolNombreExistente,
    usuarioExiste,
    rolExistente,
    concentradorExiste,
    medidorExiste,
    tipoPagoExiste,
    regionExiste,
    grupoConsumoExiste,
    empresaExiste,
    esEmpresaValida,
    verificarCedula,
    clienteExiste,
    cedulaExiste,
    provinciaExiste,
    ciudadExiste,
    parroquiaExiste,
    cantonExiste,
    barrioExiste,
    transformadorExiste,
    empresaOpcionalExiste,
    transformadorOpcionalExiste,
    frecuenciaExiste,
    cedulaCliente,
    modeloExiste,
    viviendaExiste,
    serialMedidorExiste,
    aperturaTapasExiste,
    validarMes

}