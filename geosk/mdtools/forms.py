from django import forms

class UploadMetadataFileForm(forms.Form):
    layerid = forms.IntegerField()
    file  = forms.FileField()
