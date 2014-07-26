<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:sos="http://www.opengis.net/sos/2.0" 
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
	xmlns:ows="http://www.opengis.net/ows/1.1" 
	xmlns:xlink="http://www.w3.org/1999/xlink" 
	xmlns:fes="http://www.opengis.net/fes/2.0" 
	xmlns:swes="http://www.opengis.net/swes/2.0" 
	xmlns:swe="http://www.opengis.net/swe/2.0"
	xmlns:gml="http://www.opengis.net/gml/3.2" 
	xsi:schemaLocation="http://www.opengis.net/fes/2.0 http://schemas.opengis.net/filter/2.0/filterAll.xsd http://www.opengis.net/swes/2.0 http://schemas.opengis.net/swes/2.0/swes.xsd http://www.opengis.net/sos/2.0 http://schemas.opengis.net/sos/2.0/sosGetCapabilities.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd http://www.opengis.net/ows/1.1 http://schemas.opengis.net/ows/1.1.0/owsAll.xsd"
>
<xsl:output
	method="text"
	version="1.0"
	encoding="UTF-8"
	omit-xml-declaration="yes"
	indent="yes"
	media-type="application/json"/>
	
	<xsl:param name="para1"></xsl:param>
	<xsl:param name="para2"></xsl:param>
	<xsl:template match="//sos:resultStructure/swe:DataRecord">
		[
		<xsl:for-each select="//swe:field">
			{
			"fieldName":"<xsl:value-of select="./@name"/>",
			"fieldType":"<xsl:value-of select="name(./*[1])"/>",
			"fieldDefinition":"<xsl:value-of select="./*[1]/@definition"/>",
			"uom_code_value":"<xsl:value-of select=".//swe:uom/@code"/>",
			"uom_code_href":"<xsl:value-of select=".//swe:uom/@xlink:href"/>",
			"para1":"<xsl:value-of select="$para1"/>",
			"para2":"<xsl:value-of select="$para2"/>"
			}
			<xsl:if test="position() != last()">
	          ,
	        </xsl:if>
		</xsl:for-each>
		]
	</xsl:template>
	
</xsl:stylesheet>