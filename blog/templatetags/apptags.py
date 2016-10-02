from django import template
from django.utils import timezone
import datetime

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
def get_user_votes(post_id, set, user):
	x = set.filter(post=post_id, user=user)
	if x.count() > 0:
		return x[0].option
		
 		
@register.simple_tag
def get_votes_r(post_id, set, user):
	x = set.filter(post=post_id, user=user)
	if x.count() > 0:
		return x[0].option
		
		
@register.simple_tag
def get_votes(post_id, set):
	x = set.filter(post=post_id)
	tally = [0,"Troll -",0,"Elf"]
	
	if x.count() > 0:
		for i in x:
			if i.option == "TR":
				tally[0] += 1
			elif i.option == "SE":
				tally[2] += 1
		
	return ' '.join(map(str, tally))
	
			
@register.simple_tag
def get_all_votes(post_id, tset, respo_set):
	t = tset.filter(post=post_id)
	rvset = respo_set.filter(thread_id=post_id)
	tally = [0,"Troll -",0,"Elf"]
# 	response_count = rvset.count()
	
	
	for rv in rvset:
		# r.append(rv.rvote_set.all())
		for j in rv.rvote_set.all():
			# if j.count() > 0:
			
			if j.option == "TR":
				tally[0] += 1
			elif j.option == "SE":
				tally[2] += 1
	
	if t.count() > 0:
		for i in t:
			if i.option == "TR":
				tally[0] += 1
			elif i.option == "SE":
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