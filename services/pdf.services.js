const PDFDocument = require("../utils/pdfkit-tables");
const { leerEnergiaMedidoresByMes } = require("./medidores.services");

const cargarEnergia = async(serial) => {
    const mes = new Date().getMonth() + 1
    const mesActual = await leerEnergiaMedidoresByMes(serial, mes)
    const mesAnterior = await leerEnergiaMedidoresByMes(serial, mes - 1)

    return [...mesActual, ...mesAnterior];
}

const buildPDF = async(serialMedidor, dataCallback, endCallback) => {
    const fechaAtual = new Date();
    const energias = await cargarEnergia(serialMedidor)

    const doc = new PDFDocument();
    doc.on('data', dataCallback);
    doc.on('end', endCallback);

    doc
        .image("logo.jpg", 30, 45, { width: 50 })
        .fillColor("#444444")
        .fontSize(20)
        .text("Medidores_RF_Conexión_simétrica.", 100, 57)
        .fontSize(10)
        .text("725 Fowler Avenue", 200, 65, { align: "right" })
        .text("Chamblee, GA 30341", 200, 80, { align: "right" })
        .moveDown();

    const table = {
        headers: ["Item", "Descripción", "Valor", , , , , , ],
        rows: []
    };

    table.rows.push(['1', 'Medidor No.', serialMedidor], ['2', 'Fecha', fechaAtual.toLocaleDateString('en-US')], ['3', 'Hora', `${fechaAtual.getHours()} : ${fechaAtual.getMinutes()}`], ["4", "Uso horario", "Valores totales", "TA", "TB", "TC", "TD", ])

    for (const [i, energia] of energias.entries()) {
        table.rows.push([i + 5, energia.ParamName, energia.DataVal, energia.ParamName, energia.TB, energia.TC, energia.TD, energia.medida])
    }

    doc.moveDown().table(table, 10, 125, { width: 590 });

    // const table1 = {
    //     headers: ["4", "Uso horario", "Valores totales", "TA", "TB", "TC", ],
    //     rows: []
    // };
    // table1.rows.push(['4', 'Uso horario', serialMedidor], ['2', 'Fecha', Date.now()])
    // doc.moveDown().table(table1, 10, 250, { width: 590 });

    doc.end();
}


module.exports = {
    buildPDF
}