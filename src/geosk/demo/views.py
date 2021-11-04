import os
import zipfile
from io import StringIO

from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from django.http import HttpResponse


class WorkshopView(TemplateView):
    template_name = 'demo/index.html'

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)


@login_required
def get_demodataset(request):
    current_dir = os.path.abspath(os.path.dirname(__file__))
    demodataset_dir = os.path.join(current_dir, 'demodataset')
    filenames = os.listdir(demodataset_dir)

    zip_subdir = f"{request.user.username}_demodataset"
    zip_filename = f"{zip_subdir}.zip"
    s = StringIO.StringIO()

    zf = zipfile.ZipFile(s, "w")

    for fname in filenames:
        fdir = demodataset_dir
        fpath = os.path.join(fdir, fname)
        zip_path = os.path.join(zip_subdir, f"{request.user.username}_{fname}")

        # Add file, at correct path
        zf.write(fpath, zip_path)
    zf.close()

    resp = HttpResponse(s.getvalue(), mimetype="application/x-zip-compressed")
    resp['Content-Disposition'] = f'attachment; filename={zip_filename}'

    return resp
