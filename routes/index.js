var router = require('express').Router();
const { requiresAuth } = require('express-openid-connect');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const TodoTask = require("../models/TodoTask");
const { db } = require('../models/TodoTask');
const MongoClient = require('mongodb').MongoClient;
var mongodb = require('mongodb');
const url = require('url');


router.get('/', function (req, res, next) {
  var url = "mongodb+srv://admin:JxqaaQFA3LfDuKE7@cluster0.mkzs0.mongodb.net/jshdevco?retryWrites=true&w=majority";
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("jshdevco");
    dbo.collection("jshdevco").find({}, { projection: {_id:1, task:1, createdDate:1}}).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      res.render("index", 
    { 
      title: 'JSH|DEV - Home',
      isAuthenticated: req.oidc.isAuthenticated(),
      todoTasks: result 
    });
      db.close();
    });
  });

  
});

router.get('/about', function (req, res, next) {
  res.render('about', {
    title: 'JSH|DEV - About',
    isAuthenticated: req.oidc.isAuthenticated()
  });
});

router.get('/projects', function (req, res, next) {
  res.render('projects', {
    title: 'JSH|DEV - Projects',
    isAuthenticated: req.oidc.isAuthenticated()
  });
});

router.get('/profile', requiresAuth(), function (req, res, next) {
  res.render('profile', {
    userProfile: JSON.stringify(req.oidc.user, null, 2),
    title: 'JSH|DEV - Profile'
  });
});

router.get('/contact-success', requiresAuth(), function (req, res, next) {
  res.render('contact-success', {
    userProfile: JSON.stringify(req.oidc.user, null, 2),
    title: 'JSH|DEV - Email Sent'
  });
});

const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_PASS = process.env.GMAIL_PASS
const MY_EMAIL = process.env.MY_EMAIL

// POST route from contact form
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




router.post('/addTodo',async (req, res) => 
{

  
  const uri = "mongodb+srv://admin:JxqaaQFA3LfDuKE7@cluster0.mkzs0.mongodb.net/jshdevco?retryWrites=true&w=majority";
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  client.connect(err => 
  {
    const collection = client.db("jshdevco").collection("jshdevco");
    // perform actions on the collection object
   
    console.log(collection);
    var d = new Date();
    var myobj = { task: req.body.content, createdDate: d };
    collection.insertOne(myobj, function(err, res){
      if(err){
        throw err;
      }
      console.log('added 1');
      res.redirect('index');
      db.close();
    });
  });
});

//DELETE
router.get("/remove/:id", requiresAuth(), function (req, res, next)
{
  const uri = "mongodb+srv://admin:JxqaaQFA3LfDuKE7@cluster0.mkzs0.mongodb.net/jshdevco?retryWrites=true&w=majority";
  var id = req.params.id;
  MongoClient.connect(uri, function(err, db) 
  {
    var dbo = db.db("jshdevco"); 
    try 
    {
      dbo.collection("jshdevco").deleteOne({ "_id" : new mongodb.ObjectId(id)});
      res.send('POST recieved', 200);
      db.close();
    } 
    catch (e) 
    {
      res.send('Error', 500);
      print(e);
    }
  });
});


module.exports = router;
