const {BookingService} = require('../services');


const { StatusCodes } = require('http-status-codes');
const { SuccessResponse, ErrorResponse } = require('../utils/common');

async function createBooking(req, res) {
    try {
        console.log("Here in Book ctrl");
        const airplane = await BookingService.createBooking({
            flightId: req.body.flightId,
            userId: req.body.userId,
            noOfSeats: req.body.noOfSeats
        });
        SuccessResponse.message = "Successfully created a booking";
        SuccessResponse.data = airplane;
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
    }
    catch(error) {
        ErrorResponse.message = "Error occured while creating booking";
        ErrorResponse.error = error;
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function makePayment(req, res) {
    console.log(req.body);
    try {
        const airplane = await BookingService.makePayment({
            bookingId: req.body.bookingId,
            userId: req.body.userId,
            totalCost: req.body.totalCost
        });
        SuccessResponse.message = "Successfully created a booking";
        SuccessResponse.data = airplane;
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
    }
    catch(error) {
        ErrorResponse.message = "Error occured while creating booking";
        ErrorResponse.error = error;
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}
module.exports = {
    createBooking,
    makePayment
}