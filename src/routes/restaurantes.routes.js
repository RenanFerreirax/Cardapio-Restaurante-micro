const restaurantesController = require('../controllers/restaurantes.controller');
const { authenticateToken } = require("./middlewares/authenticateToken");

module.exports = (server) => {
  // Rotas para Restaurantes
  server.get('/restaurantes', authenticateToken, restaurantesController.listarTodos);
  server.get('/restaurantes/:id', authenticateToken, restaurantesController.buscarPorId);
  server.post('/restaurantes', authenticateToken, restaurantesController.criar);
  server.put('/restaurantes/:id', authenticateToken, restaurantesController.atualizar);
  server.patch('/restaurantes/:id', authenticateToken, restaurantesController.atualizarParcial);
  server.del('/restaurantes/:id', authenticateToken, restaurantesController.excluir);
};
