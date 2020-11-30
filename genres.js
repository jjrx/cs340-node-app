module.exports = function(){
    var express = require('express');
    var router = express.Router();

    /* Get all data from Genres entity to display */
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

    /* Get all books with a particular genre by querying BookGenres entity */
    function getBooksByGenre(res, mysql, context, id, complete){
      var query = "SELECT genreName, bookCover, Books.bookID, bookTitle FROM Genres \
      INNER JOIN BookGenres ON Genres.genreID = BookGenres.genreID \
      INNER JOIN Books ON BookGenres.bookID = Books.bookID \
      WHERE Genres.genreID = ?";
      var inserts = [id];
      mysql.pool.query(query, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.genreBooks = results;
            context.genre = results[0];
            complete();
        });
    }

    /* Display all genre data in table on /genres page */
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getGenres(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('genres', context);
            }
        }

    });

    /* Display books with specific genre on /genres/:id page */
    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getBooksByGenre(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('genre', context);
            }

        }
    });

    /* Adds a genre, redirects to /genres page after adding */
    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO Genres (genreName) VALUES (?)";
        var inserts = [req.body.genreName];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            } else{
                res.redirect('/genres');
            }
        });
    });

    return router;
}();
