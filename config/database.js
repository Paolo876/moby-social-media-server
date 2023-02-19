const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, { 
    host: process.env.DB_HOST, 
    dialect: "mysql", 
    logging: false, 
    port: process.env.DB_PORT 
});


const testDBConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        // console.log("DB Models:", sequelize.models)

      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}
const sync = async () => {
    await sequelize.sync({ alter: true })
}

//init
testDBConnection();
sync();


module.exports = sequelize;