const express = require('express');
const cors = require('cors')
const fs = require('fs');
const port = 3000;
const app = express();
const mysql = require('promise-mysql');

(async () => {
    try {
        con = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "simple",
            database: "planner",
            multipleStatements: true
        });
    } catch (e) {
        console.log(e);
        return;
    }
})();

app.use(cors());
app.use(express.json())
app.use(express.static('public'))

app.get('/tasks', async (req, res) => {
    const rows = await con.query("SELECT * FROM tasks");
    res.json(rows);
});

app.get('/user', async (req, res) => {
    const rows = await con.query("SELECT * FROM user");
    res.json(rows);
});


app.get('/boards/', async (req, res) => {
    const rows = await con.query("SELECT * FROM boards");
    res.json(rows);
});

app.get('/boards/:id', async (req, res) => {
    const board = await con.query("SELECT * from boards WHERE id = ? LIMIT 1", [req.params.id]);
    const tasks = await con.query("SELECT * from tasks WHERE board_id = ?", [req.params.id]);
    res.json({
        board: board[0],
        tasks: tasks
    });
});

app.post('/register', async (req, res) => {
    const values = [req.body.username, req.body.password, req.body.firstName, req.body.lastName, req.body.email];
    let emptyValues = values.filter(e => e.length === 0);
    if(emptyValues.length > 0){
        return res.status(400).send();
    }

    let sql = `INSERT INTO
                    user
                SET
                    username = ?,
                    password = SHA(?),
                    firstName = ?,
                    lastName = ?,
                    email = ?`;
    try {
        const result = await con.query(sql, values);
        req.body.id = result.insertId;
        res.json(req.body);
    } catch (e){
        if(e.code == 'ER_DUP_ENTRY'){
            return res.status(401).send();
        }
        return res.status(500).send();
        console.error(e);ß
    }


});


app.post('/login', async (req, res) => {
    let sql = `SELECT 
                    username 
                FROM 
                    user 
                WHERE
                    email = ?
                AND
                    password = SHA(?)
                LIMIT 1`;

    const values = [req.body.email, req.body.password];
    const rows = await con.query(sql, values);
    res.json(rows);
});

app.post('/tasks', async (req, res) => {
    if (req.body.title == undefined) {
        return res.status(400).json({
            "error": "title missing"
        });
    }
    let sql = `INSERT INTO
                    tasks
                SET
                    board_id = ?,
                    title = ?,
                    status = ?,
                    description = ?,
                    points = ?,
                    date_created = NOW()`;
    const values = [req.body.boardId, req.body.title, req.body.status, req.body.description, req.body.points];
    const result = await con.query(sql, values);
    req.body.id = result.insertId;
    res.json(req.body);
});

app.post('/boards', async (req, res) => {
    if (req.body.title == undefined) {
        return res.status(400).json({
            "error": "title missing"
        });
    }
    let sql = `INSERT INTO
                    boards
                SET
                    title = ?,
                    date_created = NOW()`;
    const values = [req.body.title];
    const result = await con.query(sql, values);
    req.body.id = result.insertId;
    res.json(req.body);
})

app.put('/tasks/:id', (req, res) => {
    let sql = `UPDATE 
                    tasks
                SET 
                    title = ?,
                    status = ?,
                    description = ?,
                    points = ?
                WHERE
                    id = ?`

    const values = [req.body.title, req.body.status, req.body.description, req.body.points, req.params.id];
    con.query(sql, values);
    res.json(req.body);
});

app.delete('/tasks/:id', (req, res) => {
    let sql = `DELETE FROM
                    tasks
                WHERE id = ?`;
    con.query(sql, [req.params.id]);
    console.log(sql)
    res.json(req.body);
});

app.get('/initialize', (req, res) => {
    const file = fs.readFileSync("./sql/schema.sql").toString();
    let sql = file.split("\n").join("");
    console.log(con.query(sql));
    console.log(sql)
    res.json(


    );
});

const server = app.listen(port);
