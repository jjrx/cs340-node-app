module.exports = function(){
    var express = require('express');
    var session = require('express-session');
    var router = express.Router();

    function getUser(res, mysql, context, id, complete){
        var sql = "SELECT * FROM Users WHERE userID = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.user = results[0];
            complete();
        });
    }

    function getReviewsByUser(res, mysql, context, id, complete){
      var query = "SELECT Books.bookID, bookTitle, bookCover, ratingID, username, rating, comments, rateDate FROM Ratings \
      INNER JOIN Books ON Ratings.bookID = Books.bookID \
      INNER JOIN Users ON Ratings.userID = Users.UserID \
      WHERE Users.userID = ?";
      var inserts = [id];
      mysql.pool.query(query, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.reviews = results;
            complete();
        });
    }
    /* Display log in form */
    router.get('/', function(req, res){
          if (req.session.userID) {
            res.redirect('account');
          } else {
            res.render('login');
          }

    });

    router.get('/logout', function(req, res){
          delete req.session.userID;
          res.redirect('login');
    });

    router.post('/', function(req, res) {
      var context = {};
      var mysql = req.app.get('mysql');
      var sql = "SELECT * FROM Users WHERE username = ? AND userPassword = ?";
      var inserts = [req.body.username, req.body.password];
      sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
        if (error) {
          console.log(JSON.stringify(error))
          res.write(JSON.stringify(error));
          res.end();
        } else {
          if (results.length == 0) {
            res.redirect('login');
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
