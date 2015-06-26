//
// トレンドデータの取得
//
var model = require('../model');
var RTR_Trend = model.RTR_Trend;	
var logger4 = require('../logger');
var error_info = require('../error_info');

exports.trend_get = function (req, res) {
		if (req.connection) {
			logger4.access.info("remote address:" + getIP(req));
		}
		var res_data = {
				last_trend: {ext_ps:"", battery:"", date:"",time:"", value:[],batt:[],rssi:[]},
				error_info:{error_msg: error_info.error_msg},
				summary:{min:[0,0],max:[0,0],ave:[0,0]},
				chart_data : {
					labels: [],
					datasets: [
			              {
		            	  	label: "メタン濃度",
		            	  	fillColor:"rgba(255,255,0,0.2)", 
		            	  	strokeColor: "rgba(255,255,0,1)",
		            	  	pointColor: "rgba(255,255,0,1)",
		            	  	pointStrokeColor: "#fff",
		            	  	pointHighlightFill: "#fff",
		            		pointHighlightStroke: "rgba(255,255,0,1)",
		            		data:[]
		            	  },
		            	  {
						label: "温度",
						fillColor: "rgba(0,0,255,0.2)",
						strokeColor: "rgba(0,0,255,1)",
						pointColor: "rgba(0,0,255,1)",
						pointStrokeColor: "#fff",
						pointHighlightFill: "#fff",
						pointHighlightStroke: "rgba(0,0,255,1)",
						data:[]
		            	  }
            	  ]}
		};
		var query = {date_str : {"$gte":req.query.startdate,"$lte":req.query.enddate}};
		// mongoDBの検索
		RTR_Trend.find(query, {}, {sort:{date_str:1,time_str:1}}, function(err, items) {
				var count = items.length;
				// ファイル名から日付、時間を取り出してラベルに追加する
				var prev_date = "";
				for(var i in items) {
						if (i % req.query.interval ) continue;
						var item = items[i];
						if (prev_date === item.date_str) {
							res_data.chart_data.labels.push( addTimeSeparator(item.time_str, ":") );
						} else {
							res_data.chart_data.labels.push( addDateSeparator(item.date_str, "/") + " " + addTimeSeparator(item.time_str, ":") );
						}
						prev_date = item.date_str;
						// 子機データの処理
						for(var j in item.trends) {
								var model = item.trends[j].model;
								if (model == "RTR-502") {
										// 温度センサー値
										res_data.chart_data.datasets[ 1 ].data.push(item.trends[j].value);
//										if (i == count - 1) {
												// 最後のデータ
											res_data.last_trend.value[1] = item.trends[j].value;
											res_data.last_trend.batt[1] = item.trends[j].battery;
											res_data.last_trend.rssi[1] = item.trends[j].rssi;
//										}
								}
								else if (model == "RTR-505-mA") {
										res_data.chart_data.datasets[ 0 ].data.push(item.trends[j].value);
//										if (i == count - 1) {
												// 最後のデータ
												res_data.last_trend.value[0] = item.trends[j].value;
												res_data.last_trend.batt[0] = item.trends[j].battery;
												res_data.last_trend.rssi[0] = item.trends[j].rssi;
//										}
								}
						}
//						if (i == count - 1) {
							// 最後のデータ
							res_data.last_trend.ext_ps = item.ext_ps;		// 親機外部電源情報
							res_data.last_trend.battery = item.battery;	// 親機電池残量
							res_data.last_trend.date = addDateSeparator(item.date_str, "/");
							res_data.last_trend.time = addTimeSeparator(item.time_str, ":");
//						}
				}
				// 最小値、最大値、平均値を計算してセットする
				res_date = calcSummary(items, res_data);
				res.send(res_data);
		});
};
function calcSummary(items, res_data) {
	var temp = [100,-100,0];
	var methane = [100,-100,0];
	var temp_count = 0;
	var methane_count = 0;
	for(var i in items) {
		var item = items[i];
		// 子機データの処理
		for(var j in item.trends) {
				var model = item.trends[j].model;
				if (model == "RTR-502") {
					// 温度センサー min検査
					if (temp[0] > item.trends[j].value) {
						temp[0] = item.trends[j].value;
					}
					// 温度センサー max検査
					if (temp[1] < item.trends[j].value) {
						temp[1] = item.trends[j].value;
					}
					// 温度センサー sum検査
					temp[2] += Number(item.trends[j].value);
					temp_count++;
				}
				else if (model == "RTR-505-mA") {
					// メタン濃度 min検査
					if (methane[0] > item.trends[j].value) {
						methane[0] = item.trends[j].value;
					}
					// メタン濃度 max検査
					if (methane[1] < item.trends[j].value) {
						methane[1] = item.trends[j].value;
					}
					// メタン濃度 sum検査
					methane[2] += Number(item.trends[j].value);
					methane_count++;
				}
		}
		// メタン濃度最小値、最大値、平均値
		res_data.summary.min[0] = methane[0];
		res_data.summary.max[0] = methane[1];
		var m_ave = (methane[2] / methane_count);
		m_ave = Math.round(m_ave * 100);
		m_ave = m_ave / 100;
		res_data.summary.ave[0] = m_ave;

		res_data.summary.min[1] = temp[0];
		res_data.summary.max[1] = temp[1];
		var t_ave = (temp[2] / temp_count);
		t_ave = Math.round(t_ave * 100);
		t_ave = t_ave / 100;
		res_data.summary.ave[1] = t_ave;
	}
	return res_data;
}
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