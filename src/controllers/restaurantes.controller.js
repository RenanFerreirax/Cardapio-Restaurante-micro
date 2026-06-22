const restaurantesService = require('../services/restaurantes.service');

// Pequeno helper para validar o :id da rota antes de ir ao banco
function parseIdOuNull(valor) {
  const id = parseInt(valor, 10);
  return Number.isNaN(id) ? null : id;
}

class RestaurantesController {

  // 1. Listar todos os restaurantes (GET /restaurantes)
  // IMPORTANTE: no Restify 11, handlers async devem ter NO MÁXIMO 2 argumentos
  // (req, res). Não se usa "next" aqui — o Restify chama o próximo handler
  // sozinho assim que a Promise resolve. Se declarares "next" num handler
  // async, o servidor quebra logo no arranque (ERR_ASSERTION).
  async listarTodos(req, res) {
    try {
      const restaurantes = await restaurantesService.listarTodos();
      res.send(200, restaurantes);
    } catch (erro) {
      res.send(500, { erro: 'Erro ao listar restaurantes', detalhes: erro.message });
    }
  }

  // 2. Procurar restaurante por ID (GET /restaurantes/:id)
  async buscarPorId(req, res) {
    try {
      const id = parseIdOuNull(req.params.id);
      if (id === null) {
        res.send(400, { erro: 'O id do restaurante tem de ser um número.' });
        return;
      }

      const restaurante = await restaurantesService.buscarPorId(id);

      if (!restaurante) {
        res.send(404, { erro: 'Restaurante não encontrado' });
        return;
      }

      res.send(200, restaurante);
    } catch (erro) {
      res.send(500, { erro: 'Erro ao procurar restaurante', detalhes: erro.message });
    }
  }

  // 3. Criar novo restaurante (POST /restaurantes)
  async criar(req, res) {
    try {
      const { nome, endereco } = req.body || {};

      // Validação simples obrigatória
      if (!nome || !endereco) {
        res.send(400, { erro: 'Os campos "nome" e "endereco" são obrigatórios.' });
        return;
      }

      const novoRestaurante = await restaurantesService.criar(req.body);
      res.send(201, novoRestaurante); // 201 Created
    } catch (erro) {
      res.send(400, { erro: 'Erro ao criar restaurante', detalhes: erro.message });
    }
  }

  // 4. Atualizar todos os dados do restaurante (PUT /restaurantes/:id)
  async atualizar(req, res) {
    try {
      const id = parseIdOuNull(req.params.id);
      if (id === null) {
        res.send(400, { erro: 'O id do restaurante tem de ser um número.' });
        return;
      }

      const { nome, endereco, status } = req.body || {};

      if (!nome || !endereco || status === undefined) {
        res.send(400, { erro: 'Todos os campos são obrigatórios no PUT.' });
        return;
      }

      const restauranteAtualizado = await restaurantesService.atualizar(id, req.body);
      res.send(200, restauranteAtualizado);
    } catch (erro) {
      if (erro.code === 'P2025') {
        res.send(404, { erro: 'Restaurante não encontrado' });
        return;
      }
      res.send(400, { erro: 'Erro ao atualizar restaurante', detalhes: erro.message });
    }
  }

  // 5. Atualizar dados parcialmente (PATCH /restaurantes/:id)
  async atualizarParcial(req, res) {
    try {
      const id = parseIdOuNull(req.params.id);
      if (id === null) {
        res.send(400, { erro: 'O id do restaurante tem de ser um número.' });
        return;
      }

      const restauranteAtualizado = await restaurantesService.atualizarParcial(id, req.body || {});
      res.send(200, restauranteAtualizado);
    } catch (erro) {
      if (erro.code === 'P2025') {
        res.send(404, { erro: 'Restaurante não encontrado' });
        return;
      }
      res.send(400, { erro: 'Erro ao atualizar parcialmente o restaurante', detalhes: erro.message });
    }
  }

  // 6. Eliminar restaurante - Soft Delete (DELETE /restaurantes/:id)
  async excluir(req, res) {
    try {
      const id = parseIdOuNull(req.params.id);
      if (id === null) {
        res.send(400, { erro: 'O id do restaurante tem de ser um número.' });
        return;
      }

      await restaurantesService.excluir(id);
      res.send(200, { mensagem: 'Restaurante desativado com sucesso (status 0).' });
    } catch (erro) {
      if (erro.code === 'P2025') {
        res.send(404, { erro: 'Restaurante não encontrado' });
        return;
      }
      res.send(400, { erro: 'Erro ao desativar restaurante', detalhes: erro.message });
    }
  }
}

module.exports = new RestaurantesController();
