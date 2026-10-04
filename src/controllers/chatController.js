const { responderChat } = require('../services/chatService');

const chat = async (req, res) => {
  try {
    const { mensaje, historial } = req.body;

    if (!mensaje || mensaje.trim() === '') {
      return res.status(400).json({ error: 'El mensaje es obligatorio' });
    }

    const resultado = await responderChat(mensaje, historial || []);

    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar el mensaje del chat' });
  }
};

module.exports = { chat };