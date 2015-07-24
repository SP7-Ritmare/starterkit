from __future__ import absolute_import
import os
import zipfile
import StringIO

from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from django.http import HttpResponse

class WorkshopView(TemplateView):
    template_name = 'demo/index.html'

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(WorkshopView, self).dispatch(*args, **kwargs)

@login_required
def get_demodataset(request):
    current_dir = os.path.abspath(os.path.dirname(__file__))
    demodataset_dir = os.path.join(current_dir, 'demodataset')
    filenames = os.listdir(demodataset_dir)

    zip_subdir = "{}_demodataset".format(request.user.username)
    zip_filename = "{}.zip".format(zip_subdir)
    s = StringIO.StringIO()

    zf = zipfile.ZipFile(s, "w")

    for fname in filenames:
        fdir = demodataset_dir
        fpath = os.path.join(fdir, fname)
        zip_path = os.path.join(zip_subdir, "{}_{}".format(request.user.username, fname))

        # Add file, at correct path
        zf.write(fpath, zip_path)
    zf.close()

    resp = HttpResponse(s.getvalue(), mimetype = "application/x-zip-compressed")
    resp['Content-Disposition'] = 'attachment; filename=%s' % zip_filename

    return resp
