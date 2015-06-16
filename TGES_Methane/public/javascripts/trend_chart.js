//
// トレンド表示、期間表示画面
//
$(function() {
	Chart.defaults.global.animation = false;
	/**
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
	};**/
	$.datepicker.setDefaults($.datepicker.regional[ "ja" ]); // 日本語化
	// タブの初期化
	trend_chart.initTabs();
	// データ表示
	trend_chart.dispLogger_info(["3","3"],["4","5"]);
	// データリクエスト用のタイマーセット
	trend_chart.timer = setInterval(trend_chart.onTimer, 10000);
});

// チャートデータの処理
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
	// 表示データのリクエストをサーバへ送信する
	trend_chart.requestTrendData();
};

// サーバへデータ要求する
trend_chart.requestTrendData = function() {
	var enddate = trend_chart.getToday("{0}{1}{2}");
	var today = new Date();
	var startdate = trend_chart.getDateString(trend_chart.addDate(today,  0), "{0}{1}{2}");
	$.get('/trend_get?startdate=' + startdate + '&enddate=' + enddate, function(data){
		// 応答データでチャートを更新する
		trend_chart.chart_init(data.chart_data);
		// 子機情報の更新
		trend_chart.dispLogger_info(data.last_trend.batt, data.last_trend.rssi);
		$("#trend_methane").text(data.last_trend.value[0]);
		$("#trend_temp").text(data.last_trend.value[1]);
		// 後で実装
	});
};
// 今日の日付文字列を取得する
trend_chart.getToday = function(format_str) {
		var d = new Date();
		return trend_chart.getDateString(d, format_str);
}
// 日付文字列を取得する
trend_chart.getDateString = function(date, format_str) {
		var date_format = trend_chart.format(format_str,
				date.getFullYear(),
				date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1),
				date.getDate() < 10 ? "0" + date.getDate() : date.getDate());
		return date_format;
}
// フォーマット
trend_chart.format = function(fmt , a) {
	var rep_fn = undefined;
	if (typeof a == "object") {
		rep_fn = function(m, k) {return a[ k ];}
	} else {
		var args = arguments;
		rep_fn = function(m, k) {return args[ parseInt(k) + 1];}
	}
	return fmt.replace(/\{(\w+)\}/g, rep_fn);
}

// 日付の加算
trend_chart.addDate = function(date, count) {
		var t = date.getTime();
		t = t + (count * 86400000);
		var d = new Date();
		d.setTime(t);
		return d;
}
