import os
import urllib
import zipfile
import shutil
import urlparse

from bs4 import BeautifulSoup

from paver.easy import *

try:
    from paver.path import pushd
except ImportError:
    from paver.easy import pushd


def grab(src, dest, name):
    download = True
    if not dest.exists():
        print 'Downloading %s' % name
    # elif not zipfile.is_zipfile(dest):
    #    print 'Downloading %s (corrupt file)' % name
    else:
        download = False
    if download:
        urllib.urlretrieve(str(src), str(dest))


EDI_STATICS = [
    "http://sp7.irea.cnr.it/jboss/MDService/rest/xml2json.js",
    "http://sp7.irea.cnr.it/jboss/MDService/rest/json2xml.js",
    "http://sp7.irea.cnr.it/jboss/MDService/rest/langs.js",
    "http://sp7.irea.cnr.it/jboss/MDService/rest/spin.js",
    #"http://sp7.irea.cnr.it/jboss/MDService/rest/mdeditor.js",
    "http://sp7.irea.cnr.it/jboss/MDService/rest/mdeditor.js?version=2.00",
    ]

EDI_BLOCK = "http://sp7.irea.cnr.it/jboss/MDService/rest/getEditor?template=RNDT&version=2.00&mode=block"

EDI_FULL = "http://sp7.irea.cnr.it/jboss/MDService/rest/getEditor?template=RNDT&version=2.00"

BUTTON = """
  <div id="bottone" class="form-actions">
    <button id="postButton" class="btn btn-primary">Aggiorna metadati</button>
  </div>
"""

DUPLICATE_BUTTON = """
    <div class="duplicate-block">
      <a href="javascript:void();"><i class="icon-plus duplicator"  duplicates="%s"> Add new block </i></a>
    </div>
"""

DELETE_DUPLICATE_BUTTON = """
      <a href="javascript:void();"><i class="icon-remove"> Remove </i></a>
"""

@task
def setup_edi(options):
    download_dir = path('downloaded')
    if not download_dir.exists():
        download_dir.makedirs()
    for src in EDI_STATICS:
        # get version (if defined)
        u = urlparse.urlparse(src)
        version = urlparse.parse_qs(u.query).get('version',['1.00'])[0]
        dest = download_dir / version / os.path.basename(u.path)
        grab(src, dest, dest)
        
    edi_dest = download_dir / 'rndt_block.html'
    grab(EDI_BLOCK, edi_dest, 'edi')
    _clean_edi_block(edi_dest)

    static_dir = path('geosk/static/edi/js/')
    for src in EDI_STATICS:
        u = urlparse.urlparse(src)
        version = urlparse.parse_qs(u.query).get('version',['1.00'])[0]
        srcfile = download_dir / version / os.path.basename(u.path)
        justcopy(srcfile, static_dir / version )

    # custom mdeditor.js
    #  justcopy(path('modified') / "mdeditor.js", static_dir)

    template_dir = path('geosk/mdtools/templates/mdtools/')
    justcopy(edi_dest, template_dir)

@task
def update_statics(options):
    sh('django-admin  collectstatic --settings=geosk.settings --noinput -i externals -i node_modules -i SOSClient')

def _clean_edi_block(src):    
    with open(src, 'r+') as f:
        html_doc = f.read()
        s = BeautifulSoup(html_doc)
        _clean(s)
        # attenzione se ci sono altri tag li ignora
        s_script = s.script.prettify()
        s_div = s.div.prettify()
        f.seek(0)
        f.write(s_script.encode('utf8'))
        f.write(s_div.encode('utf8'))
        f.truncate()

def _clean(s):
    # rimuovo il bottone per il Post
    tag = s.find(id='bottone')
    if tag is not None:
        tag.extract()

    # aggiungo bottone alla fine dell'ultima section
    # s.find_all('section')[-1].append(BUTTON)
    s.find_all('section')[-1].append(BeautifulSoup(BUTTON).button)
    # s.find_all('div', 'bs-docs-sidebar').append(BeautifulSoup(BUTTON).button)

    # rimuovo il form, perche' mi da problemi di formattazione
    tag = s.find(id='theForm')
    if tag is not None:
        tag.unwrap()
        
    # nascondo alcuni fastidiosi input hidden che occupano spazio non necessario
    for el_id in ['resp_md_4', 'resp_md_5', 'resp_md_6',]:
        tag=s.find(id=el_id).find_parent("div")
        tag['style']='display: none;'


    # modifico il bottone per l'aggiunta di un nuovo blocco
    #
    # ora basta cambiare il colore
    # for  b in s.select('button[duplicates]'):
    #     b.replace_with(BeautifulSoup(DUPLICATE_BUTTON % b['duplicates']).div)
    #
    for  b in s.select('button[duplicates]'):
        b['class'] = 'btn btn-mini duplicator'
        

# jquery di correzione pulsante
#
# $('button[removes]').each(
#    function(){
#        var label = $(this).parent().find('label').first();
#        //$(this).appenTo(label);
#        //<button removes="resp_md_XritX" id="resp_md_XritX_remover" type="button" class="btn btn-mini btn-danger">X</button>
#        label.append('<a href="javascript:void();"><i class="icon-remove"> Remove </i></a>');
#    }
# );
    

def justcopy(origin, target):
    import shutil
    if os.path.isdir(origin):
        shutil.rmtree(target, ignore_errors=True)
        shutil.copytree(origin, target)
    elif os.path.isfile(origin):
        if not os.path.exists(target):
            os.makedirs(target)
        shutil.copy(origin, target)
