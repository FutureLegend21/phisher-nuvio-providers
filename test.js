const { getStreams } = require('./providers/xdmovies.js');

getStreams('200875', 'tv',1,1).then(streams => {
  console.log('Found', streams.length, 'streams');
  streams.forEach(stream => console.log(`${stream.name}: ${stream.quality}`));
}).catch(console.error);