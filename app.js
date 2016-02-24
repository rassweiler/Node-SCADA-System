var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
var app = express();

var mc = require('mcprotocol');
var fs = require('fs');
var conn = new mc;
var seconds1 = 2;var interval1 = seconds1*1000;
var seconds2 = 30;var interval2 = seconds2*1000;
var displayData = null;
var historyData = null;
var lastMin = null;
var variables = {
  CURRENT:'D1160',
  LAST:'D1161',
  BEST:'D1171',
  AVERAGE:'D1172',
  HISTORY:'D1161,10',
  PARTSCS:'D1175',
  PARTSCH:'D1174'
};

connect();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('displayData', displayData);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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

function connect(){
  console.log("----------------\n" + new Date());
  conn.initiateConnection({port: 5050, host: '169.254.195.11', ascii: false}, connected)
}

function disconnect(){
  conn.dropConnection();
}

function read(){
  console.log("Start Of Read Func");
  conn.readAllItems(valuesReady);
  setTimeout(read,interval1);
}

function connected(err) {
  if (typeof(err) !== "undefined") {
    // We have an error.  Maybe the PLC is not reachable.
    console.log(err);
    console.log(new Date() + ": Script Failed..\n");
    setTimeout(connect, interval2);
  }
  if(!err){
    conn.setTranslationCB(function(tag) {return variables[tag];});  // This sets the "translation" to allow us to work with object names defined in our app not in the module
    conn.addItems(['CURRENT', 'LAST', 'BEST', 'AVERAGE', 'HISTORY', 'PARTSCS', 'PARTSCH']);
    read();
  }
}

function FormatDate(d){
  var temp = d.replace(/\..+/, '');
  temp = temp.replace('T', ' ');
  return temp;
}

function valuesReady(anythingBad, values) {
  if (anythingBad) { 
    console.log("SOMETHING WENT WRONG READING VALUES!!!!");
  }else{
    var date = new Date();
    var min = date.getMinutes();
    if(min != lastMin){
      lastMin = min;
      var year = date.getFullYear();
      var month = date.getMonth()+1;
      if (month < 10){
        month = '0'+month;
      }
      var day = date.getDate();
      if (day < 10){
        day = '0'+day;
      }
      var folder = ''+year+'-'+month;
      console.log(folder);
      var file = ''+year+'-'+month+'-'+day+'.json';
      console.log(file);
      if(!fs.existsSync(process.cwd() + '/Data/'+folder)){
        fs.mkdirSync(process.cwd() + '/Data/'+folder);
      }
      if(!fs.existsSync(process.cwd() + '/Data/'+folder+'/'+file)){
        fs.writeFileSync(process.cwd() + '/Data/'+folder+'/'+file, '{"data":[]}', "utf8");
      }
      var temp = null;
      try{
        historyData = fs.readFileSync(process.cwd() + '/Data/'+folder+'/'+file);
      }catch(e){
        console.log(e);
      }
      historyData = JSON.parse(historyData);
      temp = JSON.stringify(values);
      temp = JSON.parse(temp);
      temp["CURRENT"] = temp["CURRENT"]/10;
      temp["LAST"] = temp["LAST"]/10;
      temp["BEST"] = temp["BEST"]/10;
      temp["AVERAGE"] = temp["AVERAGE"]/10;
      delete temp["HISTORY"];
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      date = (new Date(Date.now() - tzoffset)).toISOString().slice(0,-1);
      temp.date = FormatDate(date);
      historyData["data"].push(temp);
      try{
        fs.writeFileSync(process.cwd() + '/Data/'+folder+'/'+file, JSON.stringify(historyData), "utf8");
      }catch(e){
        console.log(e);
      }
      tzoffset = null;
      historyData = null;
      temp = null;
      year = null;
      month = null;
      day = null;
      folder = null;
      file = null;
    }
    var v = JSON.stringify(values);
    displayData = JSON.parse(v);
    displayData["CURRENT"] = displayData["CURRENT"]/10;
    displayData["LAST"] = displayData["LAST"]/10;
    displayData["BEST"] = displayData["BEST"]/10;
    displayData["AVERAGE"] = displayData["AVERAGE"]/10;
    for(i in displayData["HISTORY"]){
      displayData["HISTORY"][i] = displayData["HISTORY"][i]/10;
    }
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    date = (new Date(Date.now() - tzoffset)).toISOString().slice(0,-1);
    displayData.date = FormatDate(date);
    app.set('displayData', displayData);
    tzoffset = null;
    v = null;
    date = null;
    min = null;
    console.log("Finished mcprotocol");
  }
}

module.exports = app;
