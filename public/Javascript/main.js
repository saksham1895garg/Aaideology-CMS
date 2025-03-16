const express = require('express');
const app = express();
const port = 3000;
const valid = require('validator')

// Serve static files from the current directory
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/admin.html');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
 