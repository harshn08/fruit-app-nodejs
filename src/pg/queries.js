const Pool = require("pg").Pool;
const {Client} = require("pg");
const uuid = require("uuid");

const USERID = process.env.USERID;

console.log("THE USERID is in queries.js is : " + USERID);

const {
    getPGConnectString,
} = require("./pg")

const dbConn = new Client(getPGConnectString());
try {
    dbConn.connect();
} catch (err) {
    console.log("failed to connect to database.")
}

const createFruit = (req, rep) => {
    (async () => {
        let fruit = {
            id: uuid.v4(),
            name: req.body.name,
            quantity: req.body.quantity,
        }
        console.log('post called', fruit);
        if (!fruit.name) {
           throw new Error("missing fruit name.")
        }
        try {
            let res = await dbConn.query(`insert into ` + USERID + `.fruit (id, name, quantity) values ($1, $2, $3)`, [fruit.id, fruit.name, fruit.quantity]);
            let res_outbox = await dbConn.query(`insert into ` + USERID + `.fruitoutbox (id, name, quantity) values ($1, $2, $3)`, [fruit.id, fruit.name, fruit.quantity]);
            // await pgPool.end();
        } catch (err) {
            console.log(`fail to use db ${err.status}`);
        }
        rep.send(fruit);
    })().catch((err) => console.log("err from async: " + err.stack));
}

const listFruits = (req, rep) => {
    (async () => {
        dbConn.query('select * from ' + USERID + '.fruit').then(res => {
            rep.status(200).send(res.rows);
        }).catch(e => console.error(e.stack));
    })().catch((err) => console.log("err from async: " + err.stack));
}

const listFruitsv2 = (req, rep) => {
    (async () => {
        const connectionString = getPGConnectString()
        console.log("connstr", connectionString)

        const pool2 = new Pool({connectionString});

        // Connect to database
        const client = await pool2.connect();

        client.query('select * from ' + USERID + '.fruit').then(res => {
            rep.status(200).send(res.rows);
            client.release();
        }).catch(e => console.error(e.stack));
    })().catch((err) => console.log("err from async: " + err.stack));
}

const deleteFruit = (req, rep) => {
    (async () => {
        console.log("deleting", req.params.id);
        let id = req.params.id;
        if(!id){
            throw new Error("Missing fruit id ");
        }
        try{
            let res = await dbConn.query("delete from " + USERID + ".fruit where id = $1", [req.params.id]);
            let res2 = await dbConn.query("delete from " + USERID + ".fruitoutbox where id = $1", [req.params.id]);
            rep.status(200).send(res.rows);
        } catch(err){
            console.log(`fail to use db ${err.status}`);
        }
        //rep.status(200).send(res.rows);
    })().catch((err) => console.log("err from async: " + err.stack));
}

const updateFruit = (req, rep) => {
    (async () => {
        console.log("updating", req.params.id, req.body.name, req.body.quantity);
        let fruit = {
            id: req.params.id,
            name: req.body.name,
            quantity: req.body.quantity,
        }
        if (!fruit.name) {
            throw new Error("missing fruit name.")
        }try{
            let res = await dbConn.query("update " + USERID + ".fruit set name = $1, quantity = $2 where id = $3", [req.body.name,req. body.quantity, req.params.id]);
            let res2 = await dbConn.query("update " + USERID + ".fruitoutbox set name = $1, quantity = $2 where id = $3", [req.body.name,req. body.quantity, req.params.id]);
            rep.status(200).send(res.rows);
        } catch(err){
            console.log(`fail to use db ${err.status}`);
        }
    })().catch((err) => console.log("err from async: " + err.stack));
}

async function createDBClient() {
    const connectionString = getPGConnectString()
    console.log("connstr", connectionString)

    const client = new Client(connectionString);
    return client
}

// ??
async function createDBPool() {
    const connectionString = getPGConnectString()
    console.log("connstr", connectionString)

    const pool2 = new Pool({connectionString});

    // Connect to database
    const client = await pool2.connect();
    return client
}

module.exports = {
    createFruit,
    listFruitsv2,
    listFruits,
    deleteFruit,
    updateFruit,
};
