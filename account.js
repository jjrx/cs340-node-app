module.exports = function(){
    var express = require('express');
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


    /* Display info and reviews for logged in user */
    router.get('/', function(req, res){
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
      } else {
        res.redirect('login');
      }
    });

    function dateToYMD(date) {
      var d = date.getDate();
      var m = date.getMonth() + 1; //Month from 0 to 11
      var y = date.getFullYear();
      return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
  }

    // router.put('/:id', function(req, res){
    //     var curDate = new Date();
    //     var curDateString = dateToYMD(curDate);
    //     var mysql = req.app.get('mysql');
    //     console.log(req.body)
    //     console.log(req.params.id)
    //     var sql = "UPDATE Ratings SET rating=?, comments=?, rateDate=? WHERE ratingID=?";
    //     var inserts = [req.body.rating, req.body.comments, curDateString];
    //     sql = mysql.pool.query(sql,inserts,function(error, results, fields){
    //         if(error){
    //             console.log(error)
    //             res.write(JSON.stringify(error));
    //             res.end();
    //         }else{
    //             res.status(200);
    //             res.end();
    //         }
    //     });
    // });

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
