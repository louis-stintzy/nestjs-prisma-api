import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const config: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
    .setTitle('Projet3 NestJS API')
    .setDescription("Documentation de l'API du projet 3 de la formation NestJS")
    .setVersion('1.0')
    .addTag('users')
    .addTag('articles')
    .build();
  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
