
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
		var newContent = file.contents.toString().replace(/\n\s*\r/g, '');
		newContent = newContent.replace(/\/\*br\*\//gi, '');


		//合并相同选择器样式, 去掉多余空行
		// var cssObj = {};
		// content.replace(/(.+)\{(.+)\}/g, function($0, $1, $2) {

		// 	if(cssObj[$1]) {
		// 		cssObj[$1] = $2 + cssObj[$1];
		// 	}
		// 	else {
		// 		cssObj[$1] = $2;
		// 	}
		// });

		// var newContent = '';
		// for(var name in cssObj) {

		// 	// 多张雪碧图，样式用空行分开	
		// 	// if((/((?:\.)(?:[^,]+)(?:\,))/g).test(name)) {

		// 	// 	newContent += '\n';
		// 	// }

	 //        newContent += (name + '{' + cssObj[name] + '}' + '\n');
	 //    }

	    var date = new Date();
	    var othInfo = '/*\n'
			+ ' * @author: ' + options.author + ';\n'
			+ ' * @design: ' + options.designer + ';\n'
			+ ' * @update: ' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ';\n'
			+ ' */\n\n';



		newContent = othInfo + newContent;	


		file.contents = new Buffer(newContent);
		this.push(file);
		cb();
	})
}