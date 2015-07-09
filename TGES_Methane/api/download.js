//
// トレンドデータの取得
//
var model = require('../model');
var RTR_Trend = model.RTR_Trend;	
var logger4 = require('../logger');

exports.download = function (req, res) {
		if (req.connection) {
			logger4.access.info("remote address:" + getIP(req));
		}
		var query = {date_str : {"$gte":req.query.startdate,"$lte":req.query.enddate}};
		// mongoDBの検索
		RTR_Trend.find(query, {}, {sort:{date_str:1,time_str:1}}, function(err, items) {
				var count = items.length;
				var data = {date:"",time:"", temp:"",methane:""};
				var csv = "";
				for(var i in items) {
						var item = items[i];
						data.date = addDateSeparator(item.date_str, "/");
						data.time = addTimeSeparator(item.time_str, ":") ;
						// 子機データの処理
						for(var j in item.trends) {
								var model = item.trends[j].model;
								if (model == "RTR-502") {
										// 温度センサー値
										data.temp = item.trends[j].value;
								}
								else if (model == "RTR-505-mA") {
										data.methane = item.trends[j].value;
								}
						}
						if (csv.length === 0) {
							csv = "Date,Time,Methane,Temperature\n"
//							csv = "日付,時刻,メタン濃度,温度\n"
							csv += data.date + "," + data.time + "," +  data.methane + "," + data.temp;
						} else {
							csv += "\n" + data.date + "," + data.time + ","  + data.methane "," + data.temp;
						}
				}
				res.send(csv);
		});
};
function addDateSeparator(date,sep) {
	return date.substring(0,4) + sep + date.substring(4,6) + sep + date.substring(6);
}
function addTimeSeparator(date,sep) {
	return date.substring(0,2) + sep + date.substring(2,4) + sep + date.substring(4);
}
var getIP = function (req) {
	  if (req.headers['x-forwarded-for']) {
	    return req.headers['x-forwarded-for'];
	  }
	  if (req.connection && req.connection.remoteAddress) {
	    return req.connection.remoteAddress;
	  }
	  if (req.connection.socket && req.connection.socket.remoteAddress) {
	    return req.connection.socket.remoteAddress;
	  }
	  if (req.socket && req.socket.remoteAddress) {
	    return req.socket.remoteAddress;
	  }
	  return '0.0.0.0';
};
