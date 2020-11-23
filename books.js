module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getBooks(res, mysql, context, complete){
        mysql.pool.query("SELECT * FROM Books", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            // context.books = JSON.parse(JSON.stringify(results));
            context.books = results;
            complete();
        });
    }

    function getReviewsByBook(res, mysql, context, id, complete){
      var query = "SELECT ratingID, username, rating, comments, rateDate FROM Ratings INNER JOIN Users ON Ratings.userID = Users.UserID WHERE bookID = ?";
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

    function getBook(res, mysql, context, id, complete){
        var sql = "SELECT * FROM Books WHERE bookID = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.book = results[0];
            complete();
        });
    }


    // Display all book data
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};

        var mysql = req.app.get('mysql');
        getBooks(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('books', context);
            }
        }

    });

    /* Display info for a specific book */
    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getBook(res, mysql, context, req.params.id, complete);
        getReviewsByBook(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('book', context);
            }

        }
    });

    // /* Adds a book, redirects to the books page after adding */
    // router.post('/', function(req, res){
    //     console.log(req.body.homeworld)
    //     console.log(req.body)
    //     var mysql = req.app.get('mysql');
    //     var sql = "INSERT INTO bsg_people (fname, lname, homeworld, age) VALUES (?,?,?,?)";
    //     var inserts = [req.body.fname, req.body.lname, req.body.homeworld, req.body.age];
    //     sql = mysql.pool.query(sql,inserts,function(error, results, fields){
    //         if(error){
    //             console.log(JSON.stringify(error))
    //             res.write(JSON.stringify(error));
    //             res.end();
    //         }else{
    //             res.redirect('/people');
    //         }
    //     });
    // });

    return router;
}();
