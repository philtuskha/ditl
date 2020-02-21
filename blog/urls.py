from . import views
#from . import ajax
from django.urls import path

urlpatterns = [
    path('thread_list', views.thread_list, name='thread_list'),
    path('status/', views.status, name='status'),
    path('notifications/', views.notifications, name='notifications'),
    path('user_view/', views.user_view, name='user_view'),
    path('keywords', views.keywords, name='keywords'),
    path('thread/<int:pk>/', views.thread_detail, name='thread_detail'),
    path('thread_detail_detail/<int:pk>/', views.thread_detail_detail, name='thread_detail_detail'),
    path('vote/', views.vote, name='vote'),
    path('update_page/', views.update_page, name='update_page'),
    path('delete_post/', views.delete_post, name='delete_post'),
    path('restore_post/', views.restore_post, name='restore_post'),
    path('thread/new/', views.thread_new, name='thread_new'),
    path('', views.home, name='home'),
    path('ajax/add/', views.add_thread, name='add_thread'),
    path('profile_test/', views.profile_test, name='profile_test'),
    path('guest_user/', views.guest_user, name='guest_user'),
]