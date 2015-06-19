/**
 * ログ出力処理
 */
var log4js = require('log4js');
var logger = exports = module.exports = {};
log4js.configure({
	appenders: [
	   	     {
	 			"type":"file",
	 			"category":"rtr_trend",
	 			"filename":"./log/rtr_trend.log",
	 			"pattern":"-yyyy-MM-dd"
	 	     },
		     {
					"type":"file",
					"category":"access",
					"filename":"./log/access.log",
					"pattern":"-yyyy-MM-dd"
			     }
	     ],
	     levels:{"rtr_trend":"DEBUG", "access":"DEBUG"}
});

logger.rtr_trend = log4js.getLogger('rtr_trend');
logger.access = log4js.getLogger('access');
