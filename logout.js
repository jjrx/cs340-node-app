module.exports = function() {
  var express = require('express');
  var session = require('express-session');
  var router = express.Router();

  /* End user session if user logs out */
  router.get('/', function(req, res) {
    delete req.session.userID;
    res.redirect('login');
  });

  return router;
}();
