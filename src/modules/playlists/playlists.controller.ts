import { GetBatchDto } from '../../common/getBatch.dto';
import { UserRecord } from 'firebase-functions/lib/providers/auth';
import { PlaylistsService } from './playlists.service';
import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Query,
  Delete,
} from '@nestjs/common';
import { User } from '../../decorators/user.decorator';
import { DocumentData } from '@google-cloud/firestore';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Get('/')
  async getPlaylists(
    @User() user: UserRecord,
    @Query() getBatchDto: GetBatchDto,
  ): Promise<object> {
    return this.playlistsService.getPlaylists(user, getBatchDto);
  }
  @Get('/:playlistId')
  async getPlaylist(
    @User() user: UserRecord,
    @Param('playlistId') playlistId: string,
  ): Promise<DocumentData> {
    return this.playlistsService.getPlaylist(user, playlistId);
  }

  @Post('/')
  async addPlaylist(
    @User() user: UserRecord,
    @Body('name') playlistName: string,
  ): Promise<void> {
    return this.playlistsService.addPlaylist(user, playlistName);
  }

  @Post('/:playlistId/')
  async addTrackIdToPlaylist(
    @User() user: UserRecord,
    @Param('playlistId') playlistId: string,
    @Body('trackId') trackId: string,
  ): Promise<void> {
    return this.playlistsService.addTrackIdToPlaylist(
      user,
      playlistId,
      trackId,
    );
  }

  @Delete('/:playlistId/')
  async removeTrackIdFromPlaylist(
    @User() user: UserRecord,
    @Param('playlistId') playlistId: string,
    @Body('trackId') trackId: string,
  ): Promise<void> {
    return this.playlistsService.removeTrackIdFromPlaylist(
      user,
      playlistId,
      trackId,
    );
  }

  @Get('/:playlistId/tracks')
  async getTracksByPlaylistId(
    @User() user: UserRecord,
    @Param('playlistId') playlistId: string,
    @Query() getBatchDto: GetBatchDto,
  ): Promise<object> {
    return this.playlistsService.getTracksByPlaylistId(
      user,
      playlistId,
      getBatchDto,
    );
  }
}
