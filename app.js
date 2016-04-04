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
var settings = require('./plc.json');
var seconds1 = 2;var interval1 = seconds1*1000;
var seconds2 = 30;var interval2 = seconds2*1000;
var displayData = null;
var historyData = null;
var lastMin = 0;
var ctvar = [];
var ctvar2 = [];

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

function GetVariableKeys(){
	var keys = [];
	for(var key in settings.variables){
		keys.push(key);
	}
	return keys;
}

function connect(){
  console.log("----------------\n" + new Date());
  conn.initiateConnection({port: settings.port, host: settings.ip, ascii: settings.ascii}, connected)
}

function disconnect(){
  conn.dropConnection();
}

function read(){
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
    conn.setTranslationCB(function(tag) {return settings.variables[tag];});  // This sets the "translation" to allow us to work with object names defined in our app not in the module
    conn.addItems(GetVariableKeys());
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
    var sec = date.getSeconds();
    if((min == 0 || min == 30) && sec < 2){
      var year = date.getFullYear();
      var month = date.getMonth()+1;
      if (month < 10){
        month = '0'+month;
      }
      var day = date.getDate();
      if (day < 10){
        day = '0'+day;
      }
      var file = ''+year+month+day+'.json';
      if(!fs.existsSync(settings.directory+settings.name)){
        fs.mkdirSync(settings.directory+settings.name);
      }
      if(!fs.existsSync(settings.directory+settings.name+file)){
        fs.writeFileSync(settings.directory+settings.name+file, '[]', "utf8");
      }
      var temp = null;
      try{
        historyData = fs.readFileSync(settings.directory+settings.name+file);
      }catch(e){
        console.log(e);
      }
      historyData = JSON.parse(historyData);
      temp = JSON.stringify(values);
      temp = JSON.parse(temp);
      delete temp["Last CT"];
      delete temp["Best CT"];
      delete temp["Average CT"];
      delete temp["Parts Out"];
      delete temp["PARTSCH"];
      delete temp["CT Variance"];
      delete temp["Target CT"];
      delete temp["Target Parts"];
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      date = (new Date(Date.now() - tzoffset)).toISOString().slice(0,-1);
      temp.date = FormatDate(date);
      historyData.push(temp);
      try{
        fs.writeFileSync(settings.directory+settings.name+file, JSON.stringify(historyData), "utf8");
      }catch(e){
        console.log(e);
      }
      tzoffset = null;
      historyData = null;
      temp = null;
      year = null;
      month = null;
      day = null;
      file = null;
    }
    var v = JSON.stringify(values);
    displayData = JSON.parse(v);
    displayData["Last CT"] = displayData["Last CT"]/10;
    displayData["Best CT"] = displayData["Best CT"]/10;
    displayData["Average CT"] = displayData["Average CT"]/10;
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    date = (new Date(Date.now() - tzoffset)).toISOString().slice(0,-1);
    displayData.date = FormatDate(date);
    if(min != lastMin){
    	if(displayData["CT Variance"] >= 0){
		    ctvar.push({
		            x: Date.now(), y: displayData["CT Variance"]
		        });
		    ctvar2.push({
		            x: Date.now(), y: 0
		        });
		}else{
			ctvar.push({
		            x: Date.now(), y: 0
		        });
			ctvar2.push({
		            x: Date.now(), y: displayData["CT Variance"]
		        });
		}
	    if(ctvar.length > 180){
	    	ctvar.shift();
	    	ctvar2.shift();
	    }
	    app.set('ctvar', ctvar);
	    app.set('ctvar2', ctvar2);
	    lastMin = min;
	}
    app.set('displayData', displayData);
    tzoffset = null;
    v = null;
    date = null;
    min = null;
    sec = null;
    console.log("Finished mcprotocol");
  }
}

module.exports = app;
