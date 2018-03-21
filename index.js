process.env["NTBA_FIX_319"] = 1;

const Bot = require('node-telegram-bot-api');
const request = require('request');
const token = require('./token');
const Promise = require('bluebird');
let members = [];

Promise.config({
  cancellation: true
});

const bot = new Bot(token, {polling: true});

const prepareData = (body, option) => {

  // console.log(option, body);

  switch(option) {
    case 'launches':
      const launches = JSON.parse(body).launches;
      return launches.filter((launch) => launch !== undefined)
                   .map((launch) => `${launch.name} on ${launch.net}`)
                   .join('\n\n');
      break;
    case 'btc':
      const btc = JSON.parse(body).bpi;
      return (`USD: ${btc.USD.rate_float}\n\nGBP: ${btc.GBP.rate_float}\n\nEUR: ${btc.EUR.rate_float}`);
      break;
  }
};

bot.on('message', (msg) => {

  // console.log(msg);

  // store members who have written in the chat in memory, can be useful
  let member = msg.from.username;
  let found = members.find(m => m === member);
  if(!found) {
    members.push(msg.from.username);
  }

  if (msg.text.toString().toLowerCase() === 'elon musk') {
    return request('https://launchlibrary.net/1.3/launch', (err, resp, body) => {
      bot.sendMessage(msg.chat.id, prepareData(body, 'launches'));
    });
  }

  if(msg.text.toString().toLowerCase() === 'a cuanto esta el bitcoin') {
    return request('https://api.coindesk.com/v1/bpi/currentprice.json', (err, resp, body) => {
      bot.sendMessage(msg.chat.id, prepareData(body, 'btc'));
    });
  }

  if(msg.text.toString().toLowerCase() === 'veves') {
    for(let i = 0; i < 5; i++) {
      bot.sendPhoto(msg.chat.id, 'https://i.imgur.com/QWzOPlt.png').then(data => {});
    }
  }

  if(msg.text.toString().toLowerCase() === 'el mas cabron del mes') {
    if(members.length !== 0) {
      var item = members[Math.floor(Math.random() * members.length)];
      bot.sendMessage(msg.chat.id, `@${item}`);
    }
    else {
      bot.sendMessage(msg.chat.id, 'Hablad hijos de puta!');
    }
  }

  /*
  bot.sendMessage(msg.chat.id, 'Hi, do you want to travel?', {
    reply_markup: {
      keyboard: [[trigger], ['Bulk option']]
    }
  });
  */
});