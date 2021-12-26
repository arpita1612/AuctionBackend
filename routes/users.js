var express = require('express');
var router = express.Router();
var mongodb = require('../models/mongodb')
var ObjectID = require('mongodb').ObjectID;


/* GET users listing. */
// router.get('/', function (req, res, next) {
//   // res.send('respond with a resource');
//   req.db.collection.remove('user')

// });

router.post('/register', function (req, res, next) {
  //var obj ={ Name: '', Email: '', Gender: '', DOB: '', Mobile_no: '', Address : '', State: '', Country: '', PinCode: '', Bidcoin : '', Date: '', IsVerified: '', Username: '', Password: '', type: ''}
  var obj = req.body;
  mongodb.insert(req, "user", obj, function (err, result) {
    if (err) {
      res.json({ status: false });
    }
    else
      res.json({ status: true });
  })
});

router.post('/update', function (req, res, next) {
  if (req.body._id != null) {
    var _id = ObjectID(req.body._id);
    var obj = req.body;
    delete obj._id;
    var myquery = { _id: _id };
    var newvalues = { $set: obj };
    mongodb.update(req, "user", myquery, newvalues, function (err, result) {
      if (err) {
        res.json({ status: false });
      }
      else
        res.json({ status: true });
    })
  } else res.json({ status: false });
});


router.post('/login', function (req, res, next) {
  if (req.body.username != null && req.body.password != null) {
    var query = { username: req.body.username, password: req.body.password };
    mongodb.findOne(req, "user", query, function (err, result) {
      if (err)
        res.json([]);
      else {
        console.log(result);
        if (result != null && req.body.username == result.username && req.body.password == result.password) {
          delete result.password;
          res.json(result);
        } else res.json([]);
        ;
      }
    })
  } else res.json([]);
  ;
});

module.exports = router;
