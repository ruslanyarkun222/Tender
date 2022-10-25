const ws = require('ws');
const { 
  login, 
  registration,
  сreationTender,
  getStateusersTenders,
  getTendersInfo,
  getActualTenders,
  takePartTender,
  getTenderMembers,
  getMemberInfo,
  choiceWinner,
  getWinnerTenders,
  getUserTenderInfo,
  getUserTenders 
} = require('./database.js');


const port = process.env.PORT || 3000;
const wss = new ws.Server({
  port,
}, () => console.log(`Server started on ${port}\n`));

let users = {};

wss.on('connection', (ws) => {
  ws.onmessage = async req => {
    let resp = '';
    const data = JSON.parse(req.data);
    if(data.Func === 'Authorization') {
      resp = await login(data.Actor, data.Login, data.Password, users, ws);
      resp.messageType = 'Authorization';
    }
    if(data.Func === 'Registation') {
      resp = await registration(data.Actor, data.Name, data.Surname, data.Login, data.Password);
      resp.messageType = 'Registation';
    }
    if(data.Func === 'CreationTender') {
      resp = await сreationTender(data.Login, data.NameOfTender, data.DescriptionOfTender, data.PriceOfTender);
      resp.messageType = 'CreationTender';
    }
    if(data.Func === 'ShowListOfCreatedTenders') {
      resp = await getStateusersTenders(data.Login );
      resp.messageType = 'ListOfCreatedTenders';
    }
    if(data.Func === 'Show detail info of current created Tender') {
      resp = await getTendersInfo(data.TenderId );
      resp.messageType = 'DetailInfoOfCreatedTender';
    }

    if(data.Func === 'ShowListOfActualTenders') {
      resp = await getActualTenders(data.Login);
      resp.messageType = 'ListOfActualTenders';
    }

    if(data.Func === 'Show detail info of current actual Tender') {
      resp = await getTendersInfo(data.TenderId );
      resp.messageType = 'DetailInfoOfActualTender';
    }

    if(data.Func === 'RequestForTakingPart') {
      resp = await takePartTender(data.Login, data.NameOfTender, data.IdTender, data.DescriptionOfTender, data.PriceToDo);
      resp.messageType = 'RequestForTakingPart';
    }

    if(data.Func === 'ShowMembersOfTender') {
      resp = await getTenderMembers(data.TenderId );
      resp.messageType = 'ListOfMembers';
    }

    if(data.Func === 'Show detail info of member who took part at tender') {
      resp = await getMemberInfo(data.TenderId, data.LoginOfMember);
      resp.messageType = 'DetailOfMember';
    }

    if(data.Func === 'Choose Winner') {
      resp = await choiceWinner(data.TenderId, data.LoginOfMember);
      resp.messageType = 'Choose Winner';
    }

    if(data.Func === 'ShowListOfWinnedTenders') {
      resp = await getWinnerTenders(data.Login);
      resp.messageType = 'ListOfWinnedTenders';
    }

    if(data.Func === 'Show detail info of winned Tender') {
      resp = await getUserTenderInfo(data.TenderId, data.Login );
      resp.messageType = 'DetailInfoOfWinnedTender';
    }

    if(data.Func === 'ShowMyTenders') {
      resp = await getUserTenders(data.Login );
      resp.messageType = 'ListOfMyTenders';
    }

    if(data.Func === 'Show detail info of my Tender') {
      console.log(1)
      resp = await getUserTenderInfo(data.TenderId, data.Login );
      resp.messageType = 'DetailInfoOfMyTender';
    }

    
    
    console.log(output(data)); 
    console.log(`Respond:\n`);
    console.log(resp)
    const buf = Buffer.from(JSON.stringify(resp)); 
    ws.send(buf);

  };

  ws.onclose = () => {
    const login = getLogin(users, ws);
    if(login) {
      delete users[login];
      console.log(`User ${login} is disconnected.\n`);
    }
  }
});

function output(data) {
  console.log('New request:');
  for(let key in data) {
    if(!data[key]) delete data[key]
  }
  return data;
}

function getLogin(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}
