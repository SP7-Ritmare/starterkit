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
    <!-- Created By: Paolo Tagliolato - CNR ISMAR, CNR IREA in Milano - 2014-06-07T00:00:00Z -->
    <!-- Licence GPL 3 -->
<xsl:output
	method="text"
	version="1.0"
	encoding="UTF-8"
	omit-xml-declaration="yes"
	indent="yes"
	media-type="text"/>
	
	<xsl:template match="/">	
{"response":{		
		<xsl:if test="//ows:ExceptionReport">
			"ExceptionReport":{
				"code":"<xsl:value-of select="//ows:ExceptionReport/ows:Exception/@exceptionCode"/>",
				"text":"<xsl:value-of select="//ows:ExceptionReport/ows:Exception/ows:ExceptionText"/>"
			}
		</xsl:if>
		<xsl:if test="//sos:InsertResultTemplateResponse">
			"InsertResultTemplateResponse":{
				"acceptedTemplate":"<xsl:value-of select="//sos:InsertResultTemplateResponse/sos:acceptedTemplate"/>"
			}
		</xsl:if>
		<xsl:if test="//sos:InsertResultResponse">
			"InsertResultResponse":""
		</xsl:if>
	}
}
	</xsl:template>
	
</xsl:stylesheet>