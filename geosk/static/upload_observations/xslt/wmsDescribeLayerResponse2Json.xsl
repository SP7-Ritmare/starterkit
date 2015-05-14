<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
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

