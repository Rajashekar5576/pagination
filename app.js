const express = require('express');
const app = express();
const mongoose = require('mongoose');

// Connect to DB
mongoose.connect('mongodb://localhost:27017/mydb', { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to MongoDB');
});

// Create a Mongoose schema for the items
const itemSchema = new mongoose.Schema({
    name: String
});
const Item = mongoose.model('Item', itemSchema);

// Function to paginate items
const paginate = (collection, itemsPerPage, page) => {
    return new Promise((resolve, reject) => {
        
        collection.countDocuments((error, count) => {
            if (error) {
                reject(error);
            }
            const totalItems = count;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const start = (page - 1) * itemsPerPage;
            
            collection
                .find()
                .skip(start)
                .limit(itemsPerPage)
                .exec((error, items) => {
                    if (error) {
                        reject(error);
                    }
                    resolve({
                        items: items,
                        totalItems: totalItems,
                        totalPages: totalPages,
                        currentPage: page
                    });
                });
        });
    });
};

// Route to display items for a given page
app.get('/items/:page', (req, res) => {
    const page = req.params.page || 1;
    const itemsPerPage = 10;
    paginate(Item, itemsPerPage, page)
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.error(error);
            res.send({ error: error})
        })
})


app.listen(3000, () => console.log("Server is running on port 3000"))
