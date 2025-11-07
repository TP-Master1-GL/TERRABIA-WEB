from django.db import models

class Categorie(models.Model):
    categorie_id = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nom


class Produit(models.Model):
    produit_id = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)
    unite_mesure = models.CharField(max_length=50)
    est_bio = models.BooleanField(default=False)
    est_publier = models.BooleanField(default=False)
    date_publication = models.DateTimeField(auto_now_add=True)
    condition_conservation = models.TextField(blank=True, null=True)
    categorie = models.ForeignKey(
        Categorie,
        on_delete=models.SET_NULL,
        null=True,
        related_name='produits'
    )
    id_agriculteur = models.IntegerField()  # Correspond à l'id_user dans le service users

    def __str__(self):
        return self.nom


class Media(models.Model):
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]

    media_id = models.AutoField(primary_key=True)
    url_fichier = models.URLField()
    type_media = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    date_upload = models.DateTimeField(auto_now_add=True)
    produit = models.ForeignKey(
        Produit,
        on_delete=models.CASCADE,
        related_name='medias'
    )

    def __str__(self):
        return f"{self.type_media} - {self.url_fichier}"
