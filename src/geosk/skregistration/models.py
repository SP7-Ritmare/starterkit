from django.db import models
from django.utils.translation import ugettext, ugettext_lazy as _
from django.contrib.sites.models import Site


class SkRegistrationManager(models.Manager):
    def get_current(self):
        current_site = Site.objects.get_current()
        try:
            return self.get(site=current_site)
        except SkRegistration.DoesNotExist:
            return None


class SkRegistration(models.Model):
    site = models.ForeignKey(Site, on_delete=models.CASCADE)
    api_key = models.TextField(null=True, blank=True)
    verified = models.BooleanField()
    objects = SkRegistrationManager()

    class Meta:
        verbose_name = _("GET-IT registration")
        verbose_name_plural = _("GET-IT registration")
