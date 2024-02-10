const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name']
    },
    phone: {
        type: String,
        required: [true, 'Please provide a phone number']
    },
    address: {
        type: String,
        required: [true, 'Please provide the address']
    },
    photo: {
        type: [String], 
        required: true 
    },
    description:{
        type: String,
        required: [true, 'Please provide a description for item']
    },
    category: {
        type: String,
        enum: ['أخري', 'أدوات مدرسيه', 'ألعاب', 'كتب', 'ديكور وأثاث', 'أحذية', 'أجهزة إلكترونية', 'هواتف محمولة', 'ملابس'],
        required: true
    }
});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;