const { getData, setData } = require('./firebase');

async function login(actor, login, password, users, ws) {
    let response = {};
    const path = actor === 'Учасник' ? 'Users' : 'Stateusers';
    const user = await getData(`${path}/${login}`);
    if(user) {
        if(user.password === password) {
            const { name, surname } = user;
            users[login] = ws;
            console.log(`User ${login} is connected.\n`);
            response = { messageValue: 'True', name, surname };
        }
        else {
            response = { messageValue: 'False', name: '', surname: '' };
        }
    } 
    else {
        response = { messageValue: 'False', name: '', surname: '' };
    }
    return response;
}
  
async function registration(actor, name, surname, login, password) {
    let response = {};
    console.log(actor)
    const path = actor === 'Учасник' ? 'Users' : 'Stateusers';
    const user = await getData(`${path}/${login}`);
    if(user) {
        response = { messageValue: 'False', name: '', surname: '' };
    }
    else {
        let updates = {};
        updates[`${path}/${login}`] = { name, surname, password };
        await setData(updates);
        response = { messageValue: 'True', name, surname };
    }
    return response;
}
async function сreationTender(login, name, description, price) {
    let response = {};
    const tenders = await getData(`Stateusers/${login}/Tenders`) || {};
    if(Object.keys(tenders).includes(name)) {
        response = { messageValue: 'False' };
    }
    else {
        const date = new Date();
        const id = date.getTime();
        let updates = {};
        updates[`Tenders/${id}`] = {
            name,
            description,
            price,
            date: formatDate(date),
            status: true

        };
        await setData(updates);
        updates = {};
        updates[`Stateusers/${login}/Tenders/${name}`] = id;
        await setData(updates);
        response = { messageValue: 'True' };
    }
    return response;
}

function formatDate(date) {
    let dd = date.getDate();
    if (dd < 10) dd = '0' + dd;
    let mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;
    let yy = date.getFullYear() % 100;
    if (yy < 10) yy = '0' + yy;
    return `${dd}-${mm}-20${yy}`;
}

async function getStateusersTenders(login) {
    let response = {};
    const tenders = await getData(`Stateusers/${login}/Tenders`);
    if(tenders) {
        let tmp = [];
        for(let name in tenders) {
            const id = tenders[name].toString();
            tmp.push({ name, id });
        }
        response = { messageValue: 'True', tenders: tmp };
    }   
    else {
        response = { messageValue: 'False', tenders: [] };
    }
    return response;
}

async function getTendersInfo(id) {
    const tender = await getData(`Tenders/${id}`);
    const { description, price, date } = tender;
    return { 
        messageValue: 'True', 
        descriptionOfTender: description,
        priceOfTender: price,
        dateOfTender: date
    };
}

async function getActualTenders(login) {
    const userTenders = await getData(`Users/${login}/Tenders`) || {};
    const tenders = await getData(`Tenders`) || {};
    let tmp = [];
    for(let id in tenders) {
        if(!Object.keys(userTenders).includes(id)) {
            const { name, status } = tenders[id];
            if(status) tmp.push({ name, id });
        }
    }
    
    const messageValue = tmp.length !== 0 ? 'True' : 'False';
    return { messageValue, tenders: tmp };
}


async function takePartTender(login, name, id, description, price) {
    let response = {};
    const tenders = await getData(`Users/${login}/Tenders`);
    if(Object.keys(tenders).includes(id)) {
        response = { messageValue: 'False' };
    }
    else {
        const date = new Date();
        let updates = {};
        updates[`Tenders/${id}/Members/${login}`] = {
            description,
            price,
            date: formatDate(date),
            isWinner: false
        };
        await setData(updates);
        updates = {};
        updates[`Users/${login}/Tenders/${id}`] = name;
        await setData(updates);
        response = { messageValue: 'True' };
    }
    return response;
}

async function getTenderMembers(id) {
    let response = {};
    const status = await getData(`Tenders/${id}/status`);
    if(status) {
        const data = await getData(`Tenders/${id}/Members`);
        if(data) {
            const users = await getData(`Users`);
            const members = Object.keys(data).map(login => {
                const { name, surname } = users[login];
                return {name: `${name} ${surname}`, loginOfMember: login };
            });
            response = { messageValue: 'True', members };
        }
        else {
            response = { messageValue: 'False1', members: [] };
        }
    }
    else {
        response = { messageValue: 'False2', members: [] };
    }
    return response;
}

async function getMemberInfo(id, login) {
    const data = await getData(`Tenders/${id}/Members/${login}`);
    const { description, price } = data;
    return { 
        descriptionOfTender: description,
        price: price,
    };
}

async function choiceWinner(id, login) {
    let updates = {};
    updates[`Tenders/${id}/status`] = false;
    updates[`Tenders/${id}/Members/${login}/isWinner`] = true;
    await setData(updates);
    return { messageValue: 'True' };
}
async function getWinnerTenders(login) {
    const data = await getData(`Users/${login}/Tenders`);
    if(data) {
        const tenders = await getData(`Tenders`);
        let res = [];
        Object.keys(data).forEach(id => {
            const { name } = tenders[id];
            const { isWinner } = tenders[id].Members[login];
            if(isWinner) res.push({ name, id });
        });
        const messageValue = res.length !== 0 ? 'True' : 'False';
        response = { messageValue, tenders: res };
    }
    else {
        response = { messageValue: 'False', tenders: [] };
    }
    return response;
}

async function getUserTenderInfo(id, login) {
    const tender = await getData(`Tenders/${id}`);
    const { date } = tender;
    const { description, price } = tender.Members[login];
    return { 
       // messageValue: 'True', 
        descriptionOfTender: description,
        priceOfTender: price,
        dateOfTender: date
    };
}

async function getUserTenders(login) {
    const data = await getData(`Users/${login}/Tenders`);
    if(data) {
        const tenders = await getData(`Tenders`);
        let res = [];
        Object.keys(data).forEach(id => {
            const { name, status } = tenders[id];
            const { isWinner } = tenders[id].Members[login];
            if(status && !isWinner) res.push({ name, id });
        });
        const messageValue = res.length !== 0 ? 'True' : 'False';
        response = { messageValue, tenders: res };
    }
    else {
        response = { messageValue: 'False', tenders: [] };
    }
    return response;
}


module.exports = {
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
   
};
