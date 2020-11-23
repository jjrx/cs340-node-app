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

    function getGenres(res, mysql, context, complete){
        mysql.pool.query("SELECT * FROM Genres", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.genres = results;
            complete();
        });
    }

    // function getPeople(res, mysql, context, complete){
    //     mysql.pool.query("SELECT bsg_people.character_id as id, fname, lname, bsg_planets.name AS homeworld, age FROM bsg_people INNER JOIN bsg_planets ON homeworld = bsg_planets.planet_id", function(error, results, fields){
    //         if(error){
    //             res.write(JSON.stringify(error));
    //             res.end();
    //         }
    //         context.people = results;
    //         complete();
    //     });
    // }

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

    //  Find people whose fname starts with a given string in the req 
    // function getPeopleWithNameLike(req, res, mysql, context, complete) {
    //   //sanitize the input as well as include the % character
    //    var query = "SELECT bsg_people.character_id as id, fname, lname, bsg_planets.name AS homeworld, age FROM bsg_people INNER JOIN bsg_planets ON homeworld = bsg_planets.planet_id WHERE bsg_people.fname LIKE " + mysql.pool.escape(req.params.s + '%');
    //   console.log(query)

    //   mysql.pool.query(query, function(error, results, fields){
    //         if(error){
    //             res.write(JSON.stringify(error));
    //             res.end();
    //         }
    //         context.people = results;
    //         complete();
    //     });
    // }

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

    /*Display all people. Requires web based javascript to delete users with AJAX*/

    // router.get('/', function(req, res){
    //     var callbackCount = 0;
    //     var context = {};

    //     var mysql = req.app.get('mysql');
    //     mysql.pool.query("SELECT * FROM Books", function(error, results, fields){
    //         if(error){
    //             res.write(JSON.stringify(error));
    //             res.end();
    //         }
    //         context.books = JSON.parse(JSON.stringify(results));
    //         res.render('books', context);
    //     });
    // });


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

    // /*Display all people from a given homeworld. Requires web based javascript to delete users with AJAX*/
    // router.get('/filter/:homeworld', function(req, res){
    //     var callbackCount = 0;
    //     var context = {};
    //     context.jsscripts = ["deleteperson.js","filterpeople.js","searchpeople.js"];
    //     var mysql = req.app.get('mysql');
    //     getPeoplebyHomeworld(req,res, mysql, context, complete);
    //     getPlanets(res, mysql, context, complete);
    //     function complete(){
    //         callbackCount++;
    //         if(callbackCount >= 2){
    //             res.render('people', context);
    //         }

    //     }
    // });

    // /*Display all people whose name starts with a given string. Requires web based javascript to delete users with AJAX */
    // router.get('/search/:s', function(req, res){
    //     var callbackCount = 0;
    //     var context = {};
    //     context.jsscripts = ["deleteperson.js","filterpeople.js","searchpeople.js"];
    //     var mysql = req.app.get('mysql');
    //     getPeopleWithNameLike(req, res, mysql, context, complete);
    //     getPlanets(res, mysql, context, complete);
    //     function complete(){
    //         callbackCount++;
    //         if(callbackCount >= 2){
    //             res.render('people', context);
    //         }
    //     }
    // });

    /* Display one book */

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

    // /* Adds a person, redirects to the people page after adding */

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

    // /* The URI that update data is sent to in order to update a person */

    // router.put('/:id', function(req, res){
    //     var mysql = req.app.get('mysql');
    //     console.log(req.body)
    //     console.log(req.params.id)
    //     var sql = "UPDATE bsg_people SET fname=?, lname=?, homeworld=?, age=? WHERE character_id=?";
    //     var inserts = [req.body.fname, req.body.lname, req.body.homeworld, req.body.age, req.params.id];
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

    // /* Route to delete a person, simply returns a 202 upon success. Ajax will handle this. */

    // router.delete('/:id', function(req, res){
    //     var mysql = req.app.get('mysql');
    //     var sql = "DELETE FROM bsg_people WHERE character_id = ?";
    //     var inserts = [req.params.id];
    //     sql = mysql.pool.query(sql, inserts, function(error, results, fields){
    //         if(error){
    //             console.log(error)
    //             res.write(JSON.stringify(error));
    //             res.status(400);
    //             res.end();
    //         }else{
    //             res.status(202).end();
    //         }
    //     })
    // })

    return router;
}();
