const amqp = require('amqplib');

class RabbitMQService {
  constructor() {
    this.connection = null;
    this.channel = null;
    // Lê do .env (RABBITMQ_URL). Em casa normalmente é amqp://localhost;
    // quando mudares para o servidor da faculdade, basta trocar no .env,
    // sem mexer em código.
    this.url = process.env.RABBITMQ_URL || 'amqp://localhost';
  }

  async conectar() {
    if (!this.connection) {
      try {
        this.connection = await amqp.connect(this.url);
        this.channel = await this.connection.createChannel();
        console.log('🐰 Conectado ao RabbitMQ com sucesso!');
      } catch (erro) {
        console.error('❌ Erro ao conectar ao RabbitMQ:', erro);
      }
    }
    return this.channel;
  }

  // Método para atuar como PRODUCER (Enviar mensagens)
  async publicarMensagem(fila, mensagem) {
    try {
      const canal = await this.conectar();
      await canal.assertQueue(fila, { durable: true });
      
      // O RabbitMQ só entende Buffers (bytes), por isso convertemos o JSON
      canal.sendToQueue(fila, Buffer.from(JSON.stringify(mensagem)), {
        persistent: true // Garante que a mensagem não se perde se o RabbitMQ reiniciar
      });
      
      console.log(`📤 Mensagem publicada na fila "${fila}":`, mensagem);
    } catch (erro) {
      console.error(`❌ Erro ao publicar na fila ${fila}:`, erro);
    }
  }

  // Método para atuar como CONSUMER (Receber mensagens)
  async consumirMensagem(fila, callback) {
    try {
      const canal = await this.conectar();
      await canal.assertQueue(fila, { durable: true });
      
      console.log(`📥 A aguardar mensagens na fila "${fila}"...`);
      
      canal.consume(fila, (msg) => {
        if (msg !== null) {
          const conteudo = JSON.parse(msg.content.toString());
          // Passa o conteúdo para a função de callback fornecida pelo teu Service
          callback(conteudo); 
          // Confirma ao RabbitMQ que a mensagem foi processada com sucesso
          canal.ack(msg);
        }
      });
    } catch (erro) {
      console.error(`❌ Erro ao consumir a fila ${fila}:`, erro);
    }
  }
}

module.exports = new RabbitMQService();