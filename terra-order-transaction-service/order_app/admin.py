from django.contrib import admin
from .models import Order, OrderItem, Transaction, PaymentAttempt

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'buyer_id', 'farmer_id', 'status', 'total_amount', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('order_number', 'buyer_id', 'farmer_id')
    readonly_fields = ('order_number', 'created_at', 'updated_at')
    fieldsets = (
        ('Informations de base', {
            'fields': ('order_number', 'buyer_id', 'farmer_id', 'status')
        }),
        ('Montants', {
            'fields': ('subtotal', 'delivery_fee', 'total_amount')
        }),
        ('Livraison', {
            'fields': ('delivery_id', 'delivery_address', 'delivery_latitude', 'delivery_longitude')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at', 'confirmed_at', 'paid_at', 'delivered_at', 'completed_at', 'cancelled_at')
        }),
        ('Notes', {
            'fields': ('buyer_notes', 'cancellation_reason', 'admin_notes')
        }),
    )

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('total_price',)

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'order', 'quantity', 'unit_price', 'total_price')
    list_filter = ('product_category',)
    search_fields = ('product_name', 'order__order_number')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_reference', 'order', 'transaction_type', 'payment_method', 'amount', 'status', 'created_at')
    list_filter = ('transaction_type', 'payment_method', 'status', 'created_at')
    search_fields = ('transaction_reference', 'order__order_number', 'payer_id', 'payee_id')
    readonly_fields = ('transaction_reference', 'created_at')
    fieldsets = (
        ('Informations de base', {
            'fields': ('transaction_reference', 'order', 'transaction_type', 'payment_method')
        }),
        ('Montants et parties', {
            'fields': ('amount', 'payer_id', 'payee_id')
        }),
        ('Statut', {
            'fields': ('status', 'created_at', 'processed_at')
        }),
        ('Informations du fournisseur', {
            'fields': ('provider_transaction_id', 'provider_response')
        }),
        ('Notes', {
            'fields': ('description', 'failure_reason')
        }),
    )

class PaymentAttemptInline(admin.TabularInline):
    model = PaymentAttempt
    extra = 0
    readonly_fields = ('attempted_at',)

@admin.register(PaymentAttempt)
class PaymentAttemptAdmin(admin.ModelAdmin):
    list_display = ('transaction', 'attempt_number', 'success', 'attempted_at')
    list_filter = ('success', 'attempted_at')
    readonly_fields = ('attempted_at',)