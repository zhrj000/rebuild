
// gulp npm 本地依赖包
var gulp = require('gulp');
var compass = require('gulp-compass');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var imageminJpegtran = require('imagemin-jpegtran');
var rimraf = require('gulp-rimraf');
var rename = require('gulp-rename');
var tar = require('gulp-tar');

//自定义模块
var styleFilter = require('./utils/style-filter');
var email = require('./utils/email');
var tplFilter = require('./utils/tpl');


//配置信息
var config = {
    //活动页名称
	name: '111', 
	//产品
	productor: '111',
	//设计
	designer: '111',	
	//ftp地址
	ftp: '\\\\192.168.16.189\\部门\\设计部\\需求设计稿\\Z张若君\\工作\\2015\\月份\\',		
	//重构
	author: 'zhangruojun',
	//审核人
	checker: '文静',
	//需要压缩的图片路径配置!src\/img\/[^-]*-s[a-z0-9]{10}\.png	
	imgminPath: ['src/**/*.{jpg,png}', '!src/img/*/*.{jpg,png}', '!src\/img\/*-s*.png']		
}

//sass编译,compass合并雪碧图
gulp.task('sass', function() {
	return gulp.src('src/sass/*.scss')
	.pipe(tplFilter({type: 'scss', path: 'E:/service/moudle/style.scss'}))
	.pipe(gulp.dest('src/sass/'))
	.pipe(compass({
		config_file: 'src/config.rb',
		css: 'src/css',
		sass: 'src/sass',
		image: 'src/img'
	}))
});



//图片压缩
gulp.task('image', function () {
    return gulp.src(config.imgminPath)
    .pipe(imagemin({
        progressive: true,
        use: [pngquant(), imageminJpegtran({progressive: true})]
    }))
    .pipe(gulp.dest('build'));
});

//css
gulp.task('css', function() {
	return gulp.src('src/css/*.css')
	.pipe(styleFilter(config))
	.pipe(gulp.dest('build/css'));
})

//html
gulp.task('html', function() {
	return gulp.src(['src/*.html', '!src/email*.html'])
	.pipe(tplFilter({type: 'html', path: 'E:/service/moudle/index.html'}))
	.pipe(gulp.dest('src/'))
    .pipe(gulp.dest('build/'));
});

gulp.task('email', function() {
	return gulp.src('src/email.html')
	.pipe(email(config)).pipe(rename({
    	suffix: '-build'
    }))
    .pipe(gulp.dest('src/'));
});


//js文件暂不做处理
gulp.task('js', function() {
	return gulp.src(['src/*/*.js', '!src/utils/*.js'])
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

	gulp.watch(['src/*.html'], gulp.series('html'));

	gulp.watch(['src/css/*.css'], gulp.series('css'));

});


// gulp  4.0
gulp.task('build', gulp.series('sass', gulp.parallel('image', 'html', 'css', 'js', 'email')));

//上传到ftp
gulp.task('prod', gulp.series('clean', 'build', 'ftp', 'email', 'tar')); 



//将package.json复制到常用的盘的根目录，然后npm install
//或者用npm link
//node的模块分核心模块和自定义模块
//核心模块如 http fs node已经指明了明确路径
//自定义模块的查找
//1.当前文件目录下的node_modules目录
//2.父目录下的node_modules目录
//3.父目录的父目录下的node_modules目录
//4.沿路径向上逐级递归，直到根目录下的node_modules目录



