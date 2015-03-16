module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            }
        },
        concat: {
            gxp_extr: {
                src: [
                    '.components/gxp/src/script/locale/it.js'
                ],
                dest: 'geosk/js/gxp_extra.js'

            },
            openlayers_sos: {
                src: [
                    '.components/openlayers/lib/OpenLayers/Format/OWSCommon/v1_1_0.js',
                    // override name readers
                    // '.components/openlayers/lib/OpenLayers/Format/SOSGetFeatureOfInterest.js',
                    'geosk/js/SOSClient/SOSGetFeatureOfInterest.js',
                    '.components/openlayers/lib/OpenLayers/Format/SOSCapabilities.js',
                    '.components/openlayers/lib/OpenLayers/Format/SOSGetObservation.js',
                    '.components/openlayers/lib/OpenLayers/Format/SOSCapabilities.js',
                    '.components/openlayers/lib/OpenLayers/Format/SOSCapabilities/v1_0_0.js',
                    '.components/openlayers/lib/OpenLayers/Protocol/SOS.js',
                    '.components/openlayers/lib/OpenLayers/Protocol/SOS/v1_0_0.js',
                ],
                dest: 'geosk/js/openlayers_sos.js'
            },
            geosk_sos: {
                src: [
                    '.components/momentjs/moment.js',
                    'geosk/js/SOSClient/GridExporter.js',
                    'geosk/js/SOSClient/BaseSOSClient.js',
                    'geosk/js/SOSClient/AddSOS.js',
                    'geosk/js/SOSClient/SOSSourceDialog.js',
                    'geosk/js/SOSClient/SOSSource.js',
                    'geosk/js/SOSClient/SOSGetFeatureInfo.js',
                    'geosk/js/SOSClient/locale/it.js'
                    //'geosk/js/SOSClient/utils.js'
                ],
                dest: 'geosk/js/geosk_sos.js'
            },
            flotcharts: {
                src: [
                    '.components/float/jquery.flot.js',
                    '.components/float/jquery.flot.resize.js',
                    '.components/float/jquery.flot.crosshair.js',
                    '.components/float/jquery.flot.navigate.js',
                    '.components/float/jquery.flot.time.js'
                ],
                dest: 'geosk/js/flotcharts.js'
            }
        },

        less: {
            development: {
                files: [
                    {
                        'geosk/css/site_base.css': 'geosk/less/site_base.less'
                    }
                ]
            },
            production: {
                files: [
                    {
                        'geosk/css/site_base.css': 'geosk/less/base.less'
                    }
                ]
            }
        }

    });


    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-text-replace');


    // Default task(s).
    grunt.registerTask('default', ['uglify']);

};
