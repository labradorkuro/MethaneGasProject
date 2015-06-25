var logger4 = require('../logger');

exports.login = function (req, res) {
	var user_id = "tges_user";
	var password = "szgmr";
	if (req.connection) {
			logger4.access.info("remote address:" + getIP(req));
		}
		var msg = "ユーザ名/パスワードが正しくありません";
		var page_title = 'メタン濃度計測システム';
		var uid = req.body.uid;
		var pass = req.body.password;
		req.session.login = false;
		if ((typeof uid === "undefined") || (uid == "")) {
		    res.render('index', { title: page_title,msg:msg });
		} else if ((typeof pass === "undefined") || (pass == "")) {
		    res.render('index', { title: page_title,msg:msg });
		} else {
			if ((uid === user_id) && (pass === password)) {
				req.session.login = true;
				req.session.uid = uid;
				res.render('trend_chart', { title: page_title, trend_data:  null});
			} else {
			    res.render('index', { title: page_title,msg:msg });
			}
		}
		
}
var getIP = function (req) {
	  if (req.headers['x-forwarded-for']) {
	    return req.headers['x-forwarded-for'];
	  }
	  if (req.connection && req.connection.remoteAddress) {
	    return req.connection.remoteAddress;
	  }
	  if (req.connection.socket && req.connection.socket.remoteAddress) {
	    return req.connection.socket.remoteAddress;
	  }
	  if (req.socket && req.socket.remoteAddress) {
	    return req.socket.remoteAddress;
	  }
	  return '0.0.0.0';
};
