from rest_framework import serializers
from .models import Order, OrderItem, Transaction, PaymentAttempt

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'
        read_only_fields = ('id', 'total_price')

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ('id', 'transaction_reference', 'created_at')

class PaymentAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentAttempt
        fields = '__all__'
        read_only_fields = ('id', 'attempted_at')

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    transactions = TransactionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('id', 'order_number', 'created_at', 'updated_at')

class CreateOrderSerializer(serializers.Serializer):
    buyer_id = serializers.CharField(max_length=100)
    farmer_id = serializers.CharField(max_length=100)
    items = serializers.ListField(
        child=serializers.DictField(),
        write_only=True
    )
    delivery_address = serializers.CharField()
    delivery_latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    delivery_longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    buyer_notes = serializers.CharField(required=False, allow_blank=True)

class UpdateOrderStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
    cancellation_reason = serializers.CharField(required=False, allow_blank=True)
    admin_notes = serializers.CharField(required=False, allow_blank=True)

class CreateTransactionSerializer(serializers.Serializer):
    order_id = serializers.UUIDField()
    transaction_type = serializers.ChoiceField(choices=Transaction.TRANSACTION_TYPES)
    payment_method = serializers.ChoiceField(choices=Transaction.PAYMENT_METHODS)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    payer_id = serializers.CharField(max_length=100)
    payee_id = serializers.CharField(max_length=100)
    description = serializers.CharField(required=False, allow_blank=True)