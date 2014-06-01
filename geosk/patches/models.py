from django.db import models

from django.contrib.auth.decorators import login_required


# patch https://github.com/GeoNode/geonode/commit/2832fc1959e50fa7034b03eaa79e83e8e7e475e1
from geonode.layers import views as layers_views
from geonode.layers.views import _resolve_layer, _PERMISSION_MSG_MODIFY, FailedRequestError, Layer, set_styles, render_to_response, RequestContext, MultiValueDictKeyError, logger, HttpResponseRedirect, reverse

@login_required
def layer_style_manage(req, layername):
    layer = _resolve_layer(req, layername, 'layers.change_layer',_PERMISSION_MSG_MODIFY)
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
            return render_to_response(
                'layers/layer_style_manage.html',
                RequestContext(req, {
                    "layer": layer,
                    "gs_styles": gs_styles,
                    "layer_styles": layer_styles,
                    "default_style": layer.default_style.name
                    }
                )
            )
        except (FailedRequestError, EnvironmentError) as e:
            msg = ('Could not connect to geoserver at "%s"'
               'to manage style information for layer "%s"' % (
                ogc_server_settings.LOCATION, layer.name)
            )
            logger.warn(msg, e)
            # If geoserver is not online, return an error
            return render_to_response(
                'layers/layer_style_manage.html',
                RequestContext(req, {
                    "layer": layer,
                    "error": msg
                    }
                )
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
        except (FailedRequestError, EnvironmentError, MultiValueDictKeyError) as e:
            msg = ('Error Saving Styles for Layer "%s"'  % (layer.name)
            )
            logger.warn(msg, e)
            return render_to_response(
                'layers/layer_style_manage.html',
                RequestContext(req, {
                    "layer": layer,
                    "error": msg
                    }
                )
            )


layers_views.layer_style_manage = layer_style_manage
