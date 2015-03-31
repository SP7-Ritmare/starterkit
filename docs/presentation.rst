Breve presentazione di SK e sue funzionalità
============================================

SK è un pacchetto software sviluppato dai ricercatori di SP7 -provenienti da diversi istituti del CNR- esperti nella realizzazione di Infrastrutture di dati e servizi geospaziali, nell’ambito del progetto RITMARE SP7.
Questa guida ha l'obiettivo di supportare i ricercatori ad abilitare servizi [[Interoperabilità|interoperabili]] per la condivisione di dati geospaziali e/o osservativi conformi agli standard nazionali ed internazionali.
In particolare, SK è rivolto principalmente ai gruppi di ricerca e/o istituti del progetto RITMARE che non dispongono di strumenti idonei allo scopo.

L'applicazione è stata sviluppata partendo da prodotti open source con l'aggiunta di alcuni moduli creati appositamente per meglio rispondere alle esigenze del progetto.
La suite offre **un ambiente per  la gestione, la pubblicazione e la visualizzazione di dati** (ed eventuale download) attraverso servizi web `standard<http://www.opengeospatial.org/>` dell'OGC per le seguenti macro-categorie di dati:
	
#. **mappe o layer** (strati informativi geografici). Permettendo di pubblicare, visualizzare i dati geografici, siano essi vettoriali, raster o coverage. Utilizza una soluzione open-source basata sulla piattaforma GeoNode, appositamente personalizzata per le esigenze di progetto. Essa supporta le principali operazioni per: caricamento dati, archiviazione dati, vestizione ed esposizione web (visualizzazione e/o accesso/download secondo interfacce standard WMS, WFS, WCS).	
#. **osservazioni** provenienti da sensori di varia natura (boe, glider, mooring,stazioni meteo, etc.). Utilizza una soluzione open-source basata sulle specifiche Sensor Web Enablement (SWE), come implementate dall'iniziativa denominata 52°North (52N). Essa supporta le principali operazioni per: caricamento dei dati osservativi, archiviazione e gestione dati in un Data Base Management System, esposizione delle osservazioni su web (secondo interfaccia standard SOS).
#. **documenti** (file di testo, fogli di calcolo, immagini ecc.).

Una delle funzionalità cruciali di SK è l'**ambiente per la metadatazione** denominato [[EDI]] che da la possibilità di creare, modificare e consultare i metadati relativi ai dati inseriti (risorse geografiche, dati osservativi  e documenti) che ne permettano la descrizione secondo standard nazionali e internazionali (Repertorio Nazionale dei Dati Territoriali – [[RNDT]], [[INSPIRE]] e [[SensorML]]).
I metadati, compilati attraverso questo modulo, sono semanticamente arricchiti 	per potenziare le funzioni di discovery successive e il loro reperimento da parte del ricercatore stesso o altri utenti abilitati (per approfondimenti: vedi [[EDI|pagina relativa]]).	

Inoltre SK permette di gestire (per ogni dato inserito) i permessi consentendo/non consentendo agli utenti registrati di:
* visualizzare	
* editare
* scaricare i dati


Lo SK viene rilasciato con licenza open source (GPL v.3.0) e distribuito in forma di macchina virtuale pronta per l’uso. Il prodotto, una volta installato mette a disposizione, con un'interfaccia utente facile ed intuitiva, gli strumenti e i servizi che costituiscono un nodo locale di [[Infrastruttura_di_Dati_Spaziali|Infrastruttura di Dati Spaziali]], con le caratteristiche sopra descritte.
