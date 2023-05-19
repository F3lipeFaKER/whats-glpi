const venom = require('venom-bot');
const axios = require('axios');
const express = require("express");

venom.create({
  session: 'Bot-Felipe',
  catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
    console.log('Scan the QR code to log in:', asciiQR);
  }
}).then((client) => startBot(client));

const stages = {};
const problemDescriptions = {};
const inactiveTimeouts = {};

function startBot(client) {


                            var app = express();
                          app.listen(3001, () => {
                            console.log("Servidor rondando na porta 3001");
                        });

                          app.get("/api/message", async (req, res, next) => {
                            await client.sendText(req.query.number + '@c.us', req.query.message);
                            res.json(req.query);
                          });

                         
                        





  client.onMessage((message) => {
    if (!message.isGroupMsg && message.body && message.fromMe === false) {
      const stage = getStage(message.from);

      if (stage === 0) {
        const response = `👋 Olá! Seja bem-vindo ao atendimento da VipTech.\nPosso te ajudar? Selecione a opção para prosseguir:\n\n   ⿡ - CRIAR UM CHAMADO\n   ⿢ - OUTROS\n   ⿠ - FALAR COM ATENDENTE`;
        client.sendText(message.from, response);
        setStage(message.from, 1);
      } else if (stage === 1) {
        if (message.body === '1') {
          const response = `Por favor, informe o problema que você está enfrentando.`;
          client.sendText(message.from, response);
          setStage(message.from, 2);
        } else if (message.body === '0') {
          const response = `Você será direcionado para um atendente em breve.`;
          client.sendText(message.from, response);
          setStage(message.from, 3);
          setInactiveTimeout(message.from, 60 * 60 * 1000);
        } else {
          const response = `Opção inválida. Por favor, selecione uma das opções fornecidas.`;
          client.sendText(message.from, response);
        }
      } else if (stage === 2) {
        const response = `Você está relatando o seguinte problema:\n\n${message.body}\n\nPor favor, confirme se a mensagem está correta.\n\nResponder com:\n\n⿡ - SIM\n⿠ - NÃO`;
        client.sendText(message.from, response);
        setProblemDescription(message.from, message.body);
        setStage(message.from, 3);
      } else if (stage === 3) {
        if (message.body === '1') {
          createTicketInGLPI(message, client);
        } else if (message.body === '0') {
          const response = `Por favor, informe o problema corretamente.`;
          client.sendText(message.from, response);
          setStage(message.from, 2);
        } else {
          const response = `Desculpe, mas estou atualmente indisponível. Aguarde alguns minutos antes de enviar uma nova mensagem. Obrigado!`;
          client.sendText(message.from, response);
          setInactiveTimeout(message.from, 60 * 60 * 1000)
         
        }
      }
    }
  });
}

function createTicketInGLPI(message, client) {
  const url = 'http://192.168.34.93/glpi/apirest.php/Ticket';
  const appToken = 'P2sen34fT1LpjIXk17hHRQKmI2m8VViBqzgeL3At';
  const sessionToken = 'ffdb87jb84j8o6k8n94j3fg1p4';

  const data = {
    input: {
      name: message.sender.pushname,
      content: getProblemDescription(message.from),
      priority: 2,
      category: 'Categoria do chamado',
    },
  };

  const headers = {
    'Content-Type': 'application/json',
    'App-Token': appToken,
    'Session-Token': sessionToken,
  };

  axios
    .post(url, data, { headers })
    .then((response) => {
      if (response.status === 201) {
        const ticketId = response.data.id;
        const successMessage = `Chamado criado com sucesso. Número do Ticket: ${ticketId}\nVocê será direcionado para um atendente em breve...\nA VipTech agradece o seu contato.`;

        client
          .sendText(message.from, successMessage)
          .then(() => {
            setStage(message.from, 5);
            setProblemDescription(message.from, '');
            clearTimeout(inactiveTimeouts[message.from]);
          })
          .catch((error) => {
            console.error('Erro ao enviar a mensagem:', error);
          });
      } else {
        console.error('Erro na criação do chamado:', response.status);
      }
    })
    .catch((error) => {
      console.error('Erro na requisição ao GLPI:', error);
    });
}

function getProblemDescription(clientId) {
  return problemDescriptions[clientId] || '';
}

function setProblemDescription(clientId, description) {
  problemDescriptions[clientId] = description;
}

function getStage(clientId) {
  return stages[clientId] || 0;
}

function setStage(clientId, stage) {
  stages[clientId] = stage;
}

function setInactiveTimeout(clientId, timeout) {
  clearTimeout(inactiveTimeouts[clientId]);

  inactiveTimeouts[clientId] = setTimeout(() => {
    setStage(clientId, 0);
    clearTimeout(inactiveTimeouts[clientId]);
  }, timeout);
}

























































































































/*

const venom = require('venom-bot');
const axios = require('axios');

// Função para obter as respostas do GLPI
async function obterRespostasGLPI() {
  // Substitua pelas suas credenciais do GLPI
  const username = 'fbdomingos';
  const password = '@Felipe$1236';

  try {
    // Faz a requisição para obter as respostas do GLPI
    const response = await axios.get('http://192.168.34.93/glpi/apirest.php/Ticket?app_token=P2sen34fT1LpjIXk17hHRQKmI2m8VViBqzgeL3At&session_token=ffdb87jb84j8o6k8n94j3fg1p4', {
      auth: {
        username,
        password
      }
    });

    // Obtém a resposta do GLPI
    const respostaGLPI = response.data.content;

    // Retorna a resposta do GLPI
    return respostaGLPI;
  } catch (error) {
    console.error('Erro ao obter respostas do GLPI:', error);
    return null;
  }
}

// Função para enviar mensagem para o WhatsApp
async function enviarMensagemWhatsApp(client, numeroTelefone, mensagem) {
  try {
    await client.sendText(numeroTelefone, mensagem);
    console.log('Mensagem enviada com sucesso');
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
  }
}

// Inicializa o Venom-bot
venom.create().then(async (client) => {
  try {
    // Obtém as respostas do GLPI
    const respostaGLPI = await obterRespostasGLPI();

    if (respostaGLPI) {
      // Monta a mensagem a ser enviada para o WhatsApp
      const mensagem = `Resposta do GLPI: ${respostaGLPI}`;

      // Substitua pelo número de telefone do destinatário
      const numeroTelefone = '554498923553';

      // Envia a mensagem para o WhatsApp
      enviarMensagemWhatsApp(client, numeroTelefone, mensagem);
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}).catch((error) => {
  console.error('Erro ao inicializar o Venom-bot:', error);
});
















































/*const venom = require('venom-bot');
const axios = require('axios');

venom.create({
  session: 'Bot-Felipe',
  catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
    console.log('Scan the QR code to log in:', asciiQR);
  }
}).then((client) => startBot(client));

function startBot(client) {
  client.onMessage((message) => {
    // Verifica se a mensagem é de um cliente e não é uma mensagem enviada pelo próprio bot
    if (!message.isGroupMsg && message.body && message.fromMe === false) {
      // Encaminha a mensagem para o GLPI
      sendToGLPI(message)
        .then((response) => {
          // Verifica se a requisição ao GLPI foi bem-sucedida
          if (response && response.status === 201) {
            const ticketId = response.data.id;
            console.log(`Chamado criado com sucesso. Número do Ticket: ${ticketId}`);

            // Aguarda a resposta do GLPI e envia para o WhatsApp do cliente
            waitForTicketResponse(ticketId, client, message.from)
              .then((ticketResponse) => {
                // Envia a resposta para o WhatsApp do cliente
                client.sendText(message.from, ticketResponse)
                  .then(() => {
                    console.log('Resposta enviada com sucesso para o WhatsApp');
                  })
                  .catch((error) => {
                    console.error('Erro ao enviar a resposta para o WhatsApp:', error);
                  });
              })
              .catch((error) => {
                console.error('Erro ao aguardar a resposta do ticket do GLPI:', error);
              });
          } else {
            console.error('Erro na criação do chamado:', response && response.status);
          }
        })
        .catch((error) => {
          console.error('Erro na requisição ao GLPI:', error);
        });
    }
  });
}

function sendToGLPI(message) {
  // Configurações para a integração com o GLPI
  const glpiApiUrl = 'http://192.168.34.93/glpi/apirest.php/Ticket';
  const appToken = 'P2sen34fT1LpjIXk17hHRQKmI2m8VViBqzgeL3At';
  const sessionToken = 'pvg6695mv2smr2b04u2fir7a3g';

  // Constrói o objeto de dados para criar um novo ticket no GLPI
  const data = {
    input: {
      name: message.sender.pushname,
      content: message.body,
      priority: 2,
      category: 'Categoria do chamado',
    },
  };

  // Configura os headers da requisição
  const headers = {
    'Content-Type': 'application/json',
    'App-Token': appToken,
    'Session-Token': sessionToken,
  };

  // Faz a requisição POST para criar um novo ticket no GLPI
  return axios.post(`${glpiApiUrl}/Ticket`, data, { headers });
}

function waitForTicketResponse(ticketId, client, recipient) {
  // Configurações para a integração com o GLPI
  const glpiApiUrl = 'http://192.168.34.93/glpi/apirest.php/Ticket';
  const appToken = 'P2sen34fT1LpjIXk17hHRQKmI2m8VViBqzgeL3At';
  const sessionToken = 'pvg6695mv2smr2b04u2fir7a3g';

  // Configura os headers da requisição
  const headers = {
    'Content-Type': 'application/json',
    'App-Token': appToken,
    'Session-Token': sessionToken,
  };

  // Função que verifica se o ticket recebeu uma resposta
  const checkTicketResponse = () => {
    return axios.get(`${glpiApiUrl}/Ticket/${ticketId}`, { headers })
      .then((response) => {
        if (response && response.status === 200) {
          // Verifica se o ticket possui uma resposta
          if (response.data.answer) {
            // Retorna a resposta do ticket do GLPI
            return response.data.answer;
          } else {
            // Caso não tenha resposta, espera um tempo e verifica novamente
            return new Promise((resolve) => setTimeout(resolve, 5000))
              .then(() => checkTicketResponse());
          }
        } else {
          throw new Error(`Erro ao obter os detalhes do ticket do GLPI. Status: ${response && response.status}`);
        }
      });
  };

  // Inicia a verificação da resposta do ticket
  return checkTicketResponse();
}
*/