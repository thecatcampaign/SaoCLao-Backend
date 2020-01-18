import { AllExceptionsFilter } from './filters/allExceptions.filter';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import express from 'express';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { ValidationPipe } from '@nestjs/common';
let serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://react-movie-2dee0.firebaseio.com',
});

const server = express();

export const createNestServer = async (expressInstance) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  return app.init();
};

createNestServer(server);
    // .then(v => console.log('Nest Ready'))
    // .catch(err => console.error('Nest broken', err));

export const api = functions.https.onRequest(server);
