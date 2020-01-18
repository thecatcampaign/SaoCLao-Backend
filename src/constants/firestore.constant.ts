// firestore model

const playlistsCollection = {
  COLLECTION_NAME: 'playlists',
  NAME: 'name',
  CREATED_AT: 'created_at',
  TRACK_COUNT: 'track_count',
  TRACKS: 'tracks',
  ID: 'id',
};

const tracksCollection = {
  COLLECTION_NAME: 'tracks',
  ALBUM: 'album',
  ARTIST: 'artist',
  COUNT_LIKE: 'count_like',
  COUNT_PLAY: 'count_play',
  DURATION: 'duration',
  ARTWORK_URL: 'artwork_url',
  ID: 'id',
  NAME: 'name',
  SEARCH: 'search',
  CREATED_AT: 'created_at',
};

const usersCollection = {
    COLLECTION_NAME: 'users',
    NAME: 'name',
    USERNAME: 'username',
    PLAYED_HISTORY: 'played_history',
    CREATED_AT: 'created_at',
};

const likesCollection = {
    COLLECTION_NAME: 'likes',
    TRACK_ID: 'track_id',
    USERNAME: 'username',
    CREATED_AT: 'created_at',
};

export {likesCollection, tracksCollection, usersCollection, playlistsCollection};
