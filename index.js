require('dotenv').config()
const express = require('express');
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

const { Telegraf } = require('telegraf')
const { BOT_TOKEN } = process.env
const { PORT } = process.env
///////////////////Controllers/////////////////////////////////
const { getStockQuote, replaceMarkDown, differentialPercentage, getStockChart } = require('./controllers')

////////////////Servidor///////////////////////////////////////
app.listen(PORT, () => {
    console.log(`server run PORT= ${PORT} `)

})
///////////////Bot Telegram////////////////////////////////////////////////////////
const bot = new Telegraf(BOT_TOKEN)

bot.start((ctx) => {
    console.log(ctx.update.message)
    console.log(ctx)
    ctx.reply('Hola soy rudolf bot. ¿En q puedo ayudarte?')
})

bot.help((ctx) => {
    ctx.reply('Aca explicamos q opciones tiene el bot')
})

bot.on('sticker', (ctx) => ctx.reply('👍'))

bot.command("cursos", (ctx) => {
    ctx.reply('aca enviamos los link de los cursos')
})

bot.command("stock", async (ctx) => {
    try {
        let datos = ctx.update.message.text.split(' ')
        let subCommand = datos[1]
        let symbol = datos[2]
        let timeFrames = datos[3]

        if (subCommand === 'quote' && symbol) {

            let data = await getStockQuote(symbol)
            if (data === false) {
                ctx.reply(`El symbol ${symbol} no existe`)
            }
            else {
                ctx.replyWithMarkdownV2(`
\u{1F4C8}  *${data.data.symbol}*   \\${differentialPercentage(data.data.snapshot.last, data.data.snapshot.close, data.data.snapshot.previous_close)}%
    
*Bid Size*: _${replaceMarkDown(data.data.snapshot.bid_size)}_    *Bid*: _${replaceMarkDown(data.data.snapshot.bid)}_
*Ask*: _${replaceMarkDown(data.data.snapshot.ask)}_    *Ask Size*: _${replaceMarkDown(data.data.snapshot.ask_size)}_
*Last*: _${replaceMarkDown(data.data.snapshot.last)}_    *Volumen*: _${replaceMarkDown(data.data.snapshot.volume)}_
*Open*: _${replaceMarkDown(data.data.snapshot.open)}_    *High*: _${replaceMarkDown(data.data.snapshot.high)}_
*Low*: _${replaceMarkDown(data.data.snapshot.low)}_    *Close*: _${replaceMarkDown(data.data.snapshot.close)}_
*Previous Close*: _${replaceMarkDown(data.data.snapshot.previous_close)}_
                `)
            }
        }
        else if (subCommand === 'chart' && symbol) {

            let data = await getStockChart(symbol, timeFrames)

            if (data.status === "error") {
                ctx.replyWithMarkdownV2(data.message)

            } else {
                ctx.replyWithPhoto({ source: data.url });
            }
        }
        else {
            ctx.replyWithMarkdownV2(`
Comando invalido\\. Los comandos disponibles son:
\`\`\` 1\\. quote \\(ej: /stock quote GGAL\\)\`\`\`
\`\`\` 2\\. quote \\(ej: /stock chart GGAL\\)\`\`\`
        `)
        }
    } catch (error) {
        console.log("entre en bot")
    }

})

bot.launch();

////////////////Ruta Testing/////////////////////////////////////////////////////////////////////////
// Script para enviar mensaje manual.
app.get('/sendMessage', async (req, res) => {
    bot.telegram.sendMessage("-664476579", "envio manual")
    res.json({ 'msg': "OK" })

})



