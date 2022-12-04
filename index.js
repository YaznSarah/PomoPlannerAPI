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

app.get('/blogs', async (req, res) => {
    const rows = await con.query("SELECT * FROM blogs");
    res.json(rows);
});

app.get('/blogstags', async (req, res) => {
    const rows = await con.query("SELECT * FROM blogstags");
    res.json(rows);
});

app.get('/comments', async (req, res) => {
    const rows = await con.query("SELECT * FROM comments");
    res.json(rows);
});

app.get('/blogs/:id', async (req, res) => {
    const blog = await con.query("SELECT * from blogs WHERE blogid = ? LIMIT 1", [req.params.id]);
    const comments = await con.query("SELECT * from comments WHERE blogid = ?", [req.params.id]);
    const tags = await con.query("SELECT * from blogstags WHERE blogid = ?", [req.params.id]);
    res.json({
        blog: blog[0],
        comments: comments,
        tags: tags
    });
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
    res.json(req.body);
});

app.post('/blogs', async (req, res) => {
    let selectSQL = 
                `SELECT 
                    count(*) AS total 
                FROM 
                    blogs
                WHERE 
                    pdate > NOW() - INTERVAL 1 DAY
                AND 
                    created_by = ?`;
    user = req.body.created_by
    blogsPostedToday = await con.query(selectSQL, user)
    if(blogsPostedToday.length > 0 && blogsPostedToday[0].total >= 2){
        return res.status(400).json({
            "error": "Maximum POST limit per user reached"
        })
    };
     let sql = `INSERT INTO
                    blogs
                SET
                    subject = ?,
                    description = ?,
                    created_by = ?,
                    pdate  = NOW()`;
    const values = [req.body.subject, req.body.description, req.body.created_by];
    const result = await con.query(sql, values)
    req.body.blogid = result.insertId;
    for(let tag of req.body.tags){
        let sql = 
        `INSERT INTO 
            blogstags
        SET
            blogid = ?,
            tag = ?`;
    
        let tagValues = [result.insertId, tag]
        await con.query(sql, tagValues)
    }

    res.json(req.body)
});

app.post('/blogstags', async (req, res) => {
   let sql = 
               `INSERT INTO 
                   blogstags
                SET
                   blogid = ?,
                   tag = ?`;
   const values = [req.body.blogid, req.body.tag]
   const result = await con.query(sql, values)
   res.json(req.body)
});


app.post('/comments', async (req, res) => {

    let blogSelect = 
        `SELECT 
            created_by
        FROM 
            blogs
        WHERE 
            blogid = ?`;
    
    const blogInfo = await con.query(blogSelect, [req.body.blogid]);
    if(blogInfo.length == 0 || blogInfo[0].created_by == req.body.posted_by){
        return res.status(400).json({
            "error": "User cannot comment on a blog they posted"
        });
    }

    let selectSQL = 
            `SELECT 
                blogid, count(*) AS total
            FROM 
                comments
            WHERE 
                cdate > NOW() - INTERVAL 1 DAY 
            AND 
                posted_by = ?
            GROUP BY
                blogid`;
    user = req.body.posted_by
    commentsPostedToday = await con.query(selectSQL, [user])
    let totalPosts = 0;
    for(let row of commentsPostedToday){
        totalPosts+= row['total'];
        if(row['blogid'] == req.body.blogid){
            return res.status(400).json({
                "error": "Already posted to this blog"
            });
        }
    }
    let sql = 
                `INSERT INTO 
                    comments
                 SET
                    sentiment = ?,
                    description = ?,
                    posted_by = ?,
                    cdate = NOW(),
                    blogid = ?`;
    const values = [req.body.sentiment, req.body.description, req.body.posted_by, req.body.blogid]
    const result = await con.query(sql, values)
    res.json(req.body)
 });

app.post('/boards', async (req, res) => {
    if (req.body.title == undefined) {
        return res.status(400).json({
            "error": "title missing"
        });
    }
    let sql = 
                `INSERT INTO
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
