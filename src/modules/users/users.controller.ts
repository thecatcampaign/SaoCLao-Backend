import { User } from './../../decorators/user.decorator';
import {
  UserInfo,
  user,
  UserRecord,
} from 'firebase-functions/lib/providers/auth';
import { User } from '../../decorators/user.decorator';
import { CreateAccontDto } from './dtos/createAccount.dto';
import { UsersService } from './users.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';

import { QuerySnapshot, DocumentData } from '@google-cloud/firestore';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('/')
  async createAccount(
    @Body() createAccountDto: CreateAccontDto,
  ): Promise<UserRecord> {
    return this.userService.createAccount(createAccountDto);
  }

  @Get('/')
  async getProfile(@User() user): Promise<UserRecord> {
    return this.userService.getProfile(user);
  }

  @Get('/liker/:trackId/')
  async getLikerByTrackId(
    @Param('trackId', ParseIntPipe) trackId: number,
  ): Promise<DocumentData[]> {
    return this.userService.getLikerByTrackId(trackId);
  }
}
