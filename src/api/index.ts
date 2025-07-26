import express from 'express';

import start from '../index';

const app = express();
const PORT = process.env.PORT || 3000;


app.get('/', (_, res) => {
  start();
  res.send('Etheria United Front Bot API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
