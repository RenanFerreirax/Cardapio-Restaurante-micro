const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 A iniciar o Seed...');

  // 1. Criar Categorias de Pratos
  const catItaliana = await prisma.categoriaPrato.create({ data: { nome: 'Italiana', status: 1 } });
  const catBrasileira = await prisma.categoriaPrato.create({ data: { nome: 'Brasileira', status: 1 } });
  const catLanches = await prisma.categoriaPrato.create({ data: { nome: 'Lanches', status: 1 } });

  // 2. Criar Restaurantes
  const rest1 = await prisma.restaurante.create({
    data: {
      nome: 'Pizzaria Bella Napoli',
      descricao: 'As melhores pizzas em forno de lenha.',
      endereco: 'Rua das Flores, 123',
      status: 1
    }
  });

  const rest2 = await prisma.restaurante.create({
    data: {
      nome: 'Churrascaria Fogo Forte',
      descricao: 'Rodízio completo de carnes nobres.',
      endereco: 'Avenida Central, 450',
      status: 1
    }
  });

  // 3. Criar Pratos (Cardápio)
  await prisma.prato.createMany({
    data: [
      { nome: 'Pizza Margherita', descricao: 'Queijo, tomate e manjericão', preco: 45.50, categoriaId: catItaliana.id, restauranteId: rest1.id, disponibilidade: 1, status: 1 },
      { nome: 'Pizza Calabresa', descricao: 'Calabresa com cebola', preco: 49.90, categoriaId: catItaliana.id, restauranteId: rest1.id, disponibilidade: 1, status: 1 },
      { nome: 'Picanha na Chapa', descricao: 'Acompanha arroz, farofa e fritas', preco: 120.00, categoriaId: catBrasileira.id, restauranteId: rest2.id, disponibilidade: 1, status: 1 }
    ]
  });

  console.log('✅ Base de dados populada com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });