.. _conversionegeotiff:

========================
Conversione Tiff-GeoTiff
========================
.. toctree::
   :maxdepth: 3

I raster in formato TIFF con annesso tfw (Tiff World File) spesso non contengono le informazioni complete per permettere la corretta rappresentazione su GIS/WEBGIS. Quasi sempre manca infatti la descrizione della proiezione. E' quindi conveniente utilizzare il formato GEOTIFF, ormai molto più diffuso.


GeoTIFF è un tipo di metadati, rilasciato nel pubblico dominio, che permette di incorporare riferimenti geografici all'interno di un'immagine TIFF. Potenzialmente, può includere proiezioni, ellissoidi, datum, coordinate, e tutto ciò che è necessario per stabilire l'esatto riferimento spaziale per il file. Il formato GeoTIFF è completamente compatibile con le specifiche TIFF 6.0, per cui i software non in grado di interpretare i metadati li ignoreranno, rimanendo però in grado di visualizzare l'immagine (http://it.wikipedia.org/wiki/GeoTIFF).


Di seguito illustreremo la procedura di conversione di un raster nel formato GeoTIFF tramite software QGIS.

Caricare il raster da convertireo sula mappa
Selezionare il raster dall'elenco dei Layer
Selezionare il comando "salva con nome" dal menù "Layer"
Inserire il percorso e il nome del file in cui salvare il raster
Verificare che il sistema di riferimento selezionato sia corretto e eventualmente modificarlo
Schiacciare "OK" per salvare il raster
