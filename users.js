module.exports = function() {
  var express = require('express');
  var router = express.Router();

  /* Get all data from Users entity */
  function getUsers(res, mysql, context, complete) {
    mysql.pool.query("SELECT * FROM Users", function(error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      // context.books = JSON.parse(JSON.stringify(results));
      context.users = results;
      complete();
    });
  }

  /* Get all data for a particular user from Users entity */
  function getUser(res, mysql, context, id, complete) {
    var sql = "SELECT * FROM Users WHERE userID = ?";
    var inserts = [id];
    mysql.pool.query(sql, inserts, function(error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.user = results[0];
      complete();
    });
  }

  /* Get all reviews for a particular user */
  function getReviewsByUser(res, mysql, context, id, complete) {
    var query = "SELECT Books.bookID, bookTitle, bookCover, ratingID, username, rating, comments, rateDate FROM Ratings \
      LEFT JOIN Books ON Ratings.bookID = Books.bookID \
      LEFT JOIN Users ON Ratings.userID = Users.UserID \
      WHERE Users.userID = ?";
    var inserts = [id];
    mysql.pool.query(query, inserts, function(error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.reviews = results;
      complete();
    });
  }

  /* Display all data from Users entity in table on /users page */
  router.get('/', function(req, res) {
    var callbackCount = 0;
    var context = {};
    var mysql = req.app.get('mysql');
    getUsers(res, mysql, context, complete);
    function complete() {
      callbackCount++;
      if (callbackCount >= 1) {
        res.render('users', context);
      }
    }
  });

  /* Display info and reviews for a specific user when visiting /users/:id */
  router.get('/:id', function(req, res) {
    callbackCount = 0;
    var context = {};
    var mysql = req.app.get('mysql');
    getUser(res, mysql, context, req.params.id, complete);
    getReviewsByUser(res, mysql, context, req.params.id, complete);
    function complete() {
      callbackCount++;
      if (callbackCount >= 2) {
        res.render('user', context);
      }

    }
  });

  /* Search for users by username, first name or last name to display only
  these users */
  router.post('/', function(req, res) {
    var context = {};
    var mysql = req.app.get('mysql');
    var sql = "SELECT * FROM Users WHERE username = ? OR userFirstName = ? OR userLastName = ?";
    var inserts = [req.body.username, req.body.fname, req.body.lname];
    sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
      if (error) {
        console.log(JSON.stringify(error))
        res.write(JSON.stringify(error));
        res.end();
      } else {
        context.users = results;
        res.render('users', context);
      }
    });
  });

  return router;
}();
