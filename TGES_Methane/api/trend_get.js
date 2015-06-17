//
// トレンドデータの取得
//
var model = require('../model');
var RTR_Trend = model.RTR_Trend;	

exports.trend_get = function (req, res) {
		var res_data = {
				last_trend: {date:"",time:"", value:[],batt:[],rssi:[]},
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
								if (model === "RTR-502") {
										// 温度センサー値
										res_data.chart_data.datasets[ 1 ].data.push(item.trends[j].value);
//										if (i == count - 1) {
												// 最後のデータ
											res_data.last_trend.value[1] = item.trends[j].value;
											res_data.last_trend.batt[1] = item.trends[j].battery;
											res_data.last_trend.rssi[1] = item.trends[j].rssi;
//										}
								}
								else if (model === "RTR-505-mA") {
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
							res_data.last_trend.date = addDateSeparator(item.date_str, "/");
							res_data.last_trend.time = addTimeSeparator(item.time_str, ":");
//						}
				}
				res.send(res_data);
		});
};
function addDateSeparator(date,sep) {
	return date.substring(0,4) + sep + date.substring(4,6) + sep + date.substring(6);
}
function addTimeSeparator(date,sep) {
	return date.substring(0,2) + sep + date.substring(2,4) + sep + date.substring(4);
}
