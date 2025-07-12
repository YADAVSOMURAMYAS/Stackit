const express = require('express');
const app = express();

require('dotenv').config();
const PORT = process.env.PORT || 4000;

app.use(express.json());

const connectWithDb = require('./config/database');
connectWithDb();

const User = require('./routes/User');
app.use('/api/v1',User);

app.listen(PORT,()=>{
    console.log(`App is running on ${PORT}`)
})

app.get('/',(req,res)=>{
    res.send('This is Homepage')
})