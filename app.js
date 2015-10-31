/* global __dirname */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var SessionStore = require('express-mysql-session');
var config = require('./config')
var mysql = require('mysql');
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session(
       {
          secret: config.sessionSecret,
          resave: false,
          saveUninitialized: false,
          store: new SessionStore(
            { host: config.db.host,
              user: config.db.user, 
              password: config.db.password, 
              database: config.db.database
            })
       }));
app.use(express.static(path.join(__dirname, 'public')));



/* create a 'pool' (group) of connections that can be used for interacting with the database. */
var dbConnectionPool = mysql.createPool( 
  { host: config.db.host,
    user: config.db.user, 
    password: config.db.password, 
    database: config.db.database
});
/* middleware for accessing database. We need access to the database to be available 
  *before* we process routes in index.js, so this app.use() needs to be *before*the
  app.use('/', routes);
  Express will run this function on every request and then continue with the next module, 
  index.js. So for all requests that we handle in index.js, we’ll be able to access the pool
  using req.pool 
*/
app.use(function(req, res, next) { 
    req.pool = dbConnectionPool; 
    next();
  });
  
app.use('/', routes);
app.use('/users', users);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
