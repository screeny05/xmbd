module.exports = function(grunt){
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			all: ['src/xmbd.js'],
			options: {
				jshintrc: '.jshintrc'
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - built: <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				sourceMap: 'build/xmbd.min.map'
			},
			build: {
				src: 'src/<%= pkg.name %>.js',
				dest: 'build/<%= pkg.name %>.min.js'
			}
		},
		qunit: {
			all: {
				options: {
					timeout: 100000,
					urls: [
						'http://localhost:8000/test/qunit.html'
					]
				}
			}
		},
		connect: {
			server: {
				options: {
					port: 8000,
					base: '.'
				}
			},
			keepalive: {
				options: {
					port: 8000,
					base: '.',
					keepalive: true
				}
			}
		},
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.registerTask('default', ['jshint', 'uglify', 'connect:server', 'qunit']);
	grunt.registerTask('test', ['connect:server', 'qunit']);
	grunt.registerTask('server', ['connect:keepalive']);
	grunt.registerTask('build', ['uglify']);
};
