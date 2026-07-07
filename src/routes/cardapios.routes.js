const cardapiosController = require('../controllers/cardapios.controller');
const { authenticateToken } = require("./middlewares/authenticateToken");

module.exports = (server) => {
  // Rotas para Categorias de Pratos
  server.get('/categorias', authenticateToken,  cardapiosController.listarCategorias);
  server.post('/categorias', authenticateToken, cardapiosController.criarCategoria);

  // Rotas para Pratos (Cardápio)
  server.get('/restaurantes/:restauranteId/pratos', authenticateToken, cardapiosController.listarPorRestaurante);
  server.get('/pratos/:id', authenticateToken, cardapiosController.buscarPratoPorId);
  server.post('/pratos', authenticateToken, cardapiosController.criarPrato);
  server.put('/pratos/:id', authenticateToken, cardapiosController.actualizarPrato);
  server.patch('/pratos/:id', authenticateToken, cardapiosController.actualizarPrato);
  server.del('/pratos/:id', authenticateToken, cardapiosController.excluirPrato);
};
