from django.contrib import admin
from .models import Thread
from .models import Response
from .models import TVOption
from .models import RVOption
from .models import TVote
from .models import RVote

admin.site.register(Thread)
admin.site.register(Response)
admin.site.register(TVOption)
admin.site.register(RVOption)
admin.site.register(TVote)
admin.site.register(RVote)
