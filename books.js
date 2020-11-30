module.exports = function() {
  var express = require('express');
  var router = express.Router();
  var session = require('express-session');

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
    var query = "SELECT ratingID, Users.userID, username, rating, comments, rateDate FROM Ratings INNER JOIN Users ON Ratings.userID = Users.UserID WHERE bookID = ?";
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
    FROM Books LEFT JOIN BookAuthors ON Books.bookID = BookAuthors.bookID \
    LEFT JOIN Authors ON BookAuthors.authorID = Authors.authorID \
    LEFT JOIN BookGenres ON Books.bookID = BookGenres.bookID \
    LEFT JOIN Genres ON BookGenres.genreID = Genres.genreID \
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

  //
  //   function insertBook(res, req, mysql, context) {
  //     var sql = "INSERT INTO Books (bookTitle, numPages, publishedYear, bookCover) VALUES (?,?,?,?)";
  //     var inserts = [req.body.title, req.body.pages, req.body.year, req.body.url];
  //     return new Promise((resolve, reject) => {
  //       mysql.pool.query(sql, inserts, function(error, results, fields) {
  //       // if (error) {
  //       //   res.write(JSON.stringify(error));
  //       //   res.end();
  //       // }
  //         context.bookID = results.insertId;
  //         console.log("Inserted book with ID: ", context.bookID);
  //         resolve(true);
  //       })
  //     });
  //   }
  //
  // function insertAuthors(res, req, mysql, context) {
  //     const authorPromises = [];
  //     var authors = req.body.authors.split(",");
  //     for (let a = 0; a < authors.length; a++) {
  //       var authorPromise = new Promise((resolve, reject) => {
  //         var authorName = authors[a].trim();
  //         console.log(req.body.title, authorName);
  //         authorName = authorName.split(" ");
  //         var firstName = authorName[0];
  //         var lastName = authorName[1];
  //         var sql = "INSERT IGNORE INTO Authors (authorFirstName, authorLastName) VALUES (?,?)";
  //         var inserts = [firstName, lastName];
  //         mysql.pool.query(sql, inserts, function(error, results, fields) {
  //           // if (error) {
  //           //   res.write(JSON.stringify(error));
  //           //   res.end();
  //           // }
  //           console.log(inserts);
  //           var sql = "SELECT authorID FROM Authors WHERE authorFirstName=? AND authorLastName=?";
  //           mysql.pool.query(sql, inserts, function(error, results, fields) {
  //             var authorID = results[0].authorID;
  //             var relationship = [context.bookID, authorID];
  //             console.log("cur relationship: ", relationship);
  //             context.bookAuthors.push(relationship);
  //             console.log(context.bookAuthors.length);
  //             resolve(true);
  //           });
  //         });
  //
  //       });
  //       authorPromises.push(authorPromise);
  //     }
  //     // complete();
  //     return Promise.all(authorPromises);
  //   }
  //
  //   function insertBookAuthors(res, req, mysql, context) {
  //     console.log('test');
  //       const bookAuthorPromises = [];
  //       // console.log("testing: ", context.bookAuthors);
  //       for (let b = 0; b < context.bookAuthors.length; b++) {
  //         var bookAuthorPromise = new Promise((resolve, reject) => {
  //           console.log(context.bookAuthors[b]);
  //           var sql = "INSERT INTO BookAuthors (bookID, authorID) VALUES (?,?)";
  //           var bookID = context.bookAuthors[b][0];
  //           var authorID = context.bookAuthors[b][1];
  //           var inserts = [bookID, authorID];
  //           console.log("Attempted inserts: ", inserts);
  //           mysql.pool.query(sql, inserts, function(error, results, fields) {
  //             // if (error) {
  //             //   res.write(JSON.stringify(error));
  //             //   res.end();
  //             // }
  //             console.log(results);
  //             resolve(true);
  //           });
  //         })
  //         bookAuthorPromises.push(bookAuthorPromise);
  //       }
  //       // complete();
  //       return Promise.all(bookAuthorPromises);
  //     }


  async function insertBook(res, req, mysql, context) {
    var sql = "INSERT INTO Books (bookTitle, numPages, publishedYear, bookCover) VALUES (?,?,?,?)";
    var inserts = [req.body.title, req.body.pages, req.body.year, req.body.url];
    return new Promise((resolve, reject) => {
      mysql.pool.query(sql, inserts, function(error, results, fields) {
        // if (error) {
        //   res.write(JSON.stringify(error));
        //   res.end();
        // }
        context.bookID = results.insertId;
        console.log("Inserted book with ID: ", context.bookID);
        resolve(true);
      })
    });
  }

  async function insertAuthors(res, req, mysql, context) {
    const authorPromises = [];
    var authors = req.body.authors.split(",");
    for (let a = 0; a < authors.length; a++) {
      var authorPromise = new Promise((resolve, reject) => {
        var authorName = authors[a].trim();
        console.log("inserting: ", req.body.title, authorName);
        authorName = authorName.split(" ");
        var firstName = authorName[0];
        var lastName = authorName[1];
        var sql = "INSERT IGNORE INTO Authors (authorFirstName, authorLastName) VALUES (?,?)";
        var inserts = [firstName, lastName];
        mysql.pool.query(sql, inserts, function(error, results, fields) {
          // if (error) {
          //   res.write(JSON.stringify(error));
          //   res.end();
          // }
          var sql = "SELECT authorID FROM Authors WHERE authorFirstName=? AND authorLastName=?";
          mysql.pool.query(sql, inserts, function(error, results, fields) {
            var authorID = results[0].authorID;
            var relationship = [context.bookID, authorID];
            console.log("cur author relationship: ", relationship);
            context.bookAuthors.push(relationship);
            resolve(true);
          });
        });

      });
      authorPromises.push(authorPromise);
    }
    // complete();
    return Promise.all(authorPromises);
  }

  async function insertBookAuthors(res, req, mysql, context) {
    const bookAuthorPromises = [];
    // console.log("testing: ", context.bookAuthors);
    for (let b = 0; b < context.bookAuthors.length; b++) {
      var bookAuthorPromise = new Promise((resolve, reject) => {
        console.log(context.bookAuthors[b]);
        var sql = "INSERT INTO BookAuthors (bookID, authorID) VALUES (?,?)";
        var bookID = context.bookAuthors[b][0];
        var authorID = context.bookAuthors[b][1];
        var inserts = [bookID, authorID];
        console.log("attempted BookAuthors inserts: ", inserts);
        mysql.pool.query(sql, inserts, function(error, results, fields) {
          // if (error) {
          //   res.write(JSON.stringify(error));
          //   res.end();
          // }
          resolve(true);
        });
      })
      bookAuthorPromises.push(bookAuthorPromise);
    }
    // complete();
    return Promise.all(bookAuthorPromises);
  }


  async function insertGenres(res, req, mysql, context) {
    const genrePromises = [];
    var genres = req.body.genres.split(",");
    for (let g = 0; g < genres.length; g++) {
      var genrePromise = new Promise((resolve, reject) => {
        var genreName = genres[g].trim();
        console.log("inserting: ", req.body.title, genreName);
        var sql = "INSERT IGNORE INTO Genres (genreName) VALUES (?)";
        var inserts = [genreName];
        mysql.pool.query(sql, inserts, function(error, results, fields) {
          // if (error) {
          //   res.write(JSON.stringify(error));
          //   res.end();
          // }
          var sql = "SELECT genreID FROM Genres WHERE genreName=?";
          mysql.pool.query(sql, inserts, function(error, results, fields) {
            var genreID = results[0].genreID;
            var relationship = [context.bookID, genreID];
            console.log("cur genre relationship: ", relationship);
            context.bookGenres.push(relationship);
            resolve(true);
          });
        });

      });
      genrePromises.push(genrePromise);
    }
    // complete();
    return Promise.all(genrePromises);
  }

  async function insertBookGenres(res, req, mysql, context) {
    const bookGenrePromises = [];
    // console.log("testing: ", context.bookAuthors);
    for (let b = 0; b < context.bookGenres.length; b++) {
      var bookGenrePomise = new Promise((resolve, reject) => {
        var sql = "INSERT INTO BookGenres (bookID, genreID) VALUES (?,?)";
        var bookID = context.bookGenres[b][0];
        var genreID = context.bookGenres[b][1];
        var inserts = [bookID, genreID];
        console.log("attempted BookGenres inserts: ", inserts);
        mysql.pool.query(sql, inserts, function(error, results, fields) {
          // if (error) {
          //   res.write(JSON.stringify(error));
          //   res.end();
          // }
          resolve(true);
        });
      })
      bookGenrePromises.push(bookGenrePomise);
    }
    // complete();
    return Promise.all(bookGenrePromises);
  }



  // function getBookID(res, mysql, context, bookTitle complete) {
  //   var sql = "SELECT bookID FROM Books WHERE bookTitle = ?";
  //   var inserts = [bookTitle];
  //   mysql.pool.query(sql, inserts, function(error, results, fields) {
  //     if (error) {
  //       res.write(JSON.stringify(error));
  //       res.end();
  //     }
  //     context.bookID = results[0];
  //     complete();
  //   });
  // }



  // Display all book data
  router.get('/', function(req, res) {
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ["deletebook.js"];
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
  //       res.redirect('books');
  //     }
  //   });
  // });

  function dateToYMD(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1; //Month from 0 to 11
    var y = date.getFullYear();
    return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
  }

  router.post('/:id', function(req, res) {
    var curDate = new Date();
    var curDateString = dateToYMD(curDate);
    var mysql = req.app.get('mysql');
    if (req.session.userID) {
      var sql = "INSERT INTO Ratings (bookID, userID, rating, comments, rateDate) VALUES (?,?,?,?,?)";
      var inserts = [req.body.bookID, req.session.userID, req.body.rating, req.body.comments, curDateString];
      sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
        if (error) {
          console.log(JSON.stringify(error))
          res.write(JSON.stringify(error));
          res.end();
        } else {
          res.redirect(req.get('referer'));
        }
      });
    } else {
      // you must be signed in
      res.redirect('/login');
    }

  });

  /* Adds a book, redirects to the books page after adding */
  router.post('/', async function(req, res) {
    // var callbackCount = 0;
    var context = {
      bookAuthors: [],
      bookGenres: []
    };
    var mysql = req.app.get('mysql');
    // insertBook(res, req, mysql, context)
    // .then(insertAuthors(res, req, mysql, context))
    // .then(insertBookAuthors(res, req, mysql, context))
    // .catch(function(error) {
    //   res.write(JSON.stringify(error));
    //   res.end();
    // });
    let result = await insertBook(res, req, mysql, context);
    result = await insertAuthors(res, req, mysql, context);
    result = await insertBookAuthors(res, req, mysql, context);
    result = await insertGenres(res, req, mysql, context);
    result = await insertBookGenres(res, req, mysql, context);
    res.redirect('books');


    // function complete() {
    //   callbackCount++;
    //   if (callbackCount >= 3) {
    //     res.render('book', context);
    //   }
    // }
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

  router.delete('/:id', function(req, res) {
    var mysql = req.app.get('mysql');
    var sql = "DELETE FROM Books WHERE bookID = ?";
    var inserts = [req.params.id];
    sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
      if (error) {
        console.log(error);
        res.write(JSON.stringify(error));
        res.status(400);
        res.end();
      } else {
        res.status(202).end();
      }
    })
  })

  return router;

}();
