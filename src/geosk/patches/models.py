from django.db import models

from django.contrib.auth.decorators import login_required


# patch https://github.com/GeoNode/geonode/commit/2832fc1959e50fa7034b03eaa79e83e8e7e475e1
from geonode.layers import views as layers_views
from geonode.layers.views import _resolve_layer, _PERMISSION_MSG_MODIFY, Layer, render, logger, HttpResponseRedirect, reverse
from geoserver.catalog import FailedRequestError
from geonode.geoserver.helpers import set_styles
from django.utils.datastructures import MultiValueDictKeyError


@login_required
def layer_style_manage(req, layername):
    layer = _resolve_layer(req, layername, 'layers.change_layer', _PERMISSION_MSG_MODIFY)
    if req.method == 'GET':
        try:
            cat = Layer.objects.gs_catalog
            # First update the layer style info from GS to GeoNode's DB
            set_styles(layer, cat)

            all_available_gs_styles = cat.get_styles()
            gs_styles = []
            for style in all_available_gs_styles:
                gs_styles.append(style.name)

            current_layer_styles = layer.styles.all()
            layer_styles = []
            for style in current_layer_styles:
                layer_styles.append(style.name)

            # Render the form
            return render(
                req,
                'layers/layer_style_manage.html',
                {
                    "layer": layer,
                    "gs_styles": gs_styles,
                    "layer_styles": layer_styles,
                    "default_style": layer.default_style.name
                }
            )
        except (FailedRequestError, OSError) as e:
            msg = (f'Could not connect to geoserver at "{ogc_server_settings.LOCATION}"to manage style information for layer "{layer.name}"'
                   )
            logger.warn(msg, e)
            # If geoserver is not online, return an error
            return render(
                req,
                'layers/layer_style_manage.html',
                {
                    "layer": layer,
                    "error": msg
                }
            )
    elif req.method == 'POST':
        try:
            selected_styles = req.POST.getlist('style-select')
            default_style = req.POST['default_style']
            # Save to GeoServer
            cat = Layer.objects.gs_catalog
            gs_layer = cat.get_layer(layer.name)
            gs_layer.default_style = default_style
            styles = []
            for style in selected_styles:
                # styles.append(type('style',(object,),{'name' : style}))
                styles.append(style)
            gs_layer.styles = styles
            cat.save(gs_layer)

            # Save to Django
            layer = set_styles(layer, cat)
            layer.save()
            return HttpResponseRedirect(reverse('layer_detail', args=(layer.typename,)))
        except (FailedRequestError, OSError, MultiValueDictKeyError) as e:
            msg = (f'Error Saving Styles for Layer "{layer.name}"'
                   )
            logger.warn(msg, e)
            return render(
                req,
                'layers/layer_style_manage.html',
                {
                    "layer": layer,
                    "error": msg
                }
            )


layers_views.layer_style_manage = layer_style_manage
