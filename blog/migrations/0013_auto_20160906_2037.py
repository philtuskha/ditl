# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-09-07 00:37
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0012_auto_20160906_1947'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='last_thread',
            field=models.DateTimeField(null=True),
        ),
    ]
