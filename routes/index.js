const debugRoutes = require('./debug');
const userRoutes = require('./user');

module.exports = (app)=> {    
    app.use('/debug', debugRoutes);
    app.use('/user', userRoutes);
}