module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getAuthors(res, mysql, context, complete){
        mysql.pool.query("SELECT * FROM Authors", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            // context.books = JSON.parse(JSON.stringify(results));
            context.authors = results;
            complete();
        });
    }

    function getBooksByAuthor(res, mysql, context, id, complete){
      var query = "SELECT authorFirstName, authorLastName, bookCover, bookTitle FROM Books INNER JOIN BookAuthors ON Books.bookID = BookAuthors.bookID INNER JOIN Authors ON BookAuthors.authorID = Authors.authorID WHERE Authors.authorID = ?";
      var inserts = [id];
      mysql.pool.query(query, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.authorBooks = results;
            context.author = results[0];
            complete();
        });
    }


    // Display all authors data
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getAuthors(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('authors', context);
            }
        }
    });

    /* Display books by author */
    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getBooksByAuthor(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('author', context);
            }

        }
    });

    // /* Adds an author, redirects to the authors page after adding */
    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO Authors (authorFirstName, authorLastName, authorCity, authorState, authorCountry) VALUES (?,?,?,?,?)";
        var inserts = [req.body.fname, req.body.lname, req.body.city, req.body.state, req.body.country];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/authors');
            }
        });
    });

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


    return router;
}();
