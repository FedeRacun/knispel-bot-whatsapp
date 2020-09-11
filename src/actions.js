const Receta = require('./models/recetas')
const MESSAGES = require('./constants/messages');

function getRandom(max) {
    if (max !== 0) max--;
    const number=  0 + Math.random() * (max - 0);
    return number.toFixed();
}

async function getReceta(query) {
    console.log('Voy a pedirle a la base: ',query);
    return new Promise((resolve,reject) => {
        Receta.find(query)
        .exec( (err, recetaDB)=> {
            if( err) {
                reject( console.log({
                    ok: false,
                    err
                }))
            };
            const random = getRandom(recetaDB.length);
            resolve(recetaDB[random]);
        })
    });
};

function actions(msg) {
    let body = msg.body;
    let queryPlus = {};
    const isAction = body.startsWith('#')
    const hasAdditives = body.includes('-')

    console.log({isAction, hasAdditives})

    if (isAction) {
        body = body.replace(/\s/g, '');

        if(hasAdditives){
            let additivesIndex = body.search('-')+1;
            let additivesSector = body.slice(additivesIndex, body.length)
            const additives = additivesSector.split('-');

            switch (additives[0]) {
                case "f":
                    queryPlus = {...queryPlus, difficulty: 1};
                    break;
                case "m":
                    queryPlus = {...queryPlus, difficulty: 2};
                    break;
                case "d":
                    queryPlus = {...queryPlus, difficulty: 3};
                    break;
                case "tacc":
                    queryPlus = {...queryPlus, glutenFree: true};
                    break;
            }

            queryPlus = !!additives[1] ? {...queryPlus, glutenFree: true} : queryPlus;
            body = body.split('-')[0];
        }


    } else {
        return client.sendMessage(msg.from, MESSAGES.NOTACTION);
    }

    switch (body) {
        case '#ping':
            client.sendMessage(msg.from, 'pong');
            break;

        case '#facil':
        case "#fácil":
            getReceta({...queryPlus,difficulty: 1}).then( recetaRandom => {
                client.sendMessage(msg.from, MESSAGES.RECIPE(recetaRandom));
            })
            break;

        case '#medio':
            getReceta({...queryPlus,difficulty: 2}).then( recetaRandom => {
                client.sendMessage(msg.from, MESSAGES.RECIPE(recetaRandom));
            })
            break;

        case '#dificil':
        case "#difícil":
            getReceta({...queryPlus,difficulty: 3}).then( recetaRandom => {
                client.sendMessage(msg.from, MESSAGES.RECIPE(recetaRandom));
            })
            break;

        case ('#vegetariano'):
            getReceta({...queryPlus,type: 'VEGETARIAN'}).then( recetaRandom => {
                client.sendMessage(msg.from, MESSAGES.RECIPE(recetaRandom));
            })
            break;

        case '#vegano':
            getReceta({...queryPlus,type: 'VEGAN'}).then( recetaRandom => {
                client.sendMessage(msg.from, MESSAGES.RECIPE(recetaRandom));
            })
            break;

        case '#postre':
            getReceta({...queryPlus,type: 'DESSERT'}).then( recetaRandom => {
                client.sendMessage(msg.from, MESSAGES.RECIPE(recetaRandom));
            })
            break;

        case '#opciones':
            client.sendMessage(msg.from, MESSAGES.OPTIONS);
            break;

        default:
            client.sendMessage(msg.from, MESSAGES.DEFAULT);
            break;

    }

}

module.exports = {
    actions
};