<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:sos="http://www.opengis.net/sos/2.0" 
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:sams="http://www.opengis.net/samplingSpatial/2.0" 
	xmlns:gml="http://www.opengis.net/gml/3.2" 
	xmlns:sf="http://www.opengis.net/sampling/2.0"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	xsi:schemaLocation="http://www.opengis.net/sos/2.0 http://schemas.opengis.net/sos/2.0/sosGetFeatureOfInterest.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd http://www.opengis.net/samplingSpatial/2.0 http://schemas.opengis.net/samplingSpatial/2.0/spatialSamplingFeature.xsd http://www.opengis.net/sampling/2.0 http://schemas.opengis.net/sampling/2.0/samplingFeature.xsd"
>
    <!-- Created By: Paolo Tagliolato - CNR ISMAR, CNR IREA in Milano - 2015-05-01T00:00:00Z -->
    <!-- Licence GPL 3 -->
<xsl:output
	method="text"
	version="1.0"
	encoding="UTF-8"
	omit-xml-declaration="yes"
	indent="yes"
	media-type="application/json"/>
	
	<xsl:param name="para1"></xsl:param>
	<xsl:param name="para2"></xsl:param>

	<xsl:template match="/sos:GetFeatureOfInterestResponse">
		{
			"request": "GetFeatureOfInterest",
			"version": "2.0.0",
			"service": "SOS",
			"featureOfInterest": [
				<xsl:for-each select="sos:featureMember/sams:SF_SpatialSamplingFeature">
					{
						"identifier":"<xsl:value-of select="gml:identifier"/>",
						"name":"<xsl:value-of select="gml:name"/>",
						"geometry":{
							<xsl:choose>
								<xsl:when test="sf:type/@xlink:href='http://www.opengis.net/def/samplingFeatureType/OGC-OM/2.0/SF_SamplingPoint'">
								"type": "Point",
					            "coordinates": [
					            	<xsl:value-of select="translate(sams:shape/gml:Point/gml:pos,' ',',')"/>
					            ],
					            "crs":{
					            	"type":"name",
					            	"properties":{
					            		<!-- TODO: fare in modo che in assenza di /www.opengis.net/def/crs/EPSG/0/ si comporti adeguatamente -->
					            		<xsl:if test="contains(sams:shape/gml:Point/gml:pos/@srsName,'/def/crs/EPSG/0/')">
					            		"name":"<xsl:value-of select="concat('EPSG:',substring-after(sams:shape/gml:Point/gml:pos/@srsName,'/def/crs/EPSG/0/'))"/>",
					            		</xsl:if>
					            		"srsName":"<xsl:value-of select="sams:shape/gml:Point/gml:pos/@srsName"/>"
					            	}
					            }
								</xsl:when>
							</xsl:choose>

						},
						"sampledFeature":"<xsl:value-of select="sf:sampledFeature/@xlink:href"/>"
					}
					<xsl:if test="position() != last()">
			          ,
			        </xsl:if>
				</xsl:for-each>
			]
		}

	</xsl:template>
	
	

</xsl:stylesheet>
