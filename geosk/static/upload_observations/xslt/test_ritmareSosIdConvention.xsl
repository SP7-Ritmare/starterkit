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

<xsl:import href="ritmareSosIdConvention.xsl"/>
<xsl:output
	method="xml"
	version="1.0"
	encoding="UTF-8"
	omit-xml-declaration="no"
	indent="yes"	
	media-type="text"/>


<xsl:param name="SK_DOMAIN_NAME"/>
<xsl:param name="PROCEDURE_ID"/>
<xsl:param name="SRS"/>
<xsl:param name="SPATIAL_SAMPLING_POINT_X"/>
<xsl:param name="SPATIAL_SAMPLING_POINT_Y"/>

<!--xsl:include href="ritmareSosIdConvention.xsl"/-->


<xsl:template match="/">
	{
		param_here:{
			"SK_DOMAIN_NAME":"<xsl:value-of select="$SK_DOMAIN_NAME"/>",
			"PROCEDURE_ID":"<xsl:value-of select="$PROCEDURE_ID"/>",
			"SRS":"<xsl:value-of select="$SRS"/>",
			"SPATIAL_SAMPLING_POINT_X":"<xsl:value-of select="$SPATIAL_SAMPLING_POINT_X"/>",
			"SPATIAL_SAMPLING_POINT_Y":"<xsl:value-of select="$SPATIAL_SAMPLING_POINT_Y"/>",
		},
		constants_from_imported:{
			"baseurl_sp7":"<xsl:value-of select="$baseurl_sp7"/>",
			"app_name":"<xsl:value-of select="$app_name"/>",
			"observation_type":"<xsl:value-of select="$observation_type"/>",
		}
		output_from_imported:{
			"observed_properties_compound_id":"<xsl:value-of select="$observed_properties_compound_id"/>",
			"foi_id":"<xsl:value-of select="$foi_id"/>",
			"result_template_id":"<xsl:value-of select="$result_template_id"/>",
		},		
		<xsl:variable name="PROCEDURE_ID" select="'nuovaProcedure____'"/>
		<xsl:variable name="OFFERING_ID" select="'nuovaOffering____'"/>
		<xsl:apply-imports/>
		output_from_imported_after_runtime_execution:{
			"observed_properties_compound_id":"<xsl:value-of select="$observed_properties_compound_id"/>",
			"foi_id":"<xsl:value-of select="$foi_id"/>",
			"result_template_id":"<xsl:value-of select="$r_result_template_id"/>",
			"offering_id":"<xsl:value-of select="$r_offering_id"/>",


		}
	}

<!-- COSTANTI -->


<!-- Valori presi da describeSensor (documento in input)-->


<!-- vaori calcolati secondo pattern -->


<!--  -->
</xsl:template>
</xsl:stylesheet> 