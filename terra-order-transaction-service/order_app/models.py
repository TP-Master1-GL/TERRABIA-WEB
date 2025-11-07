from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from decimal import Decimal
import uuid
from .config_utils import (
    get_order_status_choices,
    get_transaction_type_choices,
    get_payment_method_choices,
    get_transaction_status_choices,
    get_order_number_prefix,
    get_transaction_reference_prefix,
    get_platform_commission_rate,
    get_delivery_base_fee,
    get_delivery_free_threshold,
    is_payment_simulation_enabled,
    get_payment_simulation_success_rate
)

class Order(models.Model):
    """Modèle représentant une commande"""
    
    # Les choix de statut sont maintenant dynamiques
    STATUS_CHOICES = get_order_status_choices()
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=20, unique=True, editable=False)
    
    # Références utilisateurs (IDs du service utilisateur)
    buyer_id = models.CharField(max_length=100, db_index=True)
    farmer_id = models.CharField(max_length=100, db_index=True)
    
    # Statut et dates - utilisation du statut par défaut depuis la config
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default=STATUS_CHOICES[0][0] if STATUS_CHOICES else 'PENDING'
    )
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
    
    # Commission de la plateforme (calculée dynamiquement)
    platform_commission = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00')
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
            # Générer un numéro de commande unique avec le préfixe dynamique
            import datetime
            timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
            prefix = get_order_number_prefix()
            self.order_number = f"{prefix}{timestamp}{str(uuid.uuid4())[:4].upper()}"
        
        # Calculer la commission de la plateforme si nécessaire
        if self.subtotal and not self.platform_commission:
            commission_rate = Decimal(str(get_platform_commission_rate())) / Decimal('100')
            self.platform_commission = self.subtotal * commission_rate
        
        # Calculer les frais de livraison si nécessaire
        if self.delivery_fee == Decimal('0.00') and self.subtotal:
            free_threshold = Decimal(str(get_delivery_free_threshold()))
            base_fee = Decimal(str(get_delivery_base_fee()))
            
            if self.subtotal < free_threshold:
                self.delivery_fee = base_fee
        
        # Recalculer le montant total
        self.total_amount = self.subtotal + self.delivery_fee
        
        super().save(*args, **kwargs)
    
    def get_status_display_name(self):
        """Retourne le nom d'affichage du statut"""
        return dict(self.STATUS_CHOICES).get(self.status, self.status)


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
    
    # Les choix sont maintenant dynamiques
    TRANSACTION_TYPES = get_transaction_type_choices()
    PAYMENT_METHODS = get_payment_method_choices()
    STATUS_CHOICES = get_transaction_status_choices()
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction_reference = models.CharField(max_length=100, unique=True, editable=False)
    
    # Lien avec la commande
    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name='transactions')
    
    # Type et méthode
    transaction_type = models.CharField(
        max_length=20, 
        choices=TRANSACTION_TYPES,
        default=TRANSACTION_TYPES[0][0] if TRANSACTION_TYPES else 'PAYMENT'
    )
    payment_method = models.CharField(
        max_length=20, 
        choices=PAYMENT_METHODS,
        default=PAYMENT_METHODS[0][0] if PAYMENT_METHODS else 'MOBILE_MONEY'
    )
    
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
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default=STATUS_CHOICES[0][0] if STATUS_CHOICES else 'PENDING'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    # Informations du provider de paiement
    provider_transaction_id = models.CharField(max_length=255, blank=True, null=True)
    provider_response = models.JSONField(blank=True, null=True)
    
    # Simulation de paiement
    is_simulated = models.BooleanField(default=False)
    
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
            prefix = get_transaction_reference_prefix()
            self.transaction_reference = f"{prefix}{timestamp}{str(uuid.uuid4())[:6].upper()}"
        
        # Marquer comme simulé si la simulation est activée
        if not self.is_simulated and is_payment_simulation_enabled():
            self.is_simulated = True
        
        super().save(*args, **kwargs)
    
    def process_payment(self):
        """Traite le paiement (simulé ou réel)"""
        from decimal import Decimal
        import random
        
        if self.is_simulated:
            # Simulation de paiement
            success_rate = get_payment_simulation_success_rate()
            success = random.random() < success_rate
            
            if success:
                self.status = 'SUCCESS'
                self.provider_response = {
                    'simulated': True,
                    'success': True,
                    'message': 'Paiement simulé réussi'
                }
            else:
                self.status = 'FAILED'
                self.failure_reason = 'Échec de paiement simulé'
                self.provider_response = {
                    'simulated': True,
                    'success': False,
                    'message': 'Paiement simulé échoué'
                }
            
            self.processed_at = timezone.now()
            self.save()
            
            return success
        else:
            # Ici, intégration avec un vrai provider de paiement
            # À implémenter selon le provider choisi
            pass


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