# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-09-18 20:16
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0022_auto_20160918_1615'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='favorites',
            field=models.CharField(max_length=200, null=True),
        ),
    ]
