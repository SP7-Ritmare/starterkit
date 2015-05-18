<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
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
	exclude-result-prefixes="swe1"
>
        <!-- Created By: Paolo Tagliolato & Alessandro Oggioni- CNR IREA in Milano - 2014-06-07T00:00:00Z -->
        <!-- Licence GPL 3 -->
<xsl:output
	method="xml"
	version="1.0"
	encoding="UTF-8"
	omit-xml-declaration="no"
	indent="yes"	
	media-type="text/xml"/>


<xsl:param name="SK_DOMAIN_NAME"/>
<xsl:param name="EXISTING_FOI_ID"/>
<xsl:param name="SPATIAL_SAMPLING_POINT_X"/>
<xsl:param name="SPATIAL_SAMPLING_POINT_Y"/>
<xsl:param name="SRS_NAME"/>
<xsl:param name="SAMPLED_FEATURE_URL">http://www.opengis.net/def/nil/OGC/0/unknown</xsl:param>
<xsl:param name="FOI_NAME"/>

<!--xsl:include href="ritmareSosIdConvention.xsl"/-->

<xsl:param name="PHENOMENON_TIME_BEGIN"/>
<xsl:param name="PHENOMENON_TIME_END"/>  
<xsl:param name="RESULT_ENCODING_TOKEN_SEP"/>
<xsl:param name="RESULT_ENCODING_BLOCK_SEP"/>
<xsl:param name="RESULT_TIME_TIME_POSITION_ISO"/>
<xsl:param name="ELEMENT_COUNT"/>
<xsl:param name="VALUES"/>


<xsl:variable name="BASEURL_SP7" select="'http://sp7.irea.cnr.it/'"/>
<xsl:variable name="APP_NAME" select="'sensors'"/>

<xsl:variable name="SRS" select="concat('EPSG:',substring-after($SRS_NAME,'/def/crs/EPSG/0/'))"/>
<xsl:variable name="FOI_ID">
<xsl:choose >
<xsl:when test="$EXISTING_FOI_ID"><xsl:value-of select="$EXISTING_FOI_ID"/></xsl:when>
 <xsl:otherwise><xsl:value-of select="$BASEURL_SP7"/><xsl:value-of select="$APP_NAME"/>/<xsl:value-of select="$SK_DOMAIN_NAME"/>/foi/SSF/SP/<xsl:value-of select="$SRS"/>/<xsl:value-of select="$SPATIAL_SAMPLING_POINT_X"/>/<xsl:value-of select="$SPATIAL_SAMPLING_POINT_Y"/></xsl:otherwise>
</xsl:choose>
</xsl:variable>
<xsl:variable name="OBSERVATION_TYPE" select="'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_SWEArrayObservation'"/>

<xsl:template match="/">

<!-- From describeSensor (xml document in input)-->
<xsl:variable name="PROCEDURE_ID" select="//sml:identifier[@name='uniqueID']/sml:Term/sml:value"/>
<xsl:variable name="OFFERING_ID" select="//sml:capabilities[@name='offerings']//swe1:Text[@definition='http://www.opengis.net/def/offering/identifier']/swe1:value"/>

<!-- ritmare convention -->
<xsl:variable name="OBSERVED_PROPERTIES_COMPOUND_ID"><xsl:value-of select="$PROCEDURE_ID"/>/observedProperty/compound</xsl:variable>


<!-- costanti di utilita' -->
<!-- ****** TODO: capire se sia obbligatorio! (che senso ha in template??) -->
<xsl:variable name="OBSERVATION_ID" select="'o1'"/>

<xsl:variable name="FOI_CONTENT_SSF_SP">
	<sams:SF_SpatialSamplingFeature gml:id="SSF_1">
		<gml:identifier codeSpace=""><xsl:value-of select="$FOI_ID"/></gml:identifier>
		<gml:name><xsl:value-of select="$FOI_NAME"/></gml:name>
		<sf:type xlink:href="http://www.opengis.net/def/samplingFeatureType/OGC-OM/2.0/SF_SamplingPoint" />
		<sf:sampledFeature xlink:href="{$SAMPLED_FEATURE_URL}" />
		<sams:shape>
			<gml:Point gml:id="p1">
				<gml:pos srsName="{$SRS_NAME}">
					<xsl:value-of select="$SPATIAL_SAMPLING_POINT_X"/><xsl:value-of select="' '"/>
					<xsl:value-of select="$SPATIAL_SAMPLING_POINT_Y"/></gml:pos>
			</gml:Point>
		</sams:shape>
	</sams:SF_SpatialSamplingFeature>
</xsl:variable>

<xsl:variable name="PHENOMENON_TIME_DEFINITION">                  
    <swe:Time definition="http://www.opengis.net/def/property/OGC/0/PhenomenonTime">
        <swe:uom xlink:href="http://www.opengis.net/def/uom/ISO-8601/0/Gregorian"/>
    </swe:Time>
</xsl:variable>
    
<!-- Inizio output -->
<sos:InsertObservation xmlns:sos="http://www.opengis.net/sos/2.0"
    xmlns:swes="http://www.opengis.net/swes/2.0" xmlns:swe="http://www.opengis.net/swe/2.0"
    xmlns:sml="http://www.opengis.net/sensorML/1.0.1" xmlns:gml="http://www.opengis.net/gml/3.2"
    xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:om="http://www.opengis.net/om/2.0"
    xmlns:sams="http://www.opengis.net/samplingSpatial/2.0"
    xmlns:sf="http://www.opengis.net/sampling/2.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" service="SOS" version="2.0.0"
    xsi:schemaLocation="http://www.opengis.net/sos/2.0 http://schemas.opengis.net/sos/2.0/sos.xsd http://www.opengis.net/samplingSpatial/2.0 http://schemas.opengis.net/samplingSpatial/2.0/spatialSamplingFeature.xsd">
	
	
    <!-- OFFERING -->
    <sos:offering><xsl:value-of select="$OFFERING_ID"/></sos:offering>            
            
    <sos:observation>
        <!--  om:OM_Observation gml:id="sensor2obsTemplate">--> 
        <om:OM_Observation gml:id="{$OBSERVATION_ID}">
            <om:type xlink:href="{$OBSERVATION_TYPE}"/>
            <om:phenomenonTime>
                <gml:TimePeriod gml:id="phenomenonTime_{$OBSERVATION_ID}">
                    <gml:beginPosition><xsl:value-of select="$PHENOMENON_TIME_BEGIN"/></gml:beginPosition>
                    <gml:endPosition><xsl:value-of select="$PHENOMENON_TIME_END"/></gml:endPosition>
                </gml:TimePeriod>
            </om:phenomenonTime>

            <om:resultTime>
                <gml:TimeInstant gml:id="resultTime_{$OBSERVATION_ID}">
                    <gml:timePosition><xsl:value-of select="$RESULT_TIME_TIME_POSITION_ISO"/></gml:timePosition>
                </gml:TimeInstant>
            </om:resultTime>
                    
			<!-- PROCEDURE  -->
            <om:procedure xlink:href="{$PROCEDURE_ID}"/>

            <!--  OBSERVED_PROPERTY (COMPOUND) -->
            <om:observedProperty xlink:href="{$OBSERVED_PROPERTIES_COMPOUND_ID}"/>      

            <!-- <om:featureOfInterest/> -->
            <xsl:choose>
                <xsl:when test="$EXISTING_FOI_ID">
			       <om:featureOfInterest xlink:href="{$EXISTING_FOI_ID}"/>
                </xsl:when>
                <xsl:otherwise>
                    <om:featureOfInterest>
                        <xsl:copy-of select="$FOI_CONTENT_SSF_SP"/>
                    </om:featureOfInterest>
                </xsl:otherwise>
            </xsl:choose>

            <!-- <om:result/> -->
            <om:result>
                <swe:DataArray>
                    <swe:elementCount>
                        <swe:Count>
                            <swe:value><xsl:value-of select="$ELEMENT_COUNT"/></swe:value>
                        </swe:Count>
                    </swe:elementCount>

                    <swe:elementType name="defs">
                        <swe:DataRecord>
                            <!--  se e' presente inserisco phenomenon time e result time qui -->
                            <xsl:if test="//sml:output[@name='phenomenonTime']">
                                <swe:field name="phenomenonTime">    
                                    <xsl:copy-of select="$PHENOMENON_TIME_DEFINITION"></xsl:copy-of>
                                    <!-- <swe:Time definition="http://www.opengis.net/def/property/OGC/0/PhenomenonTime">
                                        <swe:uom xlink:href="http://www.opengis.net/def/uom/ISO-8601/0/Gregorian"/>
                                    </swe:Time> -->
                                </swe:field>
                            </xsl:if>                                    
                            <!-- ad ogni sml:output in sensorML faccio corrispondere un swe:field per il dataRecord-->
                            <xsl:for-each select="//sml:output">
                                <!-- nota: qui devo usare il prefisso swe1 per gli xpath che cercano in sensorML (usa swe versione 1.0.1) 
                                            uso invece il prefisso swe per gli elementi che compariranno in sos:InsertResultTemplate (sos 2 usa swe versione 2)
                                -->
                                <!-- escludo output phenomenonTime (messo prima cmq) -->
                                <xsl:if test="@name!='phenomenonTime'">
                                    <!-- esempio di risultato:
                                    <swe:field name="Temperature of the water column">
                                        <swe:Quantity definition="http://vocab.nerc.ac.uk/collection/P02/current/TEMP/">
                                            <swe:uom code="degC"/>
                                        </swe:Quantity>
                                    </swe:field>
                                    -->
                                    <swe:field> 
                                        <xsl:attribute name="name"> <xsl:value-of select="@name"/></xsl:attribute> 
                                        <swe:Quantity>
                                            <xsl:attribute name="definition"> <xsl:value-of select="./swe1:Quantity/@definition"/></xsl:attribute> 
                                            <swe:uom>
                                                <xsl:attribute name="code"> <xsl:value-of select="./swe1:Quantity/swe1:uom/@code"/> </xsl:attribute> 
                                            </swe:uom>  
                                        </swe:Quantity>                           
                                    </swe:field>
                                    
                                </xsl:if>
                            </xsl:for-each>
                        </swe:DataRecord>
                    </swe:elementType>

                    <swe:encoding>
                        <swe:TextEncoding tokenSeparator="{$RESULT_ENCODING_TOKEN_SEP}" blockSeparator="{$RESULT_ENCODING_BLOCK_SEP}" collapseWhiteSpaces="false" decimalSeparator="."/>
                    </swe:encoding>

                    <swe:values>
                        <xsl:value-of select="$VALUES"/>                        
                    </swe:values>                
                </swe:DataArray>
            </om:result>

        </om:OM_Observation>
    </sos:observation>
</sos:InsertObservation>

<!--  -->
</xsl:template>
</xsl:stylesheet> 