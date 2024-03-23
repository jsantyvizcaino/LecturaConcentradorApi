const Server = require("./server");
const Usuario = require("./usuario");
const Role = require("./role");
const Concentrador = require("./concentrador");
const Medidor = require('./medidor');
const TipoPago = require("./tipo-pago");
const Historico = require("./historico");
const Region = require("./region");
const TablaPagos = require("./tabla-pagos");
const GrupoConsumo = require("./grupo-consumo");
const Empresa = require("./empresa");
const Cliente = require("./cliente");
const Provincia = require("./provincia");
const Ciudad = require("./ciudad");
const Parroquia = require("./parroquia");
const Canton = require("./canton");
const Barrio = require("./barrio");
const Transformador = require("./transformador");
const Frecuencia = require("./frecuencia");
const ParametrosMedidor = require("./parametros-medidor");
const EnergiasMedidor = require("./energias-medidor");
const EnergiasHistorico = require("./energia-historico-mensual");
const ModeloMedidores = require("./modelo-medidores");
const HistoricoMedidoresMensual = require("./graficas-historico-mensual");
const MedidorTapaAperturaHistroico = require("./medidor-tapa-apertura-historico");
const Vivienda = require("./vivienda");
const AperturaMedidor = require("./apertura-tapa");









module.exports = {

    Server,
    Usuario,
    Role,
    Concentrador,
    Medidor,
    TipoPago,
    Historico,
    Region,
    TablaPagos,
    GrupoConsumo,
    Empresa,
    Cliente,
    Provincia,
    Ciudad,
    Parroquia,
    Canton,
    Barrio,
    Transformador,
    Frecuencia,
    ParametrosMedidor,
    EnergiasMedidor,
    EnergiasHistorico,
    ModeloMedidores,
    HistoricoMedidoresMensual,
    Vivienda,
    MedidorTapaAperturaHistroico,
    AperturaMedidor


}