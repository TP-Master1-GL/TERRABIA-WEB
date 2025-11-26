FROM eclipse-temurin:17-jre-alpine

WORKDIR /tmp
ADD target/terra-registry-service.jar terra-registry-service.jar

ENTRYPOINT ["java", "-jar", "terra-registry-service.jar"]