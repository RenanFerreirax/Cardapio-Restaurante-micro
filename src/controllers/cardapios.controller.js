const cardapiosService = require('../services/cardapios.service');

// Pequeno helper para validar :id antes de ir ao banco
function parseIdOuNull(valor) {
  const id = parseInt(valor, 10);
  return Number.isNaN(id) ? null : id;
}

class CardapiosController {

  // ==========================================================
  // OPERAÇÕES DE PRATOS
  // ==========================================================

  // 1. Listar pratos de um restaurante (GET /restaurantes/:restauranteId/pratos)
  async listarPorRestaurante(req, res) {
    try {
      const restauranteId = parseIdOuNull(req.params.restauranteId);
      if (restauranteId === null) {
        res.send(400, { erro: 'O id do restaurante tem de ser um número.' });
        return;
      }

      const pratos = await cardapiosService.listarPorRestaurante(restauranteId);
      res.send(200, pratos);
    } catch (erro) {
      res.send(500, { erro: 'Erro ao listar cardápio', detalhes: erro.message });
    }
  }

  // 2. Procurar prato específico por ID (GET /pratos/:id)
  async buscarPratoPorId(req, res) {
    try {
      const id = parseIdOuNull(req.params.id);
      if (id === null) {
        res.send(400, { erro: 'O id do prato tem de ser um número.' });
        return;
      }

      const prato = await cardapiosService.buscarPratoPorId(id);

      if (!prato) {
        res.send(404, { erro: 'Prato não encontrado' });
        return;
      }

      res.send(200, prato);
    } catch (erro) {
      res.send(500, { erro: 'Erro ao procurar prato', detalhes: erro.message });
    }
  }

  // 3. Criar novo prato no cardápio (POST /pratos)
  async criarPrato(req, res) {
    try {
      const { nome, preco, categoriaId, restauranteId } = req.body || {};

      // Nota: usar "=== undefined" em vez de "!preco", porque um prato com
      // preço 0 (ex: cortesia) é um valor válido e "!0" daria falso positivo.
      if (!nome || preco === undefined || preco === null || !categoriaId || !restauranteId) {
        res.send(400, { erro: 'Campos obrigatórios em falta: nome, preco, categoriaId, restauranteId.' });
        return;
      }

      if (Number.isNaN(parseFloat(preco))) {
        res.send(400, { erro: 'O campo "preco" tem de ser um número.' });
        return;
      }

      const novoPrato = await cardapiosService.criarPrato(req.body);
      res.send(201, novoPrato);
    } catch (erro) {
      if (erro.code === 'P2003') {
        res.send(400, { erro: 'categoriaId ou restauranteId não existem.' });
        return;
      }
      res.send(400, { erro: 'Erro ao criar prato', detalhes: erro.message });
    }
  }

  // 4. Atualizar prato (PUT /pratos/:id)
  async actualizarPrato(req, res) {
    try {
      const id = parseIdOuNull(req.params.id);
      if (id === null) {
        res.send(400, { erro: 'O id do prato tem de ser um número.' });
        return;
      }

      const pratoAtualizado = await cardapiosService.atualizarPrato(id, req.body || {});
      res.send(200, pratoAtualizado);
    } catch (erro) {
      if (erro.code === 'P2025') {
        res.send(404, { erro: 'Prato não encontrado' });
        return;
      }
      res.send(400, { erro: 'Erro ao atualizar prato', detalhes: erro.message });
    }
  }

  // 5. Eliminar prato - Soft Delete (DELETE /pratos/:id)
  async excluirPrato(req, res) {
    try {
      const id = parseIdOuNull(req.params.id);
      if (id === null) {
        res.send(400, { erro: 'O id do prato tem de ser um número.' });
        return;
      }

      await cardapiosService.excluirPrato(id);
      res.send(200, { mensagem: 'Prato desativado do cardápio com sucesso.' });
    } catch (erro) {
      if (erro.code === 'P2025') {
        res.send(404, { erro: 'Prato não encontrado' });
        return;
      }
      res.send(400, { erro: 'Erro ao desativar prato', detalhes: erro.message });
    }
  }

  // ==========================================================
  // OPERAÇÕES DE CATEGORIAS
  // ==========================================================

  // 6. Listar todas as categorias (GET /categorias)
  async listarCategorias(req, res) {
    try {
      const categorias = await cardapiosService.listarCategorias();
      res.send(200, categorias);
    } catch (erro) {
      res.send(500, { erro: 'Erro ao listar categorias', detalhes: erro.message });
    }
  }

  // 7. Criar nova categoria (POST /categorias)
  async criarCategoria(req, res) {
    try {
      const { nome } = req.body || {};

      if (!nome) {
        res.send(400, { erro: 'O nome da categoria é obrigatório.' });
        return;
      }

      const novaCategoria = await cardapiosService.criarCategoria(nome);
      res.send(201, novaCategoria);
    } catch (erro) {
      res.send(400, { erro: 'Erro ao criar categoria', detalhes: erro.message });
    }
  }
}

module.exports = new CardapiosController();
