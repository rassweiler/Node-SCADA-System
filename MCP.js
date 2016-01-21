var mc = require('mcprotocol');
var fs = require('fs');
var conn = new mc;

var variables = {
	CURRENT:'D1160',
	LAST:'D1161',
	BEST:'D1162',
	AVERAGE:'D1163',
	HISTORY:'D1164,10',
	PARTSCS:'D1174'  
};

conn.initiateConnection({port: 5050, host: '169.254.195.11', ascii: false}, connected); 

function connected(err) {
	if (typeof(err) !== "undefined") {
		// We have an error.  Maybe the PLC is not reachable.  
		console.log(err);
	}
	if(!err){
		conn.setTranslationCB(function(tag) {return variables[tag];});  // This sets the "translation" to allow us to work with object names defined in our app not in the module
		conn.addItems(['CURRENT', 'LAST', 'BEST', 'AVERAGE', 'HISTORY', 'PARTSCS']);    
		conn.readAllItems(valuesReady);
	}
}

function valuesReady(anythingBad, values) {
    if (anythingBad) { 
    	console.log("SOMETHING WENT WRONG READING VALUES!!!!"); 
    }else{
    	fs.writeFile(process.cwd() + "../Mitsubishi-SCADA/Data/data.json", JSON.stringify(values), "utf8", function(err){
	    	if(err){
	    		console.log(err);
	    	}
	    });
    	conn.dropConnection();
    }
}