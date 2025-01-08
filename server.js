const express = require('express');
const app = express();
const path = require('path');
const Datastore = require('nedb');
require('dotenv').config();
port = 3000

const api_key = process.env.GM_API_KEY;
const log_db = new Datastore({filename: path.join(__dirname, 'databases', 'log_db.db')});
const places_db = new Datastore({filename: path.join(__dirname, 'databases', 'places_db.db')});
const plan_db = new Datastore({filename: path.join(__dirname, 'databases', 'plan_db.db')});

log_db.loadDatabase();
places_db.loadDatabase();
plan_db.loadDatabase();

app.use(express.static('public'));
app.use(express.json());
app.post('/add-item', (req, res) => {
    const data = req.body;
    places_db.insert(data);
    console.log('item added :', data)
    res.json(data);
});

app.get('/overview', (req, res) => {
    places_db.find({}, (err, data) => {
        if (err) {
            response.end();
            return;
        }
        res.json({data});
    });
});

app.post('/plan', (req, res) => {
    const data = req.body;
    plan_db.remove({}, {multi:true}, function (err, res) {} );
    plan_db.insert(data);
    console.log('plan added : ', data)
    res.json(data)
});

app.get('/plan', (req, res) => {
    plan_db.find({}, (err, data) => {
        if (err) {
            response.end();
            return;
        }
        res.json({data});
    });
});


app.listen(port, () => {
    console.log(`app is running on http://localhost:${port}`)
})