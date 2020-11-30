module.exports = function() {
  var express = require('express');
  var session = require('express-session');
  var router = express.Router();

  /* Display log in form or account page */
  router.get('/', function(req, res) {
    // show dashboard if user is successfully logged in
    if (req.session.userID) {
      res.redirect('account');
    } else {
    // redirect to login page if there is no current user session
      res.render('login');
    }

  });

  /* Assess if user login is valid */
  router.post('/', function(req, res) {
    var context = {};
    var mysql = req.app.get('mysql');
    // attempt to locate user info in database
    var sql = "SELECT * FROM Users WHERE username = ? AND userPassword = ?";
    var inserts = [req.body.username, req.body.password];
    sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
      if (error) {
        console.log(JSON.stringify(error))
        res.write(JSON.stringify(error));
        res.end();
      } else {
        // username and userPassword were not found in db
        if (results.length == 0) {
          res.redirect('login');
        // login was successful so keep track of user's ID in session
        } else {
          var id = results[0].userID;
          req.session.userID = id;
          res.redirect('account');
        }
      }
    });
  });

  return router;
}();
