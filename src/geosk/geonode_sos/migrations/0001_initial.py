# Generated by Django 2.2.24 on 2022-04-20 10:14
#########################################################################
#
# Copyright (C) 2022 OSGeo
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
import django.contrib.gis.db.models.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('layers', '0035_auto_20220223_1547'),
    ]

    operations = [
        migrations.CreateModel(
            name='FeatureOfInterest',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, null=True)),
                ('identifier', models.CharField(max_length=2000, null=True)),
                ('codespace', models.CharField(max_length=2000, null=True)),
                ('feature_type', models.CharField(max_length=2000, null=True)),
                ('feature_id', models.CharField(max_length=2000, null=True)),
                ('sampled_feature', models.CharField(max_length=2000, null=True)),
                ('geometry', django.contrib.gis.db.models.fields.PolygonField(blank=True, null=True, srid=4326)),
                ('srs_name', models.CharField(max_length=255, null=True)),
                ('description', models.TextField(blank=True, max_length=2000, null=True)),
                ('shape_blob', models.TextField(blank=True, max_length=2000, null=True)),
                ('resource_id', models.IntegerField()),
            ],
            options={
                'verbose_name': 'Feature of interest',
                'verbose_name_plural': 'Features of interest',
            },
        ),
        migrations.CreateModel(
            name='ServiceProvider',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, null=True)),
                ('site', models.CharField(max_length=2000, null=True)),
                ('individual_name', models.CharField(max_length=2000, null=True)),
                ('position_name', models.CharField(max_length=255, null=True)),
                ('phone', models.CharField(max_length=255, null=True)),
                ('delivery_point', models.CharField(max_length=255, null=True)),
                ('city', models.CharField(max_length=255, null=True)),
                ('administrative_area', models.CharField(max_length=255, null=True)),
                ('postal_code', models.CharField(max_length=255, null=True)),
                ('country', models.CharField(max_length=255, null=True)),
                ('email', models.CharField(max_length=255, null=True)),
                ('service', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='services.Service')),
            ],
            options={
                'verbose_name': 'Service Provider',
                'verbose_name_plural': 'Service Provider',
            },
        ),
        migrations.CreateModel(
            name='SensorResponsible',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, null=True)),
                ('phone', models.CharField(max_length=255, null=True)),
                ('delivery_point', models.CharField(max_length=255, null=True)),
                ('city', models.CharField(max_length=255, null=True)),
                ('administrative_area', models.CharField(max_length=255, null=True)),
                ('postal_code', models.CharField(max_length=255, null=True)),
                ('country', models.CharField(max_length=255, null=True)),
                ('mail', models.CharField(max_length=255, null=True)),
                ('online_resource', models.CharField(max_length=2000, null=True)),
                ('arcrole', models.CharField(max_length=2000, null=True)),
                ('role', models.CharField(max_length=255, null=True)),
                ('extracted_arcrole', models.CharField(choices=[('manufacturerName', 'manufacturerName'), ('owner', 'owner'), ('pointOfContact', 'pointOfContact')], max_length=255, null=True)),
                ('resource', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='layers.Layer')),
            ],
        ),
        migrations.CreateModel(
            name='Offerings',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, null=True)),
                ('definition', models.CharField(max_length=2000, null=True)),
                ('value', models.CharField(max_length=2000, null=True)),
                ('resource', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='layers.Layer')),
            ],
            options={
                'verbose_name': 'Offering',
                'verbose_name_plural': 'Offerings',
            },
        ),
    ]
