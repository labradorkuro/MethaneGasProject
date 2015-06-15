//
// トレンドデータの取得
//

exports.trend_get = function (req, res) {
	var attrs = [
	              {
	            	  	label: "メタン濃度",
	            	  	fillColor:"rgba(255,255,0,0.2)", 
	            	  	strokeColor: "rgba(255,255,0,1)",
	            	  	pointColor: "rgba(255,255,0,1)",
	            	  	pointStrokeColor: "#fff",
	            	  	pointHighlightFill: "#fff",
	            		pointHighlightStroke: "rgba(255,255,0,1)",
	            	  },
	            	  {
					label: "温度",
					fillColor: "rgba(0,0,255,0.2)",
					strokeColor: "rgba(0,0,255,1)",
					pointColor: "rgba(0,0,255,1)",
					pointStrokeColor: "#fff",
					pointHighlightFill: "#fff",
					pointHighlightStroke: "rgba(0,0,255,1)",
	            	  }
	              ];
	var chart_data = {
			labels: [],
			datasets: []
		};
	
	// mongoDBの検索
	RTR_Trend.find(function(err, items) {
		for(var i in items) {
			// ファイル名から日付、時間を取り出してラベルに追加する
			var name = items.$;
			var model = items.group[0].trends[i].model;
			var attr_index = 0;
			if (model === "RTR-502") {
				// 温度センサー値
				attr_index = 1;
			}
			else if (model === "RTR-505-mA") {
				attr_index = 0;
			}
			var data = {
					label: "",
					fillColor: "",
					strokeColor: "",
					pointColor: "",
					pointStrokeColor: "",
					pointHighlightFill: "",
					pointHighlightStroke: "",
					data: []
			};
			data.label = attr[attr_index].label;
			data.fillColor = attr[attr_index].fillColor;
			data.strokeColor = attr[attr_index].strokeColor;
			data.pointColor = attr[attr_index].pointColor;
			data.pointStrokeColor = attr[attr_index].pointStrokeColor;
			data.pointHighlightFill = attr[attr_index].pointHighlightFill;
			data.pointHighlightStroke = attr[attr_index].pointHighlightStroke;

			data.data.push(items.group[0].remote[i].ch[0].current[0].value[0]._);
			
		}
	});
	var data = {
		labels: ["January", "February", "March", "April", "May", "June", "July"],
		datasets: [
			{
				label: "メタン濃度",
				fillColor: "rgba(255,255,0,0.2)",
				strokeColor: "rgba(255,255,0,1)",
				pointColor: "rgba(255,255,0,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(255,255,0,1)",
				data: [60, 50, 40, 45, 65, 60, 40]
			},
			{
				label: "温度",
				fillColor: "rgba(0,0,255,0.2)",
				strokeColor: "rgba(0,0,255,1)",
				pointColor: "rgba(0,0,255,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(0,0,255,1)",
				data: [24, 20, 21, 22, 25, 24, 23]
			}
		]
	};
	res.send(data);
};
