const http = require('http');
const port = process.env.PORT || 2345;
const url = require('url')
const fs = require('fs');
const { disconnect } = require('process');

// Read and parse TSV FILE
const data = fs.readFileSync('./data/cities_canada-usa.tsv', 'utf8');
const lines = data.split('\n');
var cities = lines.slice(1).map(line => {
  var [id, name, altName, , latitude, longitude] = line.split('\t');
  return { id, name, altName, latitude, longitude };
});

//Haversine distance formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function calculateScore(city, searchTerm, latLong) {
  let score = 1;
  score *= Math.sqrt(searchTerm.length / city.name.length);
  if (latLong.latitude && latLong.longitude) {
    const distance = calculateDistance(city.latitude, city.longitude, latLong.latitude, latLong.longitude);
    const MAX_DISTANCE = 6200; // seems about the maximum possible distance from a point in canada and the US 
    score *= Math.exp(-distance / MAX_DISTANCE);
  }


  return score

}

function createSuggestion(searchTerm, latLong) {
  let filteredCities = cities.filter(city => city.name && city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.altName && city.altName.toLowerCase().includes(searchTerm.toLowerCase()));
  let scoredCities = filteredCities.map(city => {
    let score = calculateScore(city, searchTerm, latLong);
    return { ...city, score };
  });
  return scoredCities.sort((a, b) => b.score - a.score);
}

const server = http.createServer(function (req, res) {
  const parsedUrl = url.parse(req.url, true); // Parse the URL

  if (parsedUrl.pathname === '/suggestions') {

    const searchTerm = parsedUrl.query.q;        // Get the 'q' parameter
    const latitude = parsedUrl.query.latitude;   // get latitude parameter
    const longitude = parsedUrl.query.longitude; // get longitude parameter

    const suggestions = createSuggestion(searchTerm, { latitude, longitude });

    if (!suggestions || suggestions.length === 0) {
      console.log("empty suggestions")
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ suggestions: [] }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ suggestions }));
  }
});

module.exports = server;

console.log('Server running at http://127.0.0.1:%d/suggestions', port);