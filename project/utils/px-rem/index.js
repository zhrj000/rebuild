
var through = require('through2');
var gutil = require('gulp-util');

module.exports = function(options) {
	return through.obj(function(file, enc, cb) {

		if(file.isNull()) {
			this.push(file);
			return cb();
		}

		if(file.isStream()) {
			this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
      		return cb();
		}

	
		var content = file.contents.toString();
		
		if(options) {
			
			if(content.indexOf('rem') < 0) {
				//width放大10px
				content = content.replace(/(?:(?:width:)\s+([+\-]?\d+)(?:px)?)/g, function($0, $1) {
					return 'width: ' + ((+$1 + 10) / options / 2) + 'rem';
				});
				//高度放大10px
				content = content.replace(/(?:(?:height:)\s+([+\-]?\d+)(?:px)?)/g, function($0, $1) {
					return 'height: ' + ((+$1 + 10) / options / 2) + 'rem';
				});
				//background-postion 相对放大5px
				content = content.replace(/(?:(?:background-position:)\s+([+\-]?\d+)(?:px)?\s+([+\-]?\d+)(?:px)?)/g, function($0, $1, $2) {
					return 'background-position: ' + ((+$1 + 5) / options / 2) + 'rem' + ' ' + ((+$2 + 5) / options / 2) + 'rem';
				});
	
			}
			

			// content = content.replace(/(?:([0-9]*)px)/g, function($0, $1) {		//只针对compass生成的雪碧图文件

			// 	return ($1 / options / 2 * 1 + 'rem');


			// });
		}
		


		file.contents = new Buffer(content);
		this.push(file);
		cb();
	})
}