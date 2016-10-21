# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-10-12 20:48
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0029_userprofile_activity'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userprofile',
            name='activity',
        ),
        migrations.AddField(
            model_name='userprofile',
            name='activity_responses',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='activity_rvotes',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='activity_threads',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='activity_tvotes',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='last_response',
            field=models.CharField(max_length=200, null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='last_thread',
            field=models.CharField(max_length=200, null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='last_vote',
            field=models.CharField(max_length=200, null=True),
        ),
    ]