# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'ResponsiblePartyScope'
        db.create_table(u'mdtools_responsiblepartyscope', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('value', self.gf('django.db.models.fields.CharField')(unique=True, max_length=100)),
        ))
        db.send_create_signal(u'mdtools', ['ResponsiblePartyScope'])

        # Adding model 'MultiContactRole'
        db.create_table(u'mdtools_multicontactrole', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('resource', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['mdtools.MdExtension'])),
            ('contact', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['people.Profile'])),
            ('role', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['people.Role'])),
            ('scope', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['mdtools.ResponsiblePartyScope'])),
        ))
        db.send_create_signal(u'mdtools', ['MultiContactRole'])

        # Adding model 'MdExtension'
        db.create_table(u'mdtools_mdextension', (
            ('resource', self.gf('annoying.fields.AutoOneToOneField')(to=orm['base.ResourceBase'], unique=True, primary_key=True)),
            ('elements_xml', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('rndt_xml', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('fileid', self.gf('django.db.models.fields.IntegerField')(null=True, blank=True)),
            ('md_language', self.gf('django.db.models.fields.CharField')(default='ita', max_length=3)),
            ('md_date', self.gf('django.db.models.fields.DateTimeField')(default=datetime.datetime.now)),
        ))
        db.send_create_signal(u'mdtools', ['MdExtension'])

        # Adding model 'ServicesMetadata'
        db.create_table(u'mdtools_servicesmetadata', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('node_name', self.gf('django.db.models.fields.CharField')(default='Starter Kit', max_length=200)),
            ('node_title', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('node_abstract', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('node_keywords', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('provider_name', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('provider_url', self.gf('django.db.models.fields.URLField')(max_length=200, null=True, blank=True)),
            ('contact_name', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('contact_position', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('contact_email', self.gf('django.db.models.fields.EmailField')(max_length=75)),
            ('contact_url', self.gf('django.db.models.fields.URLField')(max_length=200, null=True, blank=True)),
            ('contact_address', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('contact_city', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('contact_stateprovince', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('contact_postalcode', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('contact_country', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('contact_phone', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('contact_fax', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('contact_hours', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('contact_instructions', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('contact_role', self.gf('django.db.models.fields.CharField')(default='pointOfContact', max_length=200, null=True, blank=True)),
        ))
        db.send_create_signal(u'mdtools', ['ServicesMetadata'])


    def backwards(self, orm):
        
        # Deleting model 'ResponsiblePartyScope'
        db.delete_table(u'mdtools_responsiblepartyscope')

        # Deleting model 'MultiContactRole'
        db.delete_table(u'mdtools_multicontactrole')

        # Deleting model 'MdExtension'
        db.delete_table(u'mdtools_mdextension')

        # Deleting model 'ServicesMetadata'
        db.delete_table(u'mdtools_servicesmetadata')


    models = {
        u'actstream.action': {
            'Meta': {'ordering': "('-timestamp',)", 'object_name': 'Action'},
            'action_object_content_type': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'action_object'", 'null': 'True', 'to': u"orm['contenttypes.ContentType']"}),
            'action_object_object_id': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'actor_content_type': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'actor'", 'to': u"orm['contenttypes.ContentType']"}),
            'actor_object_id': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'data': ('jsonfield.fields.JSONField', [], {'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'public': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'target_content_type': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'target'", 'null': 'True', 'to': u"orm['contenttypes.ContentType']"}),
            'target_object_id': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'timestamp': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2014, 6, 21, 16, 33, 9, 581850)'}),
            'verb': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        u'auth.group': {
            'Meta': {'object_name': 'Group'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'auth.permission': {
            'Meta': {'ordering': "(u'content_type__app_label', u'content_type__model', u'codename')", 'unique_together': "((u'content_type', u'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2014, 6, 21, 16, 33, 9, 578632)'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2014, 6, 21, 16, 33, 9, 578074)'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        u'base.contactrole': {
            'Meta': {'unique_together': "(('contact', 'resource', 'role'),)", 'object_name': 'ContactRole'},
            'contact': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['people.Profile']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'resource': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['base.ResourceBase']"}),
            'role': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['people.Role']"})
        },
        u'base.license': {
            'Meta': {'object_name': 'License'},
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'license_text': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '2000', 'null': 'True', 'blank': 'True'})
        },
        u'base.region': {
            'Meta': {'ordering': "('name',)", 'object_name': 'Region'},
            'code': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        u'base.resourcebase': {
            'Meta': {'object_name': 'ResourceBase'},
            'abstract': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'bbox_x0': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '19', 'decimal_places': '10', 'blank': 'True'}),
            'bbox_x1': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '19', 'decimal_places': '10', 'blank': 'True'}),
            'bbox_y0': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '19', 'decimal_places': '10', 'blank': 'True'}),
            'bbox_y1': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '19', 'decimal_places': '10', 'blank': 'True'}),
            'category': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['base.TopicCategory']", 'null': 'True', 'blank': 'True'}),
            'constraints_other': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'contacts': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['people.Profile']", 'through': u"orm['base.ContactRole']", 'symmetrical': 'False'}),
            'csw_anytext': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'csw_insert_date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'null': 'True', 'blank': 'True'}),
            'csw_mdsource': ('django.db.models.fields.CharField', [], {'default': "'local'", 'max_length': '256'}),
            'csw_schema': ('django.db.models.fields.CharField', [], {'default': "'http://www.isotc211.org/2005/gmd'", 'max_length': '64'}),
            'csw_type': ('django.db.models.fields.CharField', [], {'default': "'dataset'", 'max_length': '32'}),
            'csw_typename': ('django.db.models.fields.CharField', [], {'default': "'gmd:MD_Metadata'", 'max_length': '32'}),
            'csw_wkt_geometry': ('django.db.models.fields.TextField', [], {'default': "'POLYGON((-180 -90,-180 90,180 90,180 -90,-180 -90))'"}),
            'data_quality_statement': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'date': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'date_type': ('django.db.models.fields.CharField', [], {'default': "'publication'", 'max_length': '255'}),
            'distribution_description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'distribution_url': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'edition': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'language': ('django.db.models.fields.CharField', [], {'default': "'ita'", 'max_length': '3'}),
            'license': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['base.License']", 'null': 'True', 'blank': 'True'}),
            'maintenance_frequency': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'metadata_uploaded': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'metadata_xml': ('django.db.models.fields.TextField', [], {'default': '\'<gmd:MD_Metadata xmlns:gmd="http://www.isotc211.org/2005/gmd"/>\'', 'null': 'True', 'blank': 'True'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']", 'null': 'True', 'blank': 'True'}),
            'purpose': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'regions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['base.Region']", 'symmetrical': 'False', 'blank': 'True'}),
            'restriction_code_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['base.RestrictionCodeType']", 'null': 'True', 'blank': 'True'}),
            'spatial_representation_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['base.SpatialRepresentationType']", 'null': 'True', 'blank': 'True'}),
            'srid': ('django.db.models.fields.CharField', [], {'default': "'EPSG:4326'", 'max_length': '255'}),
            'supplemental_information': ('django.db.models.fields.TextField', [], {'default': "u'No information provided'"}),
            'temporal_extent_end': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'temporal_extent_start': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'thumbnail': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['base.Thumbnail']", 'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'uuid': ('django.db.models.fields.CharField', [], {'max_length': '36'})
        },
        u'base.restrictioncodetype': {
            'Meta': {'ordering': "('identifier',)", 'object_name': 'RestrictionCodeType'},
            'description': ('django.db.models.fields.TextField', [], {'max_length': '255'}),
            'gn_description': ('django.db.models.fields.TextField', [], {'max_length': '255'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'identifier': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'is_choice': ('django.db.models.fields.BooleanField', [], {'default': 'True'})
        },
        u'base.spatialrepresentationtype': {
            'Meta': {'ordering': "('identifier',)", 'object_name': 'SpatialRepresentationType'},
            'description': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'gn_description': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'identifier': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'is_choice': ('django.db.models.fields.BooleanField', [], {'default': 'True'})
        },
        u'base.thumbnail': {
            'Meta': {'object_name': 'Thumbnail'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'thumb_file': ('django.db.models.fields.files.FileField', [], {'max_length': '100'}),
            'thumb_spec': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'version': ('django.db.models.fields.PositiveSmallIntegerField', [], {'default': '0', 'null': 'True'})
        },
        u'base.topiccategory': {
            'Meta': {'ordering': "('identifier',)", 'object_name': 'TopicCategory'},
            'description': ('django.db.models.fields.TextField', [], {}),
            'gn_description': ('django.db.models.fields.TextField', [], {'default': "''", 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'identifier': ('django.db.models.fields.CharField', [], {'default': "'location'", 'max_length': '255'}),
            'is_choice': ('django.db.models.fields.BooleanField', [], {'default': 'True'})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        u'mdtools.mdextension': {
            'Meta': {'object_name': 'MdExtension'},
            'contacts': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['people.Profile']", 'through': u"orm['mdtools.MultiContactRole']", 'symmetrical': 'False'}),
            'elements_xml': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'fileid': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'md_date': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'md_language': ('django.db.models.fields.CharField', [], {'default': "'ita'", 'max_length': '3'}),
            'resource': ('annoying.fields.AutoOneToOneField', [], {'to': u"orm['base.ResourceBase']", 'unique': 'True', 'primary_key': 'True'}),
            'rndt_xml': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'})
        },
        u'mdtools.multicontactrole': {
            'Meta': {'object_name': 'MultiContactRole'},
            'contact': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['people.Profile']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'resource': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['mdtools.MdExtension']"}),
            'role': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['people.Role']"}),
            'scope': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['mdtools.ResponsiblePartyScope']"})
        },
        u'mdtools.responsiblepartyscope': {
            'Meta': {'object_name': 'ResponsiblePartyScope'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'value': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '100'})
        },
        u'mdtools.servicesmetadata': {
            'Meta': {'object_name': 'ServicesMetadata'},
            'contact_address': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'contact_city': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'contact_country': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'contact_email': ('django.db.models.fields.EmailField', [], {'max_length': '75'}),
            'contact_fax': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'contact_hours': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'contact_instructions': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'contact_name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'contact_phone': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'contact_position': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'contact_postalcode': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'contact_role': ('django.db.models.fields.CharField', [], {'default': "'pointOfContact'", 'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'contact_stateprovince': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'contact_url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'node_abstract': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'node_keywords': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'node_name': ('django.db.models.fields.CharField', [], {'default': "'Starter Kit'", 'max_length': '200'}),
            'node_title': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'provider_name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'provider_url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        u'people.profile': {
            'Meta': {'object_name': 'Profile'},
            'area': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'city': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'country': ('django.db.models.fields.CharField', [], {'max_length': '3', 'null': 'True', 'blank': 'True'}),
            'delivery': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            'fax': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'organization': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'position': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'profile': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.OneToOneField', [], {'blank': 'True', 'related_name': "'profile'", 'unique': 'True', 'null': 'True', 'to': u"orm['auth.User']"}),
            'voice': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'zipcode': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        u'people.role': {
            'Meta': {'object_name': 'Role'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'value': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'})
        },
        u'taggit.tag': {
            'Meta': {'object_name': 'Tag'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '100'}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '100', 'db_index': 'True'})
        },
        u'taggit.taggeditem': {
            'Meta': {'object_name': 'TaggedItem'},
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "u'taggit_taggeditem_tagged_items'", 'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'object_id': ('django.db.models.fields.IntegerField', [], {'db_index': 'True'}),
            'tag': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "u'taggit_taggeditem_items'", 'to': u"orm['taggit.Tag']"})
        }
    }

    complete_apps = ['mdtools']
