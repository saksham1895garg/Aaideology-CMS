const express = require('express');
const app = express();
const port = 3001; // Use a different port to avoid conflicts

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Test server running on http://localhost:${port}`);
});
