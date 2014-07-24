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


def grab(src, dest, name, force=False):
    download = True
    if not dest.exists() or force:
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

RNDT_BLOCK = "http://sp7.irea.cnr.it/jboss/MDService/rest/getEditor?template=RNDT&version=2.00&mode=block"
SENSORML_BLOCK = "http://sp7.irea.cnr.it/jboss/MDService/rest/getEditor?template=SensorML2&version=2.00&mode=block"

BUTTON = """
  <div id="bottone" class="form-actions">
    <button id="postButton" class="btn btn-primary">{% trans "Update metadata" %}</button>
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

LEGEND = """
<li>
<blockquote>
<h3>Field types</h3>
<p class="text-error">Required (to save the form)</p>
<p class="text-info">Mandatory (to RNDT/INSPIRE compliance)</p>
<p class="">Optional (to RNDT/INSPIRE compliance)</p>
</blockquote>
</li>
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
        grab(src, dest, dest, force=True)
        
    rndt_dest = download_dir / 'rndt_block.html'
    grab(RNDT_BLOCK, rndt_dest, rndt_dest, force=True)
    _clean_edi_block(rndt_dest)
    static_dir = path('geosk/static/edi/js/')

    sensorml_dest = download_dir / 'sensorml_block.html'
    grab(SENSORML_BLOCK, sensorml_dest, sensorml_dest, force=True)
    _clean_edi_block(sensorml_dest)
    static_dir = path('geosk/static/edi/js/')

    for src in EDI_STATICS:
        u = urlparse.urlparse(src)
        version = urlparse.parse_qs(u.query).get('version',['1.00'])[0]
        srcfile = download_dir / version / os.path.basename(u.path)
        justcopy(srcfile, static_dir / version )

    # custom mdeditor.js
    #  justcopy(path('modified') / "mdeditor.js", static_dir)

    template_dir = path('geosk/mdtools/templates/mdtools/')
    justcopy(rndt_dest, template_dir)

    template_dir_osk = path('geosk/osk/templates/osk/')
    justcopy(sensorml_dest, template_dir_osk)

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

        s_script = unicode(s.script)
        s_div = unicode(s.div)

        # remove white spaces in textarea
        # # Double curly brackets to avoid problems with .format()
        # stripped_s_div = s_div.replace('{','{{').replace('}','}}')
        # stripped_s_div = BeautifulSoup(stripped_s_div)
        # unformatted_tag_list = []
        # for i, tag in enumerate(stripped_s_div.div.find_all(['textarea',])):
        #     unformatted_tag_list.append(unicode(tag))
        #     tag.replace_with('{' + 'unformatted_tag_list[{0}]'.format(i) + '}')
        # print unformatted_tag_list[1][100:]
        # s_div = stripped_s_div.div.prettify().format(unformatted_tag_list=unformatted_tag_list)

        f.seek(0)
        f.write('{% load i18n %}')
        f.write(s_script.encode('utf8'))
        f.write(s_div.encode('utf8'))
        f.truncate()

def _clean(s):
    # remove the tile
    tag = s.find('h1')
    if tag is not None:
        tag.extract()
    
    # rimuovo il bottone per il Post
    tag = s.find(id='bottone')
    if tag is not None:
        tag.extract()

    # aggiungo bottone alla fine dell'ultima section
    # s.find_all('section')[-1].append(BUTTON)
    s.find_all('section')[-1].append(BeautifulSoup(BUTTON).button)
    # s.find_all('div', 'bs-docs-sidebar').append(BeautifulSoup(BUTTON).button)
    # s.find(id='myTab').append(BeautifulSoup(LEGEND).li)

    # rimuovo il form, perche' mi da problemi di formattazione
    tag = s.find(id='theForm')
    if tag is not None:
        tag.unwrap()
        
    # nascondo alcuni fastidiosi input hidden che occupano spazio non necessario
    for el_id in ['resp_md_4', 'resp_md_5', 'resp_md_6',]:
        tag=s.find(id=el_id)
        if tag:
            parent = tag.find_parent("div")
            parent['style']='display: none;'


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
