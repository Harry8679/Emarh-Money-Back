const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 5001;

app.get('/', (req, res) => {
    res.send('Hello World !');
});

app.listen(port, () => console.log(`Our App is running on the port ${port}`));