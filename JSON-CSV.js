var fs = require('fs');
var filePath = process.argv[2];
var fileName = process.argv[3];

JSON2CSV();
//http://jsfiddle.net/sturtevant/vunf9/
//Modified for offline
function JSON2CSV() {
	console.log("Entered Func\n");
	if(fs.existsSync(filePath)){
		console.log("Passed If\n");
		var data = fs.readFileSync(filePath);
		data = JSON.parse(data);
		var objArray = data["data"];
		var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

		var str = '';
		var line = '';
		var head = array[0];
		for (var index in array[0]) {
			var value = index + "";
			line += '"' + value.replace(/"/g, '""') + '",';
		}

		line = line.slice(0, -1);
		str += line + '\r\n';
		for (var i = 0; i < array.length; i++) {
			var line = '';
			for (var index in array[i]) {
				var value = array[i][index] + "";
				line += '"' + value.replace(/"/g, '""') + '",';
			}
			line = line.slice(0, -1);
			str += line + '\r\n';
		}
		console.log(str);
		fs.writeFileSync(process.cwd() + '/JSON-CSV/CSV/' + fileName + '.csv', str, "utf8");
	}
}