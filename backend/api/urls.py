from django.urls import path
from .views import admin_register, user_register, user_login, admin_login, create_event,events_list

urlpatterns = [
    path('api/admin/register/', admin_register, name='admin_register'),
    path('api/admin/login/', admin_login, name='admin_login'),
    path('api/user/register/', user_register, name='user_register'),
    path('api/user/login/', user_login, name='user_login'),
    path('api/create-event/', create_event, name='create_event'),
    path('api/get-events/', events_list, name='get_events'),
]