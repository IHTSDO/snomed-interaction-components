/**
 * Created by alo on 7/8/14.
 */
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ["build", "dist", "views/compiled"],
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    'js/conceptDetailsPlugin.js',
                    'js/drawConceptDiagram.js',
                    'js/searchPlugin.js',
                    'js/svgdiagrammingv2.js',
                    'js/taxonomyPlugin.js',
                    'views/compiled/templates.js'
                ],
                dest: 'build/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'build/<%= pkg.name %>-<%= pkg.version %>.js',
                dest: 'build/<%= pkg.name %>-<%= pkg.version %>.min.js'
            }
        },
        cssmin: {
            minify: {
                expand: true,
                cwd: 'dist/css/',
                src: ['*.css', '!*.min.css'],
                dest: 'dist/css/',
                ext: '.min.css'
            }
        },
        copy: {
            main: {
                files:
                [
                    {
                        expand: true,
                        cwd: 'build',
                        src: '*.js',
                        dest: 'dist/js/',
                        options: {
                            process: function (content) {
                                return content.replace(new RegExp('views/', 'g'), 'snomed-interaction-components/views/');
                            }
                        }
                    },
                    {
                        expand: true,
                        cwd: 'css',
                        src: 'sct-diagram.css',
                        dest: 'dist/css/'
                    }
                ]
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
        release: {
            options: {
                npm: false,
                tagName: 'snomed-interaction-components-<%= version %>',
                github: {
                    repo: 'termMed/snomed-interaction-components',
                    usernameVar: 'GITHUB_USERNAME',
                    passwordVar: 'GITHUB_PASSWORD'
                }
            }
        },
        jshint: {
            all: ['js/**/*.js'],
            options: {
                reporter: require('jshint-stylish'),
                reporterOutput: 'dist/jshint-output.txt'
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-release');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Default task(s).
    grunt.registerTask('default', ['clean', 'handlebars', 'concat','uglify', 'copy', 'cssmin']);
};