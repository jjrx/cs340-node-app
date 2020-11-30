module.exports = function(){
    var express = require('express');
    var router = express.Router();

    /* Gets all info for a particular user from Users entity */
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

    /* Gets all ratings for a particular user */
    function getReviewsByUser(res, mysql, context, id, complete){
      // left join in case bookID for a review is NULL
      var query = "SELECT Books.bookID, bookTitle, bookCover, ratingID, username, rating, comments, rateDate FROM Ratings \
      LEFT JOIN Books ON Ratings.bookID = Books.bookID \
      LEFT JOIN Users ON Ratings.userID = Users.UserID \
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

    /* Display info and reviews for user after s/he logs in */
    router.get('/', function(req, res){
      // only display data if user is logged in
      if (req.session.userID) {
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletereview.js", "editreview.js"];
        var mysql = req.app.get('mysql');
        getUser(res, mysql, context, req.session.userID, complete);
        getReviewsByUser(res, mysql, context, req.session.userID, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('account', context);
            }
        }
      // redirect to login form if there is no current user session
      } else {
        res.redirect('login');
      }
    });

    /* Deletes a particular rating */
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM Ratings WHERE ratingID = ?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                console.log(error);
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            } else{
                res.status(202).end();
            }
        })
    })

    return router;
}();
