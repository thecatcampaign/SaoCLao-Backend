import { Module, HttpModule } from '@nestjs/common';
import { TracksController } from './tracks.controller';
import { TracksService } from './tracks.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 7000,
        maxRedirects: 7,
      }),
    }),
  ],
  controllers: [TracksController],
  providers: [TracksService],
})
export class TracksModule {}
