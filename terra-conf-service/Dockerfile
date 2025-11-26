FROM eclipse-temurin:17-jre-alpine

WORKDIR /tmp
ADD target/terra-conf-service.jar terra-conf-service.jar

ENTRYPOINT ["java", "-jar", "terra-conf-service.jar"]