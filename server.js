const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();

const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const folderRoutes = require('./routes/folderRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
// const searchRoutes = require('./routes/searchRoutes');

dotenv.config();
const PORT = process.env.PORT || 5000;


app.use(express.json()); 
// app.use(express.urlencoded({ extended: true }));


app.use(cors());

// app.use(cors({
//   origin: 'http://localhost:5173',
//   credentials: true
// }));

app.get('/', (req, res) => {
  res.status(200).send('<h1>Welcome to the Backend Server!</h1>');
});

app.use('/auth', authRoutes);
app.use('/files', fileRoutes);
app.use('/folders', folderRoutes);
app.use('/permissions', permissionRoutes);
// app.use('/search', searchRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});