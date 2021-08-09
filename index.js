const express = require('express');
const cors = require('cors')
const Database = require('mysql')
const port = 3000;
const app = express();
let db;

var con = Database.createConnection({
    host: "localhost",
    user: "admin",
    password: "password"
});

con.connect((error) => {
    if(error) throw error;
    console.log("Connected!")
    con.query("CREATE DATABASE mydb", (err, result) => {
        if (err) throw err;
        console.log("Database created");
    });
});

app.use(cors());
app.use(express.json());


app.get('/tasks', (req, res) => {
  res.json(req.body);
});
app.post('/tasks', (req, res) => {
    res.json(req.body);
});

app.put('/tasks/:id', (req, res) => {
    res.json(req.body);
});

app.delete('/tasks/:id', (req, res) => {
    res.json(req.body);
});

const server = app.listen(3000);