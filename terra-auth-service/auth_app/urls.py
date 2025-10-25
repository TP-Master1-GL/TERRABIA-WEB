# auth_app/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),         # ← name='login'
    path('refresh/', views.RefreshView.as_view(), name='refresh'),   # ← name='refresh'
    path('validate/', views.ValidateView.as_view(), name='validate'), # ← name='validate'
    path('logout/', views.LogoutView.as_view(), name='logout'),      # ← name='logout'
    # path('register/', views.RegisterView.as_view(), name='register'),
]