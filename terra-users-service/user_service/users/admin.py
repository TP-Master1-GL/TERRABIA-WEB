from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, EmailVerificationToken, PasswordResetToken

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email', 'username', 'role', 'is_staff', 'is_verified', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'role')
    search_fields = ('email', 'username', 'phone_number')
    ordering = ('email',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informations personnelles', {'fields': ('username', 'phone_number', 'address', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_verified', 'groups', 'user_permissions')}),
        ('Dates importantes', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'role', 'is_staff', 'is_superuser', 'is_verified')}
        ),
    )

admin.site.register(EmailVerificationToken)
admin.site.register(PasswordResetToken)
