<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:swes="http://www.opengis.net/swes/2.0"
    xmlns:sos="http://www.opengis.net/sos/2.0" xmlns:swe="http://www.opengis.net/swe/1.0.1"
    xmlns:sml="http://www.opengis.net/sensorML/1.0.1" xmlns:gml="http://www.opengis.net/gml"
    xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    exclude-result-prefixes="xs swes sos swe sml gml xlink xsi"
    version="2.0">
    
    <xsl:output method="html"
        encoding="UTF-8"
        indent="no" omit-xml-declaration="yes" />

    <xsl:template match="/">
        <xsl:text disable-output-escaping="yes">&lt;!DOCTYPE html&gt;</xsl:text>
        <html lang="en">
            <head>

                <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <meta name="description" content="Human readable version of a sensor description from SensorML and describeSensor request"/>
                <meta name="author" content="Alessandro Oggioni"/>
                <meta name="author" content="Paolo Tagliolato"/>
                <link rel="icon" href="http://skmi.irea.cnr.it/static/geosk/img/favicon.ico"/>

                <title>Sensor description</title>
                <link rel="stylesheet" href="//cdn.leafletjs.com/leaflet-0.7.2/leaflet.css" />

                <link href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css" rel="stylesheet"/>


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
                </style>

                <style>
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

                <script src="//code.jquery.com/jquery-1.11.1.min.js"></script>
                <script src="//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>

            </head>

            <body>
        
                <div class="container">
        
                    <div class="row row-offcanvas row-offcanvas-right">
        
                        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"> <!-- all -->
                            
                            <div class="page-header">
                                <xsl:call-template name="description" />
                                <ul class="nav nav-pills">
                                    <xsl:call-template name="keywords" />
                                </ul>
                                <!-- keyword -->
                            </div>
        
                            <div class="row">
                                <xsl:call-template name="manufacturer" />
                                <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
                                    <h2>Parameters</h2>
                                    <xsl:call-template name="parameters" />
                                </div>
                                <!--/span-->
                            </div>
        
                            <div class="row">

                                <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                                    <h2>Position</h2>
                                    <div class="row">
                                        <div id="map-container">
                                            <div id="map"></div>
                                        </div><!-- /map-outer -->
                                    </div><!-- /row -->
                                </div>
                                <!--/span-->
                                <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                                    <h2>Contact</h2>
                                    <xsl:call-template name="contact" />
                                </div>
                            </div>
                            <div class="row">
                                <!--/span-->
                                <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                                    <h2>Documentation</h2>
                                    <xsl:call-template name="documentation" />
                                </div>
                                <!--/span-->
                                <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 span4">
                                    <h2>History</h2>
                                    <xsl:call-template name="history" />
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
                <script src="//getbootstrap.com/assets/js/ie10-viewport-bug-workaround.js"></script>
                <script src="//cdn.leafletjs.com/leaflet-0.7.2/leaflet.js"></script>
                
                <script>
                    <xsl:call-template name="position" />
            	</script>
        
            </body>
        </html>
    </xsl:template>
    
    <xsl:template name="description">
        <xsl:for-each select="swes:DescribeSensorResponse/swes:description/swes:SensorDescription/swes:data/sml:SensorML/sml:member/sml:System">
            <h1><xsl:value-of select="gml:name" /><xsl:text> </xsl:text><small>(<xsl:value-of select="sml:identification/sml:IdentifierList/sml:identifier[@name='Long Name']/sml:Term/sml:value" />)</small></h1>
            <p><xsl:value-of select="gml:description" /></p>
        </xsl:for-each>
    </xsl:template>
    
    <xsl:template name="manufacturer">
        <xsl:for-each select="swes:DescribeSensorResponse/swes:description/swes:SensorDescription/swes:data/sml:SensorML/sml:member/sml:System">
            <div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
                <h3>Manufacturer Name</h3>
                <!-- sml:identifier name="Manufacturer Name" -->
                <p><b><xsl:value-of select="sml:identification/sml:IdentifierList/sml:identifier[@name='Manufacturer Name']/sml:Term/sml:value" /></b><br/></p>
                <p><i class="glyphicon glyphicon-earphone"></i><xsl:text> </xsl:text><xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:manufacturer']/sml:ResponsibleParty/sml:contactInfo/sml:phone/sml:voice" /><br/></p>
                <p><i class="glyphicon glyphicon-list-alt"></i><xsl:text> </xsl:text><xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:manufacturer']/sml:ResponsibleParty/sml:contactInfo/sml:address/sml:deliveryPoint" /><br/>
                <xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:manufacturer']/sml:ResponsibleParty/sml:contactInfo/sml:address/sml:city" /><br/>
                <xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:manufacturer']/sml:ResponsibleParty/sml:contactInfo/sml:address/sml:postalCode" /><br/>
                <xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:manufacturer']/sml:ResponsibleParty/sml:contactInfo/sml:address/sml:country" /><br/></p>
                <p>
                    <xsl:variable name="linkMailMan" select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:manufacturer']/sml:ResponsibleParty/sml:contactInfo/sml:address/sml:electronicMailAddress"/>
                    <a href="{concat('mailto:', $linkMailMan)}">
                        <i class="glyphicon glyphicon-envelope"></i><xsl:text> </xsl:text><xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:manufacturer']/sml:ResponsibleParty/sml:contactInfo/sml:address/sml:electronicMailAddress" /><br/>
                    </a>
                </p>
                <p><i class="glyphicon glyphicon-link"></i><xsl:text> </xsl:text><xsl:variable name="link" select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:manufacturer']/sml:ResponsibleParty/sml:contactInfo/sml:onlineResource/@xlink:href"/>
                    <a href="{$link}" target="_blank">
                        <xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:manufacturer']/sml:ResponsibleParty/sml:contactInfo/sml:onlineResource/@xlink:href" />
                    </a>
                </p>
                <!-- sml:value -->
            </div>
            <div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
                <h3>Model Number</h3>
                <!-- sml:identifier name="Model Number" -->
                <p><xsl:value-of select="sml:identification/sml:IdentifierList/sml:identifier[@name='Model Number']/sml:Term/sml:value" /></p>
                <!-- sml:value -->
            </div>
        </xsl:for-each>
    </xsl:template>
    
    <xsl:template name="history">
        <div> <!-- Only required for left/right tabs -->
            
            <div class="tab-content">
                <!-- template update -->
                <div class="tab-pane active" id="tab1">
                    <!-- Timeline start -->
                    <ul class="timeline">
                        <li>
                            <div class="tldate">Today</div>
                        </li>
                        <xsl:for-each select="swes:DescribeSensorResponse/swes:description/swes:SensorDescription/swes:data/sml:SensorML/sml:member/sml:System/sml:history/sml:EventList/sml:member/sml:Event">
                            <xsl:sort select="sml:date" order="descending" />
                            <xsl:variable name="class">
                                <xsl:choose>
                                    <xsl:when test="../../@gml:id='smlUpdates' or ../../@gml:id='calibration'"><xsl:value-of select="../../@gml:id"/> timeline-inverted</xsl:when>
                                    <xsl:otherwise><xsl:value-of select="../../@gml:id"/></xsl:otherwise>
                                </xsl:choose>
                            </xsl:variable>
                            <li class="{$class}">
                                <div class="timeline-badge success"><i class="glyphicon glyphicon-chevron-up"></i></div>
                                <div class="timeline-panel">
                                    <div class="timeline-heading">
                                        <xsl:choose>
                                            <xsl:when test="../../@gml:id='smlUpdates'">
                                                <h4 class="timeline-title">Update</h4>
                                            </xsl:when>
                                            <xsl:when test="../../@gml:id='operations'">
                                                <h4 class="timeline-title">Operations</h4>
                                            </xsl:when>
                                            <xsl:when test="../../@gml:id='calibration'">
                                                <h4 class="timeline-title">Calibration</h4>
                                            </xsl:when>
                                            <xsl:when test="../../@gml:id='otherEvents'">
                                                <h4 class="timeline-title">Other events</h4>
                                            </xsl:when>
                                            <xsl:otherwise>
                                                <h4 class="timeline-title">
                                                    <xsl:value-of select="../../@gml:id"/>
                                                </h4>
                                            </xsl:otherwise>
                                        </xsl:choose>
                                        <p><small class="text-muted"><i class="glyphicon glyphicon-time"></i><xsl:text> </xsl:text><xsl:value-of select="sml:date" /> </small></p>
                                    </div>
                                    <div class="timeline-body">
                                        <p><xsl:value-of select="gml:description" /></p>
                                    </div>
                                </div>
                            </li>
                        </xsl:for-each>
                    </ul>
                    <!-- Timeline end -->
                </div>
            </div>
        </div>
    </xsl:template>

    <xsl:template name="position">

        var popup;
        var map;
        <xsl:for-each select="swes:DescribeSensorResponse/swes:description/swes:SensorDescription/swes:data/sml:SensorML/sml:member/sml:System">
        map = L.map('map').setView([<xsl:value-of select="sml:position/swe:Position/swe:location/swe:Vector/swe:coordinate[@name='northing']/swe:Quantity/swe:value" />, <xsl:value-of select="sml:position/swe:Position/swe:location/swe:Vector/swe:coordinate[@name='easting']/swe:Quantity/swe:value" />], 13);
        

        L.marker([<xsl:value-of select="sml:position/swe:Position/swe:location/swe:Vector/swe:coordinate[@name='northing']/swe:Quantity/swe:value" />, <xsl:value-of select="sml:position/swe:Position/swe:location/swe:Vector/swe:coordinate[@name='easting']/swe:Quantity/swe:value" />]).addTo(map)
        .bindPopup("<b><xsl:value-of select="gml:name" /></b>"+
            "<br />" +
            "Position:<xsl:text> </xsl:text><xsl:value-of select="sml:position/swe:Position/swe:location/swe:Vector/swe:coordinate[@name='northing']/swe:Quantity/swe:value" /><xsl:text> N</xsl:text>, <xsl:value-of select="sml:position/swe:Position/swe:location/swe:Vector/swe:coordinate[@name='easting']/swe:Quantity/swe:value" /><xsl:text> E</xsl:text><br/>" +
            "Altitude:<xsl:text> </xsl:text><xsl:value-of select="sml:position/swe:Position/swe:location/swe:Vector/swe:coordinate[@name='altitude']/swe:Quantity/swe:value" /><xsl:text> </xsl:text><xsl:value-of select="sml:position/swe:Position/swe:location/swe:Vector/swe:coordinate[@name='altitude']/swe:Quantity/swe:uom/@code" /><xsl:text> </xsl:text>asl").openPopup();
        
        //var popup = L.popup();
        popup = L.popup();
        
        //map.on('click', onMapClick);
        </xsl:for-each>

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '�� <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

    </xsl:template>

    <xsl:template name="contact">
        <xsl:for-each select="swes:DescribeSensorResponse/swes:description/swes:SensorDescription/swes:data/sml:SensorML/sml:member/sml:System">
            <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6">
                <h3>Owner</h3>
                <!-- sml:identifier name="Owner" -->
                <p><b><xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:owner']/sml:ResponsibleParty/sml:organizationName" /></b><br/></p>
                <p><i class="glyphicon glyphicon-earphone"></i><xsl:text> </xsl:text><xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:owner']/sml:ResponsibleParty/sml:contactInfo/sml:phone/sml:voice" /><br/></p>
                <p><i class="glyphicon glyphicon-list-alt"></i><xsl:text> </xsl:text><xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:owner']/sml:ResponsibleParty/sml:contactInfo/sml:address/sml:deliveryPoint" /><br/>
                    <xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:owner']/sml:ResponsibleParty/sml:contactInfo/sml:address/sml:city" /><br/>
                    <xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:owner']/sml:ResponsibleParty/sml:contactInfo/sml:address/sml:postalCode" /><br/>
                    <xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:owner']/sml:ResponsibleParty/sml:contactInfo/sml:address/sml:country" /><br/></p>
                <p>
                    <xsl:variable name="linkMailOw" select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:owner']/sml:ResponsibleParty/sml:contactInfo/sml:address/sml:electronicMailAddress"/>
                    <a href="{concat('mailto:', $linkMailOw)}">
                        <i class="glyphicon glyphicon-envelope"></i><xsl:text> </xsl:text><xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:owner']/sml:ResponsibleParty/sml:contactInfo/sml:address/sml:electronicMailAddress" /><br/>
                    </a>
                </p>
                <p><i class="glyphicon glyphicon-link"></i><xsl:text> </xsl:text><xsl:variable name="link" select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:owner']/sml:ResponsibleParty/sml:contactInfo/sml:onlineResource/@xlink:href"/>
                    <a href="{$link}" target="_blank">
                        <xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:owner']/sml:ResponsibleParty/sml:contactInfo/sml:onlineResource/@xlink:href" />
                    </a>
                </p>
                <!-- sml:value -->
            </div>
            <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6">
                <h3>Operator</h3>
                <!-- sml:identifier name="Operator" -->
                <p><b><xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:operator']/sml:ResponsibleParty/sml:organizationName" /></b><br/></p>
                <p><i class="glyphicon glyphicon-earphone"></i><xsl:text> </xsl:text><xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:operator']/sml:ResponsibleParty/sml:contactInfo/sml:phone/sml:voice" /><br/></p>
                <p><i class="glyphicon glyphicon-list-alt"></i><xsl:text> </xsl:text><xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:operator']/sml:ResponsibleParty/sml:contactInfo/sml:address/sml:deliveryPoint" /><br/>
                    <xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:operator']/sml:ResponsibleParty/sml:contactInfo/sml:address/sml:city" /><br/>
                    <xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:operator']/sml:ResponsibleParty/sml:contactInfo/sml:address/sml:postalCode" /><br/>
                    <xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:operator']/sml:ResponsibleParty/sml:contactInfo/sml:address/sml:country" /><br/></p>
                <p>
                    <xsl:variable name="linkMailOp" select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:operator']/sml:ResponsibleParty/sml:contactInfo/sml:address/sml:electronicMailAddress"/>
                    <a href="{concat('mailto:', $linkMailOp)}">
                        <i class="glyphicon glyphicon-envelope"></i><xsl:text> </xsl:text><xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:operator']/sml:ResponsibleParty/sml:contactInfo/sml:address/sml:electronicMailAddress" /><br/>
                    </a>
                </p>
                <p><i class="glyphicon glyphicon-link"></i><xsl:text> </xsl:text><xsl:variable name="link" select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:operator']/sml:ResponsibleParty/sml:contactInfo/sml:onlineResource/@xlink:href"/>
                    <a href="{$link}" target="_blank">
                        <xsl:value-of select="sml:contact[@xlink:arcrole='urn:ogc:def:classifiers:OGC:contactType:operator']/sml:ResponsibleParty/sml:contactInfo/sml:onlineResource/@xlink:href" />
                    </a>
                </p>
                <!-- sml:value -->
            </div>
        </xsl:for-each>
    </xsl:template>

    <xsl:template name="parameters" match="swes:DescribeSensorResponse/swes:description/swes:SensorDescription/swes:data/sml:SensorML/sml:member/sml:System/sml:outputs/sml:OutputList/sml:output">
        <xsl:for-each select="swes:DescribeSensorResponse/swes:description/swes:SensorDescription/swes:data/sml:SensorML/sml:member/sml:System/sml:outputs/sml:OutputList/sml:output">
            <xsl:if test="@name!='phenomenonTime'">
                <h4>
                    <xsl:variable name="linkParam" select="swe:Quantity/@definition"/>
                    <a href="{$linkParam}" target="_blank">
                        <xsl:value-of select="@name" />
                    </a>
                </h4>
                <small>Unit of measure:<xsl:text> </xsl:text><xsl:value-of select="swe:Quantity/swe:uom/@code"/></small>
                <p><xsl:value-of select="swe:Quantity/gml:description" /></p>
            </xsl:if>
        </xsl:for-each>
    </xsl:template>
    
    <xsl:template name="documentation">
        <xsl:for-each select="swes:DescribeSensorResponse/swes:description/swes:SensorDescription/swes:data/sml:SensorML/sml:member/sml:System/sml:documentation">
            <p><xsl:value-of select="sml:Document/gml:description" /></p>
            <xsl:variable name="linkDoc" select="sml:Document/sml:onlineResource/@xlink:href" />
            <i class="glyphicon glyphicon-paperclip"></i><xsl:text> </xsl:text><a href="{$linkDoc}" target="_blank">
                <xsl:value-of select="sml:Document/sml:format" />
            </a>
        </xsl:for-each>
    </xsl:template>

    <xsl:template name="keywords">
        <xsl:for-each select="swes:DescribeSensorResponse/swes:description/swes:SensorDescription/swes:data/sml:SensorML/sml:member/sml:System/sml:keywords/sml:KeywordList/sml:keyword">
            <xsl:if test="not(contains(., 'http://')) and not(contains(., 'offering:'))">
                <li class="disabled">
                    <!--xsl:variable name="linkKeyword" select="." /-->
                    <!--a href="#{$linkKeyword}" target="_self"-->
                       <a> <xsl:value-of select="." /> </a>
                    <!--/a-->
                </li>
            </xsl:if>
        </xsl:for-each>
    </xsl:template>
</xsl:stylesheet>