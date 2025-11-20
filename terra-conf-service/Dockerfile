FROM openjdk:17-jdk-slim

WORKDIR /tmp
ADD target/terra-conf-service.jar terra-conf-service.jar

ENTRYPOINT ["java", "-jar", "terra-conf-service.jar"]