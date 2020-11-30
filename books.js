module.exports = function() {
  var express = require('express');
  var router = express.Router();
  var session = require('express-session');
  var moment = require('moment');

  /* Gets all data from Books entity to display on /books page */
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

  /* Gets all reviews for a particular book to display on /books/:id page */
  function getReviewsByBook(res, mysql, context, id, complete) {
    var query = "SELECT ratingID, Users.userID, username, rating, comments, rateDate FROM Ratings \
    INNER JOIN Users ON Ratings.userID = Users.UserID \
    WHERE bookID = ?";
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

  /* Display authors, genres, and all info from Books entity for a particular book to display
  in a blurb on its individual page */
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

  /* Insert book data into Books entity */
  async function insertBook(res, req, mysql, context) {
    var sql = "INSERT INTO Books (bookTitle, numPages, publishedYear, bookCover) VALUES (?,?,?,?)";
    // insert placeholder book cover image if user didn't supply book cover
    if (req.body.url == '') {
      req.body.url = '/img/no-cover.jpg';
    }
    var inserts = [req.body.title, req.body.pages, req.body.year, req.body.url];
    return new Promise((resolve, reject) => {
      mysql.pool.query(sql, inserts, function(error, results, fields) {
        if (error) {
          res.write(JSON.stringify(error));
          res.end();
        }
        // store book ID so that we can associate it with author IDs and genre IDs
        // for insertion into BookAuthors and BookGenres tables
        context.bookID = results.insertId;
        resolve(true);
      })
    });
  }

  /* Insert author data into Authors entity for all authors associated with added book */
  async function insertAuthors(res, req, mysql, context) {
    const authorPromises = [];
    // user entered a list of authors in 'add a book form', each separated by a comma
    var authors = req.body.authors.split(",");
    // add each author to Authors entity (if they don't already exist)
    for (let a = 0; a < authors.length; a++) {
      var authorPromise = new Promise((resolve, reject) => {
        // split each author's name into first name and last name
        var authorName = authors[a].trim();
        authorName = authorName.split(" ");
        var firstName = authorName[0];
        var lastName = authorName[1];
        // 'IGNORE' because we don't want to throw an error if author already exists in db
        var sql = "INSERT IGNORE INTO Authors (authorFirstName, authorLastName) VALUES (?,?)";
        var inserts = [firstName, lastName];
        mysql.pool.query(sql, inserts, function(error, results, fields) {
          if (error) {
            res.write(JSON.stringify(error));
            res.end();
          }
          // ascertain the authorID of the author we just attempted to insert to associate them
          // with the book we added
          var sql = "SELECT authorID FROM Authors WHERE authorFirstName=? AND authorLastName=?";
          mysql.pool.query(sql, inserts, function(error, results, fields) {
            var authorID = results[0].authorID;
            var relationship = [context.bookID, authorID];
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

  /* Insert each book-author relationship into BookAuthors entity */
  async function insertBookAuthors(res, req, mysql, context) {
    const bookAuthorPromises = [];
    for (let b = 0; b < context.bookAuthors.length; b++) {
      var bookAuthorPromise = new Promise((resolve, reject) => {
        var sql = "INSERT INTO BookAuthors (bookID, authorID) VALUES (?,?)";
        var bookID = context.bookAuthors[b][0];
        var authorID = context.bookAuthors[b][1];
        var inserts = [bookID, authorID];
        mysql.pool.query(sql, inserts, function(error, results, fields) {
          if (error) {
            res.write(JSON.stringify(error));
            res.end();
          }
          resolve(true);
        });
      })
      bookAuthorPromises.push(bookAuthorPromise);
    }
    // complete();
    return Promise.all(bookAuthorPromises);
  }

  /* Insert genre data into Genres entity for all genres associated with added book */
  async function insertGenres(res, req, mysql, context) {
    const genrePromises = [];
    // user entered a list of genres in 'add a book form', each separated by a comma
    var genres = req.body.genres.split(",");
    for (let g = 0; g < genres.length; g++) {
      var genrePromise = new Promise((resolve, reject) => {
        var genreName = genres[g].trim();
        // 'IGNORE' because we don't want to throw an error if genre already exists in db
        var sql = "INSERT IGNORE INTO Genres (genreName) VALUES (?)";
        var inserts = [genreName];
        mysql.pool.query(sql, inserts, function(error, results, fields) {
          if (error) {
            res.write(JSON.stringify(error));
            res.end();
          }
          // ascertain the genreID of the genre we just attempted to insert to associate it
          // with the book we added
          var sql = "SELECT genreID FROM Genres WHERE genreName=?";
          mysql.pool.query(sql, inserts, function(error, results, fields) {
            var genreID = results[0].genreID;
            var relationship = [context.bookID, genreID];
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

  /* Insert each book-genre relationship into BookGenres entity */
  async function insertBookGenres(res, req, mysql, context) {
    const bookGenrePromises = [];
    for (let b = 0; b < context.bookGenres.length; b++) {
      var bookGenrePomise = new Promise((resolve, reject) => {
        var sql = "INSERT INTO BookGenres (bookID, genreID) VALUES (?,?)";
        var bookID = context.bookGenres[b][0];
        var genreID = context.bookGenres[b][1];
        var inserts = [bookID, genreID];
        mysql.pool.query(sql, inserts, function(error, results, fields) {
          if (error) {
            res.write(JSON.stringify(error));
            res.end();
          }
          resolve(true);
        });
      })
      bookGenrePromises.push(bookGenrePomise);
    }
    // complete();
    return Promise.all(bookGenrePromises);
  }

  /* Display all data from Books entity on /books page in table */
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

  /* Display info and reviews for a specific book when visiting /books/:id page */
  router.get('/:id', function(req, res) {
    callbackCount = 0;
    var context = {};
    var mysql = req.app.get('mysql');
    getBook(res, mysql, context, req.params.id, complete);
    getReviewsByBook(res, mysql, context, req.params.id, complete);

    function complete() {
      callbackCount++;
      if (callbackCount >= 2) {
        res.render('book', context);
      }

    }
  });

  /* Insert a rating for a book into Ratings entity */
  /* Note: there is an 'add a review' form on each book's /book/:id page */
  router.post('/:id', function(req, res) {
    // convert JS date format to SQL format for insert
    var curDate = moment();
    var curDateString = curDate.format('YYYY-MM-DD');
    var mysql = req.app.get('mysql');
    // only allow user to add a rating if they are logged in
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
    // user must be logged in to add a rating
    } else {
      res.redirect('/login');
    }
  });

  /* Adds a book by inserting into Books, Authors (if necessary), BookAuthors,
  Genres (if necessary), and BookGenres entities; then reload books page after adding */
  router.post('/', async function(req, res) {
    var context = {
      bookAuthors: [],
      bookGenres: []
    };
    var mysql = req.app.get('mysql');
    let result = await insertBook(res, req, mysql, context);
    result = await insertAuthors(res, req, mysql, context);
    result = await insertBookAuthors(res, req, mysql, context);
    result = await insertGenres(res, req, mysql, context);
    result = await insertBookGenres(res, req, mysql, context);
    res.redirect('books');
  });

  /* Deletes a book in Books entity */
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
