
var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "IPL",
    password: "12345",
    database: "ipl"

 
});
con.connect(function (err) {
    if (err) throw err;

});

module.exports = con;