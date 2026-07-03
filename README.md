Libro de Turnos

Aplicación web para la gestión de turnos de pacientes: carga, edición, seguimiento de estado y búsqueda, con persistencia en la nube y despliegue gratuito en Netlify.

Demo: https://sistema-pacientes-turnos.netlify.app


*INDICE


Características
Stack técnico
Estructura del proyecto
Instalación y desarrollo local
Despliegue en Netlify
Documentación de la API
Modelo de datos
Costos
Solución de problemas
Roadmap
Licencia



*CARACTERISTICAS


Alta de turnos con nombre, apellido, DNI, obra social, fecha, hora y motivo (opcional).
Fecha y hora autocompletadas al momento actual, editables para turnos futuros.
Edición en línea: corregir un turno cargado sin necesidad de eliminarlo y volver a crearlo.
Cambio de estado (pendiente / atendido) con un clic.
Eliminación con confirmación, para evitar borrados accidentales.
Búsqueda por apellido o DNI y filtro por estado.
Panel de estadísticas en tiempo real: turnos del día, pendientes, atendidos y total histórico.
Validación de campos en vivo, con mensajes claros orientados a usuarios sin conocimientos técnicos.
Notificaciones no bloqueantes (toasts) para cada acción realizada.
Datos persistentes y compartidos: cualquier persona que entre a la URL ve y edita la misma agenda, sin necesidad de una base de datos externa.
Diseño responsive, accesible (foco visible, aria-label, prefers-reduced-motion) y sin dependencias de frameworks pesados.

*ESTRUCTURA DEL PROYECTO

turnos-app/
├── netlify.toml                  
├── package.json                  
├── README.md
├── netlify/
│   └── functions/
│       └── turnos.js             
└── public/
    ├── index.html                
    ├── styles.css               
    └── app.js                   
