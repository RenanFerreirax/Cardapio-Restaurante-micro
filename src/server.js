require('dotenv').config(); // Carrega as variáveis de ambiente ANTES de tudo o resto
const restify = require('restify');
const rabbitmq = require('./config/rabbitmq');

// Inicializa o servidor Restify
const server = restify.createServer({
  name: 'Microservico-Restaurantes-Cardapios',
  version: '1.0.0'
});

// Plugins essenciais do Restify
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser()); // Permite receber JSON no req.body

// ---------------------------------------------------------------
// CORS simples para testes locais (ex: front-end noutra porta/origem).
// Usa server.pre() (não server.use()) porque o pedido OPTIONS de
// preflight não está registado como rota — server.use() só corre depois
// do roteamento encontrar uma rota, e o Restify devolveria 405 antes de
// lá chegar. server.pre() corre ANTES do roteamento.
// Antes de entregar/publicar no servidor da faculdade, troca o '*' pela
// origem real do front-end se a disciplina pedir mais rigor.
// ---------------------------------------------------------------
server.pre((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.send(204);
    return;
  }
  return next();
});

// Importa e regista as rotas
const rotasRestaurantes = require('./routes/restaurantes.routes');
const rotasCardapios = require('./routes/cardapios.routes');

rotasRestaurantes(server);
rotasCardapios(server);

// Rota de Teste Simples (Health Check)
server.get('/ping', (req, res, next) => {
  res.send(200, { status: 'Servidor online!', data: new Date() });
  return next();
});

// ---------------------------------------------------------------
// Rota não encontrada (404) com resposta em JSON, em vez do HTML
// padrão do Restify
// ---------------------------------------------------------------
server.on('NotFound', (req, res) => {
  res.send(404, { erro: `Rota não encontrada: ${req.method} ${req.url}` });
});

// ---------------------------------------------------------------
// Apanha erros não tratados que escapem dos try/catch dos controllers,
// para nunca devolver uma página de erro crua ao cliente.
// ---------------------------------------------------------------
server.on('uncaughtException', (req, res, route, erro) => {
  console.error('❌ Erro não tratado:', erro);
  if (!res.headersSent) {
    res.send(500, { erro: 'Erro interno do servidor', detalhes: erro.message });
  }
});

// Inicia o servidor
const PORTA = process.env.PORT || 3000;

server.listen(PORTA, async () => {
  console.log(`🚀 Servidor a rodar em: http://localhost:${PORTA}`);
  console.log(`📌 Para testar, abre: http://localhost:${PORTA}/ping`);

  // Tenta ligar ao RabbitMQ no arranque, só para já avisar nos logs se ele
  // estiver desligado. Não impede a API de subir e responder a pedidos REST
  // mesmo sem o RabbitMQ — ver comentário em config/rabbitmq.js.
  await rabbitmq.conectar();
});
