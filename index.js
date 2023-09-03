const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path')
const fs = require('fs');
const sharp = require('sharp');
const { Readable } = require('stream');


// Configurar o token do seu bot do Telegram
const telegramToken = '6190693318:AAE0Rh7x91AmTnKlaOB-yXO1mAf7isYuUss';
const bot = new TelegramBot(telegramToken, { polling: true });

function isMagazineLuizaURL(url) {
    const pattern = /https:\/\/www\.magazinevoce\.com\.br\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\/p\/[0-9]+\/te\/[a-zA-Z0-9-]+/i;
    return pattern.test(url);
}

// Verificar se a URL pertence à Amazon
function isAmazonURL(url) {
    const pattern = /^https:\/\/amzn\.to\/[a-zA-Z0-9]+$/i;
    return pattern.test(url);
}

// Função para extrair dados da página do produto
async function scrapeProductData(url) {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    if(isMagazineLuizaURL(url)) {
        console.log('URL Magalu')
        const title = $('.sc-dcJsrY.jjGTqv').text(); // Extrair o título da página
        const price = $('.sc-dcJsrY.eLxcFM.sc-kbdlSk.edtRSh').text(); // Extrair o preço do produto
        const image = $('.sc-fUnMCh.lhoQy').attr('src'); // Extrair o URL da imagem do produto
        const installment = $('.sc-dcJsrY.eRIzys.sc-bdOgaJ.kflUR').text(); // Extrair informações de parcelamento

        const newTitle = title.substring(0, 47) + '...'

        console.log(newTitle, url)
        return { newTitle, price, image, installment, url};
    }

    if(isAmazonURL(url)) {
        console.log('URL Amazon')
        const title = $('#productTitle').text(); // Extrair o título da página
        // const priceSymbol = $('.a-price-symbol').text();
        // const priceValue = $('.a-price-whole').text();
        const price = $('.priceToPay .a-offscreen').text(); // Extrair o preço do produto
        const image = $('.a-dynamic-image').attr('src'); // Extrair o URL da imagem do produto
        const installment = $('.best-offer-name.a-text-bold').text(); // Extrair informações de parcelamento

        const newTitle = title.substring(0, 47) + '...'
        // const price = priceSymbol + '' + priceValue + ',' + pricedecimal
        console.log(price)

        console.log(newTitle, url)
        return { newTitle, price, image, installment, url};
    }
    
}


// Função para gerar imagem com os dados do produto
async function generateProductImage(data) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    
    if(isMagazineLuizaURL(data.url)) {
        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                
        @import url('https://fonts.googleapis.com/css2?family=Nunito&display=swap');

        html, body {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            font-family: 'Nunito', sans-serif;
        }


        .content {
            width: 60%;
            height: 120rem;
            background-color: orange;
        }

        .content img {
            width: 70%;
            position: absolute;
            top: 25rem; 
            left: 17rem;
        }

        .content .title {
            width: 100%;
            position: absolute;
            top: 73rem;
            left: 9rem;
            margin: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        .title h1 {
            font-size: 55px;
            width: 100%;
            text-align: center;
            margin: 1rem 0;
            margin-bottom: 1px;
        }

        .price {
            text-align: center;
            width: 30rem;
        }

        .price h1 {
            font-size: 80px;
            font-weight: bold;
            border-radius: 1rem;
            background-color: white;
        }

        .title h2 {
            font-size: 35px;
        }

            </style>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Nunito&display=swap" rel="stylesheet">
            <title>Postagem de produto</title>
        </head>
        <body>
            <img src="background.png" alt="">
            <div class="content">
                <img src="${data.image}" alt="">
                <div class="title">
                    <h1>${data.newTitle}</h1>
                    <div class="price">
                        <h1>${data.price}</h1>
                    </div>
                    <h2>${data.installment}</h3>
                </div>
            </div>
        </body>
        </html>`

    // Configure o conteúdo da página com o HTML gerado
    await page.setContent(htmlContent);

    
    fs.writeFileSync('temp.html', htmlContent);

    // Abra o arquivo HTML em uma nova página do navegador
    await page.goto(`file://${process.cwd()}/temp.html`);


    // Defina a área de recorte (x, y, largura, altura)
    const clip = { x: 0, y: 0, width: 1080, height: 1920 };

    // Capture o screenshot da área de recorte
    const screenshotBuffer = await page.screenshot({ clip });

    // Salve ou processe o screenshotBuffer conforme necessário

    await browser.close();
    return screenshotBuffer;
    }

    if(isAmazonURL(data.url)) {

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                
        @import url('https://fonts.googleapis.com/css2?family=Nunito&display=swap');

        html, body {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            font-family: 'Nunito', sans-serif;
        }


        .content {
            width: 1089px;
            height: 1920px;
            background-color: orange;
        }

        .content img {
            width: 60%;
            max-height: 80%;
            position: absolute;
            top: 22rem; 
            left: 40%;
            ransform: translateX(-40%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        .content .title {
            width: 100%;
            position: absolute;
            top: 75rem;
            left: 9rem;
            margin: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        .title h1 {
            font-size: 55px;
            width: 100%;
            text-align: center;
            margin: 1rem 0;
            margin-bottom: 1px;
        }

        .price {
            text-align: center;
            width: 30rem;
        }

        .price h1 {
            font-size: 80px;
            font-weight: bold;
            border-radius: 1rem;
            background-color: white;
        }

        .title h2 {
            font-size: 35px;
        }

            </style>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Nunito&display=swap" rel="stylesheet">
            <title>Postagem de produto</title>
        </head>
        <body>
            <img src="background.png" alt="">
            <div class="content">
                <img src="${data.image}" alt="">
                <div class="title">
                    <h1>${data.newTitle}</h1>
                    <div class="price">
                        <h1>${data.price}</h1>
                    </div>
                    <h2>${data.installment == "" ? 'A vista' : data.installment}</h3>
                </div>
            </div>
        </body>
        </html>`

    // Configure o conteúdo da página com o HTML gerado
    await page.setContent(htmlContent);

    
    fs.writeFileSync('temp.html', htmlContent);

    // Abra o arquivo HTML em uma nova página do navegador
    await page.goto(`file://${process.cwd()}/temp.html`);


    // Defina a área de recorte (x, y, largura, altura)
    const clip = { x: 0, y: 0, width: 1080, height: 1920 };

    // Capture o screenshot da área de recorte
    const screenshotBuffer = await page.screenshot({ clip });

    // Salve ou processe o screenshotBuffer conforme necessário

    await browser.close();
    return screenshotBuffer;
    }
    
}

// Evento para escutar mensagens enviadas ao bot
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Envie o link do produto que deseja gerar a imagem.');
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const productUrl = msg.text;

    try {
        const productData = await scrapeProductData(productUrl);
        const productImage = await generateProductImage(productData);
        
        await bot.sendPhoto(chatId, productImage);

        bot.sendMessage(chatId, 'Imagem gerada com sucesso!');
    } catch (error) {
        console.error('Ocorreu um erro:', error);
        bot.sendMessage(chatId, 'Ocorreu um erro ao processar o produto.');
    }
});
