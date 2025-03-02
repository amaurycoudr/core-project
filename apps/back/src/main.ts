import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { generateOpenApi } from '@ts-rest/open-api';
import { contract } from '@repo/contract';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Config } from './config/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();

    const configService = app.get(ConfigService<Config, true>);

    const document = generateOpenApi(
        contract,
        {
            info: { title: 'Projection API', version: '1.0.0' },
            servers: [{ url: configService.get('BASE_URL') }],
            security: [{ bearerAuth: [] }],
            components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', name: 'Authorization', bearerFormat: 'JWT' } } },
        } satisfies Omit<OpenAPIObject, 'paths' | 'openapi'>,
        { setOperationId: true },
    );

    SwaggerModule.setup('api-docs', app, document, {
        jsonDocumentUrl: 'api-docs.json',
    });

    await app.listen(configService.get('PORT'));
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
