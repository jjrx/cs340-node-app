module.exports = function() {
  var express = require('express');
  var router = express.Router();

  function getBooks(res, mysql, context, complete) {
    mysql.pool.query("SELECT * FROM Books", function(error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.books = results;
      complete();
    });
  }

  function getReviewsByBook(res, mysql, context, id, complete) {
    var query = "SELECT ratingID, username, rating, comments, rateDate FROM Ratings INNER JOIN Users ON Ratings.userID = Users.UserID WHERE bookID = ?";
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

  function getUsers(res, mysql, context, complete) {
    mysql.pool.query("SELECT * FROM Users", function(error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.users = results;
      complete();
    });
  }

  function getBook(res, mysql, context, id, complete) {
    var sql = "SELECT Books.*, \
    GROUP_CONCAT(distinct CONCAT(Authors.authorFirstName, ' ', Authors.authorLastName) SEPARATOR ', ') AS 'authors', \
     GROUP_CONCAT(distinct Genres.genreName SEPARATOR ', ') AS 'genres' \
    FROM Books INNER JOIN BookAuthors ON Books.bookID = BookAuthors.bookID \
    INNER JOIN Authors ON BookAuthors.authorID = Authors.authorID \
    INNER JOIN BookGenres ON Books.bookID = BookGenres.bookID \
    INNER JOIN Genres ON BookGenres.genreID = Genres.genreID \
    WHERE Books.bookID = ?";
    var inserts = [id];
    mysql.pool.query(sql, inserts, function(error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.book = results[0];
      complete();
    });
  }


  // Display all book data
  router.get('/', function(req, res) {
    var callbackCount = 0;
    var context = {};

    var mysql = req.app.get('mysql');
    getBooks(res, mysql, context, complete);

    function complete() {
      callbackCount++;
      if (callbackCount >= 1) {
        res.render('books', context);
      }
    }

  });

  /* Display info for a specific book */
  router.get('/:id', function(req, res) {
    callbackCount = 0;
    var context = {};
    var mysql = req.app.get('mysql');
    getBook(res, mysql, context, req.params.id, complete);
    getReviewsByBook(res, mysql, context, req.params.id, complete);
    getUsers(res, mysql, context, complete);
    function complete() {
      callbackCount++;
      if (callbackCount >= 3) {
        res.render('book', context);
      }

    }
  });

  router.post('/', function(req, res) {
    var mysql = req.app.get('mysql');
    var sql = "INSERT INTO Books (bookTitle, numPages, publishedYear, bookCover) VALUES (?,?,?,?)";
    var inserts = [req.body.title, req.body.pages, req.body.year, req.body.url];
    sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
      if (error) {
        console.log(JSON.stringify(error))
        res.write(JSON.stringify(error));
        res.end();
      } else {
        res.redirect('books');
      }
    });
  });

  function dateToYMD(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1; //Month from 0 to 11
    var y = date.getFullYear();
    return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
}

  router.post('/:id', function(req, res) {
    var curDate = new Date();
    var curDateString = dateToYMD(curDate);
    var mysql = req.app.get('mysql');
    var sql = "INSERT INTO Ratings (bookID, userID, rating, comments, rateDate) VALUES (?,?,?,?,?)";
    var inserts = [req.body.bookID, req.body.user, req.body.rating, req.body.comments, curDateString];
    sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
      if (error) {
        console.log(JSON.stringify(error))
        res.write(JSON.stringify(error));
        res.end();
      } else {
        res.redirect(req.get('referer'));
      }
    });
  });

  // /* Adds a book, redirects to the books page after adding */
  // router.post('/', function(req, res) {
  //   var mysql = req.app.get('mysql');
  //   var sql = "INSERT INTO Books (bookTitle, numPages, publishedYear, bookCover) VALUES (?,?,?,?)";
  //   var inserts = [req.body.title, req.body.pages, req.body.year, req.body.url];
  //   sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
  //     if (error) {
  //       console.log(JSON.stringify(error))
  //       res.write(JSON.stringify(error));
  //       res.end();
  //     } else {
  //       var authors = req.body.authors.split(",");
  //       async.forEach()
  //       for (var a = 0; a < authors.length; a++) {
  //         var authorName = authors[a].trim();
  //         console.log(req.body.title, authorName);
  //         authorName = authorName.split(" ");
  //         var firstName = authorName[0];
  //         var lastName = authorName[1];
  //         var sql = "INSERT IGNORE INTO Authors (authorFirstName, authorLastName) VALUES (?,?)";
  //         var inserts = [firstName, lastName];
  //         sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
  //           if (error) {
  //             console.log(JSON.stringify(error))
  //             res.write(JSON.stringify(error));
  //             res.end();
  //           } else {
  //             // BOOKAUTHORS
  //             var sql = "SELECT bookID FROM Books WHERE bookTitle = ?";
  //             var inserts = [req.body.title];
  //             sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
  //               if (error) {
  //                 console.log(JSON.stringify(error))
  //                 res.write(JSON.stringify(error));
  //                 res.end();
  //               } else {
  //                 var bookID = results[0].bookID;
  //                 var sql = "SELECT authorID FROM Authors WHERE authorFirstName = ? AND authorLastName = ?";
  //                 var inserts = [firstName, lastName];
  //                 sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
  //                   if (error) {
  //                     console.log(JSON.stringify(error))
  //                     res.write(JSON.stringify(error));
  //                     res.end();
  //                   } else {
  //                     var authorID = results[0].authorID;
  //                     var sql = "INSERT IGNORE INTO BookAuthors (bookID, authorID) VALUES (?,?)";
  //                     var inserts = [bookID, authorID];
  //                     sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
  //                       if (error) {
  //                         console.log(JSON.stringify(error))
  //                         res.write(JSON.stringify(error));
  //                         res.end();
  //                       }
  //                     });
  //                   }
  //                 });
  //               }
  //             });
  //           }
  //         });
  //       }
  //
  //       var genres = req.body.genres.split(",");
  //       for (var g = 0; g < genres.length; g++) {
  //         var genre = genres[g].trim();
  //         var sql = "INSERT IGNORE INTO Genres (genreName) VALUES (?)";
  //         var inserts = [genre];
  //         sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
  //           if (error) {
  //             console.log(JSON.stringify(error))
  //             res.write(JSON.stringify(error));
  //             res.end();
  //           } else {
  //             // BOOKGENRES
  //           }
  //         });
  //       }
  //       res.redirect('books');
  //
  //     }
  //   });
  //
  // });

  return router;

}();
