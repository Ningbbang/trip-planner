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

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.json());

app.post('/add-item/:category', (req, res) => {
    const category = req.params.category;
    const data = req.body;
    places_db.insert(data);
    res.json(data);
    // return res.redirect(`/list-page/${category}`)
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

app.get('/api/restaurant', (req, res) => {
    places_db.find({category:'restaurant'}, (err, data) => {
        if (err) {
            response.end();
            return;
        }
        res.json({data});
    })
});

app.get('/api/museum', (req, res) => {
    places_db.find({category:'museum'}, (err, data) => {
        if (err) {
            response.end();
            return;
        }
        res.json({data});
    })
});

app.get('/api/activity', (req, res) => {
    places_db.find({category:'activity'}, (err, data) => {
        if (err) {
            response.end();
            return;
        }
        res.json({data});
    })
});

app.get('/api/hotel', (req, res) => {
    places_db.find({category:'hotel'}, (err, data) => {
        if (err) {
            response.end();
            return;
        }
        res.json({data});
    })
});

app.get('/list-page/:category', (req, res) => {
    const category = req.params.category;

    places_db.find({category: category}, (err, data) => {
        if (err) {
            res.status(500).send('Error retrieving data');
            return;
        }
        res.render('list-page', { category, data });
    });
})

app.get('/add-item/:category', (req, res) => {
    const category = req.params.category;
    res.render('add-item', { category });
})

app.listen(port, () => {
    console.log(`app is running on http://localhost:${port}`)
})