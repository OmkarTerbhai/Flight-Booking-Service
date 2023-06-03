const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const { Booking } = require('../models');
const CrudRepository = require('./crud-repository');

class BookingRepository extends CrudRepository {
    constructor() {
        super(Booking);
    }

    async createBooking(data, transaction) {
        const response = await Booking.create(data, {transaction: transaction});
        return response;
    }

    async getBooking(data, transaction) {
        const response = await this.model.findByPk(data, {transaction: transaction});
        if(!response) {
            throw new AppError('Not able to fund the resource', StatusCodes.NOT_FOUND);
        }
        return response;
    }

    async updateBooking(id, data, transaction) { // data -> {col: value, ....}
        console.log("ID frm repo ", id)
        const response = await this.model.update(data, {
            where: {
                id: id
            }
        }, {transaction: transaction});
        return response;
    }

    async cancelOldBookings(timestamp) {
        const response = await this.model.update({
            status: "cancelled"
        }, {
            where: {
                [Op.and]: [
                    {
                        createdAt:{
                            [Op.lt]: timestamp
                        }
                    },
                    {
                        status: {
                            [Op.ne]: "booked"
                        }
                    },
                    {
                        status:{
                            [Op.ne] : "booked"
                        }
                    }
                ]
            }
        });
        return response;
    }
}

module.exports = BookingRepository;