const axios = require('axios');
const {ServerConfig, QueueConfig} = require('../config');
const db = require('../models');
const { BookingRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');

const bookingRepository = new BookingRepository();

async function createBooking(data) {
    console.log(data);
    const transaction = await db.sequelize.transaction();
    try {
        const flight = await axios.get(`${ServerConfig.HOST}/api/v1/flight/${data.flightId}`);
        const flightData = flight.data.data;
        if(data.noOfSeats > flightData.totalSeats) {
            return new AppError("Not enough seats available", StatusCodes.INTERNAL_SERVER_ERROR);
        }
        const totalBookingAmt = data.noOfSeats * flightData.price;
        const bookingPayload = {...data, totalCost: totalBookingAmt};
        const booking = await bookingRepository.createBooking(bookingPayload, transaction);
        
        const response = await axios.patch(`${ServerConfig.HOST}/api/v1/flight/${data.flightId}/seats`, {
            seats: data.noOfSeats
        });
        console.log(response);
        await transaction.commit();
        return true;
    }
    catch(error) {
        await transaction.rollback();
        throw error;
    }
}

async function makePayment(data) {
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetais = await bookingRepository.getBooking(data.bookingId, transaction);
        // if(bookingDetais.status == "cancelled") {
        //     throw new AppError("Booking is cancelled", StatusCodes.BAD_REQUEST);
        // }
        console.log("Det booking ", bookingDetais)
        const bookingDate = new Date(bookingDetais.createdAt);
        const currentTime = new Date();
        // if(currentTime - bookingDate > 300000) {
        //     throw new AppError("Booking has expired", StatusCodes.BAD_REQUEST);
        // }
        if(bookingDetais.totalCost != data.totalCost) {
            throw new AppError("The amount of the payment doesn't match", StatusCodes.BAD_REQUEST);
        }
        if(bookingDetais.userId != data.userId) {
            throw new AppError("The user corresponsing to the booking does not match", StatusCodes.BAD_REQUEST);
        }
        //Assume payment is sucessful
        const response = await bookingRepository.updateBooking(bookingDetais.id, {
            status: "Booked"
        }, transaction);
        QueueConfig.sendData({
            recipientEmail: 'terbhaisangeeta@gmail.com',
            subject: "Flight Booked",
            text: `Booking successfully done for ${data.bookingId}`
        });
        await transaction.commit();
    }
    catch(error) {
        console.log(error);
        throw error;
    }
}

    async function cancelBooking(data) {
        const transaction = await db.sequelize.transaction();

        try {
            const bookingDetais = await bookingRepository.getBooking(data.bookingId, transaction);
            if(bookingDetais.status == "cancelled") {
                return true;
            }

            const response = await axios.patch(`${ServerConfig.HOST}/api/v1/flight/${bookingDetais.flightId}/seats`, {
                seats: data.noOfSeats,
                desc: 0
            });
            await bookingRepository.updateBooking(data.bookingId, {
                status: "cancelled"
            }, transaction);
            await transaction.commit();
        }
        catch(error) {
            console.log(error);
            await transaction.rollback();
            throw error;
        }
    }

async function cancelBookingCron() {
    try {
        const currentTime = new Date(Date.now() - 1000 * 300);
        const response = await bookingRepository.cancelOldBookings(currentTime);
        console.log("Rec: ", response);
    }
    catch(error) {
        console.log(error);
    }
}


module.exports = {
    createBooking,
    makePayment,
    cancelBooking,
    cancelBookingCron
}