var express = require('express');
var router = express.Router();
var fs = require("fs");
var cycletime = 123;
var pps = 191;

/* GET home page. */
router.get('/', function(req, res, next) {
	var data = "value-good";
	var cc = "value-good";
	var lc = "value-good";
	var bc = "value-good";
	var ac = "value-good";
	data = req.app.get('displayData');
	if(data){
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
	/*
	if(!fs.existsSync(process.cwd()+'/Data/data.json')){
		data = null;
	}else{
		data = fs.readFileSync(process.cwd() + '/Data/data.json');
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
	*/
	res.render('index', { title: 'Mitsubishi-SCADA', 'data':data, 'cc':cc, 'lc':lc, 'bc':bc, 'ac':ac, 'pps':pps, 'ct': cycletime });
	data = null;
});

router.get('/history', function(req, res, next) {
	var data = null;
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate();
	var folder = ''+year+'-'+month;
	if(!fs.existsSync(process.cwd() + '/Data/History/'+folder)){
		data = null;
	}else{
		var files = fs.readdirSync(process.cwd() + '/Data/History/'+folder+'/');
		data = [];
		for(var i in files){
			var s = fs.readFileSync(process.cwd() + '/Data/History/'+folder+'/'+files[i]);
			var d = JSON.parse(s);
			for(var o in d["data"]){
				data.push(d["data"][o]);
			}
		}
	}
	res.render('history', { title: 'Mitsubishi-SCADA', 'data':data });
	data = null;
});

module.exports = router;
