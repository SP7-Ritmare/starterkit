from django.http import Http404, HttpResponseForbidden
from djproxy.views import HttpProxy
from django.conf import settings
from django.utils.decorators import classonlymethod


class ObservationsProxy(HttpProxy):
    # TODO move to settings
    base_url = 'http://localhost:8080/observations/'
    reverse_urls = [
        ('/observations/', 'http://localhost:8080/observations/')
        ]

    @classonlymethod
    def as_view(cls, **initkwargs):
        view = super(ObservationsProxy, cls).as_view(**initkwargs)
        view.csrf_exempt = True
        return view

    def dispatch(self, request, *args, **kwargs):
        if not self.check_perms(request):
            return HttpResponseForbidden('Forbidden')
        # force authorization header to allow "Transactional authorization token"
        if request.user.has_perm('osk.admin_sos'):
            request.META['HTTP_AUTHORIZATION'] = "%s" % settings.SOS_SERVER['default']['TRANSACTIONAL_AUTHORIZATION_TOKEN']
        else:
            request.META.pop('HTTP_AUTHORIZATION', None)
        return super(ObservationsProxy, self).dispatch(request, *args, **kwargs)

    def check_perms(self, request):
        if settings.SOS_PUBLIC_ACCESS or request.user.has_perm('osk.read_sos') or request.user.has_perm('osk.admin_sos'):
            return True
        return False

