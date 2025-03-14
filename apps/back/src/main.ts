import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { type OpenAPIObject, SwaggerModule } from "@nestjs/swagger";
import { contract } from "@repo/contract";
import { generateOpenApi } from "@ts-rest/open-api";
import { AppModule } from "./app.module";
import type { Config } from "./config/config";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors();

	const configService = app.get(ConfigService<Config, true>);

	const document = generateOpenApi(
		contract,
		{
			info: { title: "Projection API", version: "1.0.0" },
			servers: [{ url: configService.get("BASE_URL") }],
			security: [{ bearerAuth: [] }],
			components: {
				securitySchemes: {
					bearerAuth: {
						type: "http",
						scheme: "bearer",
						name: "Authorization",
						bearerFormat: "JWT",
					},
				},
			},
		} satisfies Omit<OpenAPIObject, "paths" | "openapi">,
		{ setOperationId: true },
	);

	SwaggerModule.setup("api-docs", app, document, {
		jsonDocumentUrl: "api-docs.json",
	});

	await app.listen(configService.get("PORT"));
}

void bootstrap();
