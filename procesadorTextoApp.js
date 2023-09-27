const http = require('http');
const fs = require('fs');
const url = require('url');
const procesadorTexto = require('./procesadorTexto');

const server = http.createServer((req, res) => {
    const { pathname, query } = url.parse(req.url, true);

    if (pathname === '/') {
        const palabra = query.palabra ? query.palabra.replace(/_/g, ' ') : 'No se proporcionó una palabra';

        const resultado = {
            palabrasDivididas: procesadorTexto.dividirPalabras(palabra),
            cadenaExtraida: procesadorTexto.extraerCadena(palabra, 0, 8),
            textoSinEspacios: procesadorTexto.eliminarEspacios(palabra),
            capitalizado: procesadorTexto.capitalizar(palabra),
            minusculas: procesadorTexto.convertirMinusculas(palabra),
            mayusculas: procesadorTexto.convertirMayusculas(palabra),
            numCaracteres: procesadorTexto.contarCaracteres(palabra)
        };

        fs.readFile('./procesadorTexto.html', (err, html) => {
            if (err) {
                return enviarError(res, 500, 'Internal Server Error');
            }

            const finalHtml = insertarResultadosEnHTML(html.toString(), resultado);

            enviarRespuesta(res, 200, 'text/html', finalHtml);
        });
    } else {
        enviarError(res, 404, '404 Not Found');
    }
});

const PORT = 8083;
server.listen(PORT, () => {
    console.log(`Ejecutandose http://localhost:${PORT}/`);
});

function enviarError(res, statusCode, mensaje) {
    res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
    res.end(mensaje);
}

function enviarRespuesta(res, statusCode, contentType, data) {
    res.writeHead(statusCode, { 'Content-Type': contentType });
    res.write(data);
    res.end();
}

function insertarResultadosEnHTML(htmlString, resultado) {
    // Realiza el reemplazo de marcadores de posición
    for (const key in resultado) {
        const regex = new RegExp(`{${key}}`, 'g');
        htmlString = htmlString.replace(regex, resultado[key]);
    }
    return htmlString;
}
