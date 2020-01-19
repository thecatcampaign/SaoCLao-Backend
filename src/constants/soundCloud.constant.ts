export const soundCloundConfig = {
  TRENDING_TRACKS_ENDPOINT: `https://api.soundcloud.com/tracks?linked_partitioning=1&limit=100&offset=0&client_id=${process.env.CLIENT_ID}&tags=dubstep`,
  SEARCH_TRACKS_ENDPOINT: `https://api.soundcloud.com/tracks?linked_partitioning=1&limit=20&offset=0&client_id=${process.env.CLIENT_ID}&q=`,
  GET_MEDIA_ENDPOINT: `https://api.soundcloud.com/tracks/`,
};
