# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-05-03 12:41
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0007_auto_20160420_1005'),
    ]

    operations = [
        migrations.AddField(
            model_name='rvote',
            name='published_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='tvote',
            name='published_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
