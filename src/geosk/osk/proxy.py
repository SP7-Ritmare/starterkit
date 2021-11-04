from django.conf import settings
from django.http import Http404, HttpResponseForbidden
from djproxy.views import HttpProxy
from django.utils.decorators import classonlymethod


class ObservationsProxy(HttpProxy):
    base_url = settings.REVERSE_PROXY_SOS
    reverse_urls = [
        ('/observations/', settings.REVERSE_PROXY_SOS)
    ]

    @classonlymethod
    def as_view(cls, **initkwargs):
        view = super().as_view(**initkwargs)
        view.csrf_exempt = True
        return view

    def dispatch(self, request, *args, **kwargs):
        if not self.check_perms(request):
            return HttpResponseForbidden('Forbidden')
        # force authorization header to allow "Transactional authorization token"
        if request.user.has_perm('osk.admin_sos'):
            request.META['HTTP_AUTHORIZATION'] = f"{settings.SOS_SERVER['default']['TRANSACTIONAL_AUTHORIZATION_TOKEN']}"
        else:
            request.META.pop('HTTP_AUTHORIZATION', None)
        return super().dispatch(request, *args, **kwargs)

    def check_perms(self, request):
        if settings.SOS_PUBLIC_ACCESS or request.user.has_perm('osk.read_sos') or request.user.has_perm('osk.admin_sos'):
            return True
        return False


class SparqlProxy(HttpProxy):
    base_url = settings.REVERSE_PROXY_SPARQL
    reverse_urls = [
        ('/sparql/', settings.REVERSE_PROXY_SPARQL)
    ]

    @classonlymethod
    def as_view(cls, **initkwargs):
        view = super().as_view(**initkwargs)
        view.csrf_exempt = True
        return view


class FusekiProxy(HttpProxy):
    base_url = settings.REVERSE_PROXY_FUSEKI
    reverse_urls = [
        ('/fuseki/', settings.REVERSE_PROXY_FUSEKI)
    ]

    @classonlymethod
    def as_view(cls, **initkwargs):
        view = super().as_view(**initkwargs)
        view.csrf_exempt = True
        return view


class VocabsProxy(HttpProxy):
    base_url = settings.REVERSE_PROXY_VOCABS
    reverse_urls = [
        ('/vocabs/', settings.REVERSE_PROXY_VOCABS)
    ]

    @classonlymethod
    def as_view(cls, **initkwargs):
        view = super().as_view(**initkwargs)
        view.csrf_exempt = True
        return view


class NercProxy(HttpProxy):
    base_url = settings.REVERSE_PROXY_NERC
    reverse_urls = [
        ('/nerc/', settings.REVERSE_PROXY_NERC)
    ]

    @classonlymethod
    def as_view(cls, **initkwargs):
        view = super().as_view(**initkwargs)
        view.csrf_exempt = True
        return view


class MetadataProxy(HttpProxy):
    base_url = settings.REVERSE_PROXY_METADATA
    reverse_urls = [
        ('/metadata/', settings.REVERSE_PROXY_METADATA)
    ]

    @classonlymethod
    def as_view(cls, **initkwargs):
        view = super().as_view(**initkwargs)
        view.csrf_exempt = True
        return view


class AdamassoftProxy(HttpProxy):
    base_url = settings.REVERSE_PROXY_ADAMASOFT
    reverse_urls = [
        ('/adamassoft_proxy/', settings.REVERSE_PROXY_ADAMASOFT)
    ]

    @classonlymethod
    def as_view(cls, **initkwargs):
        view = super().as_view(**initkwargs)
        view.csrf_exempt = True
        return view
