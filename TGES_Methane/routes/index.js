var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'メタン濃度計測システム',msg:'ログインしてください' });
});

module.exports = router;