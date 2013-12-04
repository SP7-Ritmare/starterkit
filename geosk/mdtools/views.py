import json
import logging

from django.http import HttpResponse
from django.forms import model_to_dict
from django.core.serializers.json import DjangoJSONEncoder

from geonode.layers.forms import LayerForm
from geonode.layers.models import Layer
from geonode.maps.forms import MapForm
from geonode.maps.models import Map

logger = logging.getLogger(__name__)

def get_data_api(request, format='json'):
    if request.method not in ('GET','POST'):
        return HttpResponse(status=405)

    rtype = request.REQUEST.get('rtype')
    id = request.REQUEST.get('id')

    if rtype == 'layer':
        r = Layer.objects.get(pk=id)
        exclude = LayerForm._meta.exclude
    elif rtype == 'map':
        r = Map.objects.get(pk=id)
        exclude = MapForm._meta.exclude

    exclude = exclude + ('owner', 'title', 'distribution_url', 'distribution_description')
    data = model_to_dict(r, exclude=exclude)

    #f=LayerForm(model_to_dict(l), prefix='layer')
    

    data['keywords'] = r.keyword_csv
    # data_prefix = {"layer-%s" % k: v for k, v in data.items()}

    results = {
        'data': data
        }
    return HttpResponse(json.dumps(results, cls=DjangoJSONEncoder), mimetype="application/json")

