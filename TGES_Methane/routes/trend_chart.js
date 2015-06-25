var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function (req, res) {
	if ((typeof req.session.login == "undefined") || (req.session.login != true)) {
		res.render('index', { title: 'メタン濃度計測', msg:  "ログインしてください"});
	} else {
		res.render('trend_chart', { title: 'メタン濃度計測', trend_data:  null});
	}
});

module.exports = router;