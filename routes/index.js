var express = require('express');
var router = express.Router();
var fs = require("fs");
var cycletime = 125;
var pps = 188;

/* GET home page. */
router.get('/', function(req, res, next) {
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
	var date = new Date(data["date"]);
	res.render('index', { title: 'Mitsubishi-SCADA', 'data':data, 'cc':cc, 'lc':lc, 'bc':bc, 'ac':ac, 'pps':pps, 'date':date.toLocaleString('en') });
});

module.exports = router;
