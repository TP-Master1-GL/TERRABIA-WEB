package com.terrabia.terra_registry_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@EnableEurekaServer
@SpringBootApplication
public class TerraRegistryServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(TerraRegistryServiceApplication.class, args);
	}

}
