var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('trend_chart', { title: 'メタン濃度計測' });
});

module.exports = router;