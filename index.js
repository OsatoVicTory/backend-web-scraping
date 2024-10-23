const express = require('express');
const cors = require('cors');
const app = express();
const route = require('./route');
require('dotenv').config();

app.use(express.json());
app.use(cors({ origin: true, methods: "GET,HEAD,POST,PUT,PATCH,DELETE", credentials: true }));
app.use('/', route);

const port = process.env.PORT || 3030;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});