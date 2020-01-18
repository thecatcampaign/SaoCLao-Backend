import { httpErrorMessage } from './../../constants/error.constant';
import { CreateAccontDto } from './dtos/createAccount.dto';
import { UserInfo, UserRecord } from 'firebase-functions/lib/providers/auth';
import { Injectable, BadRequestException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { DocumentData } from '@google-cloud/firestore';
import {
  usersCollection,
  likesCollection,
} from '../../constants/firestore.constant';

@Injectable()
export class UsersService {

  async createAccount(accountInfo: CreateAccontDto): Promise<UserRecord> {
    const { email, password, username, name } = accountInfo;

    const userRef = admin
      .firestore()
      .doc(`${usersCollection.COLLECTION_NAME}/${username}`);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      throw new BadRequestException(httpErrorMessage.USERNAME_EXISTED);
    }

    const afterUserCreated = await admin
      .auth()
      .createUser({ email, password, displayName: username });

    // create public profile
    userRef.set({
      [usersCollection.USERNAME]: username,
      [usersCollection.NAME]: name,
    });

    return afterUserCreated;
  }

  async getProfile(user): Promise<UserRecord> {
    return await admin.auth().getUser(user.uid);
  }

  async getLikerByTrackId(trackId: number): Promise<DocumentData[]> {
    const queryData = await admin
      .firestore()
      .collection(likesCollection.COLLECTION_NAME)
      .where(likesCollection.TRACK_ID, '==', trackId)
      .get();

    const usernames = queryData.docs.map(
      documentSnapshot => documentSnapshot.data().username,
    );
    return usernames;
  }
}
