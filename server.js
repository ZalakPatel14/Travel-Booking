// server.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Demo')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

// Define schema for travel booking data
const travelSchema = new mongoose.Schema({
    customer_name: String,
    phone_number: String, // Changed to String for international phone numbers
    number_of_travelers: Number,
    id_proof: String,
    place_of_travel: String,
    starting_date_of_tour: Date,
    ending_date_of_tour: Date,
    days_of_tour: Number,
    cost_per_person_per_day: Number, // Changed from price_per_person_per_day
    total_trip_cost: Number // Changed from total_price
});

// Create model for travel booking data
const Travel = mongoose.model('Travel', travelSchema);

// Handle form submission
app.post('/submit_booking', async (req, res) => {
    try {
        // Calculate days_of_tour from starting_date_of_tour and ending_date_of_tour
        const startDate = new Date(req.body.starting_date_of_tour);
        const endDate = new Date(req.body.ending_date_of_tour);
        const daysOfTour = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

        // Calculate total trip cost
        const costPerPersonPerDay = parseFloat(req.body.cost_per_person_per_day);
        const numberOfTravelers = parseInt(req.body.number_of_travelers);
        const totalTripCost = (costPerPersonPerDay * daysOfTour * numberOfTravelers);

        // Create a new travel booking document
        const newBooking = new Travel({
            customer_name: req.body.customer_name,
            phone_number: req.body.phone_number,
            number_of_travelers: numberOfTravelers,
            id_proof: req.body.id_proof,
            place_of_travel: req.body.place_of_travel,
            starting_date_of_tour: startDate,
            ending_date_of_tour: endDate,
            days_of_tour: daysOfTour,
            cost_per_person_per_day: costPerPersonPerDay,
            total_trip_cost: totalTripCost
        });

        // Save the travel booking document to the database
        await newBooking.save();

        res.send('Booking submitted successfully');
    } catch (error) {
        console.error('Error submitting booking:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
