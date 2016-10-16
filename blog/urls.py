from . import views
#from . import ajax
from django.conf.urls import include, url
from django.contrib import admin

urlpatterns = [
    url(r'^thread_list$', views.thread_list, name='thread_list'),
    url(r'^status/$', views.status, name='status'),
    url(r'^notifications/$', views.notifications, name='notifications'),
    url(r'^user_view/$', views.user_view, name='user_view'),
    url(r'^keywords$', views.keywords, name='keywords'),
    url(r'^thread/(?P<pk>[0-9]+)/$', views.thread_detail, name='thread_detail'),
    url(r'^thread_detail_detail/(?P<pk>[0-9]+)/$', views.thread_detail_detail, name='thread_detail_detail'),
    url(r'^vote/$', views.vote, name='vote'),
    url(r'^update_page/$', views.update_page, name='update_page'),
    url(r'^delete_post/$', views.delete_post, name='delete_post'),
    url(r'^restore_post/$', views.restore_post, name='restore_post'),
    url(r'^thread/new/$', views.thread_new, name='thread_new'),
    url(r'^$', views.home, name='home'),
    url(r'^ajax/add/$', views.add_thread, name='add_thread'),
    url(r'^profile_test/$', views.profile_test, name='profile_test'),
]