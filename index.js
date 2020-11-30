/*
    Uses express, dbcon for database connection, body parser to parse form data
    handlebars for HTML templates
*/

var express = require('express');
var session = require('express-session');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');
var moment = require('moment');

var app = express();
var handlebars = require('express-handlebars').create({
        defaultLayout:'main',
        });

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    key: 'user_sid',
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));
app.use('/static', express.static('public'));
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);
app.set('mysql', mysql);

// helper function that formats SQL date to "YYYY-MM-DD"
handlebars.handlebars.registerHelper('formatDate', function(dateString) {
    return new handlebars.handlebars.SafeString(
        moment(dateString).format("YYYY-MM-DD")
    );
});

handlebars.handlebars.registerHelper('ifEqual', function(v1, v2, options) {
  if(v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

app.use('/books', require('./books.js'));
app.use('/authors', require('./authors.js'));
app.use('/genres', require('./genres.js'));
app.use('/users', require('./users.js'));
app.use('/editreview', require('./editreview.js'));
app.use('/login', require('./login.js'));
app.use('/logout', require('./logout.js'));
app.use('/register', require('./register.js'));
app.use('/account', require('./account.js'));

app.use('/', express.static('public'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/img', express.static(__dirname + '/public/img'));
app.use('/js', express.static(__dirname + '/public/js'));

app.get('/', function(req, res, next) {
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
