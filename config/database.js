const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, { 
    host: process.env.DB_HOST, 
    dialect: "mysql", 
    logging: false, 
    port: process.env.DB_PORT 
});
// const sequelize = new Sequelize('moby-local', 'root', process.env.LOCALHOST_PASSWORD, {
//     host: "localhost",
//     dialect: "mysql",
//     logging: false,
// });
const testDBConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}
testDBConnection();

module.exports = sequelize;