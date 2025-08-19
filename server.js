const express = require('express');
const dotenv = require('dotenv');
const cors =require('cors');
const app = express();
const authRoutes =require('./routes/authRoutes');
const fileRoutes=require('./routes/fileRoutes');
const folderRoutes=require('./routes/folderRoutes')
const permissionRoutes=require('./routes/permissionRoutes')
// const searchRoutes=require('./routes/searchRoutes')

// Load environment variables from a .env file
dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(express.json());


app.get('/', (req, res) => {
    res.status(200).send('<h1>Welcome to the Backend Server!</h1>');
});

app.use('/',authRoutes);

app.use('/',fileRoutes)

app.use('/',folderRoutes);

app.use('/',permissionRoutes)

app.use(cors());



// app.use('/search',searchRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});