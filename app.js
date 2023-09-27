const http = require('http');
const fs = require('fs').promises;
const { parse } = require('url');
const path = require('path');

const PORT = 8082;

// Función para calcular los días faltantes entre dos fechas.
function calcularDiasFaltantes(fecha) {
  const fechaActual = new Date();
  const fechaIngresada = new Date(fecha);
  const diferencia = fechaIngresada - fechaActual;
  const diasFaltantes = Math.floor(diferencia / (1000 * 60 * 60 * 24));

  return diasFaltantes;
}

// Función para obtener la hora actual en diferentes formatos.
function obtenerHora() {
  const ahora = new Date();
  const horaActual = ahora.toLocaleTimeString(); // Formato predeterminado
  const hora24 = ahora.toLocaleTimeString('en-US', { hour12: false });
  const hora12 = ahora.toLocaleTimeString('en-US', { hour12: true });

  return {
    horaActual: `Hora Actual (Formato Predeterminado): ${horaActual}`,
    hora24: `Hora 24 Horas: ${hora24}`,
    hora12: `Hora 12 Horas: ${hora12}`,
  };
}

const server = http.createServer(async (req, res) => {
  const { pathname } = parse(req.url, true);

  try {
    if (pathname === '/calcular') {
      if (req.method === 'GET') {
        // Mostrar el formulario HTML para ingresar una fecha.
        const data = await fs.readFile('formulario.html', 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      } else if (req.method === 'POST') {
        // Procesar el formulario cuando se envía una fecha.
        const body = [];

        req.on('data', (chunk) => {
          body.push(chunk);
        });

        req.on('end', () => {
          const formData = Buffer.concat(body).toString();
          const fechaIngresada = new URLSearchParams(formData).get('fecha');

          if (fechaIngresada) {
            const diasFaltantes = calcularDiasFaltantes(fechaIngresada);
            const mensaje = `Faltan ${diasFaltantes} días para la fecha ${fechaIngresada}`;

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<h1>${mensaje}</h1>`);
          } else {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Por favor, ingresa una fecha válida en el formulario.');
          }
        });
      }
    } else if (pathname === '/hora') {
      const rutaArchivo = path.join(__dirname, 'hora.html');
      
      try {
        const data = await fs.readFile(rutaArchivo, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data.replace('{horaActual}', obtenerHora().horaActual).replace('{hora24}', obtenerHora().hora24).replace('{hora12}', obtenerHora().hora12));
      } catch (error) {
        console.error('Error al leer el archivo "hora.html":', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error interno del servidor.');
      }
    
    } else if (pathname === '/inicio' || pathname === '/galeria') {
      const rutaMapeo = {
        '/inicio': 'inicio.html',
        '/galeria': 'galeria.html',
      };

      const rutaArchivo = path.join(__dirname, rutaMapeo[pathname]);
      const data = await fs.readFile(rutaArchivo, 'utf8');

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Página no encontrada');
    }
  } catch (error) {
    console.error('Error interno del servidor:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Error interno del servidor.');
  }
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
