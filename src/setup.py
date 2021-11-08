#########################################################################
#
# Copyright (C) 2014 Starter Kit Development Team
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
#########################################################################

import os
import stat
from codecs import open
from distutils.core import setup
from shutil import copyfile

from setuptools import find_packages, setup
from setuptools.command.install import install


class PostInstallCommand(install):
    def run(self):
        install.run(self)
        print("Run post-installation")
        self.set_etc()

    def set_etc(self):
        dirs = ['/etc/starterkit/templates',
                '/etc/starterkit/media']
        for d in dirs:
            if not os.path.exists(d):
                os.makedirs(d)

        ls_fname = '/etc/starterkit/local_settings.py'
        if not os.path.isfile(ls_fname):
            sample_name = os.path.join(
                self.install_lib, 'geosk', 'local_settings.py.sample')
            copyfile(sample_name, ls_fname)

        files = [ls_fname,
                 '/etc/starterkit/pycsw_settings.py']

        for f in files:
            open(f, 'a').close()
            # make links
            link_name = os.path.join(
                self.install_lib, 'geosk', os.path.basename(f))
            if not os.path.islink(link_name):
                print('make link', link_name)
                os.symlink(f, link_name)
        os.chmod('/etc/starterkit/pycsw_settings.py', stat.S_IREAD | stat.S_IRGRP | stat.S_IROTH |
                 stat.S_IWRITE | stat.S_IWGRP | stat.S_IWOTH)


here = os.path.abspath(os.path.dirname(__file__))

with open(os.path.join(here, 'README.md'), encoding='utf-8') as f:
    long_description = f.read()


def read(*rnames):
    return open(os.path.join(os.path.dirname(__file__), *rnames)).read()


setup(
    name='starterkit',
    version=__import__('geosk').get_version(),
    description="starterkit, based on GeoNode",
    long_description=long_description,
    url='https://github.com/SP7-Ritmare/starterkit',
    author='Starter Kit Development Team',
    author_email='help.skritmare@irea.cnr.it',
    license="GPL3",
    # Full list of classifiers can be found at:
    # http://pypi.python.org/pypi?%3Aaction=list_classifiers
    classifiers=[
        'Development Status :: 4 - Beta',
        'License :: OSI Approved :: GNU General Public License v3 (GPLv3)',
        'Programming Language :: Python :: 2',
    ],
    keywords="StarterKit GeoNode Django sensors SOS",
    packages=find_packages(),
    dependency_links=[
        "git+https://github.com/SP7-Ritmare/geonode.git@2.10.x#egg=geonode"
    ],
    include_package_data=True,
    setup_requires=["setuptools_git >= 0.3", ],
    scripts=['bin/sk',
             'bin/sk-updateip',
             'bin/softInspector.sh',
             ],
    cmdclass={
        'install': PostInstallCommand,
    },
)
