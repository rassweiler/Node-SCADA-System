var express = require('express');
var router = express.Router();
var fs = require("fs");
var cycletime = 125;
var pps = 188;

/* GET home page. */
router.get('/', function(req, res, next) {
	if(!fs.existsSync(process.cwd()+'/Data/data.json')){
		var data = null;
		var cc = null;
		var lc = null;
		var bc = null;
		var ac = null;
	}else{
		var data = fs.readFileSync(process.cwd() + '/Data/data.json');
		data = JSON.parse(data);
		var cc= "value-good",lc= "value-good",bc= "value-good",ac = "value-good";
		if(data["CURRENT"] > cycletime){
			cc = "value-bad";
		}
		if(data["LAST"] > cycletime){
			lc = "value-bad";
		}
		if(data["BEST"] > cycletime){
			bc = "value-bad";
		}
		if(data["AVERAGE"] > cycletime){
			ac = "value-bad";
		}
	}
	var date = data["date"];
	res.render('index', { title: 'Mitsubishi-SCADA', 'data':data, 'cc':cc, 'lc':lc, 'bc':bc, 'ac':ac, 'pps':pps, 'date':date });
});

router.get('/history', function(req, res, next) {
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate();
	var folder = ''+year+'-'+month;
	if(!fs.existsSync(process.cwd() + '/Data/History/'+folder)){
		data = null;
	}else{
		var files = fs.readdirSync(process.cwd() + '/Data/History/'+folder+'/');
		var data = [];
		for(var i in files){
			var s = fs.readFileSync(process.cwd() + '/Data/History/'+folder+'/'+files[i]);
			var d = JSON.parse(s);
			for(var o in d["data"]){
				data.push(d["data"][o]);
			}
		}
	}
	res.render('history', { title: 'Mitsubishi-SCADA', 'data':data });
});

module.exports = router;
