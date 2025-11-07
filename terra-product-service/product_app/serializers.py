from rest_framework import serializers
from .models import Produit, Categorie, Media

class MediaSerializer(serializers.ModelSerializer):
    """
    Serializer pour Media.
    """
    class Meta:
        model = Media
        fields = ['media_id', 'url_fichier', 'type_media', 'date_upload']


class ProduitSerializer(serializers.ModelSerializer):
    """
    Serializer pour Produit avec ses médias associés.
    """
    medias = MediaSerializer(many=True, read_only=True)

    class Meta:
        model = Produit
        fields = [
            'produit_id', 'nom', 'description', 'prix_unitaire', 'unite_mesure',
            'est_bio', 'est_publier', 'date_publication', 'condition_conservation',
            'categorie', 'id_agriculteur', 'medias'
        ]


class CategorieSerializer(serializers.ModelSerializer):
    """
    Serializer pour Catégorie.
    """
    class Meta:
        model = Categorie
        fields = ['categorie_id', 'nom', 'description']


class ProduitSearchSerializer(serializers.ModelSerializer):
    """
    Serializer pour la recherche de produit.
    Inclut les informations du vendeur et note moyenne.
    """
    vendeur_info = serializers.DictField(read_only=True)
    note_moyenne_vendeur = serializers.FloatField(read_only=True)

    class Meta:
        model = Produit
        fields = [
            'produit_id', 'nom', 'description', 'prix_unitaire', 'unite_mesure',
            'est_bio', 'est_publier', 'date_publication', 'condition_conservation',
            'categorie', 'id_agriculteur', 'vendeur_info', 'note_moyenne_vendeur'
        ]
