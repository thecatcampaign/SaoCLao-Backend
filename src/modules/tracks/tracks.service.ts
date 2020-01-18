import { GetBatchDto } from '../../common/getBatch.dto';
import {
  UnauthorizedException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { soundCloundConfig } from '../../constants/soundCloud.constant';
import { Injectable, HttpService, Param } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import admin = require('firebase-admin');
import {
  getBatchByCollection,
  getAllByIds,
  getBatchByIds,
} from '../../helpers/firestore.helper';
import { DocumentData } from '@google-cloud/firestore';
import {
  tracksCollection,
  usersCollection,
  likesCollection,
} from '../../constants/firestore.constant';

@Injectable()
export class TracksService {
  constructor(private readonly httpService: HttpService) {}

  async addTracksToCollection(tracksToBeAdd, searchKw?: string) {
    await admin.firestore().runTransaction(async transaction => {
      const tracksToBeAddTransaction = tracksToBeAdd.map(async singleTrack => {
        let track = null;
        if (searchKw) {
          track = singleTrack.track;
        } else {
          track = singleTrack;
        }
        const trackRef = admin
          .firestore()
          .doc(`${tracksCollection.COLLECTION_NAME}/${track.id}`);
        const trackDoc = await trackRef.get();

        if (trackDoc.exists) { return; }
        const data = {
          [tracksCollection.ID]: track.id,
          [tracksCollection.NAME]: track.title,
          [tracksCollection.ARTIST]: track.user.username || 'unknown',
          [tracksCollection.ALBUM]: track.album || 'unknown',
          [tracksCollection.DURATION]: track.duration,
          [tracksCollection.ARTWORK_URL]: track.artwork_url || null,
          [tracksCollection.COUNT_PLAY]: 0,
          [tracksCollection.COUNT_LIKE]: 0,
          [tracksCollection.SEARCH]: searchKw || null,
          [tracksCollection.CREATED_AT]: admin.firestore.Timestamp.now(),
        };

        return transaction.set(trackRef, data);
      });

      return await Promise.all(tracksToBeAddTransaction);
    });
  }

  async addTrendingTracks(trendingTracksDto: GetBatchDto): Promise<Object> {
    const { limit, lastVisible } = trendingTracksDto;
    // const trendingTracks = await this.httpService
    //  .get(soundCloundConfig.TRENDING_TRACKS_ENDPOINT)
    //  .toPromise();
    // await this.addTracksToCollection(trendingTracks.data.collection);

    return await getBatchByCollection(
      tracksCollection.COLLECTION_NAME,
      lastVisible,
      limit,
      [tracksCollection.SEARCH, '==', null],
      tracksCollection.CREATED_AT,
    );
  }

  async addSearchingTracks(
    searchKw: string,
    getBatchDto: GetBatchDto,
  ): Promise<Object> {
    const { limit, lastVisible } = getBatchDto;

    const searchedTracks = await this.httpService
      .get(soundCloundConfig.SEARCH_TRACKS_ENDPOINT + searchKw)
      .toPromise();
    await this.addTracksToCollection(searchedTracks.data.collection, searchKw);

    // get searched tracks
    return await getBatchByCollection(
      tracksCollection.COLLECTION_NAME,
      lastVisible,
      limit,
      [tracksCollection.SEARCH, '>', ''],
      tracksCollection.SEARCH,
    );
  }

  async playTrack(user, trackId: number): Promise<string> {
    const userRef = admin
      .firestore()
      .doc(`${usersCollection.COLLECTION_NAME}/${user.name}`); // name, not displayName

    const trackRef = admin
      .firestore()
      .doc(`${tracksCollection.COLLECTION_NAME}/${trackId}`);

    // add track to field played_hitory in user Collection, remove then add to have most recent order
    await userRef.update({
      [usersCollection.PLAYED_HISTORY]: admin.firestore.FieldValue.arrayRemove(
        trackId,
      ),
    });

    await userRef.update({
      [usersCollection.PLAYED_HISTORY]: admin.firestore.FieldValue.arrayUnion(
        trackId,
      ),
    });

    // increase play_count field of track
    trackRef.update({
      [tracksCollection.COUNT_PLAY]: admin.firestore.FieldValue.increment(1),
    });

    return 'success';
  }

  async getTracksByUserPlays(user, getBatchDto: GetBatchDto): Promise<Object> {
    const { lastVisible, limit } = getBatchDto;
    const userDoc = await admin
      .firestore()
      .doc(`${usersCollection.COLLECTION_NAME}/${user.name}`)
      .get();

    const trackHistoryIds = userDoc
      .data()
      [usersCollection.PLAYED_HISTORY].reverse(); // desc

    return await getBatchByIds(
      tracksCollection.COLLECTION_NAME,
      trackHistoryIds,
      lastVisible,
      limit,
    );
  }

  async getTracksByUserFavorites(
    user,
    getBatchDto: GetBatchDto,
  ): Promise<Object> {
    const { lastVisible, limit } = getBatchDto;
    const queryData = await admin
      .firestore()
      .collection(likesCollection.COLLECTION_NAME)
      .where(likesCollection.USERNAME, '==', user.name)
      .orderBy(likesCollection.CREATED_AT, 'desc')
      .get();

    const trackIds = queryData.docs.map(
      documentSnapshot => documentSnapshot.data()[likesCollection.TRACK_ID],
    );

    return await getBatchByIds(
      tracksCollection.COLLECTION_NAME,
      trackIds,
      lastVisible,
      limit,
    );
  }

  async getTrackIdsByUserFavorites(user): Promise<any[]> {
    const queryData = await admin
      .firestore()
      .collection(likesCollection.COLLECTION_NAME)
      .where(likesCollection.USERNAME, '==', user.name)
      .get();
    const trackIds = queryData.docs.map(
      documentSnapshot => documentSnapshot.data()[likesCollection.TRACK_ID],
    );
    return trackIds;
  }

  async likeTrack(user, trackId: number): Promise<string> {
    const userTrackRef = admin
      .firestore()
      .doc(`${likesCollection.COLLECTION_NAME}/${user.name}_${trackId}`);

    const trackRef = admin
      .firestore()
      .doc(`${tracksCollection.COLLECTION_NAME}/${trackId}`);

    const likesDoc = await userTrackRef.get();

    if (likesDoc.exists) {
      throw new NotAcceptableException();
    }

    const trackDoc = await trackRef.get();
    if (!trackDoc.exists) {
      throw new NotFoundException();
    }

    await userTrackRef.create({
      [likesCollection.USERNAME]: user.name,
      [likesCollection.TRACK_ID]: trackId,
      [likesCollection.CREATED_AT]: admin.firestore.Timestamp.now(),
    });

    // update amount count_like of track
    trackRef.update({ count_like: admin.firestore.FieldValue.increment(1) });

    return 'string';
  }

  async unlikeTrack(user, trackId: number): Promise<string> {
    const userTrackRef = admin
      .firestore()
      .doc(`${likesCollection.COLLECTION_NAME}/${user.name}_${trackId}`);

    const trackRef = admin
      .firestore()
      .doc(`${tracksCollection.COLLECTION_NAME}/${trackId}`);

    return await admin.firestore().runTransaction(async transaction => {
      const userTrackDoc = await transaction.get(userTrackRef);
      if (!userTrackDoc.exists) {
        throw new NotFoundException();
      }

      transaction.delete(userTrackRef);

      // update amount count_like of track
      transaction.update(trackRef, {
        count_like: admin.firestore.FieldValue.increment(-1),
      });

      return 'string';
    });
  }
}
