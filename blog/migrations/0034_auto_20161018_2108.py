# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-10-19 01:08
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0033_thread_is_active'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userprofile',
            name='last_response',
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='last_vote',
        ),
    ]