.. _sistemi_riferimento:

========================
Italian Reference System
========================

.. toctree::
   :maxdepth: 3

In Italia per fare cartografia vengono utilizzati diversi sistemi di riferimento , è importante conoscerli per assegnare quello corretto al nostro dato geografico e poterlo visualizzare assieme ad altri su un sistema **GIS/web-GIS**.

Tutti i Sistemi di riferimento sono codificati dall'European Petroleum Survey Group o **EPSG**, questa è un'organizzazione scientifica con collegamenti con l'industria europea del petrolio composta da specialisti in geodesia applicata, analisi e cartografia riferita alla ricerca del petrolio.
EPSG compila e distribuisce i “set di parametri geodetici EPSG”, un database degli ellissoidi terrestri, datum geodetici, sistemi di coordinate geografiche e proiettate e unità di misura.

Quando si copia uno shapefile e soprattutto quando lo si carica su un GIS, è importante caricare anche il file ".prj" che contiene le informazioni sulla proiezione in uso. Senza questo file lo shapefile potrebbe essere visualizzato in maniera errata.



Principali Sistemi di Riferimento in uso in Italia
---------------------------------------------------

* **Sistema di riferimento ufficiale italiano dal 2011**: ETRF2000 (ETRS89) suddiviso nei fusi UTM 32 e 33; EPSG 32632 e 32633.

:http://spatialreference.org/ref/epsg/32632/

:http://spatialreference.org/ref/epsg/32633/

* Gauss Boaga Roma 40; EPSG fuso ovest 3003, EPSG fuso est 3004.

:http://spatialreference.org/ref/epsg/3003/

:http://spatialreference.org/ref/epsg/3004/
 
* WGS84; EPSG 4326.

:http://spatialreference.org/ref/epsg/4326/

*WGS84 Pseudomercatore; EPSG 3857 (equivalente a 900913).

:http://spatialreference.org/ref/sr-org/6864/




Alcuni link di approfondimento:
--------------------------------

http://www.epsg.org/

http://www.ing.unitn.it/~zatelli/cartografia_numerica/slides/Sistemi_di_riferimento.pdf

http://www.ing.unitn.it/~zatelli/cartografia_numerica/slides/Sistemi_di_riferimento_italiani.pdf

http://it.wikipedia.org/wiki/Datum_geodetico

http://www.ingenio-web.it/immagini/Articoli/PDF/0O5BUILO2U.pdf


