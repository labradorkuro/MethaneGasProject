var __dirname = "../../TGES_Methane_data";
var __backup_dir = "../../TGES_Methane_data_backup";

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var xml2js = require('xml2js');

var routes = require('./routes/index');
var users = require('./routes/users');
var trend_chart = require('./routes/trend_chart');
var trend_get = require('./api/trend_get');
var model = require('./model');
var Post = model.Post;	


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
	var timer = setInterval(fileSearch, (1000 * 60 * 5));
}

// ディレクトリ内のXMLファイル検索
function fileSearch() {
		var dir = __dirname;
		fs.readdir(dir,  function(err, files) {
			if (err) {
				console.log(err);
			}
			files.filter(function(file) {
				// XMLファイルのみ検索する
				file = dir + path.sep + file;
				console.log(file);
				return fs.statSync(file).isFile() && /.*\.xml$/.test(file); //絞り込み
			}).forEach(function (file) {
				// 検索されたファイルを解析する
				var org_file = dir + path.sep + file;							// ファイルパス
				var bk_file = __backup_dir + path.sep + file;		// バックアップファイルパス
				// ファイルをバックアップしてから解析処理を実行
				copyFile(org_file, bk_file,function(){
					// データファイルの解析処理
					trendFileCheck(org_file);
				})
			});
		});
}

// XMLファイルを読み込んでJSONに変換
function trendFileCheck(filepath) {
	console.log("trendFileCheck");
	//var filepath = dir + path.sep + filename;
	// XMLパーサ生成
	var parser = new xml2js.Parser();
	// ファイル読み込み
	fs.readFile(filepath, function (err, data) {
		// 解析処理
		console.log("trendFileCheck( " + filepath + " )");
	    parser.parseString(data, function (err, result) {
	    		if (err) {
	    			console.log(err);
	    		} else {
	    	        // 解析結果を処理
	    			console.dir(JSON.stringify(result));
	    			if (result.file.group) {
	    				// mongDBのmodelに合わせてjsonを作成し、データを格納する
	    				var trend = {base:result.file.base[0].model[0],
	    								trends: []};
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
				    		trend.trends.push(tr);
	    				}
			    		// mongoDBへ追加する
			    		dbPost(trend, filepath);
	    			}
	    		}
	    });
	});
}

// mongoDBに追加
function dbPost(json,filename) {
	console.dir(JSON.stringify(json));
	var new_post = new Post(json);
	new_post.save(function(err) {
		if (err) {
			console.log(err)
		} else {
			// 処理したファイルは削除する
			fs.unlink(filename,function(err){
				if (err) console.log(err);
			});
			// ファイル名（拡張子）を変更する
			console.log('** dbPost OK **');
		}
	})
}

// ファイルコピー
function copyFile(source, target, cb) {
	var cbCalled = false;

	var rd = fs.createReadStream(source);
	rd.on("error", function(err) {
		done(err);
	});
	var wr = fs.createWriteStream(target);
	wr.on("error", function(err) {
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