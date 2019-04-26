const Sequelize = require("sequelize");

const sequelize = new Sequelize({
    database: "post_checkout_survey",
    username: process.env.SURVEY_DB_USER,
    password: process.env.SURVEY_DB_PASS,
    host: process.env.SURVEY_DB_HOST,
    port: 3306,
    dialect: "mysql",
    dialectOptions: {
        // It takes time to connect from within ReviewApps.
        connectTimeout: 60000
    },
    // use a pool to save the amount of time spent on establishing connections
    pool: {
        max: 5,
        min: 3,
        idle: 60000,
        acquire: 60000
    }
});

module.exports = { sequelize };