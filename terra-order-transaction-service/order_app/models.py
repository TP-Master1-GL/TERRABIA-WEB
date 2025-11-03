from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
import uuid

class Order(models.Model):
    """Modèle représentant une commande"""
    
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('CONFIRMED', 'Confirmée'),
        ('PAID', 'Payée'),
        ('IN_DELIVERY', 'En livraison'),
        ('DELIVERED', 'Livrée'),
        ('COMPLETED', 'Terminée'),
        ('CANCELLED', 'Annulée'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=20, unique=True, editable=False)
    
    # Références utilisateurs (IDs du service utilisateur)
    buyer_id = models.CharField(max_length=100, db_index=True)
    farmer_id = models.CharField(max_length=100, db_index=True)
    
    # Statut et dates
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    # Montants
    subtotal = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    delivery_fee = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=Decimal('0.00')
    )
    total_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    
    # Informations de livraison
    delivery_id = models.CharField(max_length=100, null=True, blank=True)
    delivery_address = models.TextField()
    delivery_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    delivery_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Informations agriculteur
    farmer_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    farmer_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Notes
    buyer_notes = models.TextField(blank=True, null=True)
    cancellation_reason = models.TextField(blank=True, null=True)
    admin_notes = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['buyer_id', '-created_at']),
            models.Index(fields=['farmer_id', '-created_at']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['order_number']),
        ]
    
    def __str__(self):
        return f"Order {self.order_number} - {self.status}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            # Générer un numéro de commande unique
            import datetime
            timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
            self.order_number = f"TRB{timestamp}{str(uuid.uuid4())[:4].upper()}"
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    """Modèle représentant un article dans une commande"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    
    # Référence au produit (ID du service catalogue)
    product_id = models.CharField(max_length=100, db_index=True)
    product_name = models.CharField(max_length=255)
    product_category = models.CharField(max_length=100, blank=True)
    
    # Détails de l'article
    quantity = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    unit = models.CharField(max_length=50, default='kg')
    unit_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    total_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    
    # Informations additionnelles
    product_image_url = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'order_items'
        ordering = ['product_name']
    
    def __str__(self):
        return f"{self.product_name} x {self.quantity} {self.unit}"
    
    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class Transaction(models.Model):
    """Modèle représentant une transaction financière (Ledger)"""
    
    TRANSACTION_TYPES = [
        ('PAYMENT', 'Paiement'),
        ('REFUND', 'Remboursement'),
        ('COMMISSION', 'Commission'),
        ('PAYOUT', 'Paiement agriculteur'),
    ]
    
    PAYMENT_METHODS = [
        ('MOBILE_MONEY', 'Mobile Money'),
        ('ORANGE_MONEY', 'Orange Money'),
        ('MTN_MOMO', 'MTN Mobile Money'),
        ('CASH', 'Espèces'),
        ('BANK_TRANSFER', 'Virement bancaire'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('PROCESSING', 'En traitement'),
        ('SUCCESS', 'Réussie'),
        ('FAILED', 'Échouée'),
        ('REVERSED', 'Annulée'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction_reference = models.CharField(max_length=100, unique=True, editable=False)
    
    # Lien avec la commande
    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name='transactions')
    
    # Type et méthode
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    
    # Montants
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    
    # Parties impliquées
    payer_id = models.CharField(max_length=100)
    payee_id = models.CharField(max_length=100)
    
    # Statut et dates
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    # Informations du provider de paiement
    provider_transaction_id = models.CharField(max_length=255, blank=True, null=True)
    provider_response = models.JSONField(blank=True, null=True)
    
    # Notes
    description = models.TextField(blank=True)
    failure_reason = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order', '-created_at']),
            models.Index(fields=['payer_id', '-created_at']),
            models.Index(fields=['payee_id', '-created_at']),
            models.Index(fields=['transaction_reference']),
            models.Index(fields=['status', '-created_at']),
        ]
    
    def __str__(self):
        return f"Transaction {self.transaction_reference} - {self.amount} XAF"
    
    def save(self, *args, **kwargs):
        if not self.transaction_reference:
            import datetime
            timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
            self.transaction_reference = f"TXN{timestamp}{str(uuid.uuid4())[:6].upper()}"
        super().save(*args, **kwargs)


class PaymentAttempt(models.Model):
    """Historique des tentatives de paiement pour audit"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='attempts')
    
    attempt_number = models.IntegerField(default=1)
    attempted_at = models.DateTimeField(auto_now_add=True)
    
    request_data = models.JSONField(blank=True, null=True)
    response_data = models.JSONField(blank=True, null=True)
    
    success = models.BooleanField(default=False)
    error_message = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'payment_attempts'
        ordering = ['-attempted_at']
    
    def __str__(self):
        return f"Attempt {self.attempt_number} for {self.transaction.transaction_reference}"