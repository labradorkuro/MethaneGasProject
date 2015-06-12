/**
 * New node file
 */
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/mongodb');

function validator(v) {
	return v.length > 0;
}

var Trend = new mongoose.Schema({
	time_str :	{type: String, validate: [validator, "Empty Error"] },	// 計測時間
	model :		{type: String, validate: [validator, "Empty Error"] },	// 子機モデル名称
	num :		{type: String, validate: [validator, "Empty Error"] },	// 子機番号
	unit_name :	{type: String, validate: [validator, "Empty Error"] },	// 子機ユニット名
	value :		{type: String, validate: [validator, "Empty Error"] },	// 現在値
	value_unit :	{type: String, validate: [validator, "Empty Error"] },	// 値単位
	battery :	{type: String, validate: [validator, "Empty Error"] },	// 電池残量
	rssi :			{type: String, validate: [validator, "Empty Error"] }		// 電波強度
});

var Post = new mongoose.Schema({
	base : String,
	trends:[Trend]
});

exports.Post = db.model('Post', Post);