<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:sp7="http://sp7.irea.cnr.it/sp7"
                xmlns:exsl="http://exslt.org/common"
                xmlns:str="http://exslt.org/strings"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:sos="http://www.opengis.net/sos/2.0"
                xmlns:swes="http://www.opengis.net/swes/2.0"
                xmlns:sml="http://www.opengis.net/sensorML/1.0.1"
                xmlns:swe="http://www.opengis.net/swe/2.0"
                xmlns:swe1="http://www.opengis.net/swe/1.0.1"
                xmlns:gml="http://www.opengis.net/gml/3.2"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                xmlns:om="http://www.opengis.net/om/2.0"
                xmlns:sams="http://www.opengis.net/samplingSpatial/2.0"
                xmlns:sf="http://www.opengis.net/sampling/2.0"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://www.w3.org/1999/xlink http://www.w3.org/1999/xlink.xsd http://www.opengis.net/swe/1.0.1 http://schemas.opengis.net/sweCommon/1.0.1/swe.xsd
http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd"

                exclude-result-prefixes="swe1 sp7"
        >
    <!-- Created By: Paolo Tagliolato - CNR ISMAR, CNR IREA in Milano - 2015-05-01T00:00:00Z -->
    <!-- Licence GPL 3 -->
    <xsl:output
            method="xml"
            version="1.0"
            encoding="UTF-8"
            omit-xml-declaration="no"
            indent="yes"
            media-type="text/html"
            />

    <xsl:param name="SK_DOMAIN_NAME"/>


    <xsl:param name="EXISTING_FOI_ID"/>
    <xsl:param name="SPATIAL_SAMPLING_POINT_X"/>
    <xsl:param name="SPATIAL_SAMPLING_POINT_Y"/>
    <xsl:param name="SRS_NAME">http://www.opengis.net/def/crs/EPSG/0/4326</xsl:param>
    <xsl:param name="SAMPLED_FEATURE_URL">http://www.opengis.net/def/nil/OGC/0/unknown</xsl:param>
    <xsl:param name="FOI_NAME"/>
    <xsl:param name="PHENOMENON_TIME_BEGIN"/>
    <xsl:param name="PHENOMENON_TIME_END"/>
    <xsl:param name="RESULT_ENCODING_TOKEN_SEP">@</xsl:param>
    <xsl:param name="RESULT_ENCODING_BLOCK_SEP">#</xsl:param>
    <xsl:param name="RESULT_TIME_TIME_POSITION_ISO"/>
    <!--xsl:param name="ELEMENT_COUNT"/-->

    <xsl:variable name="BASEURL_SP7" select="'http://sp7.irea.cnr.it/'"/>
    <xsl:variable name="APP_NAME" select="'sensors'"/>
    <xsl:variable name="SRS" select="concat('EPSG:',substring-after($SRS_NAME,'/def/crs/EPSG/0/'))"/>
    <xsl:variable name="FOI_ID">
        <xsl:choose>
            <xsl:when test="$EXISTING_FOI_ID">
                <xsl:value-of select="$EXISTING_FOI_ID"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$BASEURL_SP7"/><xsl:value-of select="$APP_NAME"/>/<xsl:value-of
                    select="$SK_DOMAIN_NAME"/>/foi/SSF/SP/<xsl:value-of select="$SRS"/>/<xsl:value-of
                    select="$SPATIAL_SAMPLING_POINT_X"/>/<xsl:value-of select="$SPATIAL_SAMPLING_POINT_Y"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:variable>
    <xsl:variable name="OBSERVATION_TYPE" select="'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_SWEArrayObservation'"/>

    <xsl:template match="/">
        <xsl:variable name="PROCEDURE_ID" select="//sp7:procedure_ID"/>
        <xsl:variable name="OFFERING_ID" select="//sp7:offering"/>



        <sos:InsertObservation xmlns:sos="http://www.opengis.net/sos/2.0"
                               xmlns:swes="http://www.opengis.net/swes/2.0" xmlns:swe="http://www.opengis.net/swe/2.0"
                               xmlns:sml="http://www.opengis.net/sensorML/1.0.1"
                               xmlns:gml="http://www.opengis.net/gml/3.2"
                               xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:om="http://www.opengis.net/om/2.0"
                               xmlns:sams="http://www.opengis.net/samplingSpatial/2.0"
                               xmlns:sf="http://www.opengis.net/sampling/2.0"
                               xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" service="SOS" version="2.0.0"
                               xsi:schemaLocation="http://www.opengis.net/sos/2.0 http://schemas.opengis.net/sos/2.0/sos.xsd http://www.opengis.net/samplingSpatial/2.0 http://schemas.opengis.net/samplingSpatial/2.0/spatialSamplingFeature.xsd">

            <swes:extension>
                <swe:Boolean definition="SplitDataArrayIntoObservations">
                    <swe:value>true</swe:value>
                </swe:Boolean>
            </swes:extension>
            <!-- OFFERING -->
            <sos:offering>
                <xsl:value-of select="$OFFERING_ID"/>
            </sos:offering>


            <xsl:for-each select="//sp7:field[@name!='phenomenonTime' and sp7:values/@count!=0]">
                <xsl:if test="./@type='swe:Quantity'">
                    <xsl:call-template name="observation">
                        <xsl:with-param name="procedure_id" select="$PROCEDURE_ID"/>
                        <xsl:with-param name="name" select="./@name" />
                        <xsl:with-param name="type" select="./@type"/>
                        <xsl:with-param name="definition" select="./@definition"/>
                        <xsl:with-param name="uom_code" select="./@uom_code"/>
                        <xsl:with-param name="values" select="./sp7:values"/>
                        <xsl:with-param name="element_count" select="./sp7:values/@count"/>
                        <xsl:with-param name="position" select="position()"/>
                    </xsl:call-template>
                </xsl:if>
            </xsl:for-each>
        </sos:InsertObservation>
    </xsl:template>

    <xsl:template name="observation">
        <xsl:param name="name"/>
        <xsl:param name="type"/>
        <xsl:param name="definition"/>
        <xsl:param name="uom_code"/>
        <xsl:param name="values"/>
        <xsl:param name="element_count"/>
        <xsl:param name="position"/>
        <xsl:param name="procedure_id"/>


        <xsl:variable name="is_first" select="$position=1"/>
        <xsl:variable name="OBSERVATION_ID" select="concat('o',$position)"/>


        <sos:observation>
            <om:OM_Observation gml:id="{$OBSERVATION_ID}">
                <om:type xlink:href="{$OBSERVATION_TYPE}"/>
                <xsl:call-template name="phenomenonTime"><xsl:with-param name="is_first" select="$is_first"/></xsl:call-template>
                <xsl:call-template name="resultTime"><xsl:with-param name="is_first" select="$is_first"/></xsl:call-template>
                <om:procedure xlink:href="{$procedure_id}"/>
                <om:observedProperty xlink:href="{$definition}"/>
                <xsl:call-template name="featureOfInterest"><xsl:with-param name="is_first" select="$is_first"/></xsl:call-template>

                <om:result>
                    <swe:DataArray>
                        <swe:elementCount>
                            <swe:Count>
                                <swe:value>
                                    <xsl:value-of select="$element_count"/>
                                </swe:value>
                            </swe:Count>
                        </swe:elementCount>

                        <swe:elementType name="defs">
                            <swe:DataRecord>
                                <swe:field name="phenomenonTime">
                                    <swe:Time definition="http://www.opengis.net/def/property/OGC/0/PhenomenonTime">
                                        <swe:uom xlink:href="http://www.opengis.net/def/uom/ISO-8601/0/Gregorian"/>
                                    </swe:Time>
                                </swe:field>

                                <swe:field>
                                    <xsl:attribute name="name">
                                        <xsl:value-of select="$name"/>
                                    </xsl:attribute>
                                    <swe:Quantity>
                                        <xsl:attribute name="definition">
                                            <xsl:value-of select="$definition"/>
                                        </xsl:attribute>
                                        <swe:uom>
                                            <xsl:attribute name="code">
                                                <xsl:value-of select="$uom_code"/>
                                            </xsl:attribute>
                                        </swe:uom>
                                    </swe:Quantity>
                                </swe:field>

                            </swe:DataRecord>
                        </swe:elementType>

                        <swe:encoding>
                            <swe:TextEncoding tokenSeparator="{$RESULT_ENCODING_TOKEN_SEP}"
                                              blockSeparator="{$RESULT_ENCODING_BLOCK_SEP}"
                                              collapseWhiteSpaces="false" decimalSeparator="."/>
                        </swe:encoding>

                        <swe:values>
                            <xsl:value-of select="$values"/>
                        </swe:values>
                    </swe:DataArray>
                </om:result>
            </om:OM_Observation>
        </sos:observation>
    </xsl:template>

    <xsl:template name="phenomenonTime">
        <xsl:param name="is_first"/>
        <xsl:if test="$is_first">
            <om:phenomenonTime>
                <gml:TimePeriod gml:id="phenomenonTime_o1">
                    <gml:beginPosition>
                        <xsl:value-of select="$PHENOMENON_TIME_BEGIN"/>
                    </gml:beginPosition>
                    <gml:endPosition>
                        <xsl:value-of select="$PHENOMENON_TIME_END"/>
                    </gml:endPosition>
                </gml:TimePeriod>
            </om:phenomenonTime>
        </xsl:if>
        <xsl:if test="not($is_first)">
            <om:phenomenonTime xlink:href="#phenomenonTime_o1"/>
        </xsl:if>
    </xsl:template>

    <xsl:template name="resultTime">
        <xsl:param name="is_first"/>
        <xsl:if test="$is_first">
            <om:resultTime>
                <gml:TimeInstant gml:id="resultTime_o1">
                    <gml:timePosition>
                        <xsl:value-of select="$RESULT_TIME_TIME_POSITION_ISO"/>
                    </gml:timePosition>
                </gml:TimeInstant>
            </om:resultTime>
        </xsl:if>
        <xsl:if test="not($is_first)">
            <om:resultTime xlink:href="#resultTime_o1"/>
        </xsl:if>
    </xsl:template>

    <xsl:template name="featureOfInterest">
        <xsl:param name="is_first"/>

        <xsl:if test="$is_first">
            <xsl:choose>
                <xsl:when test="$EXISTING_FOI_ID">
                    <om:featureOfInterest xlink:href="{$EXISTING_FOI_ID}"/>
                </xsl:when>
                <xsl:otherwise>
                    <om:featureOfInterest>
                        <sams:SF_SpatialSamplingFeature gml:id="SSF_1">
                            <gml:identifier codeSpace="">
                                <xsl:value-of select="$FOI_ID"/>
                            </gml:identifier>
                            <gml:name>
                                <xsl:value-of select="$FOI_NAME"/>
                            </gml:name>
                            <sf:type xlink:href="http://www.opengis.net/def/samplingFeatureType/OGC-OM/2.0/SF_SamplingPoint"/>
<!-- PLEASE NOTE! THE ISSUE HERE IS OF XSLT processor in the browser does not implement disable-output-escaping
    We resolve the problem in javascript (subs all & before processing, then subs again the opposite way)-->
                            <!--<xsl:text disable-output-escaping="yes">&lt;</xsl:text>-->
                            <!--<xsl:value-of select="'<'" disable-output-escaping="yes"/>-->
                            <!--    <xsl:value-of select="'sf:sampledFeature xlink:href='"/>"<xsl:value-of select="$SAMPLED_FEATURE_URL" disable-output-escaping="yes"/>"<xsl:value-of select="'/>'" disable-output-escaping="yes"/>-->
                            <sf:sampledFeature xlink:href="{$SAMPLED_FEATURE_URL}"/>
                            <sams:shape>
                                <gml:Point gml:id="p1">
                                    <gml:pos srsName="{$SRS_NAME}">
                                        <xsl:value-of select="$SPATIAL_SAMPLING_POINT_X"/><xsl:value-of select="' '"/>
                                        <xsl:value-of select="$SPATIAL_SAMPLING_POINT_Y"/>
                                    </gml:pos>
                                </gml:Point>
                            </sams:shape>
                        </sams:SF_SpatialSamplingFeature>
                    </om:featureOfInterest>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:if>
        <xsl:if test="not($is_first)">
            <om:featureOfInterest xlink:href="{$FOI_ID}"/>
        </xsl:if>
    </xsl:template>

</xsl:stylesheet>