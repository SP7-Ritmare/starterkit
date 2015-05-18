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
        <!-- Licence CC By SA 3.0  http://creativecommon.org/licences/by-SA/3.0 -->
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


<!--<xsl:include href="ritmareSosIdConvention.xsl"/>-->

<xsl:param name="PHENOMENON_TIME"/><!-- es. momento in cui prelevo campione -->
<!-- SE NON SPECIFICATO LO SI DEVE TROVARE COME FIELD NEL RESULT
potrebbe essere per esempio:

<gml:TimePeriod gml:id="phenomenonTime">
                    <gml:beginPosition>2012-11-19T13:30:00+02:00</gml:beginPosition>
                    <gml:endPosition>2012-11-19T13:44:00+02:00</gml:endPosition>
                </gml:TimePeriod>	
                
oppure:

 <gml:TimeInstant gml:id="resultTime">
                    <gml:timePosition>2012-11-19T13:50:00+02:00</gml:timePosition>
                </gml:TimeInstant>
  -->
  
<xsl:param name="RESULT_TIME_TIME_POSITION_ISO">DEFAULT</xsl:param><!-- es: momento in cui ho il risultato dell'analisi -->
<!--  qui ho bisogno di un time instant necessariamente: il parametro sarà solo il timestamp iso
<gml:TimeInstant gml:id="resultTime">
    <gml:timePosition>2012-11-19T13:50:00+02:00</gml:timePosition>
</gml:TimeInstant>
  -->
<!--<xsl:param name="FOI"/> poi vediamo... -->


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

<!-- COSTANTI -->

<!-- Valori presi da describeSensor (documento in input)-->
<xsl:variable name="PROCEDURE_ID" select="//sml:identifier[@name='uniqueID']/sml:Term/sml:value"/>
<xsl:variable name="OFFERING_ID" select="//sml:capabilities[@name='offerings']//swe1:Text[@definition='http://www.opengis.net/def/offering/identifier']/swe1:value"/>

<!-- vaori calcolati secondo pattern -->
<xsl:variable name="OBSERVED_PROPERTIES_COMPOUND_ID"><xsl:value-of select="$PROCEDURE_ID"/>/observedProperty/compound</xsl:variable>

<!-- *****************************************************
     TODO: valutare se modificare <RESULT_TEMPLATE_ID> in:
     PROCEDURE_ID/template?observedProperty=<Escape(OBSERVED_PROPERTIES_COMPOUND_ID)>&featureofinterest=<Escape(FOI_ID)>
     dove Escape(FOI_ID) contiene il foi_id url_escaped (analogamente la observed property)
     + Contro: 
        1. in questo modo l'url della procedura risulta ridondante ()
        2. bisogna valutare se <Escape(RESULT_TEMPLATE_ID)> usato nelle chiamate a insertResult e gerResultTemplate dia problemi.
     + Pro:
        1. quando si avesse una FOI con id differente (inserita per esempio tramite servizi) sarebbe lo stesso possibile usare il form web sviluppato che attualmente gestisce in modo sensato solo entita' identificate unicamente secondo la convenzione.
********************************************************** -->
<xsl:variable name="RESULT_TEMPLATE_ID"><xsl:value-of select="$PROCEDURE_ID"/>/template/observedProperty/compound/foi/SSF/SP/<xsl:value-of select="$SRS"/>/<xsl:value-of select="$SPATIAL_SAMPLING_POINT_X"/>/<xsl:value-of select="$SPATIAL_SAMPLING_POINT_Y"/></xsl:variable>

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
<sos:InsertResultTemplate service="SOS" version="2.0.0"
 xsi:schemaLocation="http://www.opengis.net/sos/2.0 http://schemas.opengis.net/sos/2.0/sosInsertResultTemplate.xsd http://www.opengis.net/om/2.0 http://schemas.opengis.net/om/2.0/observation.xsd  http://www.opengis.net/samplingSpatial/2.0 http://schemas.opengis.net/samplingSpatial/2.0/spatialSamplingFeature.xsd">
	
	<sos:proposedTemplate>
        <sos:ResultTemplate>
<!-- NOTA: ID VA INDICATO: questo servira' dopo per effettuare inserimenti con FOI variabile -->
			<swes:identifier>
				<xsl:value-of select="$RESULT_TEMPLATE_ID"/>
			</swes:identifier>
            
<!-- VAL ID DELLA OFFERING -->
            <sos:offering><xsl:value-of select="$OFFERING_ID"/></sos:offering>            
            
            <sos:observationTemplate>
				<!-- GMLID DELL'OSSERVAZIONE (ma è obbligatorio !?) -->
                <!--  om:OM_Observation gml:id="sensor2obsTemplate">--> 
                <om:OM_Observation gml:id="{$OBSERVATION_ID}">
                
                
					<!--  gestiamo solo un tipo di osservazione, come dichiarato -->
                    <om:type xlink:href="{$OBSERVATION_TYPE}"/>
                    
						<!-- DUBBIO: i nilreason significano che i valori non ci sono perché è template ?!!  -->
                    <om:phenomenonTime nilReason="template"/><!-- qui in insertObservation avrei gml:TimePeriod/gml:beginPosition e endPosition -->
                    <om:resultTime nilReason="template"/><!-- come sopra ma solo un timeposition  -->
                    
					<!-- VAL: PROCEDURE  -->
                    <om:procedure xlink:href="{$PROCEDURE_ID}"/>

<!--  COMPOUND_OBSERVED_PROPERTY -->
                    <om:observedProperty xlink:href="{$OBSERVED_PROPERTIES_COMPOUND_ID}"/>      
                    

<!-- VAL ? FOI: ALE, come la gestiamo? deve essere posizione fissa da far scegliere all'utente una volta per tutte? -->
<!-- esiste anche, in sensorML l'elemento:

<sml:capabilities name="featuresOfInterest">
                <swe:SimpleDataRecord>
                  <swe:field name="featureOfInterestID">
                    <swe:Text>
                      <swe:value>http://sp7.irea.cnr.it/featureOfInterest/PuntaSaluteCanalGrande</swe:value>
                    </swe:Text>
                  </swe:field>
                </swe:SimpleDataRecord>
              </sml:capabilities>

Si può usare quello? (dubito: non ha la struttura adeguata a o&m 2). Ma quello che cos'è??
-->
					<om:featureOfInterest>
						<xsl:copy-of select="$FOI_CONTENT_SSF_SP"/>
                    </om:featureOfInterest>

                    <om:result/>
                </om:OM_Observation>
            </sos:observationTemplate>

            <!-- *** FINAL *** -->
            <!-- scelta la coppia offering,property (property qui e'compound) resultStructure non varia tra i vari template -->
            <!-- result structure e' l'unica parte restituita da getResultTemplate -->
            <sos:resultStructure>
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
									<xsl:attribute name="name"> <xsl:value-of select="translate(@name,' ','_')"/></xsl:attribute>
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
            </sos:resultStructure>
            <sos:resultEncoding>
<!-- COSTANTE da decidere -->           
            	<swe:TextEncoding tokenSeparator="#" blockSeparator="@"/>
            </sos:resultEncoding>
        </sos:ResultTemplate>
    </sos:proposedTemplate>
</sos:InsertResultTemplate>

<!--  -->
</xsl:template>
</xsl:stylesheet> 