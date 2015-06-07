//
// トレンド表示、期間表示画面
//
$(function() {
	Chart.defaults.global.animation = false;
	trend_chart.data1 = {
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
				data: [65, 59, 80, 81, 56, 55, 40]
			},
			{
				label: "温度",
				fillColor: "rgba(0,0,255,0.2)",
				strokeColor: "rgba(0,0,255,1)",
				pointColor: "rgba(0,0,255,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(0,0,255,1)",
				data: [28, 48, 40, 19, 86, 27, 90]
			}
		]
	};
	trend_chart.data2 = {
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
	$.datepicker.setDefaults($.datepicker.regional[ "ja" ]); // 日本語化
	// タブの初期化
	trend_chart.initTabs();
	//trend_chart.chart_init(trend_chart.data1);
	trend_chart.dispLogger_info(["3","3"],["4","5"]);
	trend_chart.timer = setInterval(trend_chart.onTimer,5000);
});


var trend_chart = trend_chart || {}
trend_chart.myLineChart = null;
trend_chart.timer = null;
trend_chart.count = 0;
// タブ初期化
trend_chart.initTabs = function() {
	// タブを生成
	$("#tabs").tabs();
};

// トレンドグラフ表示
trend_chart.chart_init = function(data) {
 var options = {
        // 凡例表示用の HTML テンプレート
        legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\">&nbsp;&nbsp;&nbsp;</span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
    };
	var ctx = document.getElementById("trend_chart").getContext("2d");
	trend_chart.myLineChart = new Chart(ctx).Line(data, options);
	var legend = trend_chart.myLineChart.generateLegend();
	$("#chart_legend").empty();
	$("#chart_legend").append($(legend));
};

// 子機の情報表示
trend_chart.dispLogger_info = function(battery_info, wave_info) {
	$("#logger_1_bat").text(battery_info[0]);
	$("#logger_2_bat").text(battery_info[1]);
	$("#logger_1_wav").text(wave_info[0]);
	$("#logger_2_wav").text(wave_info[1]);
};

trend_chart.onTimer = function() {
	if (trend_chart.count == 0) {
		trend_chart.chart_init(trend_chart.data1);
		trend_chart.count = 1;
	} else if (trend_chart.count == 1) {
		trend_chart.requestTrendData();
		trend_chart.count = 2;
	} else {
		clearInterval(trend_chart.timer);
	}
};

// サーバへデータを要求する
trend_chart.requestTrendData = function() {

	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/trend_get/', true);
	xhr.responseType = 'json';
	xhr.onload = trend_chart.onloadTrendData;
	xhr.send();
};

// サーバからのレスポンス処理
trend_chart.onloadTrendData = function(e) {
	if (this.status == 200) {
		var data = this.response;
		// チャートの更新
		trend_chart.chart_init(data);
		// 子機情報の更新
		// 後で実装
	}
};

