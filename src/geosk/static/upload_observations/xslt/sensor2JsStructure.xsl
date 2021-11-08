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
        <!-- Created By: Paolo Tagliolato - CNR IREA in Milano - 2014-06-07T00:00:00Z -->
        <!-- Licence CC By SA 3.0  http://creativecommon.org/licences/by-SA/3.0 -->

    <!-- without this declaration the position() of the nodes in node-set is not
         what one could expected: xslt processor includes empty text nodes (e.g. newlines) within context -->
    <xsl:strip-space elements="*" />

<xsl:output
        method="text"
        version="1.0"
        encoding="UTF-8"
        omit-xml-declaration="yes"
        indent="yes"
        media-type="text"/>

    <xsl:template match="/">
  {
    "resultStructure":[
        <xsl:call-template name="phenomenonTime" />
        <xsl:call-template name="par"/>
    ],
    "resultEncoding":{
      "textEncoding":{
        "tokenSeparator":"@",
        "blockSeparator":"#"
        }
    },
    "offerings":[<xsl:call-template name="offerings"/>]
  }
    </xsl:template>

    <xsl:template name="phenomenonTime">{
            "fieldName":"phenomenonTime",
            "fieldType":"swe:Time",
            "fieldDefinition":"http://www.opengis.net/def/property/OGC/0/PhenomenonTime",
            "uom_code_value":"",
            "uom_code_href":""
        }</xsl:template>

    <xsl:template name="par">
        <xsl:for-each select="//sml:output[@name!='phenomenonTime']">,
        {
            "fieldName":"<xsl:value-of select="translate(./@name,' ','_')"/>",
            "fieldType":"<xsl:value-of select="name(./*[1])"/>",
            "fieldDefinition":"<xsl:value-of select="./*[1]/@definition"/>",
            "uom_code_value":"<xsl:value-of select=".//swe1:uom/@code"/>",
            "uom_code_href":"<xsl:value-of select=".//swe1:uom/@xlink:href"/>"
        }</xsl:for-each>
    </xsl:template>
<!--
    <sml:capabilities name="offerings">
        <swe:SimpleDataRecord>
            <swe:field name="Offering for sensor offering:http://sp7.irea.cnr.it/procedure/PuntaSaluteCanalGrande">
                <swe:Text definition="http://www.opengis.net/def/offering/identifier">
                    <swe:value>offering:http://sp7.irea.cnr.it/procedure/PuntaSaluteCanalGrande/observations</swe:value>
                </swe:Text>
            </swe:field>
        </swe:SimpleDataRecord>
    </sml:capabilities>
-->
    <xsl:template name="offerings">
        <xsl:for-each select="//sml:capabilities[@name='offerings']//swe1:Text[@definition='http://www.opengis.net/def/offering/identifier']">
            "<xsl:value-of select="./swe1:value"/>"
        </xsl:for-each>
    </xsl:template>
    <!-- avoid matching text (default xslt template)-->
    <xsl:template match="text()"/>

</xsl:stylesheet>