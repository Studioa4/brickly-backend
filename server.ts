import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fornitoriRoutes from './routes/fornitori';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/fornitori', fornitoriRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});