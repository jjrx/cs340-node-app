module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getUsers(res, mysql, context, complete){
        mysql.pool.query("SELECT * FROM Users", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            // context.books = JSON.parse(JSON.stringify(results));
            context.users = results;
            complete();
        });
    }

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
      var query = "SELECT bookTitle, bookCover, ratingID, username, rating, comments, rateDate FROM Ratings INNER JOIN Books ON Ratings.bookID = Books.bookID INNER JOIN Users ON Ratings.userID = Users.UserID WHERE Users.userID = ?";
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

    // Display all user data
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};

        var mysql = req.app.get('mysql');
        getUsers(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('users', context);
            }
        }

    });

    /* Display info and reviews for a specific user */
    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getUser(res, mysql, context, req.params.id, complete);
        getReviewsByUser(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('user', context);
            }

        }
    });

    return router;
}();
