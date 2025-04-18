import express from 'express';
import dotenv from 'dotenv';
import emailRoutes from './routes/emailRoutes';

dotenv.config();
const app = express();
app.use(express.json());

app.use('/api', emailRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});
