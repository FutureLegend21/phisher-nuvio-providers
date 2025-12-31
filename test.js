const { getStreams } = require('./providers/moviesdrive.js');

getStreams('1381405', 'movie').then(streams => {
  console.log('Found', streams.length, 'streams');
  streams.forEach(stream => console.log(`${stream.name}: ${stream.quality}`));
}).catch(console.error);