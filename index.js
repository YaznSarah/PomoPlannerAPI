const express = require('express');
const cors = require('cors')
const port = 3000;
const app = express();
const mysql = require('promise-mysql');

let con;
(async () => {
    try {
        con = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "simple",
            database: "planner"
        });
    } catch (e) {
        console.log(e);
        return;
    }
})();

app.use(cors());
app.use(express.json());


app.get('/tasks', async (req, res) => {
    const rows = await con.query("SELECT * FROM tasks");
    res.json(rows);
});

app.get('/boards', async (req, res) => {
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

app.delete('/boards/:id', (req, res) => {
    let sql = `DELETE FROM
                    boards
                WHERE id = ?`;
    con.query(sql, [req.params.id]);
    console.log(sql)
    res.json(req.body);
})
const server = app.listen(3000);