from __future__ import unicode_literals

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User	
from django.db.models import signals


class UserProfile(models.Model):
	yesterday = timezone.now() - timezone.timedelta(days=1)
	
	user = models.OneToOneField('auth.User', related_name='profile', primary_key=True)
	favorites = models.CharField(max_length=200, null=True)
	troll_check = models.DateTimeField(null=True)
	origin_date = models.DateTimeField(null=True)
	
	def __unicode__(self):
		return self.user.username
		
#####################################################		
#create userProfile instance when user is created
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

signals.post_save.connect(create_user_profile, sender=User)
#####################################################


class Thread(models.Model):
    author = models.ForeignKey('auth.User')
    title = models.CharField(max_length=200)
    text = models.TextField()
    is_thread = models.BooleanField(default=True)
    is_active=models.IntegerField(default=0)
    resp_count = models.IntegerField(default=0)
    created_date = models.DateTimeField(
            default=timezone.now)
    published_date = models.DateTimeField(
            blank=True, null=True)

    def publish(self):
        self.published_date = timezone.now()
        self.save()

    def __str__(self):
        return self.title
        
        
        
class Response(models.Model):
	thread=models.ForeignKey('Thread', null=True, on_delete=models.CASCADE)
	author=models.ForeignKey('auth.User', related_name = 'response_author')
	title=models.CharField(max_length=200)
	text=models.TextField()
	is_thread=models.BooleanField(default=False)
	is_active=models.IntegerField(default=0)
	created_date=models.DateTimeField(default=timezone.now)
	published_date=models.DateTimeField(blank=True,null=True)
	
	def publish(self):
		self.published_date=timezone.now()
		self.save()

	def __str__(self):
		return self.title
	
class TVote(models.Model):
	MY_CHOICES=(('TR','Troll'),('SE','SuperElf'))
	post=models.ForeignKey('Thread',on_delete=models.CASCADE)
	option=models.CharField(max_length=2,choices=MY_CHOICES)
	user=models.ForeignKey(User)
	published_date=models.DateTimeField(blank=True,null=True)

	class Meta:
		unique_together=(
			('post','user'),
		)

	def publish(self):
		self.published_date=timezone.now()
		self.save()
	
	def __str__(self):
		return "%s|%s|%s|tvote" % (self.option, self.post, self.post.id)
		

class RVote(models.Model):
	MY_CHOICES=(('TR','Troll'),('SE','SuperElf'))
	post=models.ForeignKey('Response',on_delete=models.CASCADE)
	option=models.CharField(max_length=2,choices=MY_CHOICES)
	user=models.ForeignKey(User)
	published_date=models.DateTimeField(blank=True,null=True)

	class Meta:
		unique_together=(
			('post','user'),
		)
	def publish(self):
		self.published_date=timezone.now()
		self.save()
	
	def __str__(self):
		return "%s|%s|%s|rvote" % (self.option, self.post, self.post.id)
	
	
        
