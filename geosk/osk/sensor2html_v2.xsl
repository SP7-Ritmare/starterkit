<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:swes="http://www.opengis.net/swes/2.0"
                xmlns:sos="http://www.opengis.net/sos/2.0"
                xmlns:swe="http://www.opengis.net/swe/2.0"
                xmlns:sml="http://www.opengis.net/sensorml/2.0"
                xmlns:gml="http://www.opengis.net/gml/3.2"
                xmlns:sams="http://www.opengis.net/samplingSpatial/2.0"
                xmlns:sf="http://www.opengis.net/sampling/2.0"
                xmlns:gco="http://www.isotc211.org/2005/gco"
                xmlns:gmd="http://www.isotc211.org/2005/gmd"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xmlns:skos="http://www.w3.org/2004/02/skos/core#"
                exclude-result-prefixes="xs" version="2.0">

    <xsl:output method="html" doctype-system="about:legacy-compat" encoding="UTF-8" indent="yes"/>

    <xsl:strip-space elements="*" />

    <xsl:template match="/">
        <xsl:choose>
            <!-- description of a human sensor by FOAF -->
            <!-- TODO: ... -->
            <!-- description of a human sensor by OrcID -->
            <!-- TODO: add a QRCod visualization -->
            <xsl:when test="contains(//gml:identifier, 'orcid.org')">
                <html lang="en">
                    <head>
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>

                        <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
                        <meta name="viewport" content="width=device-width, initial-scale=1"/>
                        <meta name="description"
                              content="Human readable version of a sensor description from SensorML and describeSensor request"/>
                        <meta name="author" content="Alessandro Oggioni"/>
                        <meta name="author" content="Paolo Tagliolato"/>
                        <link rel="icon" href="http://skmi.irea.cnr.it/static/geosk/img/favicon.ico"/>

                        <title>Sensor description</title>
                        <link href="http://netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css"
                              rel="stylesheet"/>

                        <link
                                href="../../assets/css/ekko-lightbox.min.css"
                                rel="stylesheet"/>

                        <style type="text/css">
                            .tldate {
                            border: 1px solid #d4d4d4;
                            border-radius: 2px;
                            -webkit-box-shadow: 0 1px 6px rgba(0, 0, 0, 0.175);
                            box-shadow: 0 1px 6px rgba(0, 0, 0, 0.175);
                            display: block;
                            width: 200px;
                            background: #999999;
                            /*background: #414141;*/
                            /*border: 3px solid #212121;*/
                            color: #ededed;
                            margin: 0 auto;
                            padding: 3px 0;
                            font-weight: bold;
                            text-align: center;
                            /*-webkit-box-shadow: 0 0 11px rgba(0,0,0,0.35);*/
                            }

                            .span4 {
                            height: 100%;
                            overflow: auto;
                            }
                        </style>

                        <script src="http://code.jquery.com/jquery-1.11.1.min.js"/>

                        <!--<script src="//code.jquery.com/jquery.js"/>-->
                        <script src="../../assets/js/ekko-lightbox.js"/>
                        <script type="text/javascript">
                            $(document).on('click', '[data-toggle="lightbox"]', function(event) {
                            event.preventDefault();
                            $(this).ekkoLightbox();
                            });
                        </script>

                        <script src="http://netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"/>

                    </head>

                    <body>
                        <div class="container">
                            <div class="row row-offcanvas row-offcanvas-right">
                                <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                    <!-- all -->
                                    <div class="page-header">
                                        <h1>
                                            Profile of a human sensor
                                        </h1>
                                        <p>
                                            Description of human sensor using ORCID as a profile description of human observator
                                        </p>
                                    </div>

                                    <div class="row">
                                        <xsl:call-template name="orcid" />
                                    </div>

                                    <div class="row">
                                        <xsl:call-template name="parameters" />
                                    </div>
                                    <!--/row-->
                                </div>
                                <!--/span-->
                            </div>
                            <!--/row-->
                        </div>
                        <!--/.container-->
                    </body>
                </html>
            </xsl:when>
            <!-- Description by SensorML of real sensor -->
            <xsl:otherwise>
                <html lang="en">
                    <head>
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>

                        <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
                        <meta name="viewport" content="width=device-width, initial-scale=1"/>
                        <meta name="description"
                              content="Human readable version of a sensor description from SensorML and describeSensor request"/>
                        <meta name="author" content="Alessandro Oggioni"/>
                        <meta name="author" content="Paolo Tagliolato"/>
                        <link rel="icon" href="http://skmi.irea.cnr.it/static/geosk/img/favicon.ico"/>

                        <title>Sensor description</title>
                        <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.css"/>

                        <link href="http://netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css"
                              rel="stylesheet"/>

                        <link
                                href="../../assets/css/ekko-lightbox.min.css"
                                rel="stylesheet"/>

                        <style type="text/css">
                            .tldate {
                            border: 1px solid #d4d4d4;
                            border-radius: 2px;
                            -webkit-box-shadow: 0 1px 6px rgba(0, 0, 0, 0.175);
                            box-shadow: 0 1px 6px rgba(0, 0, 0, 0.175);
                            display: block;
                            width: 200px;
                            background: #999999;
                            /*background: #414141;*/
                            /*border: 3px solid #212121;*/
                            color: #ededed;
                            margin: 0 auto;
                            padding: 3px 0;
                            font-weight: bold;
                            text-align: center;
                            /*-webkit-box-shadow: 0 0 11px rgba(0,0,0,0.35);*/
                            }

                            .span4 {
                            height: 100%;
                            overflow: auto;
                            }

                            .timeline {
                            list-style: none;
                            padding: 20px 0 20px;
                            position: relative;
                            }

                            .timeline:before {
                            top: 0;
                            bottom: 0;
                            position: absolute;
                            content: " ";
                            width: 3px;
                            background-color: #eeeeee;
                            left: 50%;
                            margin-left: -1.5px;
                            }

                            .timeline > li {
                            margin-bottom: 20px;
                            position: relative;
                            }

                            .timeline > li:before,
                            .timeline > li:after {
                            content: " ";
                            display: table;
                            }

                            .timeline > li:after {
                            clear: both;
                            }

                            .timeline > li:before,
                            .timeline > li:after {
                            content: " ";
                            display: table;
                            }

                            .timeline > li:after {
                            clear: both;
                            }

                            .timeline > li > .timeline-panel {
                            width: 46%;
                            float: left;
                            border: 1px solid #d4d4d4;
                            border-radius: 2px;
                            padding: 20px;
                            position: relative;
                            -webkit-box-shadow: 0 1px 6px rgba(0, 0, 0, 0.175);
                            box-shadow: 0 1px 6px rgba(0, 0, 0, 0.175);
                            }

                            .timeline > li > .timeline-panel:before {
                            position: absolute;
                            top: 26px;
                            right: -15px;
                            display: inline-block;
                            border-top: 15px solid transparent;
                            border-left: 15px solid #ccc;
                            border-right: 0 solid #ccc;
                            border-bottom: 15px solid transparent;
                            content: " ";
                            }

                            .timeline > li > .timeline-panel:after {
                            position: absolute;
                            top: 27px;
                            right: -14px;
                            display: inline-block;
                            border-top: 14px solid transparent;
                            border-left: 14px solid #fff;
                            border-right: 0 solid #fff;
                            border-bottom: 14px solid transparent;
                            content: " ";
                            }

                            .timeline > li > .timeline-badge {
                            color: #fff;
                            width: 50px;
                            height: 50px;
                            line-height: 50px;
                            font-size: 1.4em;
                            text-align: center;
                            position: absolute;
                            top: 16px;
                            left: 50%;
                            margin-left: -25px;
                            background-color: #999999;
                            z-index: 100;
                            border-top-right-radius: 50%;
                            border-top-left-radius: 50%;
                            border-bottom-right-radius: 50%;
                            border-bottom-left-radius: 50%;
                            }

                            .timeline > li.timeline-inverted > .timeline-panel {
                            float: right;
                            }

                            .timeline > li.timeline-inverted > .timeline-panel:before {
                            border-left-width: 0;
                            border-right-width: 15px;
                            left: -15px;
                            right: auto;
                            }

                            .timeline > li.timeline-inverted > .timeline-panel:after {
                            border-left-width: 0;
                            border-right-width: 14px;
                            left: -14px;
                            right: auto;
                            }

                            .timeline-badge.primary {
                            background-color: #2e6da4 !important;
                            }

                            .timeline-badge.success {
                            background-color: #3f903f !important;
                            }

                            .timeline-badge.warning {
                            background-color: #f0ad4e !important;
                            }

                            .timeline-badge.danger {
                            background-color: #d9534f !important;
                            }

                            .timeline-badge.info {
                            background-color: #5bc0de !important;
                            }

                            .timeline-title {
                            margin-top: 0;
                            color: inherit;
                            }

                            .timeline-body > p,
                            .timeline-body > ul {
                            margin-bottom: 0;
                            }

                            .timeline-body > p + p {
                            margin-top: 5px;
                            }

                            @media (max-width: 767px) {
                            ul.timeline:before {
                            left: 40px;
                            }

                            ul.timeline > li > .timeline-panel {
                            width: calc(100% - 90px);
                            width: -moz-calc(100% - 90px);
                            width: -webkit-calc(100% - 90px);
                            }

                            ul.timeline > li > .timeline-badge {
                            left: 15px;
                            margin-left: 0;
                            top: 16px;
                            }

                            ul.timeline > li > .timeline-panel {
                            float: right;
                            }

                            ul.timeline > li > .timeline-panel:before {
                            border-left-width: 0;
                            border-right-width: 15px;
                            left: -15px;
                            right: auto;
                            }

                            ul.timeline > li > .timeline-panel:after {
                            border-left-width: 0;
                            border-right-width: 14px;
                            left: -14px;
                            right: auto;
                            }
                            }

                            #map {
                            position: absolute;
                            width: 100%;
                            height: 400px;
                            margin: 0;
                            padding: 0;
                            border: 1px solid #E5E5E5;
                            border-radius: 8px;
                            }

                            #mapRow {
                            height: 300px;
                            }

                            #map-outer {
                            height: 440px;
                            padding: 20px;
                            border: 2px solid #CCC;
                            margin-bottom: 20px;
                            background-color: #FFF
                            }

                            #map-container {
                            height: 400px
                            }

                            @media all and (max-width: 768px) {
                            #map-outer {
                            height: 650px
                            }
                            }

                            ul.timeline > li.smlUpdates > div.timeline-badge > i.glyphicon:before {
                            content: "\e113" !important;
                            }

                            ul.timeline > li.operations > div.timeline-badge > i.glyphicon:before {
                            content: "\e067" !important;
                            }

                            ul.timeline > li.calibration > div.timeline-badge > i.glyphicon:before {
                            content: "\e136" !important;
                            }

                            ul.timeline > li.otherEvents > div.timeline-badge > i.glyphicon:before {
                            content: "\e041" !important;
                            }
                        </style>

                        <script src="http://code.jquery.com/jquery-1.11.1.min.js"/>

                        <!--<script src="//code.jquery.com/jquery.js"/>-->
                        <script src="../../assets/js/ekko-lightbox.js"/>
                        <script type="text/javascript">
                            $(document).on('click', '[data-toggle="lightbox"]', function(event) {
                            event.preventDefault();
                            $(this).ekkoLightbox();
                            });
                        </script>

                        <script src="http://netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"/>

                    </head>

                    <body>

                        <div class="container">

                            <div class="row row-offcanvas row-offcanvas-right">

                                <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                    <!-- all -->

                                    <div class="page-header">
                                        <xsl:call-template name="description"/>
                                        <xsl:call-template name="keywords"/>
                                        <xsl:call-template name="validity" />
                                        <xsl:call-template name="component" />
                                        <!-- keyword -->
                                    </div>

                                    <div class="row">
                                        <xsl:call-template name="manufacturer" />
                                        <xsl:call-template name="modelNum" />
                                        <!--div class="col-xs-12 col-sm-12 col-md-12 col-lg-6"-->
                                        <xsl:call-template name="parameters" />
                                        <!--/div-->
                                        <!--/span-->
                                    </div>

                                    <div class="row">
                                        <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                                            <xsl:call-template name="position"/>
                                        </div>
                                        <!--/span-->
                                        <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                                            <xsl:call-template name="contact"/>
                                        </div>
                                    </div>

                                    <div class="row">
                                        <!--/span-->
                                        <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                                            <xsl:call-template name="documentation"/>
                                        </div>
                                        <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                                            <xsl:call-template name="image"/>
                                        </div>
                                        <!--/span-->
                                        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 span4">
                                            <xsl:call-template name="history"/>
                                        </div>
                                        <!--/span-->
                                    </div>
                                    <!--/row-->
                                </div>
                                <!--/span-->

                            </div>
                            <!--/row-->
                        </div>
                        <!--/.container-->


                        <!-- IE10 viewport hack for Surface/desktop Windows 8 bug -->
                        <script src="http://getbootstrap.com/assets/js/ie10-viewport-bug-workaround.js"/>
                        <script src="http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.js"/>

                        <xsl:variable name="countProperties">
                            <xsl:value-of select="count(//sml:featuresOfInterest/sml:FeatureList/sml:feature)"/>
                        </xsl:variable>
                        <xsl:choose>
                            <xsl:when test="$countProperties = '2'">
                                <xsl:choose>
                                    <!-- http://getit.lter-europe.net/geoserver/wfs?typename=geonode:moorhousemetpolygon&amp;outputFormat=text/xml; subtype=gml/3.1.1&amp;version=1.0.0&amp;request=GetFeature&amp;service=WFS -->
                                    <!-- http://getit.lter-europe.net/geoserver/wfs?typename=geonode%3Amoorhousemetpolygon&amp;outputFormat=text%2Fxml%3B+subtype%3Dgml%2F3.1.1&amp;version=1.0.0&amp;request=GetFeature&amp;service=WFS -->
                                    <!-- http://localhost:8080/geoserver/Common/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite:markers&outputFormat=text/javascript&format_options=callback:getJson -->
                                    <xsl:when test="contains(//sml:featuresOfInterest/sml:FeatureList/sml:feature[1]/@xlink:href, 'layers')">
                                        <script type="text/javascript">
                                            var popup;
                                            var map;

                                            function loadFOI() {
                                            var owsrootUrl = "<xsl:value-of select="concat(substring-before(//sml:featuresOfInterest/sml:FeatureList/sml:feature[1]/@xlink:href, '/layers/'), '/geoserver/geonode/ows?service=WFS&amp;version=1.0.0&amp;request=GetFeature&amp;typeName=',substring-after(//sml:featuresOfInterest/sml:FeatureList/sml:feature[1]/@xlink:href, '/layers/'),'&amp;maxFeatures=50&amp;outputFormat=text/javascript&amp;format_options=callback:getJson&amp;SrsName=EPSG:4326')" />"
                                            var URL = owsrootUrl;
                                            var WFSLayer = null;
                                            var ajax = $.ajax({
                                            url : URL,
                                            dataType : 'jsonp',
                                            jsonpCallback : 'getJson',
                                            success : function (response) {
                                            console.log(response);
                                            WFSLayer = L.geoJson(response, {
                                            style: function (feature) {
                                            return {
                                            stroke: false,
                                            fillColor: 'FFFFFF',
                                            fillOpacity: 0.3
                                            };
                                            },
                                            onEachFeature: function (feature, layer) {
                                            popupOptions = {maxWidth: 200};
                                            layer.bindPopup("Sampled feature of this sensor"
                                            ,popupOptions);
                                            }
                                            }).addTo(map);
                                            map.fitBounds(WFSLayer.getBounds());
                                            }
                                            });
                                            }

                                            map = L.map('map');


                                            L.marker([<xsl:value-of select="//sml:position/swe:Vector/swe:coordinate[1]/swe:Quantity/swe:value" />, <xsl:value-of select="//sml:position/swe:Vector/swe:coordinate[2]/swe:Quantity/swe:value" />]).addTo(map)
                                            .bindPopup("<b><xsl:value-of select="gml:name" /></b>"+
                                            "<br />" +
                                            "Position:<xsl:text> </xsl:text><xsl:value-of select="//sml:position/swe:Vector/swe:coordinate[1]/swe:Quantity/swe:value" /><xsl:text> E</xsl:text>, <xsl:value-of select="//sml:position/swe:Vector/swe:coordinate[2]/swe:Quantity/swe:value" /><xsl:text> N</xsl:text><br/>" +
                                            "Altitude:<xsl:text> </xsl:text><xsl:value-of select="//sml:position/swe:Vector/swe:coordinate[3]/swe:Quantity/swe:value" /><xsl:text> </xsl:text><xsl:value-of select="//sml:position/swe:Vector/swe:coordinate[3]/swe:Quantity/swe:uom/@code" /><xsl:text> </xsl:text>asl").openPopup();

                                            popup = L.popup();

                                            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                            maxZoom: 19,
                                            attribution: '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                            }).addTo(map);

                                            loadFOI();
                                        </script>
                                    </xsl:when>
                                </xsl:choose>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:choose>
                                    <xsl:when test="contains(//sml:featuresOfInterest/sml:FeatureList/sml:feature/@xlink:href, 'layers')">
                                        <script type="text/javascript">
                                            var popup;
                                            var map;

                                            function loadFOI() {
                                            var owsrootUrl = "http://getit.lteritalia.it/geoserver/geonode/ows?service=WFS&amp;version=1.0.0&amp;request=GetFeature&amp;typeName=geonode:lter_eu_it_107&amp;maxFeatures=50&amp;outputFormat=text/javascript&amp;format_options=callback:getJson&amp;SrsName=EPSG:4326"
                                            var URL = owsrootUrl;
                                            var WFSLayer = null;
                                            var ajax = $.ajax({
                                            url : URL,
                                            dataType : 'jsonp',
                                            jsonpCallback : 'getJson',
                                            success : function (response) {
                                            console.log(response);
                                            WFSLayer = L.geoJson(response, {
                                            style: function (feature) {
                                            return {
                                            stroke: false,
                                            fillColor: 'FFFFFF',
                                            fillOpacity: 0.3
                                            };
                                            },
                                            onEachFeature: function (feature, layer) {
                                            popupOptions = {maxWidth: 200};
                                            layer.bindPopup("Sampled feature of this sensor"
                                            ,popupOptions);
                                            }
                                            }).addTo(map);
                                            map.fitBounds(WFSLayer.getBounds());
                                            }
                                            });
                                            }

                                            map = L.map('map');


                                            L.marker([<xsl:value-of select="//sml:position/swe:Vector/swe:coordinate[1]/swe:Quantity/swe:value" />, <xsl:value-of select="//sml:position/swe:Vector/swe:coordinate[2]/swe:Quantity/swe:value" />]).addTo(map)
                                            .bindPopup("<b><xsl:value-of select="gml:name" /></b>"+
                                            "<br />" +
                                            "Position:<xsl:text> </xsl:text><xsl:value-of select="//sml:position/swe:Vector/swe:coordinate[1]/swe:Quantity/swe:value" /><xsl:text> E</xsl:text>, <xsl:value-of select="//sml:position/swe:Vector/swe:coordinate[2]/swe:Quantity/swe:value" /><xsl:text> N</xsl:text><br/>" +
                                            "Altitude:<xsl:text> </xsl:text><xsl:value-of select="//sml:position/swe:Vector/swe:coordinate[3]/swe:Quantity/swe:value" /><xsl:text> </xsl:text><xsl:value-of select="//sml:position/swe:Vector/swe:coordinate[3]/swe:Quantity/swe:uom/@code" /><xsl:text> </xsl:text>asl").openPopup();

                                            popup = L.popup();

                                            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                            maxZoom: 19,
                                            attribution: '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                            }).addTo(map);

                                            loadFOI();
                                        </script>
                                    </xsl:when>
                                </xsl:choose>
                            </xsl:otherwise>
                        </xsl:choose>
                    </body>
                </html>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="orcid">
        <xsl:variable name="orcidURL" select="//gml:identifier"/>
        <h2>ORCID profile <a href="https://orcid.org/" target="_blanck"><img src="../../assets/img/loghi/orcid.png" height="40px" alt="ORCID"/></a></h2>
        <!-- /row -->
        <div class="row">
            <embed src="{$orcidURL}" style="width: 100%; height: 400px; border-style: solid;"></embed>
        </div>
    </xsl:template>

    <xsl:template name="description">
        <xsl:for-each
                select="//sml:PhysicalSystem">
            <h1>
                <xsl:value-of select="gml:name"/>
                <xsl:text> </xsl:text>
                <xsl:if
                        test="sml:identification/sml:IdentifierList/sml:identifier[@name='Long Name']/sml:Term/sml:value">
                    <small>(<xsl:value-of
                            select="sml:identification/sml:IdentifierList/sml:identifier[@name='Long Name']/sml:Term/sml:value"
                    />)</small>
                </xsl:if>
            </h1>
            <xsl:if test="gml:description">
                <p>
                    <xsl:value-of select="gml:description"/>
                </p>
            </xsl:if>
        </xsl:for-each>
    </xsl:template>

    <xsl:template name="keywords">
        <xsl:if test="//sml:KeywordList/sml:keyword">
            <ul class="nav nav-pills">
                <xsl:for-each select="swes:DescribeSensorResponse/swes:description/swes:SensorDescription/swes:data/sml:PhysicalSystem/sml:keywords/sml:KeywordList/sml:keyword">
                    <xsl:if test="not(contains(., 'http://')) and not(contains(., 'offering:')) and not(contains(., 'https://'))">
                        <li class="disabled">
                            <a>
                                <xsl:value-of select="."/>
                            </a>
                        </li>
                    </xsl:if>
                </xsl:for-each>
            </ul>
        </xsl:if>
    </xsl:template>

    <xsl:template name="validity">
        <xsl:if test=".//swes:validTime">
            <p>This description is valid from: <b><xsl:value-of select="substring-before(.//swes:validTime/gml:TimePeriod/gml:beginPosition, 'T')" />
                <xsl:text> - </xsl:text>
                <xsl:value-of select="substring-before(substring-after(.//swes:validTime/gml:TimePeriod/gml:beginPosition, 'T'), 'Z')" /></b> to:
                <xsl:choose>
                    <xsl:when test=".//swes:validTime/gml:TimePeriod/gml:endPosition/@indeterminatePosition = 'unknown'">
                        <b> unknown</b>
                    </xsl:when>
                    <xsl:when test="xs:date(substring-before(.//swes:validTime/gml:TimePeriod/gml:endPosition, 'T')) &lt;= current-date()">
                        <b style="color:red">
                            <xsl:value-of select="substring-before(.//swes:validTime/gml:TimePeriod/gml:endPosition, 'T')" />
                            <xsl:text> - </xsl:text>
                            <xsl:value-of select="substring-before(substring-after(.//swes:validTime/gml:TimePeriod/gml:endPosition, 'T'), 'Z')" />
                        </b>
                    </xsl:when>
                    <xsl:otherwise>
                        <b>
                            <xsl:value-of select="substring-before(.//swes:validTime/gml:TimePeriod/gml:endPosition, 'T')" />
                            <xsl:text> - </xsl:text>
                            <xsl:value-of select="substring-before(substring-after(.//swes:validTime/gml:TimePeriod/gml:endPosition, 'T'), 'Z')" />
                        </b>
                    </xsl:otherwise>
                </xsl:choose>
            </p>
        </xsl:if>
    </xsl:template>

    <xsl:template name="manufacturer">
        <xsl:for-each
                select="//sml:PhysicalSystem">
            <div class="col-xs-12 col-sm-4 col-md-4 col-lg-4">
                <xsl:if
                        test="sml:identification/sml:IdentifierList/sml:identifier/sml:Term[@definition='http://mmisw.org/ont/ioos/definition/manufacturerName']/sml:value">
                    <h3><xsl:value-of select="sml:identification/sml:IdentifierList/sml:identifier/sml:Term[@definition='http://mmisw.org/ont/ioos/definition/manufacturerName']/sml:label" /></h3>
                    <p>
                        <b>
                            <xsl:value-of
                                    select="sml:identification/sml:IdentifierList/sml:identifier/sml:Term[@definition='http://mmisw.org/ont/ioos/definition/manufacturerName']/sml:value"
                            />
                        </b>
                        <br/>
                    </p>
                    <p>
                        <i class="glyphicon glyphicon-earphone"/>
                        <xsl:text> </xsl:text>
                        <xsl:value-of
                                select="sml:contacts/sml:ContactList/sml:contact[@xlink:arcrole='http://mmisw.org/ont/ioos/definition/manufacturerName']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:phone/gmd:CI_Telephone/gmd:voice/gco:CharacterString"/>
                        <br/>
                    </p>
                    <p>
                        <i class="glyphicon glyphicon-list-alt"/>
                        <xsl:text> </xsl:text>
                        <xsl:value-of
                                select="sml:contacts/sml:ContactList/sml:contact[@xlink:arcrole='http://mmisw.org/ont/ioos/definition/manufacturerName']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:deliveryPoint/gco:CharacterString"/>
                        <br/>
                        <xsl:value-of
                                select="sml:contacts/sml:ContactList/sml:contact[@xlink:arcrole='http://mmisw.org/ont/ioos/definition/manufacturerName']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:city/gco:CharacterString"/>
                        <br/>
                        <xsl:value-of
                                select="sml:contacts/sml:ContactList/sml:contact[@xlink:arcrole='http://mmisw.org/ont/ioos/definition/manufacturerName']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:postalCode/gco:CharacterString"/>
                        <br/>
                        <xsl:value-of
                                select="sml:contacts/sml:ContactList/sml:contact[@xlink:arcrole='http://mmisw.org/ont/ioos/definition/manufacturerName']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:country/gco:CharacterString"/>
                        <br/>
                    </p>
                    <p>
                        <i class="glyphicon glyphicon-envelope"/>
                        <xsl:variable name="linkMailMan"
                                      select="sml:contacts/sml:ContactList/sml:contact[@xlink:arcrole='http://mmisw.org/ont/ioos/definition/manufacturerName']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:electronicMailAddress/gco:CharacterString"/>
                        <a href="{$linkMailMan}">
                            <xsl:text> </xsl:text>
                            <xsl:value-of
                                    select="sml:contacts/sml:ContactList/sml:contact[@xlink:arcrole='http://mmisw.org/ont/ioos/definition/manufacturerName']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:electronicMailAddress/gco:CharacterString"/>
                            <br/>
                        </a>
                    </p>
                    <p>
                        <i class="glyphicon glyphicon-link"/>
                        <xsl:text> </xsl:text>
                        <xsl:variable name="link"
                                      select="sml:contacts/sml:ContactList/sml:contact[@xlink:arcrole='http://mmisw.org/ont/ioos/definition/manufacturerName']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:onlineResource/gmd:CI_OnlineResource/gmd:linkage/gmd:URL"/>
                        <a href="{$link}" target="_blank"
                           data-title="{sml:identification/sml:IdentifierList/sml:identifier[@definition='http://mmisw.org/ont/ioos/definition/manufacturerName']/sml:Term/sml:value}">
                            <xsl:value-of
                                    select="sml:contacts/sml:ContactList/sml:contact[@xlink:arcrole='http://mmisw.org/ont/ioos/definition/manufacturerName']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:onlineResource/gmd:CI_OnlineResource/gmd:linkage/gmd:URL"
                            />
                        </a>
                    </p>
                </xsl:if>
            </div>
        </xsl:for-each>
    </xsl:template>

    <xsl:template name="modelNum">
        <xsl:for-each select="//sml:PhysicalSystem">
            <div class="col-xs-12 col-sm-4 col-md-4 col-lg-4">
                <xsl:if
                        test="sml:identification/sml:IdentifierList/sml:identifier/sml:Term[@definition='http://mmisw.org/ont/ioos/definition/modelNumber']/sml:value">
                    <h3><xsl:value-of select="sml:identification/sml:IdentifierList/sml:identifier/sml:Term[@definition='http://mmisw.org/ont/ioos/definition/modelNumber']/sml:label" /></h3>
                    <p>
                        <xsl:value-of
                                select="sml:identification/sml:IdentifierList/sml:identifier/sml:Term[@definition='http://mmisw.org/ont/ioos/definition/modelNumber']/sml:value"
                        />
                    </p>
                </xsl:if>
            </div>
        </xsl:for-each>
    </xsl:template>

    <xsl:template name="parameters"
                  match="//sml:output">
        <xsl:if
                test="//sml:output">
            <div class="col-xs-12 col-sm-4 col-md-4 col-lg-4">
                <h2>Parameters measured</h2>
                <xsl:for-each
                        select="//sml:output">
                    <xsl:choose>
                        <!-- swe:Quantity -->
                        <xsl:when test="swe:Quantity">
                            <xsl:if test="@name!='phenomenonTime'">
                                <h4>
                                    <xsl:choose>
                                        <!-- for generic Thesaurus -->
                                        <xsl:when test="document(swe:Quantity/@definition)//skos:prefLabel">
                                            <i class="glyphicon glyphicon-link"/>
                                            <xsl:text> </xsl:text>
                                            <xsl:variable name="linkParam" select="swe:Quantity/@definition"/>
                                            <a href="{$linkParam}" data-title="{document(swe:Quantity/@definition)//skos:prefLabel}" target="_blank">
                                                <xsl:value-of select="document(swe:Quantity/@definition)//skos:prefLabel"/>
                                            </a>
                                        </xsl:when>
                                        <!-- for EnvThes -->
                                        <xsl:when test="contains(swe:Quantity/@definition, 'vocabs.lter-europe.net/EnvThes/')">
                                            <i class="glyphicon glyphicon-link"/>
                                            <xsl:text> </xsl:text>
                                            <xsl:variable name="linkParam" select="swe:Quantity/@definition"/>
                                            <a href="{$linkParam}" data-title="{document(concat('http://vocabs.ceh.ac.uk/edg/tbl/describe?_base=urn:x-evn-master:EnvThes&amp;_format=rdf%2Bxml&amp;_resource=', swe:Quantity/@definition))//skos:prefLabel}" target="_blank">
                                                <xsl:value-of select="document(concat('http://vocabs.ceh.ac.uk/edg/tbl/describe?_base=urn:x-evn-master:EnvThes&amp;_format=rdf%2Bxml&amp;_resource=', swe:Quantity/@definition))//skos:prefLabel"/>
                                            </a>
                                        </xsl:when>
                                        <!-- for SamplingTime http://www.opengis.net/def/property/OGC/0/PhenomenonTime -->
                                        <xsl:when test="swe:Time/@definition = 'http://www.opengis.net/def/property/OGC/0/PhenomenonTime'">
                                            <i class="glyphicon glyphicon-link"/>
                                            <xsl:text> </xsl:text>
                                            <xsl:variable name="PhenomenonTime" select="swe:Time/@definition"/>
                                            <a href="{$PhenomenonTime}" data-title="PhenomenonTime" target="_blank">
                                                Phenomenon Time
                                            </a>
                                        </xsl:when>
                                        <xsl:otherwise>
                                            <i class="glyphicon glyphicon-link"/>
                                            <xsl:text> </xsl:text>
                                            <xsl:variable name="linkParam" select="swe:Quantity/@definition"/>
                                            <a href="{$linkParam}" data-title="{$linkParam}" target="_blank">
                                                <xsl:value-of select="swe:Quantity/@definition" />
                                            </a>
                                        </xsl:otherwise>
                                    </xsl:choose>
                                </h4>
                                <small>Unit of measure:<xsl:text> </xsl:text>
                                    <xsl:choose>
                                        <xsl:when test="swe:Quantity/swe:uom/@xlink:href">
                                            <xsl:variable name="linkUOM" select="swe:Quantity/swe:uom/@xlink:href"/>
                                            <a href="{$linkUOM}" target="_blank" data-title="{swe:Quantity/swe:uom/@code}">
                                                <xsl:value-of select="translate(swe:Quantity/swe:uom/@code, '_', ' ')"/>
                                            </a>
                                        </xsl:when>
                                        <xsl:otherwise>
                                            <xsl:value-of select="translate(swe:Quantity/swe:uom/@code, '_', ' ')"/>
                                        </xsl:otherwise>
                                    </xsl:choose>
                                </small>
                                <p>
                                    <xsl:value-of select="swe:Quantity/gml:description"/>
                                </p>
                            </xsl:if>
                        </xsl:when>
                        <!-- swe:Category -->
                        <xsl:when test="swe:Category">
                            <h4>
                                <xsl:choose>
                                    <!-- for generic Thesaurus -->
                                    <xsl:when test="document(swe:Category/@definition)//skos:prefLabel">
                                        <i class="glyphicon glyphicon-link"/>
                                        <xsl:text> </xsl:text>
                                        <xsl:variable name="linkParam" select="swe:Category/@definition"/>
                                        <a href="{$linkParam}" data-title="{document(swe:Category/@definition)//skos:prefLabel}" target="_blank">
                                            <xsl:value-of select="document(swe:Category/@definition)//skos:prefLabel"/>
                                        </a>
                                    </xsl:when>
                                    <!-- for EnvThes -->
                                    <xsl:when test="contains(swe:Category/@definition, 'vocabs.lter-europe.net/EnvThes/')">
                                        <i class="glyphicon glyphicon-link"/>
                                        <xsl:text> </xsl:text>
                                        <xsl:variable name="linkParam" select="swe:Category/@definition"/>
                                        <a href="{$linkParam}" data-title="{document(concat('http://vocabs.ceh.ac.uk/edg/tbl/describe?_base=urn:x-evn-master:EnvThes&amp;_format=rdf%2Bxml&amp;_resource=', swe:Category/@definition))//skos:prefLabel}" target="_blank">
                                            <xsl:value-of select="document(concat('http://vocabs.ceh.ac.uk/edg/tbl/describe?_base=urn:x-evn-master:EnvThes&amp;_format=rdf%2Bxml&amp;_resource=', swe:Category/@definition))//skos:prefLabel"/>
                                        </a>
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <i class="glyphicon glyphicon-link"/>
                                        <xsl:text> </xsl:text>
                                        <xsl:variable name="linkParam" select="swe:Category/@definition"/>
                                        <a href="{$linkParam}" data-title="{$linkParam}" target="_blank">
                                            <xsl:value-of select="swe:Category/@definition" />
                                        </a>
                                    </xsl:otherwise>
                                </xsl:choose>
                            </h4>
                        </xsl:when>
                    </xsl:choose>
                </xsl:for-each>
            </div>
        </xsl:if>
    </xsl:template>

    <xsl:template name="history">
        <xsl:if
                test="//sml:history">
            <h2>History</h2>
            <div>
                <!-- Only required for left/right tabs -->

                <div class="tab-content">
                    <!-- template update -->
                    <div class="tab-pane active" id="tab1">
                        <!-- Timeline start -->
                        <ul class="timeline">
                            <!--li>
                                <div class="tldate">Today</div>
                            </li-->
                            <xsl:for-each
                                    select="//sml:history/sml:EventList/sml:event">
                                <xsl:sort select="./sml:Event/sml:time/gml:TimeInstant/gml:timePosition" order="ascending"/>
                                <xsl:variable name="class">
                                    <!--<xsl:choose>
                                        <xsl:when
                                            test="../../@gml:id='Updates' or ../../@gml:id='Calibration' or ../../@gml:id='otherEvents'"
                                                ><xsl:value-of select="../../@gml:id"/>-->
                                    timeline-inverted<!--</xsl:when>
                                        <xsl:otherwise>
                                            <xsl:value-of select="../../@gml:id"/>
                                        </xsl:otherwise>
                                    </xsl:choose>-->
                                </xsl:variable>
                                <li class="{$class}">
                                    <div class="timeline-badge success">
                                        <i class="glyphicon glyphicon-chevron-up"/>
                                    </div>
                                    <div class="timeline-panel">
                                        <div class="timeline-heading">
                                            <b><xsl:value-of select="sml:Event/swe:label" /></b>
                                            <p>
                                                <small class="text-muted">
                                                    <i class="glyphicon glyphicon-time"/>
                                                    <xsl:text> </xsl:text>
                                                    <xsl:value-of select="sml:Event/sml:time/gml:TimeInstant/gml:timePosition"/>
                                                </small>
                                            </p>
                                        </div>
                                        <div class="timeline-body">
                                            <p>
                                                <xsl:value-of select="sml:Event/swe:description" />
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            </xsl:for-each>
                        </ul>
                        <!-- Timeline end -->
                    </div>
                </div>
            </div>
        </xsl:if>
    </xsl:template>

    <xsl:template name="position">
        <xsl:variable name="countProperties">
            <xsl:value-of select="count(//sml:featuresOfInterest/sml:FeatureList/sml:feature)"/>
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="$countProperties = '2'">
                <xsl:choose>
                    <xsl:when test="contains(//sml:featuresOfInterest/sml:FeatureList/sml:feature[1]/@xlink:href, 'layers')">
                        <h2>Feature of Interest</h2>
                        <!-- /row -->
                        <div class="row">
                            <div id="map-container">
                                <div id="map"></div>
                            </div>
                            <!-- /map-outer -->
                        </div>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:variable name="featureURL" select="//sml:featuresOfInterest/sml:FeatureList/sml:feature[2]/@xlink:href"/>
                        <h2>Feature of Interest</h2>
                        <!-- /row -->
                        <div class="row">
                            <embed src="{$featureURL}" style="width: 100%; height: 300px; border-style: solid;"></embed>
                        </div>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
                <xsl:choose>
                    <xsl:when test="contains(//sml:featuresOfInterest/sml:FeatureList/sml:feature/@xlink:href, 'layers')">
                        <h2>Feature of Interest</h2>
                        <!-- /row -->
                        <div class="row">
                            <div id="map-container">
                                <div id="map"></div>
                            </div>
                            <!-- /map-outer -->
                        </div>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:variable name="featureURL" select="//sml:featuresOfInterest/sml:FeatureList/sml:feature/@xlink:href"/>
                        <h2>Feature of Interest</h2>
                        <!-- /row -->
                        <div class="row">
                            <embed src="{$featureURL}" style="width: 100%; height: 300px; border-style: solid;"></embed>
                        </div>
                    </xsl:otherwise>
                    <!--<xsl:when test="//sml:featuresOfInterest/sml:FeatureList/sml:feature/@xlink:href and not(//sml:position/swe:Vector/swe:coordinate[@name='easting']/swe:Quantity/swe:value) and not((//sml:position/swe:Vector/swe:coordinate[@name='northing']/swe:Quantity/swe:value))">
                var popup;
                var map;


                function loadFOI() {
                    var owsrootUrl = "http://getit.lter-europe.net";
                    <!-\-"<xsl:value-of select="concat(substring-before(//sml:featuresOfInterest/sml:FeatureList/sml:feature/@xlink:href, 'gml/3.1.1'), 'text/javascript', substring-after(//sml:featuresOfInterest/sml:FeatureList/sml:feature/@xlink:href, 'gml/3.1.1'), '&amp;format_options=callback:getJson&amp;SrsName=EPSG:4326')" />"-\->
                    var URL = owsrootUrl;
                    var WFSLayer = null;
                    var ajax = $.ajax({
                        url : URL,
                        dataType : 'jsonp',
                        jsonpCallback : 'getJson',
                        success : function (response) {
                            console.log(response);
                            WFSLayer = L.geoJson(response, {
                                style: function (feature) {
                                    return {
                                        stroke: false,
                                        fillColor: 'FFFFFF',
                                        fillOpacity: 0.3
                                    };
                                },
                                onEachFeature: function (feature, layer) {
                                    popupOptions = {maxWidth: 200};
                                    layer.bindPopup("Sampled feature of this sensor"
                                    , popupOptions);
                                }
                            }).addTo(map);
                            map.fitBounds(WFSLayer.getBounds());
                        }
                    });
                }

                <xsl:for-each select="swes:DescribeSensorResponse/swes:description/swes:SensorDescription/swes:data/sml:PhysicalSystem">
                    map = L.map('map');

                    popup = L.popup();
                </xsl:for-each>

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(map);

                loadFOI();
            </xsl:when>-->
                </xsl:choose>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="contact">
        <xsl:if
                test="(//sml:contact/@xlink:arcrole = 'http://inspire.ec.europa.eu/metadata-codelist/ResponsiblePartyRole/owner') or
            (//sml:contact/@xlink:arcrole = 'http://inspire.ec.europa.eu/metadata-codelist/ResponsiblePartyRole/pointOfContact')">
            <h2>Contact</h2>
            <xsl:for-each
                    select="//sml:contacts/sml:ContactList">
                <xsl:if
                        test="(.//sml:contact/@xlink:arcrole = 'http://inspire.ec.europa.eu/metadata-codelist/ResponsiblePartyRole/owner')">
                    <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6">
                        <h3>Owner</h3>
                        <!-- sml:identifier name="Owner" -->
                        <p>
                            <b>
                                <xsl:value-of
                                        select="sml:contact[@xlink:arcrole='http://inspire.ec.europa.eu/metadata-codelist/ResponsiblePartyRole/owner']/gmd:CI_ResponsibleParty/gmd:organisationName/gco:CharacterString" />
                            </b>
                            <br/>
                        </p>
                        <p>
                            <i class="glyphicon glyphicon-earphone"/>
                            <xsl:text> </xsl:text>
                            <xsl:value-of
                                    select="sml:contact[@xlink:arcrole='http://inspire.ec.europa.eu/metadata-codelist/ResponsiblePartyRole/owner']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:phone/gmd:CI_Telephone/gmd:voice/gco:CharacterString"/>
                            <br/>
                        </p>
                        <p>
                            <i class="glyphicon glyphicon-list-alt"/>
                            <xsl:text> </xsl:text>
                            <xsl:value-of
                                    select="sml:contact[@xlink:arcrole='http://inspire.ec.europa.eu/metadata-codelist/ResponsiblePartyRole/owner']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:deliveryPoint/gco:CharacterString"/>
                            <br/>
                            <xsl:value-of
                                    select="sml:contact[@xlink:arcrole='http://inspire.ec.europa.eu/metadata-codelist/ResponsiblePartyRole/owner']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:city/gco:CharacterString"/>
                            <br/>
                            <xsl:value-of
                                    select="sml:contact[@xlink:arcrole='http://inspire.ec.europa.eu/metadata-codelist/ResponsiblePartyRole/owner']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:postalCode/gco:CharacterString"/>
                            <br/>
                            <xsl:value-of
                                    select="sml:contact[@xlink:arcrole='http://inspire.ec.europa.eu/metadata-codelist/ResponsiblePartyRole/owner']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:country/gco:CharacterString"/>
                            <br/>
                        </p>
                        <p>
                            <i class="glyphicon glyphicon-envelope"/>
                            <xsl:variable name="linkMailOw"
                                          select="sml:contact[@xlink:arcrole='http://inspire.ec.europa.eu/metadata-codelist/ResponsiblePartyRole/owner']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:electronicMailAddress/gco:CharacterString"/>
                            <a href="{$linkMailOw}">
                                <xsl:text> </xsl:text>
                                <xsl:value-of
                                        select="$linkMailOw"/>
                                <br/>
                            </a>
                        </p>
                        <p>
                            <i class="glyphicon glyphicon-link"/>
                            <xsl:text> </xsl:text>
                            <xsl:variable name="linkOw"
                                          select="sml:contact[@xlink:arcrole='http://inspire.ec.europa.eu/metadata-codelist/ResponsiblePartyRole/owner']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:onlineResource/gmd:CI_OnlineResource/gmd:linkage/gmd:URL"/>
                            <!--<a href="{$link}" target="_blank">
                                <xsl:value-of
                                    select="sml:contacts/sml:ContactList/sml:contact[@xlink:arcrole=http://inspire.ec.europa.eu/metadata-codelist/ResponsiblePartyRole/owner']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:onlineResource/gmd:CI_OnlineResource/gmd:linkage/gmd:URL"
                                />
                            </a>-->
                            <a href="{$linkOw}" target="_blank"
                               data-title="{$linkOw}">
                                <!--data-footer="A custom footer text">-->
                                <xsl:value-of select="$linkOw"/>
                            </a>
                        </p>
                        <!-- sml:value -->
                    </div>
                </xsl:if>
                <xsl:if
                        test="(.//sml:contact[@xlink:arcrole = 'http://inspire.ec.europa.eu/metadata-codelist/ResponsiblePartyRole/pointOfContact'])">
                    <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6">
                        <h3>Operator</h3>
                        <p>
                            <b>
                                <xsl:value-of
                                        select="sml:contact[@xlink:arcrole='http://inspire.ec.europa.eu/metadata-codelist/ResponsiblePartyRole/pointOfContact']/gmd:CI_ResponsibleParty/gmd:organisationName/gco:CharacterString"
                                />
                            </b>
                            <br/>
                        </p>
                        <p>
                            <i class="glyphicon glyphicon-earphone"/>
                            <xsl:text> </xsl:text>
                            <xsl:value-of
                                    select="sml:contact[@xlink:arcrole='http://inspire.ec.europa.eu/metadata-codelist/ResponsiblePartyRole/pointOfContact']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:phone/gmd:CI_Telephone/gmd:voice/gco:CharacterString"/>
                            <br/>
                        </p>
                        <p>
                            <i class="glyphicon glyphicon-list-alt"/>
                            <xsl:text> </xsl:text>
                            <xsl:value-of
                                    select="sml:contact[@xlink:arcrole='http://inspire.ec.europa.eu/metadata-codelist/ResponsiblePartyRole/pointOfContact']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:deliveryPoint/gco:CharacterString"/>
                            <br/>
                            <xsl:value-of
                                    select="sml:contact[@xlink:arcrole='http://inspire.ec.europa.eu/metadata-codelist/ResponsiblePartyRole/pointOfContact']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:city/gco:CharacterString"/>
                            <br/>
                            <xsl:value-of
                                    select="sml:contact[@xlink:arcrole='http://inspire.ec.europa.eu/metadata-codelist/ResponsiblePartyRole/pointOfContact']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:postalCode/gco:CharacterString"/>
                            <br/>
                            <xsl:value-of
                                    select="sml:contact[@xlink:arcrole='http://inspire.ec.europa.eu/metadata-codelist/ResponsiblePartyRole/pointOfContact']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:country/gco:CharacterString"/>
                            <br/>
                        </p>
                        <p>
                            <i class="glyphicon glyphicon-envelope"/>
                            <xsl:variable name="linkMailOp"
                                          select="sml:contact[@xlink:arcrole='http://inspire.ec.europa.eu/metadata-codelist/ResponsiblePartyRole/pointOfContact']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:electronicMailAddress/gco:CharacterString"/>
                            <a href="{concat('mailto:', $linkMailOp)}">
                                <xsl:text> </xsl:text>
                                <xsl:value-of
                                        select="$linkMailOp"/>
                                <br/>
                            </a>
                        </p>
                        <p>
                            <i class="glyphicon glyphicon-link"/>
                            <xsl:text> </xsl:text>
                            <xsl:variable name="linkOp"
                                          select="sml:contact[@xlink:arcrole='http://inspire.ec.europa.eu/metadata-codelist/ResponsiblePartyRole/pointOfContact']/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:onlineResource/gmd:CI_OnlineResource/gmd:linkage/gmd:URL"/>
                            <!--<a href="{$link}" target="_blank">
                                <xsl:value-of
                                    select="sml:contact[@xlink:arcrole='http://inspire.ec.europa.eu/metadata-codelist/ResponsiblePartyRole/pointOfContact']/gmd:CI_ResponsibleParty/sml:contactInfo/gmd:onlineResource/gmd:CI_OnlineResource/gmd:linkage/gmd:URL"
                                />
                            </a>-->
                            <a href="{$linkOp}" target="_blank"
                               data-title="{$linkOp}">
                                <!--data-footer="A custom footer text">-->
                                <xsl:value-of select="$linkOp"/>
                            </a>
                        </p>
                    </div>
                </xsl:if>
            </xsl:for-each>
        </xsl:if>
    </xsl:template>

    <xsl:template name="documentation">
        <xsl:if
                test="//sml:documentation[@xlink:arcrole='datasheet']">
            <h2>Documentation</h2>
        </xsl:if>
        <xsl:for-each
                select="//sml:documentation[@xlink:arcrole='datasheet']">
            <i class="glyphicon glyphicon-paperclip"/>
            <xsl:text> </xsl:text>
            <xsl:variable name="datasheetLink" select="sml:DocumentList/sml:document/gmd:CI_OnlineResource/gmd:linkage/gmd:URL" />
            <a href="{$datasheetLink}" target="_blank">
                <xsl:value-of select="sml:DocumentList/sml:document/gmd:CI_OnlineResource/gmd:name/gco:CharacterString"/><br />
            </a>
        </xsl:for-each>
    </xsl:template>

    <xsl:template name="image">
        <xsl:if
                test="//sml:documentation[@xlink:arcrole='image']">
            <h2>Image</h2>
        </xsl:if>
        <xsl:for-each
                select="//sml:documentation[@xlink:arcrole='image']/sml:DocumentList">
            <p>
                <xsl:value-of select="sml:document/gmd:CI_OnlineResource/gmd:name/gco:CharacterString"/>
            </p>
            <a href="{sml:document/gmd:CI_OnlineResource/gmd:linkage/gmd:URL}" target="_blank"
               data-title="{sml:document/gmd:CI_OnlineResource/gmd:name/gco:CharacterString}" aria-hidden="true">
                <img src="{sml:document/gmd:CI_OnlineResource/gmd:linkage/gmd:URL}" class="img-responsive" height="100"
                     width="100"/>
            </a>
        </xsl:for-each>

    </xsl:template>

    <xsl:template name="component">
        <xsl:if test="//sml:component">
            <!-- TODO: non funziona per più di 1 component -->
            <xsl:variable name="components" select="count(//sml:component)" />
            <xsl:variable name="componentDoc" select="document(.//sml:component/@xlink:href)" />
            <xsl:variable name="currentProcedure" select="substring-before(substring-after(.//sml:component/@xlink:href, 'procedure='), '&amp;')" />
            <div class="table-responsive">
                <!-- if component is SensorML 1.0.0 -->
                <xsl:if test="$componentDoc//sml:SensorML/@version = '1.0.1'"
                        xmlns:sml="http://www.opengis.net/sensorML/1.0.1"
                        xmlns:gml="http://www.opengis.net/gml"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        xmlns:swe="http://www.opengis.net/swe/1.0.1">
                    <table class="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th colspan="2">
                                    This sensor
                                    <xsl:choose>
                                        <xsl:when test="$components &lt;= 1">is</xsl:when>
                                        <xsl:otherwise>are</xsl:otherwise>
                                    </xsl:choose>
                                    composed by <xsl:value-of select="$components" /> component
                                    <xsl:choose>
                                        <xsl:when test="$components &gt; 1">s</xsl:when>
                                    </xsl:choose>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th>
                                    <a href="{concat('http://', substring-before(substring-after($currentProcedure, 'http://sp7.irea.cnr.it/sensors/'), '/procedure'), '/sensors/sensor/ds/?format=text/html&amp;sensor_id=', $currentProcedure)}"
                                       target="_blank">
                                        <xsl:value-of select="$componentDoc//gml:name"/>
                                    </a>
                                </th>
                                <td>
                                    <xsl:value-of select="concat(substring($componentDoc//sml:System/gml:description, 1, 100), ' ...')"/>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </xsl:if>
                <!-- if component is SensorML 2.0 -->
                <xsl:if test="$componentDoc//sml:SensorML/@version = '2.0'"
                        xmlns:swe="http://www.opengis.net/swe/2.0" xmlns:gml="http://www.opengis.net/gml/3.2"
                        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xlink="http://www.w3.org/1999/xlink"
                        xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco"
                        xmlns:sams="http://www.opengis.net/samplingSpatial/2.0" xmlns:sml="http://www.opengis.net/sensorml/2.0"
                        xmlns:sf="http://www.opengis.net/sampling/2.0" xmlns:swes="http://www.opengis.net/swes/2.0">
                    <table class="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th colspan="2">
                                    This sensor
                                    <xsl:choose>
                                        <xsl:when test="$components &lt;= 1">is</xsl:when>
                                        <xsl:otherwise>are</xsl:otherwise>
                                    </xsl:choose>
                                    composed by <xsl:value-of select="$components" /> component
                                    <xsl:choose>
                                        <xsl:when test="$components &gt; 1">s</xsl:when>
                                    </xsl:choose>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th>
                                    <a href="{concat('http://', substring-before(substring-after($currentProcedure, 'http://sp7.irea.cnr.it/sensors/'), '/procedure'), '/sensors/sensor/ds/?format=text/html&amp;sensor_id=', $currentProcedure)}"
                                       target="_blank">
                                        <xsl:value-of select="$componentDoc//gml:name"/>
                                    </a>
                                </th>
                                <td>
                                    <xsl:value-of select="concat(substring($componentDoc//sml:System/gml:description, 1, 100), ' ...')"/>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </xsl:if>
                <!-- if component is a sml:PhysicalComponent -->
                <xsl:if test="$componentDoc//sml:PhysicalComponent">
                    <table class="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th colspan="2">
                                    This sensor
                                    <xsl:choose>
                                        <xsl:when test="$components &lt;= 1">is</xsl:when>
                                        <xsl:otherwise>are</xsl:otherwise>
                                    </xsl:choose>
                                    composed by <xsl:value-of select="$components" /> component
                                    <xsl:choose>
                                        <xsl:when test="$components &gt; 1">s</xsl:when>
                                    </xsl:choose>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th>
                                    <a href="{.//sml:component/@xlink:href}"
                                       target="_blank">
                                        <xsl:value-of select="$componentDoc//gml:name"/>
                                    </a>
                                </th>
                                <td>
                                    <xsl:value-of select="concat(substring($componentDoc//gml:description, 1, 100), ' ...')"/>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </xsl:if>
            </div>
        </xsl:if>
    </xsl:template>
</xsl:stylesheet>