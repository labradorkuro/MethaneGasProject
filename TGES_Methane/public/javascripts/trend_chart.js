﻿//
// トレンド表示、期間表示画面
//
$(function() {
		Chart.defaults.global.animation = false;
		$.datepicker.setDefaults($.datepicker.regional[ "ja" ]); // 日本語化
		// タブの初期化
		trend_chart.initTabs();
		// 表示データのリクエストをサーバへ送信する
		trend_chart.requestTrendData();
		trend_chart.requestWeeklyData();
		// データ表示
		//trend_chart.dispLogger_info(["",""],["",""]);
		// データリクエスト用のタイマーセット
		trend_chart.timer = setInterval(trend_chart.onTimer, 60000);
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
trend_chart.chart_init = function(id,id_legend, data) {
	 var options = {
	        // 凡例表示用の HTML テンプレート
	        legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\">&nbsp;&nbsp;&nbsp;</span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
	    };
	var ctx = document.getElementById(id).getContext("2d");
	trend_chart.myLineChart = new Chart(ctx).Line(data, options);
	var legend = trend_chart.myLineChart.generateLegend();
	$("#" + id_legend).empty();
	$("#" + id_legend).append($(legend));
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
	// 表示日付範囲
	var enddate = trend_chart.getToday("{0}{1}{2}");
	var today = new Date();
	var startdate = trend_chart.getDateString(trend_chart.addDate(today,  -6), "{0}{1}{2}");
	$.get('/trend_get?startdate=' + startdate + '&enddate=' + enddate + '&interval=12', function(data){
		// 応答データでチャートを更新する
		trend_chart.chart_init("trend_chart", "chart_legend",data.chart_data);
		// 子機情報の更新
		trend_chart.dispLogger_info(data.last_trend.batt, data.last_trend.rssi);
		$("#chart_title").text(trend_chart.addDateSeparator(startdate,"/") + " - " + trend_chart.addDateSeparator(enddate,"/") + "　サマリー");
//		$("#last_measure_time").text("最終計測時間：" + data.last_trend.date + " " + data.last_trend.time);
//		$("#trend_methane").text(data.last_trend.value[0]);
//		$("#trend_temp").text(data.last_trend.value[1]);
		// 
		$.get('/trend_get?startdate=' + enddate + '&enddate=' + enddate + '&interval=1', function(data){
			// 応答データでチャートを更新する
			trend_chart.chart_init("trend_chart_1" , "chart_legend_1", data.chart_data);
			$("#chart_title_1" ).text(data.last_trend.date);
			$("#last_measure_time").text("最終計測時間：" + data.last_trend.date + " " + data.last_trend.time);
			$("#trend_methane").text(data.last_trend.value[0]);
			$("#trend_temp").text(data.last_trend.value[1]);
		});
		
	});
};
trend_chart.requestWeeklyData = function() {
	var enddate = trend_chart.getToday("{0}{1}{2}");
	var today = new Date();
	enddate = trend_chart.getDateString(trend_chart.addDate(today,   -1), "{0}{1}{2}");
	$.get('/trend_get?startdate=' + enddate + '&enddate=' + enddate + '&interval=1', function(data){
		// 応答データでチャートを更新する
		trend_chart.chart_init("trend_chart_2" , "chart_legend_2", data.chart_data);
		$("#chart_title_2" ).text(data.last_trend.date );
	});
	enddate = trend_chart.getDateString(trend_chart.addDate(today,   -2), "{0}{1}{2}");
	$.get('/trend_get?startdate=' + enddate + '&enddate=' + enddate + '&interval=1', function(data){
		// 応答データでチャートを更新する
		trend_chart.chart_init("trend_chart_3" , "chart_legend_3", data.chart_data);
		$("#chart_title_3" ).text(data.last_trend.date );
	})
	enddate = trend_chart.getDateString(trend_chart.addDate(today,   -3), "{0}{1}{2}");
	$.get('/trend_get?startdate=' + enddate + '&enddate=' + enddate + '&interval=1', function(data){
		// 応答データでチャートを更新する
		trend_chart.chart_init("trend_chart_4" , "chart_legend_4", data.chart_data);
		$("#chart_title_4" ).text(data.last_trend.date );
	});
	enddate = trend_chart.getDateString(trend_chart.addDate(today,   -4), "{0}{1}{2}");
	$.get('/trend_get?startdate=' + enddate + '&enddate=' + enddate + '&interval=1', function(data){
		// 応答データでチャートを更新する
		trend_chart.chart_init("trend_chart_5" , "chart_legend_5", data.chart_data);
		$("#chart_title_5" ).text(data.last_trend.date );
	});
	enddate = trend_chart.getDateString(trend_chart.addDate(today,   -5), "{0}{1}{2}");
	$.get('/trend_get?startdate=' + enddate + '&enddate=' + enddate + '&interval=1', function(data){
		// 応答データでチャートを更新する
		trend_chart.chart_init("trend_chart_6" , "chart_legend_6", data.chart_data);
		$("#chart_title_6" ).text(data.last_trend.date );
	});
	enddate = trend_chart.getDateString(trend_chart.addDate(today,   -6), "{0}{1}{2}");
	$.get('/trend_get?startdate=' + enddate + '&enddate=' + enddate + '&interval=1', function(data){
		// 応答データでチャートを更新する
		trend_chart.chart_init("trend_chart_7" , "chart_legend_7", data.chart_data);
		$("#chart_title_7" ).text(data.last_trend.date );
	});
		
	
}
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
trend_chart.addDateSeparator = function(date,sep) {
	return date.substring(0,4) + sep + date.substring(4,6) + sep + date.substring(6);
}

