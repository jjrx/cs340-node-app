module.exports = function() {
  var express = require('express');
  var router = express.Router();
  var session = require('express-session');


  function getRating(res, mysql, context, id, complete) {
    var query = "SELECT * FROM Ratings \
    LEFT JOIN Books ON Ratings.bookID = Books.bookID \
    WHERE ratingID = ?";
    var inserts = [id];
    mysql.pool.query(query, inserts, function(error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.rating = results[0];
      complete();
    });
  }

  function getBooks(res, mysql, context, complete) {
    // var query = "SELECT DISTINCT Books.bookID, bookTitle FROM Books \
    // LEFT JOIN Ratings ON Books.bookID = Ratings.bookID \
    // WHERE Ratings.bookID NOT IN (SELECT bookID from Ratings WHERE ratingID = ?)"
    // var inserts = [id];
    var query = "SELECT bookID, bookTitle FROM Books";
    mysql.pool.query(query, function(error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.books = results;
      complete();
    });
  }

  router.get('/', function(req, res) {
    res.redirect('/account');
  });

  /* Display info for a specific rating */
  router.get('/:id', function(req, res) {
    if (req.session.userID) {
      callbackCount = 0;
      var context = {};
      context.jsscripts = ["deletereview.js", "editreview.js"];
      var mysql = req.app.get('mysql');
      getRating(res, mysql, context, req.params.id, complete);
      getBooks(res, mysql, context, complete);
      function complete() {
        callbackCount++;
        if (callbackCount >= 2) {
          res.render('editreview', context);
        }
      }
    } else {
      res.redirect('/login');
    }

  });

  function dateToYMD(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1; //Month from 0 to 11
    var y = date.getFullYear();
    return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
}

  /* Update a rating */
  router.put('/:id', function(req, res){
      var curDate = new Date();
      var curDateString = dateToYMD(curDate);
      var mysql = req.app.get('mysql');
      // convert empty string to null for successful import into db
      if (req.body.book == '') {
        req.body.book = null;
      }
      var sql = "UPDATE Ratings SET bookID=?, rating=?, comments=?, rateDate=? WHERE ratingID=?";
      var inserts = [req.body.book, req.body.rating, req.body.comments, curDateString, req.params.id];
      sql = mysql.pool.query(sql,inserts,function(error, results, fields){
          if(error){
              console.log(error);
              res.write(JSON.stringify(error));
              res.end();
          }else{
              res.status(200);
              res.end();
          }
      });
  });

  return router;

}();
