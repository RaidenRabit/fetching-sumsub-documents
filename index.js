import express from 'express';
import { resolve } from 'path';
import { start } from './sumsub.js';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();
const port = 3010;

app.use(express.static('static'));
// Enable cors
app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 Mins
  max: 100,
});
app.use(limiter);
app.set('trust proxy', 1);

// Enable cors
app.use(cors());

// Set static folder
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

start().then(() => {
  console.log("DONE");
});
