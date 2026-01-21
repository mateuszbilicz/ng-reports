import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';
import {writeFile} from 'fs/promises';
import {ShutdownObserver} from './shutdown-observer';
import * as http from 'http';
import * as https from 'https';
import {readFileSync} from 'fs';
import {HttpsOptions} from '@nestjs/common/interfaces/external/https-options.interface';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {http as httpConfig, https as httpsConfig,} from '../ng-reports.config.json';
import {CORSController} from './resources/cors-controller';
import cors from 'cors';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'log'],
    });

    // Get the underlying HTTP adapter (Express instance)
    const server = app.getHttpAdapter().getInstance();

    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Register middleware AFTER app.init() if necessary, or let implicit setup handle it.
    // However, app.use(cors) works on the underlying express app.
    // Note: NestJS has app.enableCors() which is preferred, but we follow existing pattern if possible.
    const shutdownObserver = app.get(ShutdownObserver);
    const corsController = app.get(CORSController);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    app.use(cors(corsController.dynamicCorsController));

    const config = new DocumentBuilder()
        .setTitle('NgReports')
        .setDescription('NG Reports API')
        .setVersion('1.0')
        .addTag('projects')
        .addTag('environments')
        .addTag('reports')
        .addTag('users')
        .addTag('statistics')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    writeFile('swagger.json', JSON.stringify(document), {encoding: 'utf8'})
        .then(() => {
            console.log('Successfully written swagger.json');
        })
        .catch((err) => {
            console.error(err);
        });

    if (httpConfig.enabled) {
        try {
            // Note: NestJS app.listen() starts a server. Here we are manually creating servers.
            // app.init() does NOT start listening.
            const httpServer = http.createServer(server).listen(httpConfig.port);
            console.log('Started HTTP server on port ' + httpConfig.port);
            shutdownObserver.addHttpServer(httpServer);
        } catch (err) {
            console.log('Cannot start HTTP server');
            console.error(err);
        }
    }
    if (httpsConfig.enabled) {
        try {
            const httpsOptions: HttpsOptions = {
                key: readFileSync(httpsConfig.privateKeyPath),
                cert: readFileSync(httpsConfig.certPath),
                rejectUnauthorized: false,
            };
            const httpsServer = https
                .createServer(httpsOptions, server)
                .listen(httpsConfig.port);
            console.log('Started HTTPS server on port ' + httpsConfig.port);
            shutdownObserver.addHttpServer(httpsServer);
        } catch (err) {
            console.log('Cannot start HTTPS server');
            console.error(err);
        }
    }
}

bootstrap();
