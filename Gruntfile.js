'use strict';
module.exports = function(grunt) {
    require('jit-grunt')(grunt);

    grunt.initConfig({
        watch: {
            all: {
                files: ['public/**/*.js','**/*.scss','public/**/*.html'],
                options: {
                    spawn: false,
                    event: ['changed'],
                    debounceDelay: 550,
                    livereload: true
                }
            },
            css: {
                files: '**/*.scss',
                tasks: ['sass']
            }
        },
        connect: {
            options: {
                port: 8081,
                hostname: 'localhost',
                livereload: 35729
            },
            server: {
                options: {
                    middleware:function(connect){
                        var serveStatic = require("serve-static");
                        return [
                            connect().use('/',serveStatic('./bower_components')),
                            connect().use('/',serveStatic('./public')),
                            connect().use('/',serveStatic('./data'))
                        ];
                    },
                    open: true
                }
            }
        },
        sass: {                                // Task
            dist: {                            // Target
                files: {                       // Dictionary of files
                    'public/css/style.css': 'public/css/style.scss',       // 'destination': 'source'

                }
            }
        }
    });
    grunt.registerTask('default',['connect','watch']);
};