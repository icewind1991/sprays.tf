module.exports = function (grunt) {
	grunt.initConfig({
		pkg     : grunt.file.readJSON('package.json'),
		jshint  : {
			all: ['Gruntfile.js', 'src/*.js']
		},
		watchify: {
			options: {
				debug: true
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
		watch   : {
			main: {
				files: ['src/*.js', '!src/worker.js'],
				tasks: ['jshint', 'watchify:main']
			},
			worker: {
				files: ['src/worker.js'],
				tasks: ['jshint', 'watchify:worker']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-watchify');

	// Default task(s).
	grunt.registerTask('default', ['jshint', 'watchify']);
	//grunt.registerTask('watch', ['watch']);
};
