from django.conf import settings

def get_config_value(config_path, default_value=None):
    """
    Récupère une valeur de configuration depuis BUSINESS_CONFIG
    Exemple: get_config_value('order.status.pending', 'PENDING')
    """
    keys = config_path.split('.')
    config = settings.BUSINESS_CONFIG
    
    for key in keys:
        if isinstance(config, dict) and key in config:
            config = config[key]
        else:
            return default_value
    
    return config if config is not None else default_value

# Fonctions spécifiques pour les modèles
def get_order_status(status_key):
    """Récupère un statut de commande depuis la configuration"""
    return get_config_value(f'ORDER_CONFIG.status.{status_key}', status_key.upper())

def get_transaction_type(type_key):
    """Récupère un type de transaction depuis la configuration"""
    return get_config_value(f'TRANSACTION_CONFIG.types.{type_key}', type_key.upper())

def get_transaction_status(status_key):
    """Récupère un statut de transaction depuis la configuration"""
    return get_config_value(f'TRANSACTION_CONFIG.status.{status_key}', status_key.upper())

def get_payment_method(method_key):
    """Récupère une méthode de paiement depuis la configuration"""
    return get_config_value(f'TRANSACTION_CONFIG.payment_methods.{method_key}', method_key.upper())

def get_order_number_prefix():
    """Récupère le préfixe des numéros de commande"""
    return get_config_value('ORDER_CONFIG.number_prefix', 'TRB')

def get_transaction_reference_prefix():
    """Récupère le préfixe des références de transaction"""
    return get_config_value('TRANSACTION_CONFIG.reference_prefix', 'TXN')

def get_platform_commission_rate():
    """Récupère le taux de commission de la plateforme"""
    return get_config_value('PAYMENT_CONFIG.platform_commission_rate', 5.0)

def get_delivery_base_fee():
    """Récupère les frais de livraison de base"""
    return get_config_value('DELIVERY_CONFIG.base_fee', 500)

def get_delivery_free_threshold():
    """Récupère le seuil de livraison gratuite"""
    return get_config_value('DELIVERY_CONFIG.free_threshold', 10000)

def is_payment_simulation_enabled():
    """Vérifie si la simulation de paiement est activée"""
    return get_config_value('PAYMENT_CONFIG.simulation_enabled', True)

def get_payment_simulation_success_rate():
    """Récupère le taux de succès de simulation"""
    return get_config_value('PAYMENT_CONFIG.simulation_success_rate', 0.95)

# Constantes pratiques pour l'application
def get_order_status_choices():
    """Retourne les choix de statut de commande dynamiques"""
    status_config = get_config_value('ORDER_CONFIG.status', {})
    if not status_config:
        return [
            ('PENDING', 'En attente'),
            ('CONFIRMED', 'Confirmée'),
            ('PAID', 'Payée'),
            ('IN_DELIVERY', 'En livraison'),
            ('DELIVERED', 'Livrée'),
            ('COMPLETED', 'Terminée'),
            ('CANCELLED', 'Annulée'),
        ]
    
    status_display = {
        'pending': 'En attente',
        'confirmed': 'Confirmée', 
        'paid': 'Payée',
        'in_delivery': 'En livraison',
        'delivered': 'Livrée',
        'completed': 'Terminée',
        'cancelled': 'Annulée',
    }
    
    return [
        (status_config.get(key, key.upper()), display)
        for key, display in status_display.items()
    ]

def get_transaction_type_choices():
    """Retourne les choix de type de transaction dynamiques"""
    types_config = get_config_value('TRANSACTION_CONFIG.types', {})
    if not types_config:
        return [
            ('PAYMENT', 'Paiement'),
            ('REFUND', 'Remboursement'),
            ('COMMISSION', 'Commission'),
            ('PAYOUT', 'Paiement agriculteur'),
        ]
    
    type_display = {
        'payment': 'Paiement',
        'refund': 'Remboursement',
        'commission': 'Commission', 
        'payout': 'Paiement agriculteur',
    }
    
    return [
        (types_config.get(key, key.upper()), display)
        for key, display in type_display.items()
    ]

def get_payment_method_choices():
    """Retourne les choix de méthode de paiement dynamiques"""
    methods_config = get_config_value('TRANSACTION_CONFIG.payment_methods', {})
    if not methods_config:
        return [
            ('MOBILE_MONEY', 'Mobile Money'),
            ('ORANGE_MONEY', 'Orange Money'),
            ('MTN_MOMO', 'MTN Mobile Money'),
            ('CASH', 'Espèces'),
            ('BANK_TRANSFER', 'Virement bancaire'),
        ]
    
    method_display = {
        'mobile_money': 'Mobile Money',
        'orange_money': 'Orange Money',
        'mtn_momo': 'MTN Mobile Money',
        'cash': 'Espèces',
        'bank_transfer': 'Virement bancaire',
    }
    
    return [
        (methods_config.get(key, key.upper()), display)
        for key, display in method_display.items()
    ]

def get_transaction_status_choices():
    """Retourne les choix de statut de transaction dynamiques"""
    status_config = get_config_value('TRANSACTION_CONFIG.status', {})
    if not status_config:
        return [
            ('PENDING', 'En attente'),
            ('PROCESSING', 'En traitement'),
            ('SUCCESS', 'Réussie'),
            ('FAILED', 'Échouée'),
            ('REVERSED', 'Annulée'),
        ]
    
    status_display = {
        'pending': 'En attente',
        'processing': 'En traitement',
        'success': 'Réussie', 
        'failed': 'Échouée',
        'reversed': 'Annulée',
    }
    
    return [
        (status_config.get(key, key.upper()), display)
        for key, display in status_display.items()
    ]