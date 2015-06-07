//
// トレンドデータの取得
//
exports.trend_get = function (req, res) {
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
