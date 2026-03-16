from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('register/', views.register_view, name='register'),
    path('verify-email/<uuid:token>/', views.verify_email_view, name='verify_email'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path('tasks/', views.task_list_view, name='task_list'),
    path('add-task/', views.add_task_view, name='add_task'),
    path('task/<int:id>/', views.task_detail_view, name='task_detail'),
    path('complete/<int:id>/', views.complete_task_view, name='complete_task'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('analytics/', views.analytics_dashboard_view, name='analytics'),
]
