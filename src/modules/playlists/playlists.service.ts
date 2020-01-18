import { GetBatchDto } from '../../common/getBatch.dto';
import { UserRecord } from 'firebase-functions/lib/providers/auth';
import {
  Injectable,
  HttpService,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DocumentData } from '@google-cloud/firestore';
import admin = require('firebase-admin');
import {
  playlistsCollection,
  usersCollection,
  tracksCollection,
} from '../../constants/firestore.constant';
import {
  getBatchByCollection,
  getBatchByIds,
} from '../../helpers/firestore.helper';

@Injectable()
export class PlaylistsService {
  constructor(private readonly httpService: HttpService) {}

  async getPlaylists(user, getBatchDto: GetBatchDto): Promise<Object> {
    const { limit, lastVisible } = getBatchDto;
    return await getBatchByCollection(
      usersCollection.COLLECTION_NAME,
      lastVisible,
      limit,
      undefined,
      playlistsCollection.NAME,
      [user.name, playlistsCollection.COLLECTION_NAME],
    );
  }

  async getPlaylist(user, playlistId: string): Promise<DocumentData> {
    const playlistDoc = await admin
      .firestore()
      .doc(`${usersCollection.COLLECTION_NAME}/${user.name}`)
      .collection(`${playlistsCollection.COLLECTION_NAME}`)
      .doc(playlistId)
      .get();
    return playlistDoc.data();
  }

  async addPlaylist(user, playlistName: string): Promise<void> {
    const newPlaylistDoc = admin
      .firestore()
      .doc(`${usersCollection.COLLECTION_NAME}/${user.name}`)
      .collection(`${playlistsCollection.COLLECTION_NAME}`)
      .doc();

    await newPlaylistDoc.set({
      [playlistsCollection.ID]: newPlaylistDoc.id,
      [playlistsCollection.NAME]: playlistName,
      [playlistsCollection.TRACK_COUNT]: 0,
      [playlistsCollection.TRACKS]: [],
      [playlistsCollection.CREATED_AT]: admin.firestore.Timestamp.now(),
    });
  }

  async addTrackIdToPlaylist(
    user,
    playlistId: string,
    trackId: string,
  ): Promise<void> {
    const playlistDoc = await admin
      .firestore()
      .doc(`${usersCollection.COLLECTION_NAME}/${user.name}`)
      .collection(`${playlistsCollection.COLLECTION_NAME}`)
      .doc(playlistId)
      .get();

    if (!playlistDoc.exists) {
      throw new NotFoundException('This playlist does not exist');
    }

    playlistDoc.ref.update({
      [playlistsCollection.TRACKS]: admin.firestore.FieldValue.arrayUnion(
        trackId,
      ),
    });
  }

  async removeTrackIdFromPlaylist(
    user,
    playlistId: string,
    trackId: string,
  ): Promise<void> {
    const playlistDoc = await admin
      .firestore()
      .doc(`${usersCollection.COLLECTION_NAME}/${user.name}`)
      .collection(`${playlistsCollection.COLLECTION_NAME}`)
      .doc(playlistId)
      .get();

    if (!playlistDoc.exists) {
      throw new NotFoundException('This playlist does not exist');
    }

    playlistDoc.ref.update({
      [playlistsCollection.TRACKS]: admin.firestore.FieldValue.arrayRemove(
        trackId,
      ),
    });
  }

  async getTracksByPlaylistId(
    user,
    playlistId: string,
    getBatchDto: GetBatchDto,
  ): Promise<Object> {
    const { limit, lastVisible } = getBatchDto;
    const playlistDoc = await admin
      .firestore()
      .doc(`${usersCollection.COLLECTION_NAME}/${user.name}`)
      .collection(`${playlistsCollection.COLLECTION_NAME}`)
      .doc(playlistId)
      .get();
    const trackIds = playlistDoc.data()[playlistsCollection.TRACKS];
    return await getBatchByIds(
      tracksCollection.COLLECTION_NAME,
      trackIds,
      lastVisible,
      limit,
    );
  }
}
