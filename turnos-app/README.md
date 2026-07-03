# Libro de turnos

Página para cargar turnos de pacientes (nombre, apellido, DNI, obra social,
fecha y hora), con la fecha del formulario autocompletada al día de hoy.
Los turnos quedan guardados de forma permanente (Netlify Blobs) y se pueden
seguir agregando sin límite.

**Costo: $0.** Todo funciona dentro del plan gratuito de Netlify (hosting +
Functions + Blobs).

## Publicarlo en Netlify (una sola vez)

### Opción A — arrastrando la carpeta (la más rápida, sin usar la terminal)

1. Entrá a https://app.netlify.com y creá una cuenta gratis (podés usar GitHub, Google o email).
2. Andá a **Sites** → botón **Add new site** → **Deploy manually**.
3. Arrastrá la carpeta `turnos-app` completa (o comprimila y subila).
4. Esperá a que termine el deploy. Netlify te da una URL tipo `algo-al-azar.netlify.app`.

⚠️ Con "deploy manually" las Functions y Blobs también se activan solas, no
necesitás configurar nada aparte. Si en algún momento la agenda no carga,
mirá la sección "Si algo falla" más abajo.

### Opción B — conectando un repositorio de GitHub (recomendada si vas a seguir modificando el sitio)

1. Subí esta carpeta a un repositorio nuevo en GitHub.
2. En Netlify: **Add new site** → **Import an existing project** → elegí GitHub y el repositorio.
3. Netlify va a detectar solo la configuración (ya está en `netlify.toml`). Dale a **Deploy**.
4. Cada vez que hagas un cambio y lo subas a GitHub, el sitio se actualiza solo.

## Cómo se usa

- Entrá a tu URL de Netlify.
- Completá el formulario de la izquierda (la fecha ya viene puesta en el día de hoy).
- El turno aparece al instante en la agenda de la derecha, agrupado por día.
- Podés marcarlo como "Atendido", eliminarlo, o buscar por apellido/DNI.
- Podés abrir la página desde cualquier computadora o celular: todos ven la
  misma agenda, porque los datos se guardan en el servidor, no en el navegador.

## Si algo falla

- Si la agenda dice "No se pudo cargar la agenda": revisá en Netlify que el
  deploy haya sido de tipo Function-enabled (Opción A y B ya lo son por
  defecto) y que el archivo `netlify/functions/turnos.js` se haya subido.
- Si vas a seguir editando el proyecto en tu computadora y querés probarlo
  antes de subirlo, instalá Netlify CLI (`npm install -g netlify-cli`) y
  corré `netlify dev` adentro de la carpeta `turnos-app`.

## Estructura del proyecto

```
turnos-app/
├── netlify.toml              # config de Netlify
├── package.json              # dependencia @netlify/blobs
├── netlify/functions/
│   └── turnos.js             # API: crear, listar, editar, borrar turnos
└── public/
    ├── index.html            # formulario + agenda
    ├── styles.css
    └── app.js
```
