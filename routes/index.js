var router = require('express').Router();
const { requiresAuth } = require('express-openid-connect');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const TodoTask = require("../models/TodoTask");
const { db } = require('../models/TodoTask');
const MongoClient = require('mongodb').MongoClient;
var mongodb = require('mongodb');
const url = require('url');
const { isNullOrUndefined } = require('util');

const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_PASS = process.env.GMAIL_PASS
const MY_EMAIL = process.env.MY_EMAIL
const DB_CONNECT = process.env.DB_CONNECT
// Index - Home 
router.get('/', function (req, res, next) {
  var url = DB_CONNECT;


  if (req.oidc.isAuthenticated()) {
    var userEmail = req.oidc.user.email;
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("jshdevco");

      dbo.collection("jshdevco").find({ authUser: userEmail }, { projection: { _id: 1, task: 1, createdDate: 1, authUser: 1 } }).toArray(function (err, result) {
        if (err) throw err;
        res.render("index",
          {
            title: 'JSH|DEV - Home',
            isAuthenticated: req.oidc.isAuthenticated(),
            todoTasks: result
          });
        db.close();
      });
    });
  }
  else {
    res.render("index",
      {
        title: 'JSH|DEV - Home',
        isAuthenticated: req.oidc.isAuthenticated()
      });
  }
});
// About
router.get('/about', function (req, res, next) {
  res.render('about', {
    title: 'JSH|DEV - About',
    isAuthenticated: req.oidc.isAuthenticated()
  });
});
// Projects
router.get('/projects', function (req, res, next) {
  res.render('projects', {
    title: 'JSH|DEV - Projects',
    isAuthenticated: req.oidc.isAuthenticated()
  });
});
// Profile
router.get('/profile', requiresAuth(), function (req, res, next) {
  res.render('profile', {
    userProfile: JSON.stringify(req.oidc.user, null, 2),
    title: 'JSH|DEV - Profile'
  });
});
// POST contact form
router.post('/contact', (req, res) => {

  // Instantiate the SMTP server
  const smtpTrans = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS
    }
  })

  // Specify what the email will look like
  const mailOpts = {
    from: 'dev.jshdevco@gmail.com', // This is ignored by Gmail
    to: MY_EMAIL,
    subject: 'New message from contact form at JSH|DEV',
    text: `${req.body.first_name} ${req.body.last_name} (${req.body.email_address}) says: ${req.body.email_message}`
  }

  // Attempt to send the email
  smtpTrans.sendMail(mailOpts, (error, response) => {
    if (error) {
      res.render('error') // Show a page indicating failure
    }
    else {
      res.render('contact-success') // Show a page indicating success
    }
  })
});
// Contact Success
router.get('/contact-success', requiresAuth(), function (req, res, next) {
  res.render('contact-success', {
    userProfile: JSON.stringify(req.oidc.user, null, 2),
    title: 'JSH|DEV - Email Sent'
  });
});
//Add Todo
router.post('/addTodo', requiresAuth(), async (req, res) => {
  const uri = DB_CONNECT;
  var userEmail = req.oidc.user.email;
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  client.connect(err => {
    const collection = client.db("jshdevco").collection("jshdevco");
    var d = new Date();
    var myobj = { task: req.body.content, createdDate: d, authUser: userEmail };
    collection.insertOne(myobj, function (err, res) {
      if (err) {
        throw err;
      }
      db.close();
    });
    res.redirect('/');
  });
});
//UPDATE
router.post('/edit', requiresAuth(), async (req, res, next) => {
  const uri = DB_CONNECT;
  const id = new mongodb.ObjectID(req.body.taskId);
  var d = new Date();
  console.log(id);
  console.log(req.body.newContent);
  // Find the document that describes "lego"
  const query = { "_id": id };
  // Set some fields in that document
  const update = {
    "$set": {
      "task": req.body.newContent,
      "createdDate": d
    }
  };
  // Return the updated document instead of the original document
  const options = { new: true };

  MongoClient.connect(uri, { useUnifiedTopology: true }, function (err, db) {
    var dbo = db.db("jshdevco");
    if (err) { throw err; }
    else {
      var collection = dbo.collection("jshdevco");
      collection.findOneAndUpdate({ "_id": id }, { $set: { "task": req.body.newContent, "createdDate": d } }, { returnNewDocument: true }, function (err, doc) {
        if (err) { throw err; }
        else {
          console.log("Updated");
          res.redirect('/');
          db.close();
        }
      });
    }
  });

});
//Delete Todo
router.get("/remove/:id", requiresAuth(), function (req, res, next) {
  const uri = DB_CONNECT;
  var id = req.params.id;
  MongoClient.connect(uri, function (err, db) {
    var dbo = db.db("jshdevco");
    try {
      dbo.collection("jshdevco").deleteOne({ "_id": new mongodb.ObjectId(id) });
      res.redirect('/');
      db.close();
    }
    catch (e) {
      res.status(500).send('Error: ' + e);
    }
  });
});

module.exports = router;
