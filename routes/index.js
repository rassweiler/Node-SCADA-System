var express = require('express');
var router = express.Router();
var fs = require("fs");

/* GET home page. */
router.get('/', function(req, res, next) {
	var data = fs.readFileSync(process.cwd() + '/Data/data.json');
	data = JSON.parse(data);
	res.render('index', { title: 'Mitsubishi-SCADA', 'data':data });
});

module.exports = router;
