//
// トレンドデータの取得
//

exports.trend_get = function (req, res) {
	var colors = [
	              {
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
	var trend_data = {
			labels: [],
			datasets: []
		};
	
	var trend = {
			label: "",
			fillColor: "",
			strokeColor: "",
			pointColor: "",
			pointStrokeColor: "",
			pointHighlightFill: "",
			pointHighlightStroke: "",
			data: []
	};
	// mongoDBの検索
	Post.find(function(err, items) {
		for(var i in items) {
			// ファイル名から日付、時間を取り出してラベルに追加する
			var name = items.$;
			trend_data.data.push(items.group[0].remote[i].ch[0].current[0].value[0]._);
			
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
