from django.contrib import admin
from .models import Thread
from .models import Response
from .models import TVote
from .models import RVote
from .models import UserProfile

admin.site.register(Thread)
admin.site.register(Response)
admin.site.register(TVote)
admin.site.register(RVote)
admin.site.register(UserProfile)
