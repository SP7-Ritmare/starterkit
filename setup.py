import os
from distutils.core import setup

def read(*rnames):
    return open(os.path.join(os.path.dirname(__file__), *rnames)).read()

setup(
    name="starterkit",
    version="1.0",
    author="",
    author_email="",
    description="starterkit, based on GeoNode",
    long_description=(read('README.rst')),
    # Full list of classifiers can be found at:
    # http://pypi.python.org/pypi?%3Aaction=list_classifiers
    classifiers=[
        'Development Status :: 1 - Planning',
    ],
    license="GPL3",
    keywords="starterkit geonode django",
    url='https://github.com/SP7-Ritmare/starterkit',
    packages=['geosk',],
    include_package_data=True,
    zip_safe=False,
    install_requires=[
    "django-overextends",
    "django-annoying",
    "django-rosetta",
    "django-grappelli==2.4.10",
    "djproxy",
    ]
)
