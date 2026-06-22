const restaurantesController = require('../controllers/restaurantes.controller');

module.exports = (server) => {
  // Rotas para Restaurantes
  server.get('/restaurantes', restaurantesController.listarTodos);
  server.get('/restaurantes/:id', restaurantesController.buscarPorId);
  server.post('/restaurantes', restaurantesController.criar);
  server.put('/restaurantes/:id', restaurantesController.atualizar);
  server.patch('/restaurantes/:id', restaurantesController.atualizarParcial);
  server.del('/restaurantes/:id', restaurantesController.excluir);
};