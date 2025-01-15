const express = require('express');
const app = express();
const path = require('path');
const Datastore = require('nedb');
const db = require('mysql');
require('dotenv').config();
const api_key = process.env.GM_API_KEY;

const connection = db.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'trip',
    port: 3306
});

require('dotenv').config();
port = process.env.PORT
connection.connect();


  
/* nedb */

// const log_db = new Datastore({filename: path.join(__dirname, 'databases', 'log_db.db')});
// const places_db = new Datastore({filename: path.join(__dirname, 'databases', 'places_db.db')});
// const plan_db = new Datastore({filename: path.join(__dirname, 'databases', 'plan_db.db')});

// log_db.loadDatabase();
// places_db.loadDatabase();
// plan_db.loadDatabase();

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.json());

/* nedb post places_db */
// app.post('/add-item/:category', (req, res) => {
//     const category = req.params.category;
//     const data = req.body;
//     places_db.insert(data);
//     res.json(data);
//     // return res.redirect(`/list-page/${category}`)
// });

app.post('/add-item/:category', (req, res) => {
    const category = req.params.category;
    const data = req.body;
    const trip_code = "2501_turkey";
    const title = data.title;
    const description = data.desc;
    const lat = data.lat;
    const lng = data.lng;

    var sql = `INSERT INTO places_db (trip_code, category, title, description, lat, lng) VALUES (?, ?, ?, ?, ?, ?)`
    connection.query(sql, [trip_code, category, title, description, lat, lng], (err, results) => {
        if (err) {
            console.error('Error executing query: ', err);
            return res.status(500).json({error: 'Failed to add item to the database'});
        }
        res.json({message: 'Successfully added', results});        
    });
});

app.get('/overview', (req, res) => {
    const sql = "SELECT * FROM places_db";
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching overview:', err);
            return res.status(500).json({ error: 'Failed to fetch overview data' });
        }
        res.json({ data: result });
    });
});

app.post('/plan', (req, res) => {
    const data = req.body;
    var sql = "DELETE FROM plan_db"
    connection.query(sql);

    data.forEach((item) => {
        var plan_name = item.plan_name;
        var plan_item = item.plan_item;
        var sql = "INSERT INTO plan_db (plan_name, plan_item) VALUES (?, ?)";
        connection.query(sql, [plan_name, plan_item], function (err, result) {
            if(err) throw (err);
            console.log('plan added : ', result);
        });
    });
});


app.get('/plan', (req, res) => {
    var sql = "SELECT * FROM plan_db"
    connection.query(sql, function (err, results) {
        if (err) throw (err);
        res.json({results});
    });
});

app.get('/api/:category', (req, res) => {
    const category = req.params.category;
    var sql = `SELECT * FROM places_db WHERE category = '${category}'`
    connection.query(sql, function (err, results) {
        if (err) {
            res.status(500).send('Error retrieving data');
            return;
        }
        res.json({results});
    });
});

app.get('/list-page/:category', (req, res) => {
    const category = req.params.category;
    var sql = `SELECT * FROM places_db WHERE category = '${category}'`
    connection.query(sql, function (err, results) {
        if (err) {
            res.status(500).send('Error retrieving data');
            return;
        }
        res.render('list-page', { category, results });
    });
});

app.get('/add-item/:category', (req, res) => {
    const category = req.params.category;
    res.render('add-item', { category });
})

app.listen(port, () => {
    console.log(`app is running on http://localhost:${port}`);
})