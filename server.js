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

port = process.env.PORT
connection.connect();

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


app.post('/:trip_code/add-item/:category', (req, res) => {
    const category = req.params.category;
    const data = req.body;
    const trip_code = req.params.trip_code;
    const title = data.title;
    const description = data.desc;
    const lat = data.lat;
    const lng = data.lng;
    const url = data.url;

    var sql = `INSERT INTO places_db (trip_code, category, title, description, lat, lng, url) VALUES (?, ?, ?, ?, ?, ?, ?)`
    connection.query(sql, [trip_code, category, title, description, lat, lng, url], (err, results) => {
        if (err) {
            console.error('Error executing query: ', err);
            return res.status(500).json({error: 'Failed to add item to the database'});
        }
        res.json({message: 'Successfully added', results});        
    });
});

app.get('/', (req, res) => {
    res.redirect('/2509_korea/overview/');
});

app.get('/map', (req, res) => {
    res.render('map');
});

app.get('/:trip_code/overview', (req, res) => {
    const trip_code = req.params.trip_code;
    const sql = `SELECT * FROM places_db where trip_code = '${trip_code}'`;
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching overview:', err);
            return res.status(500).json({ error: 'Failed to fetch overview data' });
        }
        res.render('overview', {trip_code, results})
    });
});

app.get('/api/:trip_code/trip_center', (req, res) => {
    const trip_code = req.params.trip_code;
    const sql = `SELECT * FROM trip_center where trip_code = '${trip_code}'`;
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching overview:', err);
            return res.status(500).json({ error: 'Failed to fetch overview data' });
        }
        res.json({data:results});
    });
});

app.get('/api/:trip_code/overview', (req, res) => {
    const trip_code = req.params.trip_code;
    const sql = `SELECT * FROM places_db where trip_code = '${trip_code}'`;
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching overview:', err);
            return res.status(500).json({ error: 'Failed to fetch overview data' });
        }
        res.json({data:results});
    });
});

app.post('/:trip_code/plan', (req, res) => {
    const trip_code = req.params.trip_code;
    const data = req.body;
    var sql = `DELETE FROM plan_db where trip_code = '${trip_code}'`
    connection.query(sql);

    data.forEach((item) => {
        var trip_code = item.trip_code;
        var plan_name = item.plan_name;
        var plan_item = item.plan_item;
        var sql = "INSERT INTO plan_db (plan_name, plan_item, trip_code) VALUES (?, ?, ?)";
        connection.query(sql, [plan_name, plan_item, trip_code], function (err, result) {
            if(err) throw (err);
            console.log('plan added : ', result);
        });
    });
});


app.get('/:trip_code/plan', (req, res) => {
    const trip_code = req.params.trip_code;

    var sql = `SELECT * FROM plan_db where trip_code = '${trip_code}'`
    connection.query(sql, function (err, results) {
        if (err) throw (err);
        res.json({results});
    });
});

app.get('/api/:trip_code/:category', (req, res) => {
    const trip_code = req.params.trip_code;
    const category = req.params.category;
    var sql = `SELECT * FROM places_db WHERE category = '${category}' and trip_code = '${trip_code}'`
    connection.query(sql, function (err, results) {
        if (err) {
            res.status(500).send('Error retrieving data');
            return;
        }
        res.json({results});
    });
});

app.get('/:trip_code/list-page/:category', (req, res) => {
    const trip_code = req.params.trip_code;
    const category = req.params.category;
    var sql = `SELECT * FROM places_db WHERE category = '${category}' and trip_code = '${trip_code}'`
    connection.query(sql, function (err, results) {
        if (err) {
            res.status(500).send('Error retrieving data');
            return;
        }
        res.render('list-page', { trip_code, category, results });
    });
});

app.get('/:trip_code/add-item/:category', (req, res) => {
    const trip_code = req.params.trip_code;
    const category = req.params.category;
    res.render('add-item', { trip_code, category });
})

app.listen(port, () => {
    console.log(`app is running on http://localhost:${port}`);
})