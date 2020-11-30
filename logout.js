module.exports = function(){
    var express = require('express');
    var session = require('express-session');
    var router = express.Router();

    router.get('/', function(req, res){
          delete req.session.userID;
          res.redirect('login');
    });

    return router;
}();
