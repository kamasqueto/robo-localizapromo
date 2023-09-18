const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const { createCanvas, loadImage, registerFont } = require("canvas");

// Configurar o token do seu bot do Telegram
const telegramToken = "6190693318:AAE0Rh7x91AmTnKlaOB-yXO1mAf7isYuUss";
const bot = new TelegramBot(telegramToken, { polling: true });

// Verificar se a URL pertence à Amazon
function isAmazonURL(url) {
  const pattern = /^https:\/\/amzn\.to\/[a-zA-Z0-9]+$/i;
  return pattern.test(url);
}

function saveImage(url) {
  const imageUrl = url;

  // Nome do arquivo de destino
  const nomeArquivo = "imagem.jpg";

  // Caminho completo do arquivo de destino
  const caminhoCompleto = `./${nomeArquivo}`;

  // Faça o download da imagem
  axios({
    method: "get",
    url: imageUrl,
    responseType: "stream",
  })
    .then((response) => {
      // Crie um fluxo de escrita para salvar a imagem localmente
      const fileWriteStream = fs.createWriteStream(caminhoCompleto);

      // Pipe (encaminhe) o fluxo de leitura da resposta do axios para o fluxo de escrita do arquivo
      response.data.pipe(fileWriteStream);

      // Aguarde até que o arquivo seja totalmente salvo
      fileWriteStream.on("finish", () => {
        console.log(`Imagem salva em: ${caminhoCompleto}`);
      });
    })
    .catch((error) => {
      console.error("Erro ao fazer o download da imagem:", error);
    });
}

// Função para extrair dados da página do produto
async function scrapeProductData(url) {
  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);

  if (isAmazonURL(url)) {
    console.log("URL Amazon");
    const title = $("#productTitle").text(); // Extrair o título da página
    // const priceSymbol = $('.a-price-symbol').text();
    // const priceValue = $('.a-price-whole').text();
    const price = $(".priceToPay").prop('innerText'); // Extrair o preço do produto
    const image = $(".a-dynamic-image").attr("src"); // Extrair o URL da imagem do produto
    const installment = $(".best-offer-name.a-text-bold").text(); // Extrair informações de parcelamento

    const newTitle = title.substring(0, 47) + "...";


    // Use uma expressão regular para encontrar todas as ocorrências de "R" seguidas por números e vírgulas.
    const regex = /R[\d,]+/g;

    // Use o método match para encontrar todas as correspondências na string.
    const correspondencias = price.match(regex);

    console.log(correspondencias); // Isso retornará ["R$46,90", "R$46,90"]

    const newPrice = price.split("\n");
    console.log(newPrice);

    console.log(newTitle, url);
    saveImage(image);
    return { newTitle, newPrice, image, installment, url };
  } else {
    console.log("URL Magalu");
    const title = $(".sc-dcJsrY.jjGTqv").text(); // Extrair o título da página
    const newPrice = $(".sc-dcJsrY.eLxcFM.sc-kbdlSk.edtRSh").text(); // Extrair o preço do produto
    const image = $(".sc-fUnMCh.lhoQy").attr("src"); // Extrair o URL da imagem do produto
    const installment = $(".sc-dcJsrY.eRIzys.sc-bdOgaJ.kflUR").text(); // Extrair informações de parcelamento

    const newTitle = title.substring(0, 47) + "...";

    console.log(newTitle, url, title);
    saveImage(image);
    return { newTitle, newPrice, image, installment, url };
  }
}

// Função para gerar imagem com os dados do produto
async function generateProductImage(data) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  registerFont("Nunito-VariableFont_wght.ttf", { family: "Nunito-Regular" });
  registerFont("Nunito-VariableFont_wght.ttf", { family: "Nunito-Bold" });

  // Defina as dimensões da imagem
  const largura = 1080;
  const altura = 1920;

  // Crie um novo canvas
  const canvas = createCanvas(largura, altura);
  const contexto = canvas.getContext("2d");

  // Carregue uma imagem de fundo
  loadImage("background.png").then((imagemDeFundo) => {
    // Desenhe a imagem de fundo no canvas
    contexto.drawImage(imagemDeFundo, 0, 0, largura, altura);

    const texto = data.newTitle;
    // Adicione texto
    contexto.fillStyle = "black";
    contexto.font = "55px Nunito-Regular";

    // Divida o texto em duas partes
    const metadeTexto = texto.length / 2;
    const primeiraParte = texto.substring(0, metadeTexto);
    const segundaParte = texto.substring(metadeTexto);
    const larguraTexto1 = contexto.measureText(primeiraParte).width;
    const larguraTexto2 = contexto.measureText(segundaParte).width;

    // Calcule as coordenadas X e Y para posicionar as duas linhas de texto
    const x1 = (largura - larguraTexto1) / 2;
    const x2 = (largura - larguraTexto2) / 2; // Coordenada X fixa
    const yPrimeiraLinha = 1260; // Coordenada Y para a primeira linha
    const ySegundaLinha = 1330; // Coordenada Y para a segunda linha

    // Adicione as duas linhas de texto ao canvas
    contexto.fillText(primeiraParte, x1, yPrimeiraLinha);
    contexto.fillText(segundaParte, x2, ySegundaLinha);

    // Defina a cor de fundo (padding) ao redor do texto
    contexto.fillStyle = "white";

    // Texto dinâmico que deseja centralizar
    const valor = data.newPrice;

    // Defina a fonte e o tamanho do texto
    contexto.font = "80px Nunito-Bold";

    // Calcule as dimensões do texto dinâmico
    const larguraValor = contexto.measureText(valor).width;
    const alturaValor = 80; // Altura da fonte

    // Defina as coordenadas e dimensões da caixa de fundo com padding com base nas dimensões do texto
    const xCaixa = largura / 2 - larguraValor / 2; // Centraliza horizontalmente
    const yCaixa = 1380; // Centraliza verticalmente
    const padding = 10; // Tamanho do padding
    const raioCantos = 15; // Raio dos cantos arredondados

    // Desenhe a caixa de fundo com padding e cantos arredondados com base nas dimensões do texto
    contexto.roundRect(
      xCaixa - padding,
      yCaixa - padding,
      larguraValor + 2 * padding,
      alturaValor + 2 * padding,
      raioCantos
    );
    contexto.fill();

    // Defina a cor do texto
    contexto.fillStyle = "black";

    // Escreva o texto centralizado dentro da caixa de fundo com padding
    contexto.fillText(valor, xCaixa, yCaixa + alturaValor - 10);

    contexto.fillStyle = "black";

    const parcelamento = !data.installment ? "A vista" : data.installment;

    contexto.font = "35px Nunito-Regular";

    const larguraParcelamento = contexto.measureText(parcelamento).width;

    const xParcelamento = (largura - larguraParcelamento) / 2;

    contexto.fillText(parcelamento, xParcelamento, 1520);
    // Carregue uma imagem para adicionar ao canvas
    loadImage("imagem.jpg").then((outraImagem) => {
      const larguraMaxima = 730; // Por exemplo, 100px de margem em cada lado
      const alturaMaxima = 640; // Por exemplo, 100px de margem em cima e em baixo

      // Calcule as novas dimensões da imagem de forma proporcional
      let novaLargura = outraImagem.width;
      let novaAltura = outraImagem.height;
      console.log(novaAltura, novaLargura)

      if(novaAltura < alturaMaxima){
        novaAltura = alturaMaxima
        novaLargura = (novaAltura / outraImagem.height) * outraImagem.width;
      }

      if(novaLargura < larguraMaxima) {
        novaLargura = larguraMaxima
        novaAltura = (novaLargura / outraImagem.width) * outraImagem.height;
      }

      if (novaLargura > larguraMaxima) {
        novaLargura = larguraMaxima;
        novaAltura = (novaLargura / outraImagem.width) * outraImagem.height;
      }

      if (novaAltura > alturaMaxima) {
        novaAltura = alturaMaxima;
        novaLargura = (novaAltura / outraImagem.height) * outraImagem.width;
      }

      // Calcule as coordenadas X e Y para centralizar a imagem
      const x = (largura - novaLargura) / 2;
      const y = (altura - novaAltura) / 4.5;

      // Desenhe a imagem adicionada no canvas
      contexto.drawImage(outraImagem, x, y, novaLargura, novaAltura);

      // Salve a imagem com as adições em um arquivo
      const stream = canvas.createPNGStream();
      const out = fs.createWriteStream(__dirname + "/nova-imagem.png");
      stream.pipe(out);
      out.on("finish", () => console.log("Imagem gerada com sucesso."));
    });
  });
}

// Evento para escutar mensagens enviadas ao bot
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Envie o link do produto que deseja gerar a imagem.");
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const productUrl = msg.text;

  try {
    const productData = await scrapeProductData(productUrl);
    await generateProductImage(productData);

    setTimeout(async function () {
      const image = fs.readFileSync("nova-imagem.png");

      await bot.sendPhoto(chatId, image);
    }, 2000);

    await bot.sendMessage(chatId, "Imagem gerada com sucesso!");
  } catch (error) {
    console.error("Ocorreu um erro:", error);
    bot.sendMessage(chatId, "Ocorreu um erro ao processar o produto.");
  }
});
