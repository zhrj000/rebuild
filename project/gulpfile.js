
// gulp npm 本地依赖包
var gulp = require('gulp');
var compass = require('gulp-compass');
var concat = require('gulp-concat');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var imageminJpegtran = require('imagemin-jpegtran');
var rimraf = require('gulp-rimraf');
var rename = require('gulp-rename');
var tar = require('gulp-tar');
var ghtmlSrc = require('gulp-html-src');
var htmlreplace = require('gulp-html-replace');

//自定义模块
var styleFilter = require('./utils/style-filter');
var pxRem = require('./utils/px-rem');

//配置信息
var config = {
	ftp: '',		//ftp地址
	projInfo: {author: 'zhangruojun', design: 'huanshun'},		//开发信息
	defaultFontSize: null, 		//px to rem default字体大小配置(16),不需要的话设置null
	imgminPath: 'src/*/*.{jpg,png}', 		//需要压缩的图片路径配置
	jsPath: ['src/*/*.js', '!src/utils/*.js']	//js文件路径
}



//sass编译,compass合并雪碧图
gulp.task('compass', function() {
	return gulp.src('src/sass/*.scss')
	.pipe(compass({
		config_file: 'src/config.rb',
		css: 'src/css',
		sass: 'src/sass',
		image: 'src/img'
	}))
});
// compass生成的雪碧图文件px to rem
gulp.task('pxrem', function() {
	return gulp.src('src/css/spr.css')
	.pipe(pxRem(config.defaultFontSize))
	.pipe(gulp.dest('src/css/'))
});
gulp.task('sass', gulp.series('compass', 'pxrem'));



//图片压缩
gulp.task('image', function () {
    return gulp.src(config.imgminPath)
    .pipe(imagemin({
        progressive: true,
        use: [pngquant(), imageminJpegtran({progressive: true})]
    }))
    .pipe(gulp.dest('build'));
});



//合并html引用到的css
//如果有多个html页面，引用不同的样式要合并成不同的
//需另外处理，这里默认都合并成一个
gulp.task('copy-css', function() {
    return gulp.src('src/index.html')
    .pipe(ghtmlSrc({ presets: 'css'}))
    .pipe(concat('style.css'))
	.pipe(styleFilter(config.projInfo))
	.pipe(gulp.dest('build/css'))
});
//替换html里面的link  
//需要合并的link需要这样包住
//<!-- build:css --><link **** /><!-- endbuild -->
gulp.task('htmlrp', function() {
	return gulp.src('src/*.html')
    .pipe(htmlreplace({
        css: 'css/style.css'
    }))
    .pipe(gulp.dest('build/'));
});
gulp.task('html', gulp.series('copy-css', 'htmlrp'));



//js文件暂不做处理
gulp.task('js', function() {
	return gulp.src(config.jsPath)
	.pipe(gulp.dest('build/'))
});



//清除
gulp.task('clean', function () {
     return gulp.src('build/', { read: false })
    .pipe(rimraf({ force: true }));
});


//打包，备份用
gulp.task('tar', function() {
	return gulp.src('build/**/*')
    .pipe(tar('backup.tar'))
    .pipe(rename({
    	suffix: '-' + Date.now()
    }))
    .pipe(gulp.dest('backup/'));
});


//上传到ftp
gulp.task('ftp', function() {
	return gulp.src('build/**/*')  //'build/*'只放了第一层目录的东西
    .pipe(gulp.dest(config.ftp))
});



//监控
gulp.task('watch', function() {

	gulp.watch(['src/sass/*.scss', 'src/images/*/'], gulp.series('sass'));   //增删图片不会重新compass,除非手动改sass

	gulp.watch(config.imgminPath, gulp.series('image'));

	gulp.watch(['src/*.html', 'src/css/*.css'], gulp.series('html'));

});


// gulp  4.0
gulp.task('build', gulp.series('sass', gulp.parallel('image', 'html', 'js')));

//上传到ftp
gulp.task('prod', gulp.series('clean', 'build', 'ftp', 'tar')); 



//将package.json复制到常用的盘的根目录，然后npm install
//或者用npm link
//node的模块分核心模块和自定义模块
//核心模块如 http fs node已经指明了明确路径
//自定义模块的查找
//1.当前文件目录下的node_modules目录
//2.父目录下的node_modules目录
//3.父目录的父目录下的node_modules目录
//4.沿路径向上逐级递归，直到根目录下的node_modules目录



