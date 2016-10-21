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
def clock(thread_time):
	diff = timezone.now() - thread_time
	hours = 23 - (diff.seconds / 60 / 60)
	minutes = 59 - (diff.seconds / 60 % 60)
	minutes = str(minutes)
	if len(minutes) != 2:
		minutes = "0" + minutes
	return "%s:%s" % (hours, minutes)
	
# var _getCurrTime = function(startTime){
# 			var time = parseFloat(startTime, 10),
# 				hrs = 24 - (time/86400 * 24),
# 				minutes = (hrs % 1) * 60;
# 		 
# 				 hrs = Math.floor(hrs)
# 				 minutes = Math.floor(minutes)
# 				 minutes = minutes.toString().length === 1 ? "0"+ minutes.toString() : minutes
# 			 
# 				 return [time, hrs, minutes]
# 			 
# 		}
# 	
# 		var addTime = function(startTime){
# 			var clock = $( "circle.pie" ),
# 			time_div = $("#time-text"),
# 			time_div_small = $("#time-text-small")
# 			radius = clock.parent().height()/2;
# 			circumference = 2 * Math.PI * radius
# 		
# 			time_parts = _getCurrTime(startTime)
# 			console.log(circumference, time_parts)
# 			if(time_parts[0] < 86400){
# 				var off_set = (time_parts[0] / 86400) * circumference/2;//off_set.toString()
# 				off_set = (off_set).toString() + ' ' + circumference.toString();
# 				var stroke_w = radius + "px"
# 	
# 				clock.css({strokeWidth: stroke_w, strokeDasharray: off_set, transition: "stroke-dasharray", transitionTimingFunction:'ease', transitionDuration: '1s' });
# 
# 				time_div.html(time_parts[1]+" hrs & "+time_parts[2]+" min left")
# 				time_div_small.html(time_parts[1]+":"+time_parts[2]+" left")	
	
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