//
// トレンド表示、期間表示画面
//
$(function() {
		Chart.defaults.global.animation = false;
		$.datepicker.setDefaults($.datepicker.regional[ "ja" ]); // 日本語化
		// タブの初期化
		trend_chart.initTabs();
		$(".datepicker").datepicker({dateFormat:"yy/mm/dd"});
		// 表示データのリクエストをサーバへ送信する
		trend_chart.requestTrendData();
		//trend_chart.requestWeeklyData();
		// データ表示
		//trend_chart.dispLogger_info(["",""],["",""]);
		// データリクエスト用のタイマーセット
		trend_chart.timer = setInterval(trend_chart.onTimer, 60000);
		// データのダウンロード画面用のボタンイベント登録
		$("#download_button").bind('click', trend_chart.downloadFile);
		$("#clear_button").bind('click', trend_chart.clearDownloadData);
		$("#clear_button").attr("disabled",true);
		$("#savefile").css("display","none");

		// 期間表示画面用のボタンイベント登録
		$("#priod_search_button").bind('click', trend_chart.searchPriodData);
		$("#priod_clear_button").bind('click', trend_chart.clearPriodData);
		// エラー表示用ダイアログの生成
		trend_chart.createMessageDialog();
});

// チャートデータの処理
var trend_chart = trend_chart || {}
trend_chart.myLineChart = null;
trend_chart.timer = null;
trend_chart.count = 0;
trend_chart.prevDate = "";	// 日付変更確認用

// メッセージダイアログの初期化
trend_chart.createMessageDialog = function() {
	$("#message_dialog").dialog({
		autoOpen:false,
		width:460,
		height:250,
		title:'エラーメッセージ',
		closeOnEscape:false,
		modal:true,
		buttons:{
			'閉じる': function () {
				$(this).dialog('close');
			}
		}
	});
}
// タブ初期化
trend_chart.initTabs = function() {
		// タブを生成
		$("#tabs").tabs({
			activate: function(event, ui) {
				if (ui.newTab.index() == 0) {
					trend_chart.requestTrendData();
				}
			}
		});
};

// トレンドグラフ表示
trend_chart.chart_init = function(id,id_legend, data) {
	 var options = {
			 pointHitDetectionRadius : 4,	// マウスでデータをポイントする範囲の大きさ指定
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
	// 電池残量によって背景色を変更する
	$("#td_logger_1_bat").attr("style","text-align:center;background-color:aquamarine;");
	if (battery_info[0] == "2") {
		$("#td_logger_1_bat").attr("style","text-align:center;background-color:yellow;");
	} 
	if (battery_info[0] <= "1") {
		$("#td_logger_1_bat").attr("style","text-align:center;background-color:red;");				
	}

	// 電波強度によって背景色を変更する
	$("#td_logger_1_wav").attr("style","text-align:center;background-color:aquamarine;");
	if (wave_info[0] == "2") {
		$("#td_logger_1_wav").attr("style","text-align:center;background-color:yellow;");
	} 
	if (wave_info[0] <= "1") {
		$("#td_logger_1_wav").attr("style","text-align:center;background-color:red;");				
	}
	
	// 電池残量によって背景色を変更する
	$("#td_logger_2_bat").attr("style","text-align:center;background-color:lightgreen;");
	if (battery_info[1] == "2") {
		$("#td_logger_2_bat").attr("style","text-align:center;background-color:yellow;");
	} 
	if (battery_info[1] <= "1") {
		$("#td_logger_2_bat").attr("style","text-align:center;background-color:red;");				
	}
	// 電波強度によって背景色を変更する
	$("#td_logger_2_wav").attr("style","text-align:center;background-color:lightgreen;");
	if (wave_info[1] == "2") {
		$("#td_logger_2_wav").attr("style","text-align:center;background-color:yellow;");
	} 
	if (wave_info[1] <= "1") {
		$("#td_logger_2_wav").attr("style","text-align:center;background-color:red;");				
	}
	// 電池残量値の表示更新
	$("#logger_1_bat").text(battery_info[0]);
	$("#logger_2_bat").text(battery_info[1]);
	// 電波強度値の表示更新
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
		if (data.error_info.error_msg != "") {
			$("#message").text(data.error_info.error_msg);
			$("#message_dialog").dialog("open");
		}
		// 応答データでチャートを更新する（サマリー）
		trend_chart.chart_init("trend_chart", "chart_legend",data.chart_data);
		$("#chart_title").text(trend_chart.addDateSeparator(startdate,"/") + " - " + trend_chart.addDateSeparator(enddate,"/") + "　サマリー");
		// 当日の詳細表示
		$.get('/trend_get?startdate=' + enddate + '&enddate=' + enddate + '&interval=1', function(data){
			// 応答データでチャートを更新する
			trend_chart.chart_init("trend_chart_1" , "chart_legend_1", data.chart_data);
			$("#chart_title_1" ).text(data.last_trend.date);
			$("#last_measure_time").text("最終計測時間：" + data.last_trend.date + " " + data.last_trend.time);
			$("#trend_methane").text(data.last_trend.value[0]);
			$("#trend_temp").text(data.last_trend.value[1]);
			var ext_ps = "";
			if (data.last_trend.ext_ps === "1") {
				ext_ps = "通電";
				$("#td_base_ext_ps").attr("style","text-align:center;background-color:lightgreen;");
			} else {
				ext_ps = "遮断";
				$("#td_base_ext_ps").attr("style","text-align:center;background-color:red;");
			}
			$("#base_ext_ps").text(ext_ps);
			$("#td_base_battery").attr("style","text-align:center;background-color:ligthgreen;");
			if (data.last_trend.battery == "2") {
				$("#td_base_battery").attr("style","text-align:center;background-color:yellow;");
			} 
			if (data.last_trend.battery <= "1") {
				$("#td_base_battery").attr("style","text-align:center;background-color:red;");				
			}
			$("#base_battery").text(data.last_trend.battery);
			// 子機情報の更新
			trend_chart.dispLogger_info(data.last_trend.batt, data.last_trend.rssi);

			// 過去１週間のデータを取得してグラフ表示
			if (trend_chart.prevDate != enddate) {
				trend_chart.prevDate = enddate;
				trend_chart.requestWeeklyData();
			}
		});
		
	});
};
// １週間前からのデータを取得してグラフ表示する
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
// 期間表示のためのデータ取得
trend_chart.searchPriodData = function() {
	var startdate = $("#priod_start_date").val();
	var enddate = $("#priod_end_date").val();
	var date_count = trend_chart.getDateCount(trend_chart.dateStringToDate(enddate), trend_chart.dateStringToDate(startdate));	
	// データ取得リクエスト
	$.get('/trend_get?startdate=' + trend_chart.dateSeparatorChange(startdate,"")  + '&enddate=' + trend_chart.dateSeparatorChange(enddate,"")  + '&interval=' + (date_count  * 2), function(data){
		if (data.error_info.error_msg != "") {
			$("#message").text(data.error_info.error_msg);
			$("#message_dialog").dialog("open");
		}
		// 応答データでチャートを更新する（サマリー）
		trend_chart.chart_init("priod_trend_chart", "priod_chart_legend",data.chart_data);
		$("#priod_chart_title").text(startdate + " - " + enddate);
	});
}

// csvファイルのダウンロードのためのデータ取得
trend_chart.downloadFile = function() {
	var startdate = $("#start_date").val();
	var enddate = $("#end_date").val();
	// データ取得リクエスト
	$.get('/download?startdate=' + trend_chart.dateSeparatorChange(startdate,"") + "&enddate=" + trend_chart.dateSeparatorChange(enddate,""), function(data) {
		$("#result_text").val(data);
		$("#clear_button").attr("disabled",false);
		var content = $("#result_text").val();
		// ファイルに保存するための処理
		var blob = new Blob([ content ], { "type" : "application/x-msdownload" });
		window.URL = window.URL || window.webkitURL;
		// ダウンロード用のリンク設定
		$("#download").attr("href", window.URL.createObjectURL(blob));
		$("#download").attr("download", "RTR_DATA.csv");
		$("#savefile").css("display","block");
		
	});
}
// ダウンロードデータの表示クリア
trend_chart.clearDownloadData = function() {
	$("#result_text").val("");
	$("#start_date").val("");
	$("#end_date").val("");
	$("#clear_button").attr("disabled",true);
	$("#download").removeAttr("href");
	$("#savefile").css("display","none");
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
trend_chart.dateStringToDate = function(dateString) {
	return new Date(dateString);
}
// 日数計算
trend_chart.getDateCount = function(start, end) {
	var d = end.getTime() - start.getTime();
	d = Math.floor((d / (24 * 3600 * 1000)));
	return d;
}
// 区切り文字変更
trend_chart.dateSeparatorChange = function(dateString, separator) {
	return dateString.replace(/[/]/g, separator);
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

