"""
This file was generated with the customdashboard management command and
contains the class for the main dashboard.

To activate your index dashboard add the following to your settings.py::
    GRAPPELLI_INDEX_DASHBOARD = 'geosk.dashboard.CustomIndexDashboard'
"""

from django.utils.translation import ugettext_lazy as _
from django.core.urlresolvers import reverse

from grappelli.dashboard import modules, Dashboard
from grappelli.dashboard.utils import get_admin_site_name


class CustomIndexDashboard(Dashboard):
    """
    Custom index dashboard for www.
    """
    
    def init_with_context(self, context):
        site_name = get_admin_site_name(context)
       
        # append an app list module for "Administration"
        self.children.append(modules.ModelList(
            _('Metadata Configuration & Registration'),
            column=1,
            collapsible=False,
            models=('geosk.mdtools.*','geosk.skregistration.*'),
        ))
        

        # append a group for "Administration" & "Applications"
        self.children.append(modules.Group(
            _('Administration & Applications'),
            column=1,
            collapsible=True,
            children = [
                modules.AppList(
                    _('Administration'),
                    column=1,
                    collapsible=False,
                    models=('django.contrib.*',),
                ),
                modules.AppList(
                    _('Applications'),
                    column=1,
                    css_classes=('collapse closed',),
                    exclude=('django.contrib.*',),
                )
            ]
        ))
        
        # append an app list module for "Applications"
        self.children.append(modules.AppList(
            _('AppList: Applications'),
            collapsible=True,
            column=1,
            css_classes=('collapse closed',),
            exclude=('django.contrib.*',),
        ))
        
        self.children.append(modules.LinkList(
            _('SK Registration'),
            column=2,
            children=[
                {
                    'title': _('Register or check registration'),
                    'url': reverse('skregistration_registration'),
                    'external': False,
                },
            ]
        ))


        self.children.append(modules.LinkList(
            _('Translations'),
            column=2,
            children=[
                {
                    'title': _('Update translations'),
                    'url': reverse('rosetta-home'),
                    'external': False,
                    'description': _('Update the translations for your languages'),
                },
                {
                    'title': _('Rosetta Documentation'),
                    'url': 'https://github.com/mbi/django-rosetta',
                    'external': True,
                },
            ]
        ))
        
        # append a recent actions module
        self.children.append(modules.RecentActions(
            _('Recent Actions'),
            limit=5,
            collapsible=False,
            column=2,
        ))

        self.children.append(modules.LinkList(
            _('SK Front end'),
            column=3,
            children=[
                {
                    'title': _('Home'),
                    'url': reverse('home'),
                    'external': False,
                },
                {
                    'title': _('Layers'),
                    'url': reverse('layer_browse'),
                    'external': False,
                },
                {
                    'title': _('Maps'),
                    'url': reverse('layer_browse'),
                    'external': False,
                },
                {
                    'title': _('Documents'),
                    'url': reverse('maps_browse'),
                    'external': False,
                },
                {
                    'title': _('People'),
                    'url': reverse('profile_browse'),
                    'external': False,
                },
                {
                    'title': _('Search'),
                    'url': reverse('search'),
                    'external': False,
                },
                {
                    'title': _('Services'),
                    'url': reverse('about_services'),
                    'external': False,
                },
                {
                    'title': _('Sos'),
                    'url': reverse('osk_browse'),
                    'external': False,
                },
            ]
        ))

