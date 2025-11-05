import 'dotenv/config';
import app from './app.js';

const port = process.env.APP_PORT || 4000;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 API POS démarrée sur le port ${port}`);
});
