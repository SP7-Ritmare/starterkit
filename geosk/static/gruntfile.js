module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            gxp_extr: {
                src: [
                    '.components/gxp/src/script/locale/it.js',
                    '.components/gxp/src/script/plugins/CSWCatalogueSource.js'
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
                    'geoext/lib/GeoExt/data/CSWRecordsReader.js',
                    '.components/openlayers/lib/OpenLayers/Format/CSWGetRecords.js',
                    '.components/openlayers/lib/OpenLayers/Format/CSWGetRecords/v2_0_2.js',
                    '.components/openlayers/lib/OpenLayers/Protocol/CSW.js',
                    '.components/openlayers/lib/OpenLayers/Protocol/CSW/v2_0_2.js'
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
        },
        processhtml: {
            options: {
                data: {
                    message: 'Hello world!'
                }
            },
            dist: {
                files: {
                    'dest/index.html': ['.components/EDI-NG_client/INSPIRE_dataset.html']
                }
            }
        },
        useminPrepare: {
            html: '.components/EDI-NG_client/INSPIRE_dataset.html',
            options: {
                dest: 'EDI-NG_client'
            }
        },
        usemin:{
            html:['EDI-NG_client/INSPIRE_dataset.html']
        },
        copy:{
            html: {
                expand: true,
                cwd: '.components/EDI-NG_client/',
                src: '**',
                dest: 'EDI-NG_client/'
            },
            cookieconsent2: {
                expand: true,
                cwd: '.components/cookieconsent2/build/',
                src: '**',
                dest: 'cookieconsent2/'
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-filerev');


    // Default task(s).
    grunt.registerTask('default',[
        'copy',
        'concat',
        // 'copy',
        // 'useminPrepare',
        // 'concat',
        // 'uglify',
        // 'usemin',
    ]);

};
