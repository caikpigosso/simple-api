const fs = require('fs');
const { Client  } = require('whatsapp-web.js');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const qrcode = require('qrcode-terminal');

app.use(bodyParser.json());
app.listen(8080,function(){
    console.log('Servidor ativo no porto 8080');
});
const SESSION_FILE_PATH = './session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}
const client = new Client({ puppeteer: { headless: true }, session: sessionCfg });
client.initialize();
client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    qrcode.generate(qr, {small: true});
});
client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg=session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});
client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessfull
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('READY');
});
app.post('/send/',async function(req,res){
    console.log(req.body);
    const {numero, alerta} = req.body;
    console.log(req.body);
    let number = numero;
    number = number.includes('@c.us') ? number : `${number}@c.us`;
    client.sendMessage(number, alerta);
    res.send('Envio com Sucesso');
});
app.get('/',function(req,res){
    res.send('Api envio do WhatsApp');
});