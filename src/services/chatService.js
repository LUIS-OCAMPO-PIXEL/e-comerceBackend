const Groq = require('groq-sdk');
const productoModel = require('../models/productoModel');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const tools = [
  {
    type: 'function',
    function: {
      name: 'buscar_productos',
      description: 'Busca productos en el catálogo por nombre o categoría. Úsalo cuando el cliente pregunte si tienen cierto producto o categoría.',
      parameters: {
        type: 'object',
        properties: {
          termino: { type: 'string', description: 'Palabra clave para buscar en nombre o descripción del producto' },
        },
        required: ['termino'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'obtener_detalle_producto',
      description: 'Obtiene el detalle completo de un producto específico por su id.',
      parameters: {
        type: 'object',
        properties: {
          producto_id: { type: 'integer', description: 'El id del producto' },
        },
        required: ['producto_id'],
      },
    },
  },
];

async function ejecutarHerramienta(nombre, args) {
  if (nombre === 'buscar_productos') {
    const productos = await productoModel.obtenerProductos();
    const termino = args.termino.toLowerCase();
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(termino) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(termino)) ||
        (p.categoria_nombre && p.categoria_nombre.toLowerCase().includes(termino))
    );
  }

  if (nombre === 'obtener_detalle_producto') {
    return await productoModel.obtenerProductoPorId(args.producto_id);
  }

  return { error: 'Herramienta no reconocida' };
}

async function responderChat(mensajeUsuario, historial = []) {
  const mensajes = [
    {
      role: 'system',
      content: 'Eres un asistente de ventas de un ecommerce de tecnología. Responde de forma breve y amable. Usa las herramientas disponibles para consultar el catálogo real antes de afirmar si algo existe o su precio — nunca inventes productos o precios.',
    },
    ...historial,
    { role: 'user', content: mensajeUsuario },
  ];

  let respuesta = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: mensajes,
    tools,
  });

  let mensajeRespuesta = respuesta.choices[0].message;

  // Mientras el modelo quiera usar herramientas, se las ejecutamos
  while (mensajeRespuesta.tool_calls && mensajeRespuesta.tool_calls.length > 0) {
    mensajes.push(mensajeRespuesta);

    for (const toolCall of mensajeRespuesta.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments);
      const resultado = await ejecutarHerramienta(toolCall.function.name, args);

      mensajes.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(resultado),
      });
    }

    respuesta = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: mensajes,
      tools,
    });

    mensajeRespuesta = respuesta.choices[0].message;
  }

  return {
    respuesta: mensajeRespuesta.content,
    historialActualizado: [...mensajes.slice(1), mensajeRespuesta], // slice(1) quita el system prompt del historial visible
  };
}

module.exports = { responderChat };