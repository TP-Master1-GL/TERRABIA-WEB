FROM eclipse-temurin:17-jre-alpine

WORKDIR /tmp
ADD target/terra-proxy-service.jar terra-proxy-service.jar

ENTRYPOINT ["java", "-jar", "terra-proxy-service.jar"]