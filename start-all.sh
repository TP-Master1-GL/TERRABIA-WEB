#!/bin/bash

echo "🚀 Démarrage de l'écosystème TERRABIA complet..."

# Étape 1: Services critiques et bases de données
echo "📦 Étape 1: Infrastructure de base..."
docker-compose up -d --build \
  terra-conf-service \
  terra-orders-db \
  terra-redis \
  terra-auth-db \
  terra-users-db \
  terabia_product \
  terra-notification-db \
  terra-rabbitmq

echo "⏳ Attente du démarrage des services de base (40s)..."
sleep 40

# Vérification que le config service est prêt
echo "🔍 Vérification du Config Service..."
until curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; do
    echo "⏱️  Config Service pas encore prêt, attente supplémentaire..."
    sleep 10
done

# Étape 2: Service Registry (dépend du Config Service)
echo "🔧 Étape 2: Service Registry..."
docker-compose up -d --build terra-registry-service

echo "⏳ Attente du service Eureka (30s)..."
sleep 30

# Vérification que Eureka est prêt
echo "🔍 Vérification d'Eureka..."
until curl -f http://localhost:8761 >/dev/null 2>&1; do
    echo "⏱️  Eureka pas encore prêt, attente supplémentaire..."
    sleep 10
done

# Étape 3: Tous les autres services (dépendent de Config + Eureka)
echo "🌐 Étape 3: Services métier..."
docker-compose up -d --build \
  terra-proxy-service \
  terra-auth-service \
  terra-users-service \
  terra-product-service \
  terra-order-transaction-service \
  terra-notification-service

echo "✅ Tous les services ont été lancés!"

# Affichage du statut
echo "📊 Statut des services:"
docker-compose ps

echo ""
echo "🌍 URLs d'accès:"
echo "   - Config Service: http://localhost:8080"
echo "   - Eureka Registry: http://localhost:8761"
echo "   - API Gateway: http://localhost:8082"
echo "   - Auth Service: http://localhost:8083"
echo "   - Users Service: http://localhost:8084"
echo "   - Product Service: http://localhost:8085"
echo "   - Order Service: http://localhost:8086"
echo "   - Notification Service: http://localhost:4002"
echo "   - RabbitMQ Management: http://localhost:15672 (guest/guest)"
echo ""
echo "📈 Pour suivre les logs: docker-compose logs -f"
echo "🛑 Pour tout arrêter: docker-compose down"