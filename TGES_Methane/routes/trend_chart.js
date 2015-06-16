var express = require('express');
var router = express.Router();

//var model = require('../model');
//var RTR_Trend = model.RTR_Trend;

/* GET home page. */
router.get('/', function (req, res) {
//	Post.find({}, function(err, items){
		res.render('trend_chart', { title: 'メタン濃度計測', trend_data:  null});
//	});
});

module.exports = router;