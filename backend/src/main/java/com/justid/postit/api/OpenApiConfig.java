package com.justid.postit.api;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI (OAS 3) wordt hier als bean geregistreerd; springdoc genereert het
 * schema en Swagger UI.
 * Zo blijft het contract van de API actief en testbaar (Postman kan importeren
 * vanaf /api-docs).
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI postItOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Justid Post-it API")
                        .version("v1")
                        .description("REST endpoints voor gebruikers en post-its (CRUD, slepen/positie, archief).")
                        .contact(new Contact().name("Justid code-opdracht")));
    }
}
