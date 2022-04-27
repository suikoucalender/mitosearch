'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const i18n = require('i18n');
i18n.configure({
    locales: ['ja', 'en'],
    defaultLocale: 'ja',
    directory: __dirname + "/locales",
    objectNotation: true
});

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const session = require("express-session");
app.use(session({
    secret: "secret"
}));

app.use(i18n.init);
app.use(function (req, res, next) {
    if (req.session.locale) {
        i18n.setLocale(req, req.session.locale);
    }
    next();
});

const fs = require("fs");

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

const port = JSON.parse(fs.readFileSync('config/config.json', 'utf8'))["port"];

app.set('port', process.env.PORT || port);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});