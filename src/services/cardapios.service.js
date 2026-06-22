const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const rabbitmq = require('../config/rabbitmq');

// Só os campos que realmente existem no model Prato e que o cliente pode
// alterar num PUT/PATCH. Evita que o Prisma rebente quando o front-end manda
// de volta o objeto inteiro (ex: com "categoria" ou "restaurante" incluídos
// do GET, que são objetos aninhados e não campos diretos da tabela).
function filtrarCamposPrato(dados = {}) {
  const permitido = {};
  if (dados.nome !== undefined) permitido.nome = dados.nome;
  if (dados.descricao !== undefined) permitido.descricao = dados.descricao;
  if (dados.preco !== undefined) permitido.preco = parseFloat(dados.preco);
  if (dados.disponibilidade !== undefined) permitido.disponibilidade = Number(dados.disponibilidade);
  if (dados.status !== undefined) permitido.status = Number(dados.status);
  if (dados.categoriaId !== undefined) permitido.categoriaId = parseInt(dados.categoriaId);
  if (dados.restauranteId !== undefined) permitido.restauranteId = parseInt(dados.restauranteId);
  return permitido;
}

class CardapiosService {

  // ==========================================================
  // PRATOS (CARDÁPIO)
  // ==========================================================

  // 1. Listar Pratos por Restaurante (GET /restaurantes/:restauranteId/pratos)
  async listarPorRestaurante(restauranteId) {
    return await prisma.prato.findMany({
      where: {
        restauranteId: parseInt(restauranteId),
        status: 1
      },
      include: {
        categoria: true // Traz a categoria do prato junto
      }
    });
  }

  // 2. Buscar Prato por ID (GET /pratos/:id)
  async buscarPratoPorId(id) {
    return await prisma.prato.findUnique({
      where: { id: parseInt(id) },
      include: { categoria: true, restaurante: true }
    });
  }

  // 3. Inserir Prato (POST /pratos)
  async criarPrato(dados) {
    const novoPrato = await prisma.prato.create({
      data: {
        nome: dados.nome,
        descricao: dados.descricao,
        preco: parseFloat(dados.preco),
        disponibilidade: dados.disponibilidade !== undefined ? Number(dados.disponibilidade) : 1,
        status: 1,
        categoriaId: parseInt(dados.categoriaId),
        restauranteId: parseInt(dados.restauranteId)
      }
    });

    // PRODUCER: Avisar outros microsserviços que o cardápio mudou!
    // Fire-and-forget: a resposta da API não fica refém do RabbitMQ.
    rabbitmq.publicarMensagem('CardapioAtualizado', {
      acao: 'NOVO_PRATO',
      prato: novoPrato
    });

    return novoPrato;
  }

  // 4. Atualizar Prato (PUT ou PATCH /pratos/:id)
  async atualizarPrato(id, dados) {
    const dadosPermitidos = filtrarCamposPrato(dados);

    const pratoAtualizado = await prisma.prato.update({
      where: { id: parseInt(id) },
      data: dadosPermitidos
    });

    // PRODUCER: Avisar sobre a atualização do prato ou preço
    rabbitmq.publicarMensagem('CardapioAtualizado', {
      acao: 'ATUALIZACAO_PRATO',
      prato: pratoAtualizado
    });

    // PRODUCER ESPECÍFICO: Se o prato ficar indisponível, avisa logo!
    if (dadosPermitidos.disponibilidade === 0 || dadosPermitidos.status === 0) {
      rabbitmq.publicarMensagem('ItemIndisponivel', {
        pratoId: pratoAtualizado.id,
        restauranteId: pratoAtualizado.restauranteId
      });
    }

    return pratoAtualizado;
  }

  // ==========================================================
  // CATEGORIAS DE PRATOS (Extra - Para gerir os Tipos de Comida)
  // ==========================================================

  async listarCategorias() {
    return await prisma.categoriaPrato.findMany({ where: { status: 1 } });
  }

  async criarCategoria(nome) {
    return await prisma.categoriaPrato.create({
      data: {
        nome: nome,
        status: 1
      }
    });
  }

  // 5. Excluir Prato (Soft Delete - DELETE /pratos/:id)
  async excluirPrato(id) {
    const pratoExcluido = await prisma.prato.update({
      where: { id: parseInt(id) },
      data: { status: 0, disponibilidade: 0 } // Fica inativo e indisponível
    });

    // Avisa a mensageria que o item saiu do cardápio!
    rabbitmq.publicarMensagem('ItemIndisponivel', {
      pratoId: pratoExcluido.id,
      restauranteId: pratoExcluido.restauranteId
    });

    return pratoExcluido;
  }
}

module.exports = new CardapiosService();
