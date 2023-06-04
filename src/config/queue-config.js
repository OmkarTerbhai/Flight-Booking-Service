const amqplib = require('amqplib');
const { Logger } = require('.');

let channel, connection;

async function connectQueue() {
    try {
        connection = await amqplib.connect("amqp://localhost");
        channel = await connection.createChannel();
        console.log("Chnnel log: ", channel);
        await channel.assertQueue("noti-queue");
    } catch (error) {
        console.log(error);
    }
}

async function sendData(data) {
    try {
        await channel.sendToQueue("noti-queue", Buffer.from(JSON.stringify(data)));

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    connectQueue,
    sendData
}

