import { UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';

export const CheckAuthentication = async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer ')
  ) {
    throw new UnauthorizedException();
  }

  const idToken = req.headers.authorization.split('Bearer ')[1];

  try {
    const user = await admin.auth().verifyIdToken(idToken);
    req.user = user;
    next();
  } catch (error) {
    throw new UnauthorizedException('Incorrect Token');
  }
};
