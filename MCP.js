var mc = require('mcprotocol');
var fs = require('fs');
var conn = new mc;
var seconds1 = 2;var interval1 = seconds1*1000;
var seconds2 = 15;var interval2 = seconds2*1000;
var LogCycles = 14;
var LogIndex = 0;

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

function connect(){
	console.log("----------------\n" + new Date());
	conn.initiateConnection({port: 5050, host: '169.254.107.11', ascii: false}, connected)
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
		disconnect();
		setTimeout(connect, interval2);
	}else{
		if(LogIndex == LogCycles){
			var date = new Date();
			var year = date.getFullYear();
			var month = date.getMonth()+1;
			var day = date.getDate();
			var folder = ''+year+'-'+month;
			var file = ''+year+'-'+month+'-'+day+'.json';
			if(!fs.existsSync(process.cwd() + '/Data/History/'+folder)){
				fs.mkdirSync(process.cwd() + '/Data/History/'+folder);
			}
			if(!fs.existsSync(process.cwd() + '/Data/History/'+folder+'/'+file)){
				fs.writeFileSync(process.cwd() + '/Data/History/'+folder+'/'+file, '{"data":[]}', "utf8");
			}
			try{
				var data = fs.readFileSync(process.cwd() + '/Data/History/'+folder+'/'+file);
			}catch(e){
				setTimeout(connect,interval1);
			}
			data = JSON.parse(data);
			var v = JSON.stringify(values);
			val = JSON.parse(v);
			val["CURRENT"] = val["CURRENT"]/10;
			val["LAST"] = val["LAST"]/10;
			val["BEST"] = val["BEST"]/10;
			val["AVERAGE"] = val["AVERAGE"]/10;
			delete val["HISTORY"];
			val.date = new Date(Date.now()).toLocaleString('en');
			data["data"].push(val);
			try{
				fs.writeFileSync(process.cwd() + '/Data/History/'+folder+'/'+file, JSON.stringify(data), "utf8");
			}catch(e){
				setTimeout(connect,interval1);
			}
			LogIndex = 0;
		}else{
			++LogIndex;
		}
		var date = Date.now();
		var v = JSON.stringify(values);
		var data = JSON.parse(v);
		data["CURRENT"] = data["CURRENT"]/10;
		data["LAST"] = data["LAST"]/10;
		data["BEST"] = data["BEST"]/10;
		data["AVERAGE"] = data["AVERAGE"]/10;
		for(i in data["HISTORY"]){
			data["HISTORY"][i] = data["HISTORY"][i]/10;
		}
		data.date = new Date(date).toLocaleString('en');
		try{
			fs.writeFile(process.cwd() + "/Data/data.json", JSON.stringify(data), "utf8");
		}catch(e){
			setTimeout(connect,interval1);
		}
		disconnect();
		console.log("Finished Script, initiate timeout\n");
		setTimeout(connect,interval1);
	}
}