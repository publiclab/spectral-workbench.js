module.exports = function(grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            options : {
                livereload: true
            },
            source: {
                files: [
                    'src/*.js',
                    'src/*/*.js',
                    'Gruntfile.js'
                ],
                tasks: [ 'build:js' ]
            }
        },

        concat: {
            dist: {
                src: [
                    'src/core/*.js',
                    'src/SpectralWorkbench.Importer.js',
                    'src/SpectralWorkbench.Image.js',
                    'src/SpectralWorkbench.Datum.js',
                    'src/SpectralWorkbench.Spectrum.js', 
                    'src/SpectralWorkbench.Set.js',
                    'src/SpectralWorkbench.Tag.js',
                    'src/SpectralWorkbench.PowerTag.js',
                    'src/api/SpectralWorkbench.API.js',
                    'src/api/SpectralWorkbench.API.Legacy.js',
                    'src/api/SpectralWorkbench.API.Core.js',
                    'src/api/SpectralWorkbench.API.Operations.js',
                    'src/ui/SpectralWorkbench.UI.Spectrum.js',
                    'src/ui/SpectralWorkbench.UI.Set.js',
                    'src/ui/SpectralWorkbench.UI.ToolPaneTypes.js',
                    'src/ui/SpectralWorkbench.UI.ToolPane.js',
                    'src/ui/SpectralWorkbench.UI.SpectraPane.js',
                    'src/ui/SpectralWorkbench.UI.StepsPane.js',
                    'src/ui/SpectralWorkbench.UI.TagForm.js',
                    'src/ui/SpectralWorkbench.UI.Misc.js',
                    'src/SpectralWorkbench.Graph.js'
                ],
                dest: 'dist/spectral-workbench.js',
            },
            capture: {
                src: [
                    'examples/capture/detect_sample_row.js',
                    'examples/capture/toggleRotation.js',
                    'examples/capture/getRow.js',
                    'examples/capture/getUserMedia.js'
                ],
                dest: 'dist/capture.dist.js'
            }
        },

        jasmine: {
          swb: {
            src: 'dist/*.js',
            options: {
              specs: 'spec/javascripts/*spec.js',
              vendor: [
                'node_modules/jquery/dist/jquery.min.js',
                'node_modules/d3/d3.js',
                'node_modules/nvd3/build/nv.d3.js',
                'node_modules/bootstrap/dist/js/bootstrap.min.js',
                'node_modules/moment/moment.js',
                'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
                'node_modules/jasmine-ajax/lib/mock-ajax.js',
                'spec/javascripts/helpers/test_responses.js'
              ],
              page: {
                  viewportSize: {
                      width: 1200,
                      height: 800
                  }
              },
              styles: [
                'dist/spectral-workbench.css'
              ]
            }
          }
        },

        tape: {
          options: {
            pretty: true,
            output: 'console'
          },
          files: ['spec/tape/spectral-workbench.js']
        }

    });

    /* Default (development): Watch files and build on change. */
    grunt.registerTask('default', ['watch']);

    grunt.registerTask('build', [
        'concat:dist'
        //'browserify:dist'
    ]);

    grunt.registerTask('test', [
        'jasmine',
        'tape'
    ]);

    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-tape');

};
