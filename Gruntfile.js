/**
 * Created by alo on 7/8/14.
 */
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ["dist", "views/compiled"],
        concat: {
            js: {
                src: [
                    'js/conceptDetailsPlugin.js',
                    'js/countryIcons.js',
                    'js/drawConceptDiagram.js',
                    'js/popover.js',
                    'js/searchPlugin.js',
                    'js/svgdiagrammingv2.js',
                    'js/taxonomyPlugin.js',
                    'js/refsetPlugin.js',
                    'js/favoritesPlugin.js',
                    'js/util.js',
                    'views/compiled/templates.js'
                ],
                dest: 'dist/js/<%= pkg.name %>-<%= pkg.version %>.js'
            },
            css: {
                src: 'css/*.css',
                dest: 'dist/css/<%= pkg.name %>-<%= pkg.version %>.css'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'dist/js/<%= pkg.name %>-<%= pkg.version %>.js',
                dest: 'dist/js/<%= pkg.name %>-<%= pkg.version %>.min.js'
            }
        },
        cssmin: {
            css: {
                src: 'dist/css/<%= pkg.name %>-<%= pkg.version %>.css',
                dest: 'dist/css/<%= pkg.name %>-<%= pkg.version %>.min.css'
            }
        },
        handlebars: {
            compile: {
                options: {
                    namespace: "JST"
                },
                files: {
                    "views/compiled/templates.js": "views/**/*.hbs"
                }
            }
        },
        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['-A'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
            }
        },
        release: {
            options: {
                bump: false, //default: true
                npm: false, //default: true
                npmtag: true, //default: no tag
                github: {
                    repo: 'termmed/snomed-interaction-components', //put your user/repo here
                    usernameVar: 'GITHUB_USERNAME', //ENVIRONMENT VARIABLE that contains Github username
                    passwordVar: 'GITHUB_PASSWORD' //ENVIRONMENT VARIABLE that contains Github password
                }
            }
        },
        jshint: {
            all: ['js/**/*.js'],
            options: {
                reporter: require('jshint-stylish'),
                reporterOutput: 'dist/jshint-output.txt'
            }
        },
        changelog: {
            options: {
                // Task-specific options go here.
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-conventional-changelog');
    grunt.loadNpmTasks('grunt-release');

    // Default task(s).
    grunt.registerTask('default', ['clean', 'handlebars', 'concat','uglify', 'cssmin']);

    grunt.registerTask('releaseit', function(target) {
        grunt.task.run([
            'bump-only:' + target,
            'default'
        ]);
    });
};