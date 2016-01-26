var mc = require('mcprotocol');
var fs = require('fs');
var conn = new mc;
var seconds1 = 2;var interval1 = seconds1*1000;
var seconds2 = 15;var interval2 = seconds2*1000;
var LogCycles = 12;
var LogIndex = 0;

var variables = {
	CURRENT:'D1160',
	LAST:'D1161',
	BEST:'D1162',
	AVERAGE:'D1163',
	HISTORY:'D1164,10',
	PARTSCS:'D1174',
	PARTSCH:'D1175'
};

connect();

function connect(){
	console.log("----------------\n" + new Date());
	conn.initiateConnection({port: 5050, host: '169.254.107.11', ascii: false}, connected);
}

function disconnect(){
	conn.dropConnection();
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
		conn.readAllItems(valuesReady);
	}
}

function valuesReady(anythingBad, values) {
	if (anythingBad) { 
		console.log("SOMETHING WENT WRONG READING VALUES!!!!"); 
	}else{
		if(LogIndex == LogCycles){
			var date = new Date();
			var year = date.getFullYear();
			var month = date.getMonth()+1;
			var day = date.getDate();
			var file = ''+year+'-'+month+'-'+day+'.json';
			if(!fs.existsSync(process.cwd() + '/Data/History/'+file)){
				fs.writeFileSync(process.cwd() + '/Data/History/'+file, '{"data":[]}', "utf8");
			}
			var data = fs.readFileSync(process.cwd() + '/Data/History/'+file);
			data = JSON.parse(data);
			var v = JSON.stringify(values);
			val = JSON.parse(v);
			val.date = new Date(Date.now()).toLocaleString('en');
			data["data"].push(val);
			fs.writeFileSync(process.cwd() + '/Data/History/'+file, JSON.stringify(data), "utf8");
			LogIndex = 0;
		}else{
			++LogIndex;
		}
		var date = Date.now();
		var v = JSON.stringify(values);
		var data = JSON.parse(v);
		data.date = new Date(date).toLocaleString('en');
		fs.writeFile(process.cwd() + "/Data/data.json", JSON.stringify(data), "utf8");
		disconnect();
		console.log("Finished Script, initiate timeout\n");
		setTimeout(connect,interval1);
	}
}