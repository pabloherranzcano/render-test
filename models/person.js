const mongoose = require('mongoose');
const password = process.env.MONGODB_PASSWORD;
const url = process.env.MONGODB_URI;

mongoose.set('strictQuery', false);
mongoose.connect(url);

console.log('connecting to', url);

mongoose
  .connect(url)
  .then((result) => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [3, 'Name must be at least 3 characters long'],
  },
  number: {
    type: String,
    required: [true, 'Number is required'],
    validate: {
      validator: function (value) {
        return /^\+\d{1,3}\s?\d{6,14}$/.test(value);
      },
      message:
        'Number must include the country code, for example: +34 612345678',
    },
  },
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Person = mongoose.model('Person', personSchema);

module.exports = Person;
