const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        port: process.env.DB_PORT,
        logging: false
    }
);

async function checkDb() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        const [results] = await sequelize.query("SHOW TABLES");
        console.log("Tables in database '" + process.env.DB_NAME + "':");
        console.log(results.map(r => Object.values(r)[0]));
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

checkDb();
