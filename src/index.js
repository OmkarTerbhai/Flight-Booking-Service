const express = require('express');
const CRON = require('./utils/common/cron-jobs');
const { ServerConfig, QueueConfig } = require('./config');
const apiRoutes = require('./routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use('/bookingService', apiRoutes);

app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT, () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
    QueueConfig.connectQueue();
});

