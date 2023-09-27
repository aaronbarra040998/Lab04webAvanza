const http = require('http');
const fs = require('fs');
const url = require('url');
const { suma, resta, multiplicacion, division } = require('./calculadora');

const server = http.createServer((req, res) => {
    const { pathname, query } = url.parse(req.url, true);

    if (pathname === '/') {
        const { operacion, num1, num2 } = query;
        const num1Float = parseFloat(num1);
        const num2Float = parseFloat(num2);

        let resultado;

        switch (operacion) {
            case 'suma':
                resultado = suma(num1Float, num2Float);
                break;
            case 'resta':
                resultado = resta(num1Float, num2Float);
                break;
            case 'multiplicacion':
                resultado = multiplicacion(num1Float, num2Float);
                break;
            case 'division':
                resultado = division(num1Float, num2Float);
                break;
            default:
                resultado = 'Operación no válida';
        }

        fs.readFile('./calculadora.html', (err, html) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
                return;
            }

            const htmlString = html.toString().replace('{resultado}', `Resultado de la ${operacion}: ${resultado}`);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(htmlString);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

const PORT = 8081;
server.listen(PORT, () => {
    console.log(`Ejecutandose http://localhost:${PORT}/`);
});
