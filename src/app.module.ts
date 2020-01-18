import { PlaylistsController } from './modules/playlists/playlists.controller';
import { CheckAuthentication } from './middlewares/checkAuthentication.middleware';
import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
  OnModuleInit,
  HttpService,
  HttpModule,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TracksService } from './modules/tracks/tracks.service';
import { TracksController } from './modules/tracks/tracks.controller';
import { TracksModule } from './modules/tracks/tracks.module';
import { UsersModule } from './modules/users/users.module';
import { CommonModule } from './common/common.module';
import { UsersController } from './modules/users/users.controller';
import { PlaylistsModule } from './modules/playlists/playlists.module';

@Module({
  imports: [TracksModule, CommonModule, UsersModule, PlaylistsModule],
  controllers: [AppController, TracksController],
  providers: [AppService, TracksService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CheckAuthentication)
      .exclude(
        { path: 'tracks/trending', method: RequestMethod.GET },
        { path: 'tracks/search/:name', method: RequestMethod.GET },
      )
      .forRoutes(TracksController);

    consumer
      .apply(CheckAuthentication)
      .exclude(
        { path: 'users', method: RequestMethod.POST },
        { path: 'users/liker/:trackId', method: RequestMethod.ALL },
      )
      .forRoutes(UsersController);

    consumer.apply(CheckAuthentication).forRoutes(PlaylistsController);
  }
}
