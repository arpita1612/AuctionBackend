var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var mongodb = require('../models/mongodb')


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});


router.post('/list', function (req, res, next) {
    // var query = { role: "bidder" };
    var query = { role: req.body.role };
    mongodb.find(req, "user", query, function (err, result) {
        if (err) res.json({});
        else {
            res.json(result);
        }
    })
});

// router.post('/tableDrop', function (req, res, next) {
//     if (req.body.tableName) {
//         mongodb.drop(req, req.body.tableName, function (err, result) {
//             if (err) {
//                 res.json({ status: false });
//             }
//             else
//                 res.json({ status: true });
//         })
//     } else res.json({ status: false });
// });



module.exports = router;