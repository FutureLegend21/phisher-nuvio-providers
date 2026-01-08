const { getStreams } = require('./src/providers/xdmovies.js');

getStreams('1218925', 'movie').then(streams => {
  console.log('Found', streams.length, 'streams');
  streams.forEach(stream => console.log(`${stream.name}: ${stream.quality} - ${stream.url}`));
}).catch(console.error);