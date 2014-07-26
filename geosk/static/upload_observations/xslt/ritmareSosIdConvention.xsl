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
        <!-- Created By: Alessandro Oggioni & Paolo Tagliolato - CNR IREA in Milano - 2014-06-07T00:00:00Z -->
        <!-- Licence CC By SA 3.0  http://creativecommon.org/licences/by-SA/3.0 -->
<xsl:output
	method="xml"
	version="1.0"
	encoding="UTF-8"
	omit-xml-declaration="no"
	indent="yes"	
	media-type="text/xml"/>

<!--
-->

<xsl:param name="URI_SK" />
<xsl:param name="PROCEDURE_ID" />
<xsl:param name="SRS" />
<xsl:param name="SPATIAL_SAMPLING_POINT_X"/>
<xsl:param name="SPATIAL_SAMPLING_POINT_Y"/>

<xsl:variable name="uri_sk" select="$URI_SK"/>
<xsl:variable name="procedure_id" select="$PROCEDURE_ID"/>
<xsl:variable name="srs" select="$SRS"/>
<xsl:variable name="spatial_sampling_point_x" select="$SPATIAL_SAMPLING_POINT_X"/>
<xsl:variable name="spatial_sampling_point_y" select="$SPATIAL_SAMPLING_POINT_Y"/>



<xsl:variable name="baseurl_sp7" select="'http://sp7.irea.cnr.it/'"/>
<xsl:variable name="app_name" select="'sensors'"/>



<xsl:variable name="observation_type" select="'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_SWEArrayObservation'"/>

<!--xsl:template match="/"-->

<!-- COSTANTI -->

<!-- Valori presi da describeSensor (documento in input)-->


<!-- vaori calcolati secondo pattern -->
<xsl:variable name="observed_properties_compound_id"><xsl:value-of select="$procedure_id"/>/observedProperty/compound</xsl:variable>

<xsl:variable name="foi_id"><xsl:value-of select="$baseurl_sp7"/><xsl:value-of select="$app_name"/>/<xsl:value-of select="$uri_sk"/>/foi/SSF/SP/<xsl:value-of select="$srs"/>/<xsl:value-of select="$spatial_sampling_point_x"/>/<xsl:value-of select="$spatial_sampling_point_y"/></xsl:variable>

<xsl:variable name="result_template_id"><xsl:value-of select="$procedure_id"/>/template/observedProperty/compound/foi/SSF/SP/<xsl:value-of select="$srs"/>/<xsl:value-of select="$spatial_sampling_point_x"/>/<xsl:value-of select="$spatial_sampling_point_y"/></xsl:variable>


<xsl:variable name="OFFERING_ID"/>
   
<!-- Inizio output -->
<xsl:template match="/">
<!--  here we can define other variables -->
<!-- sovrascrivo procedure_id -->
    <xsl:variable name="r_procedure_id" select="$PROCEDURE_ID"/>
    <xsl:variable name="r_offering_id" select="$OFFERING_ID"/>
    <xsl:variable name="observed_properties_compound_id"><xsl:value-of select="$r_procedure_id"/>/observedProperty/compound</xsl:variable>
 
    <xsl:variable name="foi_id"><xsl:value-of select="$baseurl_sp7"/><xsl:value-of select="$app_name"/>/<xsl:value-of select="$uri_sk"/>/foi/SSF/SP/<xsl:value-of select="$srs"/>/<xsl:value-of select="$spatial_sampling_point_x"/>/<xsl:value-of select="$spatial_sampling_point_y"/></xsl:variable>

    <xsl:variable name="r_result_template_id"><xsl:value-of select="$r_procedure_id"/>/template/observedProperty/compound/foi/SSF/SP/<xsl:value-of select="$srs"/>/<xsl:value-of select="$spatial_sampling_point_x"/>/<xsl:value-of select="$spatial_sampling_point_y"/></xsl:variable>


</xsl:template>
</xsl:stylesheet> 