from django.urls import path
from . import views

app_name = 'authentication'

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/update/', views.ProfileUpdateView.as_view(), name='profile_update'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('stats/', views.user_stats, name='user_stats'),
    path('resend-verification/', views.resend_verification_email, name='resend_verification'),
] 