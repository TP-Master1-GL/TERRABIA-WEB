FROM openjdk:17-jdk-slim

WORKDIR /tmp
ADD target/terra-proxy-service.jar terra-proxy-service.jar

ENTRYPOINT ["java", "-jar", "terra-proxy-service.jar"]