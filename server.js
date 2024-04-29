const server = require('./app'); // Import the server

const port = process.env.PORT || 2345;

server.listen(port, '127.0.0.1', () => {
    console.log('Server running at http://127.0.0.1:%d/suggestions', port);
});