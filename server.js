// load the express module
var express = require("express");

// load the fs module
var fs = require("fs");

// load the mongo client
var mongoClient = require('mongodb').MongoClient;

// initialising the express object
var app = express();

var port = 8080;
var apiPath = "/api/v1";
var apiResource = "/app";

// variables for file
var fileJobs;
var filteredJobs = [];

// connection and db variables for mongodb
var url = "mongodb://127.0.0.1:27017";
var dbName = "jobs";
var db;
var dbJobs = [];
var filteredDbJobs = [];

fs.readFile("data/jobs.json", (err, data) => {
    if (err) {
        throw err;
    }
    fileJobs = JSON.parse(data);
});

mongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
    if (err) {
        console.log(err);
    }
    db = client.db(dbName);
    console.log("connected to mongo db:", url);
    console.log("database:", dbName);
    var cursor = db.collection("jobs").find();
    cursor.each(function (err, doc) {
        if (err) {
            console.log(err);
        }
        if (doc) {
            dbJobs.push(doc);
        }
    });
});

app.listen(port, () => {
    console.log("server is up and running on port ", port);
});

app.get((apiPath + apiResource), (req, res) => {
    res.send("<h2>Welcome to App</h2>");
})

app.get((apiPath + apiResource + "/jobs"), (req, res) => {

    res.header("Content-Type", 'application/json');

    var query = req.query;
    var fetchMode = query.fetchMode;

    if (query && fetchMode) {
        if (fetchMode === "file") {
            var status = query.status;
            if (query && status) {
                filterJobsByStatus(status, fetchMode);
                res.json(filteredJobs);
                filteredJobs = [];
            } else {
                res.json(fileJobs);
            }
        }
        if (fetchMode === "db") {
            var status = query.status;
            if (query && status) {
                filterJobsByStatus(status, fetchMode);
                res.json(filteredDbJobs);
                filteredDbJobs = [];
            } else {
                res.json(dbJobs);
            }
        } 
    }
});

function filterJobsByStatus(status, fetchMode) {
    if (fetchMode === "file") {
        for (var i = 0; i < fileJobs.jobs.length; i++) {
            var element = fileJobs.jobs[i];
            if (element) {
                if (element.jobStatus === status) {
                    filteredJobs.push(element);
                }
            }
        }
    }
    if (fetchMode === "db") {
        var cursor = db.collection("jobs").find({ "jobStatus": status });
        cursor.each(function (err, doc) {
            if (err) {
                console.log(err);
            } else {
                if (doc) {
                    filteredDbJobs.push(doc);
                }
            }
        });
    }
}