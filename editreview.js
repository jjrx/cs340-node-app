module.exports = function() {
  var express = require('express');
  var router = express.Router();
  var session = require('express-session');
  var moment = require('moment');

  /* Get data for a particular rating from Ratings entity */
  function getRating(res, mysql, context, id, complete) {
    // var query = "SELECT * FROM Ratings \
    // LEFT JOIN Books ON Ratings.bookID = Books.bookID \
    // WHERE ratingID = ?";
    var query = "SELECT * FROM Ratings WHERE ratingID=?";
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

  /* Get all bookID and bookTitle from Books entity to display in dropdown
  in 'update review' form */
  function getBooks(res, mysql, context, complete) {
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

  /* Display info for a specific rating in 'update review' form to user */
  router.get('/:id', function(req, res) {
    // only allows form to display if user is logged on
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
    // make user login to edit reviews
    } else {
      res.redirect('/login');
    }
  });

  /* Update a rating */
  router.put('/:id', function(req, res) {
    // convert JS date format to SQL format for insert
    var curDate = moment();
    var curDateString = curDate.format('YYYY-MM-DD');
    var mysql = req.app.get('mysql');
    // convert empty string to null for successful import into db
    if (req.body.book == '') {
      req.body.book = null;
    }
    var sql = "UPDATE Ratings SET bookID=?, rating=?, comments=?, rateDate=? WHERE ratingID=?";
    var inserts = [req.body.book, req.body.rating, req.body.comments, curDateString, req.params.id];
    sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
      if (error) {
        console.log(error);
        res.write(JSON.stringify(error));
        res.end();
      } else {
        res.status(200);
        res.end();
      }
    });
  });

  return router;

}();
