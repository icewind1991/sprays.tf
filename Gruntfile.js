module.exports = function (grunt) {
	grunt.initConfig({
		pkg              : grunt.file.readJSON('package.json'),
		jshint           : {
			all: ['Gruntfile.js', 'src/*.js']
		},
		watchify         : {
			options: {
				debug: (grunt.option('target') === 'dev')
			},
			main   : {
				src : ['./src/main.js'],
				dest: 'build/bundle.js'
			},
			worker : {
				src : ['./src/worker.js'],
				dest: 'build/worker-bundle.js'
			}
		},
		watch            : {
			main  : {
				files: ['src/*.js', '!src/worker.js'],
				tasks: ['jshint', 'watchify:main', 'asset_cachebuster']
			},
			worker: {
				files: ['src/worker.js'],
				tasks: ['jshint', 'watchify:worker', 'asset_cachebuster']
			},
			less  : {
				files: ['style/*'],
				tasks: ['less', 'asset_cachebuster']
			}
		},
		less             : {
			main: {
				options: {
					paths    : ["style"],
					sourceMap: (grunt.option('target') === 'dev')
				},
				files  : {
					"build/style.css": "style/style.less"
				}
			}
		},
		asset_cachebuster: {
			options: {
				buster: Date.now()
			},
			build  : {
				files: {
					'index.html': ['main.html']
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-asset-cachebuster');
	grunt.loadNpmTasks('grunt-watchify');

	// Default task(s).
	grunt.registerTask('default', ['jshint', 'watchify', 'less', 'asset_cachebuster']);
	grunt.registerTask('dev', function () {
		grunt.option('target', 'dev');
		grunt.task.run(['watch']);
	});
};
