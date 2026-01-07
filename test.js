const { getStreams } = require('./providers/hianime.js');

getStreams('63926', 'tv',3,1).then(streams => {
  console.log('Found', streams.length, 'streams');
  streams.forEach(stream => console.log(`${stream.name}: ${stream.quality}`));
}).catch(console.error);