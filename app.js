const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');

registerFont('Nunito-Regular.ttf', { family: 'Nunito-Regular' });

// Defina as dimensões da imagem
const largura = 1080;
const altura = 1920;

// Crie um novo canvas
const canvas = createCanvas(largura, altura);
const contexto = canvas.getContext('2d');

// Carregue uma imagem de fundo
loadImage('background.png').then((imagemDeFundo) => {
  // Desenhe a imagem de fundo no canvas
  contexto.drawImage(imagemDeFundo, 0, 0, largura, altura);

    const texto = 'Headphone Bluetooth BASS 500 i2GO com Microfone Integrado, Cont'
    

  // Adicione texto
  contexto.fillStyle = 'black';
  contexto.font = '55px Nunito-Regular';


    // Divida o texto em duas partes
  const metadeTexto = texto.length / 2;
  const primeiraParte = texto.substring(0, metadeTexto);
  const segundaParte = texto.substring(metadeTexto);
  

  // Calcule as coordenadas X e Y para posicionar as duas linhas de texto
  const x = 100; // Coordenada X fixa
  const yPrimeiraLinha = 1260; // Coordenada Y para a primeira linha
  const ySegundaLinha = 1330; // Coordenada Y para a segunda linha

  // Adicione as duas linhas de texto ao canvas
  contexto.fillText(primeiraParte, x, yPrimeiraLinha);
  contexto.fillText(segundaParte, x, ySegundaLinha);

    // Defina a cor de fundo (padding) ao redor do texto
  contexto.fillStyle = 'white';

  // Texto dinâmico que deseja centralizar
  const valor = 'R$ 1690,00';

  // Defina a fonte e o tamanho do texto
  contexto.font = '80px Arial';

  // Calcule as dimensões do texto dinâmico
  const larguraValor = contexto.measureText(valor).width;
  const alturaValor = 80; // Altura da fonte

  // Defina as coordenadas e dimensões da caixa de fundo com padding com base nas dimensões do texto
  const xCaixa = largura / 2 - larguraValor / 2; // Centraliza horizontalmente
  const yCaixa = 1380; // Centraliza verticalmente
  const padding = 10; // Tamanho do padding
  const raioCantos = 15; // Raio dos cantos arredondados

  // Desenhe a caixa de fundo com padding e cantos arredondados com base nas dimensões do texto
  contexto.roundRect(xCaixa - padding, yCaixa - padding, larguraValor + 2 * padding, alturaValor + 2 * padding, raioCantos);
  contexto.fill();

  // Defina a cor do texto
  contexto.fillStyle = 'black';

  // Escreva o texto centralizado dentro da caixa de fundo com padding
  contexto.fillText(valor, xCaixa, yCaixa + alturaValor - 10);

  contexto.fillStyle = 'black'

  const parcelamento = 'Em até 3x R$ 56,64 sem juros'

  contexto.font = '35px Nunito-Regular'

  const larguraParcelamento = contexto.measureText(parcelamento).width;

  const xParcelamento = (largura - larguraParcelamento) / 2

  contexto.fillText(parcelamento, xParcelamento, 1520)

  // Carregue uma imagem para adicionar ao canvas
  loadImage('fone.jpg').then((outraImagem) => {

    const larguraMaxima = 730; // Por exemplo, 100px de margem em cada lado
    const alturaMaxima = 640; // Por exemplo, 100px de margem em cima e em baixo

  // Calcule as novas dimensões da imagem de forma proporcional
    let novaLargura = outraImagem.width;
    let novaAltura = outraImagem.height;

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
    const out = fs.createWriteStream(__dirname + '/imagem-com-texto-e-imagem.png');
    stream.pipe(out);
    out.on('finish', () => console.log('Imagem gerada com sucesso.'));
  });
});
