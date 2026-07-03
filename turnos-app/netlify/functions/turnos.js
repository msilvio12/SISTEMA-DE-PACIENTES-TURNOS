import { getStore } from "@netlify/blobs";

const KEY = "turnos.json";

function ordenar(data) {
  return data.sort((a, b) => {
    const fa = new Date(`${a.fecha}T${a.hora || "00:00"}`);
    const fb = new Date(`${b.fecha}T${b.hora || "00:00"}`);
    return fa - fb;
  });
}

export default async (req) => {
  const store = getStore("turnos-store");

  try {
    if (req.method === "GET") {
      const data = (await store.get(KEY, { type: "json" })) || [];
      return Response.json(ordenar(data));
    }

    if (req.method === "POST") {
      const nuevo = await req.json();

      if (!nuevo.nombre || !nuevo.apellido || !nuevo.dni || !nuevo.fecha || !nuevo.hora) {
        return Response.json(
          { error: "Faltan datos obligatorios (nombre, apellido, DNI, fecha, hora)." },
          { status: 400 }
        );
      }

      const data = (await store.get(KEY, { type: "json" })) || [];
      nuevo.id = crypto.randomUUID();
      nuevo.estado = nuevo.estado || "pendiente";
      nuevo.creado = new Date().toISOString();
      data.push(nuevo);
      await store.setJSON(KEY, ordenar(data));
      return Response.json(nuevo, { status: 201 });
    }

    if (req.method === "PUT") {
      const cambios = await req.json();
      if (!cambios.id) {
        return Response.json({ error: "Falta el id del turno a actualizar." }, { status: 400 });
      }
      const data = (await store.get(KEY, { type: "json" })) || [];
      const idx = data.findIndex((t) => t.id === cambios.id);
      if (idx === -1) {
        return Response.json({ error: "Turno no encontrado." }, { status: 404 });
      }
      data[idx] = { ...data[idx], ...cambios };
      await store.setJSON(KEY, ordenar(data));
      return Response.json(data[idx]);
    }

    if (req.method === "DELETE") {
      const { id } = await req.json();
      const data = (await store.get(KEY, { type: "json" })) || [];
      const filtrado = data.filter((t) => t.id !== id);
      await store.setJSON(KEY, filtrado);
      return new Response(null, { status: 204 });
    }

    return Response.json({ error: "Método no permitido." }, { status: 405 });
  } catch (err) {
    return Response.json({ error: "Error interno: " + err.message }, { status: 500 });
  }
};

export const config = { path: "/api/turnos" };
