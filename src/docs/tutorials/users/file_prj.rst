.. _file_prj:

=========
PRJ file
=========

.. toctree::
   :maxdepth: 3

Il file con estensione "prj" contiene l'informazione sul sistema di coordinate di uno shapefile, espresso in Well-Known Text.
E' un file opzionale, spesso i sistemi GIS riescono a individuare il corretto sistema di riferimento anche in sua assenza, ma spesso la sua mancanza o la sua scrittura errata (bag dei software GIS), generano errori di sovrapposizione/visualizzazione dello shapefile.


Per questo motivo è sempre consigliabile conservare assieme ai files di estensione shp, dbf, shx anche il file prj.


Uno shapefile è composto dai seguenti files:

File obbligatori:

* .shp - il file che conserva le geometrie;
* .shx - il file che conserva l'indice delle geometrie;
* .dbf - il database degli attributi.

File opzionali:

* .sbn e .sbx - indici spaziali;
* .fbn e .fbx - indici spaziali delle feature in sola lettura;
* .ain e .aih - indici attributari dei campi della tabella;
* .prj - il file che conserva l'informazione sul sistema di coordinate, espresso in Well-Known Text;
* .shp.xml - metadato dello shapefile;
* .atx - indice attributario della tabella (file .dbf) nella forma 


Da questo sito è possibile ricercare il codice da utilizzare per il nostro file ".prj" in caso di problemi:



http://spatialreference.org/ref/



E' sufficiente selezionare il sistema di riferimento del nostro shapefile dalla lista e scaricare il file ".prj" fornito. Successivamente il file va rinominato con il nome dello shapefile mantenendo la stessa estensione.

