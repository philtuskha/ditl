# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-09-13 06:04
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0019_auto_20160913_0203'),
    ]

    operations = [
        migrations.AddField(
            model_name='response',
            name='vote_count',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='thread',
            name='vote_count',
            field=models.IntegerField(default=0),
        ),
    ]
