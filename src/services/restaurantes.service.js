const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const rabbitmq = require('../config/rabbitmq');

// Só os campos que realmente existem no model Restaurante e que o cliente
// pode alterar. Isto evita que o Prisma rebente quando o front-end manda de
// volta o objeto inteiro (ex: com "id" ou com "pratos" incluídos do GET).
function filtrarCamposRestaurante(dados = {}) {
  const permitido = {};
  if (dados.nome !== undefined) permitido.nome = dados.nome;
  if (dados.restaurante_categoria !== undefined) permitido.restaurante_categoria = dados.restaurante_categoria;
  if (dados.descricao !== undefined) permitido.descricao = dados.descricao;
  if (dados.restaurante_telefone !== undefined) permitido.restaurante_telefone = dados.restaurante_telefone;
  if (dados.endereco !== undefined) permitido.endereco = dados.endereco;
  if (dados.status !== undefined) permitido.status = Number(dados.status);
  return permitido;
}

class RestaurantesService {

  // 1. Listar todos os restaurantes (GET /restaurantes)
  async listarTodos() {
    return await prisma.restaurante.findMany({
      where: { status: 1 } // Regra: Traz apenas os ativos
    });
  }

  // 2. Buscar por ID (GET /restaurantes/:id)
  async buscarPorId(id) {
    return await prisma.restaurante.findUnique({
      where: { id: parseInt(id) },
      include: { pratos: true } // Já aproveitamos e trazemos o cardápio!
    });
  }

  // 3. Inserir Restaurante (POST /restaurantes)
  async criar(dados) {
    const novoRestaurante = await prisma.restaurante.create({
      data: {
        nome: dados.nome,
        restaurante_categoria: dados.restaurante_categoria,
        descricao: dados.descricao,
        restaurante_telefone: dados.restaurante_telefone,
        endereco: dados.endereco,
        status: dados.status !== undefined ? Number(dados.status) : 1
      }
    });

    // =========================================================
    // MENSAGERIA (PRODUCER): RestauranteCriado
    // =========================================================
    // Dispara o Producer! Avisa o resto do sistema (ex: microsserviço de Pedidos)
    // que um novo restaurante acabou de ser cadastrado.
    // Nota: não usamos "await" aqui de propósito. A API não deve ficar lenta
    // (ou falhar) só porque o RabbitMQ está fora do ar — a mensagem é
    // "dispara e esquece" (fire-and-forget). Os erros de publicação já são
    // tratados e logados dentro do próprio RabbitMQService.
    rabbitmq.publicarMensagem('RestauranteCriado', novoRestaurante);
    // =========================================================

    return novoRestaurante;
  }

  // 4. Atualização Total (PUT /restaurantes/:id)
  async atualizar(id, dados) {
    return await prisma.restaurante.update({
      where: { id: parseInt(id) },
      data: {
        nome: dados.nome,
        restaurante_categoria: dados.restaurante_categoria,
        descricao: dados.descricao,
        restaurante_telefone: dados.restaurante_telefone,
        endereco: dados.endereco,
        status: Number(dados.status)
      }
    });
  }

  // 5. Atualização Parcial (PATCH /restaurantes/:id)
  async atualizarParcial(id, dados) {
    const dadosPermitidos = filtrarCamposRestaurante(dados);
    return await prisma.restaurante.update({
      where: { id: parseInt(id) },
      data: dadosPermitidos
    });
  }

  // 6. Exclusão Lógica - Soft Delete (DELETE /restaurantes/:id)
  async excluir(id) {
    // Conforme o teu documento, alteramos o status para 0 (inativo) em vez de apagar
    return await prisma.restaurante.update({
      where: { id: parseInt(id) },
      data: { status: 0 }
    });
  }
}

module.exports = new RestaurantesService();
