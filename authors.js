module.exports = function(){
    var express = require('express');
    var router = express.Router();

    /* Get all data from Authors entity to display */
    function getAuthors(res, mysql, context, complete){
        mysql.pool.query("SELECT * FROM Authors ORDER BY authorID", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            // context.books = JSON.parse(JSON.stringify(results));
            context.authors = results;
            complete();
        });
    }

    /* Get all books for a particular author by querying BookAuthors entity */
    function getBooksByAuthor(res, mysql, context, id, complete){
      var query = "SELECT authorFirstName, authorLastName, bookCover, bookTitle, Books.bookID FROM Books \
      INNER JOIN BookAuthors ON Books.bookID = BookAuthors.bookID \
      INNER JOIN Authors ON BookAuthors.authorID = Authors.authorID \
      WHERE Authors.authorID = ?";
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


    /* Display all authors data in table on /authors page */
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

    /* Display books by a particular author on /authors/:id page */
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

    /* Adds an author, redirects to the authors page after adding */
    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO Authors (authorFirstName, authorLastName) VALUES (?,?)";
        var inserts = [req.body.fname, req.body.lname];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            } else{
                res.redirect('/authors');
            }
        });
    });

    return router;
}();
