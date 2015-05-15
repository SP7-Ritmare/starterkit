<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <!-- Created By: Paolo Tagliolato - CNR ISMAR, CNR IREA in Milano - 2015-05-01T00:00:00Z -->
    <!-- Licence GPL 3 -->
    <xsl:output
            method="text"
            version="1.0"
            encoding="UTF-8"
            omit-xml-declaration="yes"
            indent="no"
            media-type="text"/>

<xsl:template match="/">
{
    "layers": [<xsl:for-each select="//LayerDescription">
        {
            "name":"<xsl:value-of select="./@name"/>",
            "type":"<xsl:value-of select="./@owsType"/>"
        }<xsl:if test="position() != last()">,</xsl:if>
    </xsl:for-each>
    ]
}
</xsl:template>

</xsl:stylesheet>

