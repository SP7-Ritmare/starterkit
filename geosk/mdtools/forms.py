from django import forms
from geonode.layers.models import Layer

class UploadMetadataFileForm(forms.Form):
    layer = forms.ModelChoiceField(queryset=Layer.objects.all(), label="Layer name")
    file  = forms.FileField()
