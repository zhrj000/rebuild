
var through = require('through2');
var gutil = require('gulp-util');
var fs = require('fs');

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
		var tpl = fs.readFileSync(options.path, 'utf-8');

		var endexp, mainexp;

		switch(options.type) {
			case 'html': 
				endexp = /<!--\s*end\s*-->/i;
				mainexp = /(?:\<\!\-\-(.*)\-\-\>)([\s\S]*)/g;
				break;
			case 'scss':
				endexp = /\/\*\s*end\s*\*\//i;
				mainexp = /(?:\/\*\s*(.*)\s*\*\/)([\s\S]*)/g;
				break;
			default:
				break;	
		}

		var tplArr = tpl.split(endexp);



		tplArr.forEach(function(line) {
			line.replace(mainexp, function($1, $2, $3) {
				content = content.replace($2, $3);
			});
		});
	

		file.contents = new Buffer(content);
		this.push(file);
		cb();
	})
}