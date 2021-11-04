.. _utilizzo_wms:

========================
Using WMS services
========================

.. toctree::
   :maxdepth: 3

**immagini da caricare - pagina provvisioria - da sistemare**


I servizi Web Map Services o **WMS**, come quelli offerti dal GET-IT o dal Portale Cartografico Nazionale (PCN), sono generalmente utilizzati attraverso software client-desktop come software GIS (es: QGIS, ArcView ecc.) oppure attraverso applicazioni web ( es: portale del PCN: http://www.pcn.minambiente.it/viewer/).

Questi applicativi sono in grado di visualizzare l'elenco dei layer forniti dal servizio scelto, inserendo la 
[[ServiziEsterni|<big>URL</big>]] del servizio, e di visualizzare sulla mappa i layer desiderati.

Vediamo ora due esempi di visualizzazione layer WMS con gli applicativi:

* Viewer del PCN
* Qgis desktop


Viewer PCN:
------------



Aprire la pagina del PCN: http://www.pcn.minambiente.it

e cliccare sul pulsante "cartografia 2D" in altoalla pagina.
Si aprirà così il visualizzatore mappe del PCN che permette di caricare sia i layer forniti dal loro portale, sia servizi wms-layer esterni.

I layer possono essere aggiunti alla mappa tramite i pannello di strumenti che presenta i comandi:
Vettoriali, Immagini, Grid, Servizi, Progetti.

Per aggiungere un  wms esterno cliccare su "Servizi" e successivamente su "WMS" con doppio-click del mouse: si aprirà la finestra sottostante:


[[File:about_wms_1.png|passo 1]]

Qui è necessario riportare l'[[ServiziEsterni|<big>URL</big>]] di un servizio esterno come nell'esempio:


[[File:about_wms_2.png|passo 2]]


Ora selezioanre dalla lista dei layer, forniti dal servizio scelto, i layer che si desidera aggiungere alla mappa e, opzionalmente, indicare anche lo stile per ogni layer (dove disponibile). Quindi cliccare sul pulsante "aggiungi layer:


[[File:about_wms_3.png|passo 3]]


Il risultato finale sarà questo:

[[File:about_wms_5.png|risultato finale]]




QGIS Desktop
-------------

Per aggiungere un layer wms alla mappa selezionare dal menù "layer" oppure direttamente dalla toolbar il comando "aggiungi layer WMS/WMTS":



[[File:wms_qgis_1.png|passo 1]]


Compilare il campo Nome e il campo [[ServiziEsterni|<big>URL</big>]]. 


Questo è già sufficeiente, ma in caso di errore di connessione, provare selezionando le due caselle:

* "Ignora la URI GetMap riportata nelle capabilities"

* "Ignora la URI GetFeatureInfo riportata nelle capabilities"

Cliccare su "ok" per salvare.


[[File:wms_qgis_2.png|passo 2]]


Selezionare dal menù a tendina il servizio appena memorizzato e cliccare su "connetti"
Comparirà ora l'elenco dei layer wms disponibili (spesso è necessario attendere un po' di tempo), dal quale è possibile selezionre uno o più layer di prorpio interesse e aggiungerli alla mappa cliccando su "aggiungi".

Quando finito cliccare su "chiudi".

[[File:wms_qgis_3.png|passo 3]]

Allo stesso modo possonoessere aggiunti altri tipi di servizi: WFS, WCS ecc., è sufficiente selezionare dal menù "layer" la voce corrispondente. 


