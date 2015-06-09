var express = require('express');
var router = express.Router();

var model = require('../model');
var Post = model.Post;

/* GET home page. */
router.get('/', function (req, res) {
	Post.find({}, function(err, items){
		res.render('trend_chart', { title: 'メタン濃度計測', trend_data:  items});
	});
});

module.exports = router;