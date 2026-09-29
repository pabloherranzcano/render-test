const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://pablo:${password}@cluster0.wvvwvls.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

const newPerson = process.argv[3];
const newPersonNumber = process.argv[4];

mongoose.set('strictQuery', false);

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: Number,
});

const Person = mongoose.model('Person', personSchema);

const person = new Person({
  name: newPerson,
  number: newPersonNumber,
});

if (process.argv.length === 3) {
  Person.find({}).then((result) => {
    console.log('phonebook:');
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
} else {
  person.save().then((result) => {
    console.log(`Added ${newPerson} number ${newPersonNumber} to phonebook`);
    mongoose.connection.close();
  });
}