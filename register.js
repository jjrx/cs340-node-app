module.exports = function(){
    var express = require('express');
    var session = require('express-session');
    var router = express.Router();

    /* Display register form */
    router.get('/', function(req, res){
          if (req.session.userID) {
            res.redirect('account');
          } else {
            res.render('register');
          }

    });

    function dateToYMD(date) {
      var d = date.getDate();
      var m = date.getMonth() + 1; //Month from 0 to 11
      var y = date.getFullYear();
      return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
  }

    router.post('/', function(req, res) {
      var context = {};
      var curDate = new Date();
      var curDateString = dateToYMD(curDate);
      var mysql = req.app.get('mysql');
      var sql = "INSERT INTO Users (username, userFirstName, userLastName, userCreationDate, userPicture, userPassword) VALUES (?,?,?,?,?,?)";
      var inserts = [req.body.username, req.body.fname, req.body.lname, curDateString, req.body.pic, req.body.password];
      sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
        if (error) {
          console.log(JSON.stringify(error))
          res.write(JSON.stringify(error));
          res.end();
        } else {
          res.redirect('login');
        }
      });
    });

    return router;
}();
