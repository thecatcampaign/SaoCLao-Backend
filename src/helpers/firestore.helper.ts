import admin = require('firebase-admin');
import {
  Query,
  QuerySnapshot,
  DocumentSnapshot,
  DocumentData,
} from '@google-cloud/firestore';

const getLastVisibleAndCollection = (
  querySnapshots: QuerySnapshot,
  limit: number,
) => {
  // If size not equal limit, means out of docs
  let lastVisible = 'end';
  let collection = querySnapshots.docs.map(singleQuerySnapshot =>
    singleQuerySnapshot.data(),
  );

  // There more items available
  if (querySnapshots.size === limit) {
    lastVisible = querySnapshots.docs[querySnapshots.size - 2].data().id; // choose near last item because we got 1 more item by limit + 1
    collection = collection.slice(0, -1);   // remove last item because we got 1 more item by limit + 1
  }

  return { lastVisible, collection };
};

const getBatchByCollection = async (
  collectionName: string,
  lastVisible,
  limit: number,
  condition?: any[],
  orderByField?: string,
  docAndSubCollection?: string[],
): Promise<object> => {
  let query: Query = admin.firestore().collection(collectionName); // have to have Query type to add filter and orderby

  if (docAndSubCollection) {
    const [doc, subCollection] = docAndSubCollection;
    query = admin
      .firestore()
      .collection(collectionName)
      .doc(doc)
      .collection(subCollection);
  }
  if (condition) {
    query = query.where(condition[0], condition[1], condition[2]);
  }

  if (orderByField) {
    query = query.orderBy(orderByField);
  }

  if (lastVisible) {
    query = query.startAfter(
      await admin
        .firestore()
        .doc(`${collectionName}/${lastVisible}`)
        .get(),
    );
  }

  query = query.limit(limit + 1); // +1 to check if has more item

  const querySnapshots = await query.get();

  return getLastVisibleAndCollection(querySnapshots, limit + 1);
};

const getAllByIds = async (
  collectionName: string,
  ids: string[],
): Promise<DocumentData[]> => {
  const documentRefs = ids.map(id => {
    return admin.firestore().doc(`${collectionName}/${id}`);
  });
  const documentSnapshots = await admin.firestore().getAll(...documentRefs); // have to have ... to destruct array
  return documentSnapshots.map(documentSnap => documentSnap.data());
};

const startAfterLimit = (array, offset: any, limit: number) => {
  let lastIndex = -1;
  if (offset) {
    lastIndex = array.indexOf(offset);
  }
  return array.slice(lastIndex + 1, lastIndex + 1 + limit);
};

const getBatchByIds = async (
  collectionName: string,
  ids: string[],
  lastVisible,
  limit: number,
) => {
  const batchIds = startAfterLimit(ids, lastVisible, limit);
  const collectionData = await getAllByIds(collectionName, batchIds);
  return {
    lastVisible: collectionData[collectionData.length - 1].id,
    collection: collectionData,
  };
};

export { getBatchByCollection, getAllByIds, getBatchByIds };
