var router = require('express').Router();
const { requiresAuth } = require('express-openid-connect');
const nodemailer = require('nodemailer');

router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'JSH|DEV - Home',
    isAuthenticated: req.oidc.isAuthenticated()
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



module.exports = router;
