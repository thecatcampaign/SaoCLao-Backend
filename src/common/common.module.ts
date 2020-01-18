import { Module, HttpModule } from '@nestjs/common';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 6000,
        maxRedirects: 6,
      }),
    }),
  ],
  exports: [HttpModule],
})
export class CommonModule {}
