module.exports = function() {
  var express = require('express');
  var session = require('express-session');
  var router = express.Router();
  var moment = require('moment');

  /* Display register form or dashboard depending on whether user has logged in */
  router.get('/', function(req, res) {
    // if user has already logged in, display dashboard
    if (req.session.userID) {
      res.redirect('account');
    // if there is no current session, display registration form
    } else {
      res.render('register');
    }

  });

  router.post('/', function(req, res) {
    var context = {};
    // convert JS date format to SQL format for insert
    var curDate = moment();
    var curDateString = curDate.format('YYYY-MM-DD');
    var mysql = req.app.get('mysql');
    var sql = "INSERT INTO Users (username, userFirstName, userLastName, userCreationDate, userPicture, userPassword) VALUES (?,?,?,?,?,?)";
    if (req.body.pic == '') {
      req.body.pic = '/img/blank-profile-picture.png';
    }
    var inserts = [req.body.username, req.body.fname, req.body.lname, curDateString, req.body.pic, req.body.password];
    sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
      if (error) {
        console.log(JSON.stringify(error))
        res.write(JSON.stringify(error));
        res.end();
      // upon successful registration, set up session and redirect user to their dashboard
      } else {
        var id = results.insertId;
        req.session.userID = id;
        res.redirect('account');
        // res.redirect('login');
      }
    });
  });

  return router;
}();
