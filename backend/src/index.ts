import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import requestRoutes from './routes/requestRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use('/api/requests', requestRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});