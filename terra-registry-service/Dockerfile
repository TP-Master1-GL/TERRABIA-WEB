FROM openjdk:17-jdk-slim

WORKDIR /tmp
ADD target/terra-registry-service.jar terra-registry-service.jar

ENTRYPOINT ["java", "-jar", "terra-registry-service.jar"]