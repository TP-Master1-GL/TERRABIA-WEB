## endpoints

Méthode	Endpoint	            Description	Accès

POST	/register/	            Inscription	Public
POST	/login/	                Connexion	Public
GET	    /profile/	            Voir profil	Authentifié
PATCH	/profile/	            Modifier profil	Authentifié
GET	    /verify-email/<token>/	Vérifier email	Public
GET 	/users/	                Liste des utilisateurs	Authentifié
POST	/users/	                Créer un utilisateur (admin)	Admin
GET	    /users/<id>/	        Détails utilisateur	Authentifié
PATCH	/users/<id>/	        Modifier utilisateur	Admin
DELETE	/users/<id>/	        Supprimer utilisateur	Admin



## Lancement des test 

chmod +x run_tests.sh
./run_tests.sh

