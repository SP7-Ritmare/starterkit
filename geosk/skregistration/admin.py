from django.contrib import admin

from geosk.skregistration.models import SkRegistration

class SkRegistrationAdmin(admin.ModelAdmin):
    list_display = ('id', 'site', 'api_key',)

    def has_add_permission(self, request):
        return not SkRegistration.objects.exists()


admin.site.register(SkRegistration, SkRegistrationAdmin)
