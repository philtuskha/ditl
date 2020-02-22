from django import template
from django.utils import timezone
import datetime
from blog.models import Thread, Response


register = template.Library()

@register.simple_tag
def time_since_post(thread_time):
	diff = timezone.now() - thread_time
	days = diff.days
	seconds = diff.seconds
	total_seconds = diff.total_seconds()
	total_seconds = (total_seconds/86400) * 49.9 
	return total_seconds

@register.simple_tag
def clock(thread_time):
	diff = timezone.now() - thread_time
	hours = round(23 - (diff.seconds / 60 / 60))
	minutes = round(59 - (diff.seconds / 60 % 60))
	minutes = str(minutes)
	if len(minutes) != 2:
		minutes = "0" + minutes
	return "%s:%s" % (hours, minutes)
	

@register.simple_tag
def get_user_votes(post_id, set, user):
	x = set.filter(post=post_id, user=user)
	if x.count() > 0:
		return x[0].option
		
 		
@register.simple_tag
def get_votes_r(post_id, set, user):
	x = set.filter(post=post_id, user=user)
	if x.count() > 0:
		return x[0].option
		
		
# @register.simple_tag
# def split_vote(string, num):
# 	vote_list = str(string).split("|")
# 	return vote_list[num]

@register.simple_tag
def get_respo_title(id):
	x = Response.objects.get(pk=id)
	return x
	
@register.simple_tag
def get_thread_title(id):
	x = Thread.objects.get(pk=id)
	return x		
		
@register.simple_tag
def get_votes(post_id, set):
	x = set.filter(post=post_id)
	l = ""
	tally = [0,"Like -",0,"Troll"]
	
	if x.count() > 0:
		for i in x:
			if i.option == "SE":
				tally[0] += 1
				
			elif i.option == "TR":
				tally[2] += 1
		
	return ' '.join(map(str, tally))

@register.simple_tag
def get_all_votes(post_id, tset, respo_set):
	t = tset.filter(post=post_id)
	rvset = respo_set.filter(thread_id=post_id)
	tally = [0,"Like -",0,"Troll"]
# 	response_count = rvset.count()
	
	
	for rv in rvset:
		# r.append(rv.rvote_set.all())
		for j in rv.rvote_set.all():
			# if j.count() > 0:
			
			if j.option == "SE":
				tally[0] += 1
			elif j.option == "TR":
				tally[2] += 1
	
	if t.count() > 0:
		for i in t:
			if i.option == "SE":
				tally[0] += 1
			elif i.option == "TR":
				tally[2] += 1
		
	return ' '.join(map(str, tally)) 
		
#alt version for binding votes to icon during django for loop.  ABOVE: javascript version
# @register.simple_tag
# def get_votes(thread_id, set, key):
# 	x = set.filter(thread=thread_id)
# 	if x.count() > 0:
# 		if x[0].option == key:
# 			return "style=background:#f28c8c;"
# 		else:
# 			return ""