const local = require('./localStrategy');
const jwt = require('./jwtStrategy');
const User = require('../models/user')

module.exports = () =>{
    local();
    jwt();
}