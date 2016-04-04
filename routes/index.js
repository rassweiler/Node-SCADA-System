var express = require('express');
var router = express.Router();
var fs = require("fs");
var pps = 191;

/* GET home page. */
router.get('/', function(req, res, next) {
	var data = null;
	var cc = "value-good";
	var lc = "value-good";
	var bc = "value-good";
	var ac = "value-good";
	var ctv = "value-good";
	data = req.app.get('displayData');
	var cycletime = data["Target Cycle"];
	if(data){
		if(data["Current CT"] > cycletime){
			cc = "value-bad";
		}
		if(data["Last CT"] > cycletime){
			lc = "value-bad";
		}
		if(data["Best CT"] > cycletime){
			bc = "value-bad";
		}
		if(data["Average CT"] > cycletime){
			ac = "value-bad";
		}
		if(data["CT Variance"] < 0){
			ctv = "value-bad";
		}
	}
	res.render('index', { title: 'Node-SCADA-System', 'data':data, 'cc':cc, 'lc':lc, 'bc':bc, 'ac':ac, 'ctv':ctv, 'pps':pps, 'ct': cycletime, 'ctvariance':req.app.get('ctvar'), 'ctvariance2':req.app.get('ctvar2')});
	data = null;
	cycletime = null;
});

module.exports = router;
