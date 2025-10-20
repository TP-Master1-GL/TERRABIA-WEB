package com.terrabia.terra_conf_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.config.server.EnableConfigServer;

@EnableConfigServer
@SpringBootApplication
public class TerraConfServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(TerraConfServiceApplication.class, args);
	}

}
