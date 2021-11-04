# Generated by Django 1.11.20 on 2019-05-06 12:29

import annoying.fields
import datetime
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        # ('base', '0028_auto_20190506_0729'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='MdExtension',
            fields=[
                ('resource',
                 annoying.fields.AutoOneToOneField(
                     on_delete=django.db.models.deletion.CASCADE,
                     primary_key=True,
                     serialize=False,
                     to='base.ResourceBase')),
                ('elements_xml',
                 models.TextField(
                     blank=True,
                     null=True)),
                ('ediversion',
                 models.CharField(
                     blank=True,
                     max_length=100,
                     null=True)),
                ('rndt_xml',
                 models.TextField(
                     blank=True,
                     null=True)),
                ('fileid',
                 models.IntegerField(
                     blank=True,
                     null=True)),
                ('md_language',
                 models.CharField(
                     choices=[
                         (b'abk',
                          b'Abkhazian'),
                         (b'aar',
                          b'Afar'),
                         (b'afr',
                          b'Afrikaans'),
                         (b'amh',
                          b'Amharic'),
                         (b'ara',
                          b'Arabic'),
                         (b'asm',
                          b'Assamese'),
                         (b'aym',
                          b'Aymara'),
                         (b'aze',
                          b'Azerbaijani'),
                         (b'bak',
                          b'Bashkir'),
                         (b'ben',
                          b'Bengali'),
                         (b'bih',
                          b'Bihari'),
                         (b'bis',
                          b'Bislama'),
                         (b'bre',
                          b'Breton'),
                         (b'bul',
                          b'Bulgarian'),
                         (b'bel',
                          b'Byelorussian'),
                         (b'cat',
                          b'Catalan'),
                         (b'chi',
                          b'Chinese'),
                         (b'cos',
                          b'Corsican'),
                         (b'dan',
                          b'Danish'),
                         (b'dzo',
                          b'Dzongkha'),
                         (b'eng',
                          b'English'),
                         (b'fra',
                          b'French'),
                         (b'epo',
                          b'Esperanto'),
                         (b'est',
                          b'Estonian'),
                         (b'fao',
                          b'Faroese'),
                         (b'fij',
                          b'Fijian'),
                         (b'fin',
                          b'Finnish'),
                         (b'fry',
                          b'Frisian'),
                         (b'glg',
                          b'Gallegan'),
                         (b'ger',
                          b'German'),
                         (b'gre',
                          b'Greek'),
                         (b'kal',
                          b'Greenlandic'),
                         (b'grn',
                          b'Guarani'),
                         (b'guj',
                          b'Gujarati'),
                         (b'hau',
                          b'Hausa'),
                         (b'heb',
                          b'Hebrew'),
                         (b'hin',
                          b'Hindi'),
                         (b'hun',
                          b'Hungarian'),
                         (b'ind',
                          b'Indonesian'),
                         (b'ina',
                          b'Interlingua (International Auxiliary language Association)'),
                         (b'iku',
                          b'Inuktitut'),
                         (b'ipk',
                          b'Inupiak'),
                         (b'ita',
                          b'Italian'),
                         (b'jpn',
                          b'Japanese'),
                         (b'kan',
                          b'Kannada'),
                         (b'kas',
                          b'Kashmiri'),
                         (b'kaz',
                          b'Kazakh'),
                         (b'khm',
                          b'Khmer'),
                         (b'kin',
                          b'Kinyarwanda'),
                         (b'kir',
                          b'Kirghiz'),
                         (b'kor',
                          b'Korean'),
                         (b'kur',
                          b'Kurdish'),
                         (b'oci',
                          b"Langue d 'Oc (post 1500)"),
                         (b'lao',
                          b'Lao'),
                         (b'lat',
                          b'Latin'),
                         (b'lav',
                          b'Latvian'),
                         (b'lin',
                          b'Lingala'),
                         (b'lit',
                          b'Lithuanian'),
                         (b'mlg',
                          b'Malagasy'),
                         (b'mlt',
                          b'Maltese'),
                         (b'mar',
                          b'Marathi'),
                         (b'mol',
                          b'Moldavian'),
                         (b'mon',
                          b'Mongolian'),
                         (b'nau',
                          b'Nauru'),
                         (b'nep',
                          b'Nepali'),
                         (b'nor',
                          b'Norwegian'),
                         (b'ori',
                          b'Oriya'),
                         (b'orm',
                          b'Oromo'),
                         (b'pan',
                          b'Panjabi'),
                         (b'pol',
                          b'Polish'),
                         (b'por',
                          b'Portuguese'),
                         (b'pus',
                          b'Pushto'),
                         (b'que',
                          b'Quechua'),
                         (b'roh',
                          b'Rhaeto-Romance'),
                         (b'run',
                          b'Rundi'),
                         (b'rus',
                          b'Russian'),
                         (b'smo',
                          b'Samoan'),
                         (b'sag',
                          b'Sango'),
                         (b'san',
                          b'Sanskrit'),
                         (b'scr',
                          b'Serbo-Croatian'),
                         (b'sna',
                          b'Shona'),
                         (b'snd',
                          b'Sindhi'),
                         (b'sin',
                          b'Singhalese'),
                         (b'ssw',
                          b'Siswant'),
                         (b'slv',
                          b'Slovenian'),
                         (b'som',
                          b'Somali'),
                         (b'sot',
                          b'Sotho'),
                         (b'spa',
                          b'Spanish'),
                         (b'sun',
                          b'Sudanese'),
                         (b'swa',
                          b'Swahili'),
                         (b'tgl',
                          b'Tagalog'),
                         (b'tgk',
                          b'Tajik'),
                         (b'tam',
                          b'Tamil'),
                         (b'tat',
                          b'Tatar'),
                         (b'tel',
                          b'Telugu'),
                         (b'tha',
                          b'Thai'),
                         (b'tir',
                          b'Tigrinya'),
                         (b'tog',
                          b'Tonga (Nyasa)'),
                         (b'tso',
                          b'Tsonga'),
                         (b'tsn',
                          b'Tswana'),
                         (b'tur',
                          b'Turkish'),
                         (b'tuk',
                          b'Turkmen'),
                         (b'twi',
                          b'Twi'),
                         (b'uig',
                          b'Uighur'),
                         (b'ukr',
                          b'Ukrainian'),
                         (b'urd',
                          b'Urdu'),
                         (b'uzb',
                          b'Uzbek'),
                         (b'vie',
                          b'Vietnamese'),
                         (b'vol',
                          b'Volap\xc3\xbck'),
                         (b'wol',
                          b'Wolof'),
                         (b'xho',
                          b'Xhosa'),
                         (b'yid',
                          b'Yiddish'),
                         (b'yor',
                          b'Yoruba'),
                         (b'zha',
                          b'Zhuang'),
                         (b'zul',
                          b'Zulu')],
                     default=b'ita',
                     help_text='language used for metadata',
                     max_length=3,
                     verbose_name='language')),
                ('md_date',
                 models.DateTimeField(
                     default=datetime.datetime.now,
                     help_text='metadata date',
                     verbose_name='metadata date')),
            ],
        ),
        migrations.CreateModel(
            name='MultiContactRole',
            fields=[
                ('id',
                 models.AutoField(
                     auto_created=True,
                     primary_key=True,
                     serialize=False,
                     verbose_name='ID')),
                ('contact',
                 models.ForeignKey(
                     on_delete=django.db.models.deletion.CASCADE,
                     to=settings.AUTH_USER_MODEL)),
                ('resource',
                 models.ForeignKey(
                     on_delete=django.db.models.deletion.CASCADE,
                     to='geosk_mdtools.MdExtension')),
            ],
        ),
        migrations.CreateModel(
            name='ResponsiblePartyScope',
            fields=[
                ('id',
                 models.AutoField(
                     auto_created=True,
                     primary_key=True,
                     serialize=False,
                     verbose_name='ID')),
                ('value',
                 models.CharField(
                     choices=[
                         (b'md_contact',
                          'Metadata responsible party'),
                         (b'citation_contact',
                          'Responsible party'),
                         (b'identification_contact',
                          'Point of contact'),
                         (b'distributor_contact',
                          'Distributor')],
                     max_length=100,
                     unique=True,
                     verbose_name='Scope')),
            ],
        ),
        migrations.CreateModel(
            name='ServicesMetadata',
            fields=[
                ('id',
                 models.AutoField(
                     auto_created=True,
                     primary_key=True,
                     serialize=False,
                     verbose_name='ID')),
                ('node_name',
                 models.CharField(
                     default=b'Starter Kit',
                     help_text='shorter than the title: e.g. acronym. This field is required',
                     max_length=200,
                     verbose_name='node name')),
                ('node_title',
                 models.CharField(
                     help_text='This field is required',
                     max_length=200,
                     verbose_name='node title')),
                ('node_abstract',
                 models.TextField(
                     blank=True,
                     null=True,
                     verbose_name='node abastract')),
                ('node_keywords',
                 models.CharField(
                     blank=True,
                     max_length=200,
                     null=True,
                     verbose_name='keywords')),
                ('provider_name',
                 models.CharField(
                     help_text='This field is required',
                     max_length=200,
                     verbose_name='organization name')),
                ('provider_url',
                 models.URLField(
                     blank=True,
                     null=True,
                     verbose_name='provider url')),
                ('contact_name',
                 models.CharField(
                     help_text='This field is required',
                     max_length=200,
                     verbose_name='contact name')),
                ('contact_position',
                 models.CharField(
                     blank=True,
                     max_length=200,
                     null=True,
                     verbose_name='contact position')),
                ('contact_email',
                 models.EmailField(
                     help_text='This field is required',
                     max_length=254,
                     verbose_name='contact email')),
                ('contact_url',
                 models.URLField(
                     blank=True,
                     null=True,
                     verbose_name='contact url')),
                ('contact_address',
                 models.CharField(
                     blank=True,
                     max_length=200,
                     null=True,
                     verbose_name='contact address')),
                ('contact_city',
                 models.CharField(
                     blank=True,
                     max_length=200,
                     null=True,
                     verbose_name='contact city')),
                ('contact_stateprovince',
                 models.CharField(
                     blank=True,
                     max_length=200,
                     null=True,
                     verbose_name='contact state or province')),
                ('contact_postalcode',
                 models.CharField(
                     blank=True,
                     max_length=200,
                     null=True,
                     verbose_name='contact postalcode')),
                ('contact_country',
                 models.CharField(
                     blank=True,
                     max_length=200,
                     null=True,
                     verbose_name='contact country')),
                ('contact_phone',
                 models.CharField(
                     blank=True,
                     max_length=200,
                     null=True,
                     verbose_name='contact phone')),
                ('contact_fax',
                 models.CharField(
                     blank=True,
                     max_length=200,
                     null=True,
                     verbose_name='contact fax')),
                ('contact_hours',
                 models.CharField(
                     blank=True,
                     help_text=b'Hours of Service',
                     max_length=200,
                     null=True,
                     verbose_name='contact hours')),
                ('contact_instructions',
                 models.CharField(
                     blank=True,
                     help_text=b'During hours of service',
                     max_length=200,
                     null=True,
                     verbose_name='contact instructions')),
                ('contact_role',
                 models.CharField(
                     blank=True,
                     default=b'pointOfContact',
                     max_length=200,
                     null=True,
                     verbose_name='contact role')),
            ],
            options={
                'verbose_name_plural': 'Services metadata',
            },
        ),
        migrations.AddField(
            model_name='multicontactrole',
            name='scope',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                to='geosk_mdtools.ResponsiblePartyScope'),
        ),
        migrations.AddField(
            model_name='mdextension',
            name='contacts',
            field=models.ManyToManyField(
                through='geosk_mdtools.MultiContactRole',
                to=settings.AUTH_USER_MODEL),
        ),
    ]
