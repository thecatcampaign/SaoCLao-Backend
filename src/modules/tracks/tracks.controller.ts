import { GetBatchDto } from './../../common/getBatch.dto';
import { Track } from './entities/track.entity';
import { TracksService } from './tracks.service';
import {
  Controller,
  Get,
  Body,
  Post,
  Param,
  Query,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { User } from '../../decorators/user.decorator';
import { UserRecord } from 'firebase-functions/lib/providers/auth';
import { DocumentData } from '@google-cloud/firestore';

@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get('/trending')
  addTrendingTracks(@Query() getBatchDto: GetBatchDto): Promise<Object> {
    return this.tracksService.addTrendingTracks(getBatchDto);
  }

  @Get('/search/:name')
  addSearchingTracks(
    @Param('name') searchKw: string,
    @Query() getBatchDto: GetBatchDto,
  ): Promise<Object> {
    return this.tracksService.addSearchingTracks(searchKw, getBatchDto);
  }

  @Post('/plays_history')
  playTrack(
    @User() user: UserRecord,
    @Body('trackId', ParseIntPipe) trackId: number,
  ): Promise<string> {
    return this.tracksService.playTrack(user, trackId);
  }

  @Get('/plays_history')
  async getTracksByUserPlays(
    @User() user: UserRecord,
    @Query() getBatchDto: GetBatchDto,
  ): Promise<Object> {
    return this.tracksService.getTracksByUserPlays(user, getBatchDto);
  }

  @Get('/likes')
  async getTracksByUserFavorites(
    @User() user,
    @Query() getBatchDto: GetBatchDto,
  ): Promise<Object> {
    return this.tracksService.getTracksByUserFavorites(user, getBatchDto);
  }

  @Get('/likes/ids')
  async getTrackIdsByUserFavorites(@User() user): Promise<any[]> {
    return this.tracksService.getTrackIdsByUserFavorites(user);
  }

  @Post('/:trackId/likes')
  async likeTrack(
    @User() user,
    @Param('trackId', ParseIntPipe) trackId: number,
  ): Promise<string> {
    return this.tracksService.likeTrack(user, trackId);
  }

  @Delete('/:trackId/likes')
  async unlikeTrack(
    @User() user,
    @Param('trackId', ParseIntPipe) trackId: number,
  ): Promise<string> {
    return this.tracksService.unlikeTrack(user, trackId);
  }
}
