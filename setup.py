import os
from distutils.core import setup

def read(*rnames):
    return open(os.path.join(os.path.dirname(__file__), *rnames)).read()

setup(
    name="geosk",
    version="0.1",
    author="",
    author_email="",
    description="geosk, based on GeoNode",
    long_description=(read('README.rst')),
    # Full list of classifiers can be found at:
    # http://pypi.python.org/pypi?%3Aaction=list_classifiers
    classifiers=[
        'Development Status :: 1 - Planning',
    ],
    license="GPL2",
    keywords="geosk geonode django",
    url='https://github.com/SP7-Ritmare/geosk',
    packages=['geosk',],
    include_package_data=True,
    zip_safe=False,
    install_requires=[
    "django-overextends",
    ]
)
