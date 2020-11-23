/*
    Uses express, dbcon for database connection, body parser to parse form data
    handlebars for HTML templates
*/


var express = require('express');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');

var app = express();
var handlebars = require('express-handlebars').create({
        defaultLayout:'main',
        });

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({extended:true}));
app.use('/static', express.static('public'));
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);
app.set('mysql', mysql);
// app.use('/people_certs', require('./people_certs.js'));
app.use('/books', require('./books.js'));
app.use('/authors', require('./authors.js'));
app.use('/genres', require('./genres.js'));
app.use('/users', require('./users.js'));

app.use('/', express.static('public'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/img', express.static(__dirname + '/public/img'));



// testing
// const getAllQuery = 'SELECT * FROM Books';
// function getAllData(res) {
//     mysql.pool.query(getAllQuery, function(err, rows, fields) {
//         if(err) {
//             next(err);
//             return;
//         }
//         res.json({rows: rows});
//     })
// }

app.get('/', function(req, res, next) {
	// getAllData(res);
	res.render('home');
})

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
