var express = require('express'),
    http = require('http');
var schedule = require('node-schedule');
var expressMongoDb = require('express-mongo-db');
var ObjectID = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var moment = require('moment');

var app = express();
app.set('port', 1111);
app.use('/schedule', express.static('../schedule'));
app.use(expressMongoDb('mongodb://localhost/auctionDB'));

var cron = schedule.scheduleJob('0 0 19 * * *', function () {
    console.log("\n ********************************************************************************************************\n");
    console.log(moment(new Date(), 'YYYY-MM-DD HH:mm').format('DD-MM-YYYY HH:mm'));
    // updateBid();
});

var cronserver = http.createServer(app).listen(app.get('port'), function (err) {
    console.log('Cron server listening on port ' + app.get('port'));
    updateBid();
});

function updateBid() {
    productList(function (err, res) {
        if (err) return res;
        if (!res) return res;
        const waitFor = (ms) => new Promise(r => setTimeout(r, ms))
        const asyncForEach = async (array, callback) => {
            for (let index = 0; index < array.length; index++) {
                await callback(array[index], index, array)
            }
        }

        const start = async () => {
            await asyncForEach(res, async (value, key) => {
                await waitFor(3000);
                getBidData(value);
            });
            console.log('Done');
        }
        start();
    });

}
function productList(next) {
    // var currentdate = moment(new Date(), 'YYYY-MM-DD').format("DD-MM-YYYY");
    var currentdate = moment('2021-06-13', 'YYYY-MM-DD').format("DD-MM-YYYY");
    MongoClient.connect('mongodb://localhost/auctionDB', function (err, client) {
        if (err) next(err, null);
        var db = client.db('auctionDB');
        var query = { bidEndDate: currentdate }
        db.collection('product').find(query).toArray(function (err, result) {
            if (err) next(err, null);
            else {
                console.log(result);
                next(null, result);
            }

        })
    })
}

function getBidData(value) {
    MongoClient.connect('mongodb://localhost/auctionDB', function (err, client) {
        if (err) return 1
        var db = client.db('auctionDB');
        db.collection('bid').find({ p_id: value._id.toString() }).sort({ bidAmount: -1 }).limit(1).toArray(function (err, result) {
        
            if (err) return 1
            else {
                console.log(result)
                var obj = { sold: true, bidder_id: result[0].u_id }
                var myquery = { _id: ObjectID(result[0].p_id) };
                var newvalues = { $set: obj };

                db.collection("product").updateOne(myquery, newvalues, function (producterr, r) {
                    if (producterr) { console.log(producterr); return 1 }
                });
                var userMyquery = { _id: ObjectID(result[0].u_id) };
                var userNewvalues = { $inc: { bidcoin: -result[0].bidAmount } };
                db.collection("user").updateOne(userMyquery, userNewvalues, function (producterr1, r1) {
                    if (producterr1) { console.log(producterr1); return 1 }
                });
            }
        })
    })
}