const express = require('express');
const cors = require('cors')
const port = 3000;
const app = express();
const mysql = require('promise-mysql');

let con;
(async () => {
    con = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "simple",
        database: "planner"
    });
})();

app.use(cors());
app.use(express.json());


app.get('/tasks', async (req, res) => {
    const rows = await con.query("SELECT * FROM tasks");
    res.json(rows);
});
app.post('/tasks', async (req, res) => {
    if(req.body.title == undefined){
        return res.status(400).json({
            "error": "title missing"
        });
    }
    let sql = `INSERT INTO
                    tasks
                SET
                    title = ?,
                    status = ?,
                    description = ?,
                    date_created = NOW()`;
    const values = [req.body.title, req.body.status, req.body.description];
    await con.query(sql, values);
    res.json(req.body);
});

app.put('/tasks/:id', (req, res) => {
    let sql = `UPDATE 
                    tasks
                SET 
                    title = ?,
                    status = ?,
                    description = ?
                WHERE
                    id = ?`

    const values = [req.body.title, req.body.status, req.body.description, req.params.id];
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

const server = app.listen(3000);