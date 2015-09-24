
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
		content = content.replace(/\{ftp\}/g, options.ftp)
						 .replace(/\{name\}/g, options.name)
						 .replace(/\{productor\}/g, options.productor)
						 .replace(/\{checker\}/g, options.checker);
		


		file.contents = new Buffer(content);
		this.push(file);
		cb();
	})
}