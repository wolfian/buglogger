const mongoose = require('mongoose');

const db = async() => {
    try {
        const conn = await mongoose.connect('mongodb+srv://wolfian1234:wolfian4321@wolfian-cluster-101.xuabp.mongodb.net/buglogger-db?retryWrites=true&w=majority',
        {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
        }
        )
    } catch(error) {
        console.log(error);
        process.exit(1)
    }
}

module.exports = db;