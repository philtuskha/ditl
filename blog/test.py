import json
from django.shortcuts import render, get_object_or_404, render_to_response, redirect
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Q, Count
from django.template.context import RequestContext
from django.http import Http404, HttpResponse
from .models import Thread, TVote, Response, RVote, UserProfile, User
from .forms import ThreadForm, TVoteForm, ResponseForm, RVoteForm
from django.contrib.auth.models import Permission
from nltk import sent_tokenize, word_tokenize, pos_tag

threads=Thread.objects.filter(published_date__lte=timezone.now())
for thread in threads:

	t = thread.tvote_set.filter(post=thread.pk)
	rvset = thread.response_set.filter(thread_id=thread.pk)
	for rv in rvset:
		r = rv.rvote_set.filter(post=thread.pk)

	tally = [0,"Troll -",0,"Elf"]
	if t.count() > 0:
		for i in t:
			if i.option == "TR":
				tally[0] += 1
			elif i.option == "SE":
				tally[2] += 1
	print tally
# 		for j in r:
		
			# if j.thread_id == "TR":
# 				tally[0] += 1
# 			elif j.option == "SE":
# 				tally[2] += 1