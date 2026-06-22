const cardapiosController = require('../controllers/cardapios.controller');

module.exports = (server) => {
  // Rotas para Categorias de Pratos
  server.get('/categorias', cardapiosController.listarCategorias);
  server.post('/categorias', cardapiosController.criarCategoria);

  // Rotas para Pratos (Cardápio)
  server.get('/restaurantes/:restauranteId/pratos', cardapiosController.listarPorRestaurante);
  server.get('/pratos/:id', cardapiosController.buscarPratoPorId);
  server.post('/pratos', cardapiosController.criarPrato);
  server.put('/pratos/:id', cardapiosController.actualizarPrato);
  server.patch('/pratos/:id', cardapiosController.actualizarPrato);
  server.del('/pratos/:id', cardapiosController.excluirPrato);
};