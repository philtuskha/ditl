# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-04-20 13:58
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0004_auto_20160408_0250'),
    ]

    operations = [
        migrations.AlterField(
            model_name='rvote',
            name='option',
            field=models.CharField(choices=[('TR', 'Troll'), ('DL', 'DisLike'), ('LK', 'Like'), ('LV', 'LoveThis'), ('SE', 'SuperElf')], max_length=2),
        ),
        migrations.AlterField(
            model_name='tvote',
            name='option',
            field=models.CharField(choices=[('TR', 'Troll'), ('DL', 'DisLike'), ('LK', 'Like'), ('LV', 'LoveThis'), ('SE', 'SuperElf')], max_length=2),
        ),
    ]
