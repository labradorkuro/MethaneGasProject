﻿var __data_dir = "../../TGES_Methane_data";
var __backup_dir = "../../TGES_Methane_data_backup";

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var xml2js = require('xml2js');
var logger4 = require('./logger');

var routes = require('./routes/index');
var users = require('./routes/users');
var trend_chart = require('./routes/trend_chart');
var trend_get = require('./api/trend_get');
var download = require('./api/download');
var model = require('./model');
var RTR_Trend = model.RTR_Trend;	


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/trend_chart',trend_chart);	// トレンド表示、期間表示
app.get('/trend_get',trend_get.trend_get);		// トレンドデータの取得
app.get('/download',download,download);		// データのcsvを取得
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// 現在値ファイルのチェックスタート
trendFileCheckStart();

module.exports = app;

// 現在値ファイルチェックスタート
function trendFileCheckStart() {
	fileSearch();
	var timer = setInterval(fileSearch, (1000 * 60 * 1));		// データファイル検索１分間隔
}

// ディレクトリ内のXMLファイル検索
function fileSearch() {
		var rc = false;
		var dir = __data_dir;
		fs.readdir(dir,  function(err, files) {
				if (err) {
					// ログ出力
					logger4.rtr_trend.error(err);
					return;
				}
				files.filter(function(file) {
						// XMLファイルのみ検索する
						file = dir + path.sep + file;
//						console.log(file);
						return fs.statSync(file).isFile() && /.*\.xml$/.test(file); //絞り込み
				}).forEach(function (file) {
						// 検索されたファイルを解析する
						var org_file = dir + path.sep + file;							// ファイルパス
						var bk_file = __backup_dir + path.sep + file;		// バックアップファイルパス
						// ファイルをバックアップしてから解析処理を実行
						copyFile(org_file, bk_file,function(){
							// データファイルの解析処理
							rc = trendFileCheck(org_file);
							if (! rc) {
								return rc;
							}
						})
				});
		});
}

// XMLファイルを読み込んでJSONに変換
function trendFileCheck(filepath) {
	var rc = false;
	//var filepath = dir + path.sep + filename;
	// XMLパーサ生成
	var parser = new xml2js.Parser();
	// ファイル読み込み
	fs.readFile(filepath, function (err, data) {
		// 解析処理
		console.log("trendFileCheck( " + filepath + " )");
		if (err) {
			// ログ出力
			logger4.rtr_trend.error(err);
			return rc;
		}
		try {
			
		    parser.parseString(data, function (err, result) {
		    		if (err) {
		    			// ログ出力
		    			logger4.rtr_trend.error(err);
		    			return rc;
		    		} else {
		    	        // 解析結果を処理
//		    			console.dir(JSON.stringify(result));
		    			if (result.file.group) {
		    				// mongDBのmodelに合わせてjsonを作成し、データを格納する
		    				// ファイル名から時間を取り出す
		    				var name = result.file.$.name;
		    				var serial = result.file.base[0].serial[0];
		    				var model = result.file.base[0].model[0];
		    				var time_str = getTimeString(model, serial,name);
		    				var date_str = getDateString(model, serial,name);
		    				// 親機の情報を取得して保存用のデータに入れる
		    				var trend = {
		    						base: model, 
		    						ext_ps: result.file.base[0].gsm[0].ext_ps, 
		    						battery: result.file.base[0].gsm[0].batt,
		    						date_str: date_str, 
		    						time_str: time_str, 
		    						trends: [ ] };
		    				console.log("len = " + result.file.group[0].remote.length);
		    				// 子機の数分ループ
		    				for(var i in result.file.group[0].remote) {
		    					var tr = {
					    				time_str : result.file.group[0].remote[i].ch[0].current[0].time_str,
					    				model : result.file.group[0].remote[i].model,
					    				num : result.file.group[0].remote[i].num,
					    				unit_name : result.file.group[0].remote[i].name,
					    				value : result.file.group[0].remote[i].ch[0].current[0].value[0]._,
					    				value_unit : result.file.group[0].remote[i].ch[0].current[0].unit,
					    				battery : result.file.group[0].remote[i].ch[0].current[0].batt,
					    				rssi : result.file.group[0].remote[i].rssi
		    					};
		    					// 計測値の無効チェック
		    					if (result.file.group[0].remote[i].ch[0].current[0].value[0].$.valid == "true") {
						    		trend.trends.push(tr);
		    					} else {
		    						// 計測値無効
				    				tr.battery = "-1";
		    					}
		    				}
	    					// メタン濃度の温度補正処理
		    				trend.trends = methaneValueAdjustment(trend.trends);
		    				
				    		// mongoDBへ追加する
				    		rc = dbPost(trend, filepath);
				    		if (! rc) {
				    			return rc;
				    		}
		    			}
		    		}
		    });
			
		} catch(ex) {
			// ログ出力
			logger4.rtr_trend.error(ex);
			return rc;
		}
	});
}

// 計測値からメタン濃度値を補正する
function methaneValueAdjustment(trends) {
	var temp = 0;
	var mA = 0;
	var _c = 0;
	// 温度値と電流値を取り出す
	if (trends[0].model == "RTR-502") {
		temp = trends[0].value;
		mA = trends[1].value;
	} else {
		temp = trends[1].value;
		mA = trends[0].value;
	}
	console.log("model=" + trends[0].model + " temp=" + temp + " mA=" + mA);
	var _temp = temp - 20;
	if (_temp < -10) {
		_c = -2.3;
	} else if ((-10 <= _temp) && (_temp <= 10) ){
		_c = _temp * 0.23;
	} else {
		_c = 2.3;
	}
	var c0 = 50 * (mA - 4) / 8;
	var c = (c0 + _c);
	c = Math.round(c * 100);
	c = c / 100;
	if (trends[0].model == "RTR-502") {
		trends[1].value = c;
	} else {
		trends[0].value = c;
	}
	return trends;
}
//ファイル名から日付文字列を取り出す
function getDateString(model, serial, name) {
		var idx_a = model.length + serial.length + 2;
		var date = name.substring(idx_a, idx_a + 8);
		return date;
};
//ファイル名から時間文字列を取り出す
function getTimeString(model, serial, name) {
		var idx_a = model.length + serial.length + 2 + 9;
		var time = name.substring(idx_a, idx_a + 6);
		return time;
};

// mongoDBに追加
function dbPost(json,filename) {
	//console.dir(JSON.stringify(json));
	var new_RTR_Trend = new RTR_Trend(json);
	new_RTR_Trend.save(function(err) {
		if (err) {
			// ログ出力
			logger4.rtr_trend.error(err);
			// 処理したファイルは削除する
			fs.unlink(filename,function(err){
				if (err)  logger4.rtr_trend.error(err);
			});
			return false;
		} else {
			// 処理したファイルは削除する
			fs.unlink(filename,function(err){
				if (err)  logger4.rtr_trend.error(err);
			});
			return true;
		}
	});
}

// ファイルコピー
function copyFile(source, target, cb) {
	var cbCalled = false;

	var rd = fs.createReadStream(source);
	rd.on("error", function(err) {
		logger4.rtr_trend.error(err);
		done(err);
	});
	var wr = fs.createWriteStream(target);
	wr.on("error", function(err) {
		logger4.rtr_trend.error(err);
		done(err);
	});
	wr.on("close", function(ex) {
		done();
	});
	rd.pipe(wr);

	function done(err) {
		if (!cbCalled) {
			cb(err);
			cbCalled = true;
		}
	}
}

