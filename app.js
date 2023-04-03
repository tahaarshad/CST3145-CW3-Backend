const express = require("express");
const app = express();
var cors = require("cors");
const path = require("path");
var fs = require("fs");

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Logger
app.use(function (request, response, next) {
  console.log("In comes a " + request.method + " to: " + request.url);
  next();
});

const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectId;

let db;

MongoClient.connect(
  "mongodb+srv://mdx-taha:q6mBFDWJNGI2wOFJ@clusterv1.gh9nfpp.mongodb.net",
  (err, client) => {
    db = client.db("webstore");
  }
);

app.get("/", (req, res, next) => {
  res.send("Select a collection, e.g, /collection/messages");
});

app.param("collectionName", (req, res, next, collectionName) => {
  req.collection = db.collection(collectionName);
  return next();
});

app.get("/collection/:collectionName", (req, res, next) => {
  req.collection.find({}).toArray((e, results) => {
    if (e) return next(e);
    res.send(results);
  });
});

app.post("/collection/:collectionName", (req, res, next) => {
  req.collection.insertOne(req.body, (e, results) => {
    if (e) return next(e);
    res.send(results.ops);
  });
});

app.get("/collection/:collectionName/:id", (req, res, next) => {
  req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, results) => {
    if (e) return next(e);
    res.send(results);
  });
});

app.put("/collection/:collectionName/:id", (req, res, next) => {
  req.collection.updateOne(
    { _id: new ObjectID(req.params.id) },
    { $set: req.body },
    { safe: true, multi: false },
    (e, results) => {
      if (e) return next(e);
      res.send(results ? { msg: "sucess" } : { msg: "error" });
    }
  );
});

app.delete("/collection/:collectionName/:id", (req, res, next) => {
  req.collection.deleteOne(
    { _id: new ObjectID(req.params.id) },
    (e, results) => {
      if (e) return next(e);
      res.send(results ? { msg: "sucess" } : { msg: "error" });
    }
  );
});

app.get("/collection/:collectionName/search/:keyword", (req, res, next) => {
  let { keyword } = req.params;
  req.collection.find({}).toArray((err, results) => {
    if (err) return next(err);
    let filteredList = results.filter((lesson) => {
      return (
        lesson.Subject.toLowerCase().match(keyword.toLowerCase()) ||
        lesson.Location.toLowerCase().match(keyword.toLowerCase())
      );
    });
    res.send(filteredList);
  });
});

// File middleware
app.use(function (req, res, next) {
  var filePath = path.join(__dirname, "images", req.url);
  fs.stat(filePath, function (err, fileInfo) {
    if (err) {
      next();
      return;
    }
    if (fileInfo.isFile()) {
      res.sendFile(filePath);
    } else {
      next();
    }
  });
});

app.use(function (req, res, next) {
  res.status(404);
  res.send("File not found");
});

app.listen(3000, function () {
  console.log("server listening");
});
