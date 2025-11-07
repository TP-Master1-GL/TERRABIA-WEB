#!/usr/bin/env python
import os
import re

def remove_drf_yasg_references():
    """Supprimer toutes les références à drf_yasg"""
    
    files_to_check = [
        'terra_orders/urls.py',
        'terra_orders/settings.py',
        'order_app/views.py',
    ]
    
    for file_path in files_to_check:
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                content = f.read()
            
            # Supprimer les imports drf_yasg
            content = re.sub(r'from drf_yasg\..*', '', content)
            content = re.sub(r'import drf_yasg', '', content)
            
            # Supprimer les configurations drf_yasg
            content = re.sub(r"('drf_yasg',?\s*)", '', content)
            content = re.sub(r'("drf_yasg",?\s*)', '', content)
            
            # Écrire le fichier nettoyé
            with open(file_path, 'w') as f:
                f.write(content)
            
            print(f"✓ Fichier nettoyé: {file_path}")

if __name__ == "__main__":
    remove_drf_yasg_references()
    print("Nettoyage terminé!")