const proj4 = require('proj4');

proj4.defs("EPSG:32717", "+proj=utm +zone=17 +south +datum=WGS84 +units=m +no_defs");

function convertirLatLongUTM(latitud, longitud) {

    try {
        // Define la proyección para WGS84 (latitud/longitud)
        const fromProjection = 'EPSG:4326';

        const zonaUTM = Math.floor((longitud + 180) / 6) + 1;
        // Define la proyección para UTM
        const toProjection = 'EPSG:32717'; // Por ejemplo, UTM zona 33N

        // Convierte las coordenadas
        const utmCoordinates = proj4(fromProjection, toProjection, [longitud, latitud]);

        // Devuelve un objeto con las coordenadas UTM
        return {
            easting: utmCoordinates[0],
            northing: utmCoordinates[1],
            zone: zonaUTM
        };
    } catch (error) {
        console.error('Error al convertir coordenadas:', error);

    }
}




module.exports = {
    convertirLatLongUTM
}