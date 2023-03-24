const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
var con = require('./database/db');
const config = {
    host: "localhost",
    user: "mangotv_demo",
    password: "mango@12345",
    database: "mangotv_demo",
}





users = [];
connections = [];
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/users.js');
io.on('connection', socket => {
    console.log(socket.conn.server.clientsCount);
    var count = (socket.conn.server.clientsCount);
    socket.on('join', ({ name, user_id, image, model_id, channel_no, date, type, end_time }, callback) => {

        const { user } = addUser({ id: socket.id, name: user_id, room: channel_no }); // add user with socket id and room info

        socket.join(user.room);
        const status = 1;
        const message = `${name.toUpperCase()} has joined! ${count}`;
        const time_slot = '';

        const time_stamp = Date.now();
        const currentDate = new Date(end_time);
        console.log('Current Date', currentDate.getTime());
        var time = Date.now().valueOf() + 19800000
        const Time_ms = currentDate.getTime().valueOf() - time
        console.log('==',Time_ms);
        var sql = "INSERT INTO chat (user_id , message,status,model_id,date,channel_no,type,time_slot,time_stamp) VALUES ('" + user_id + "' , '" + message + "' , '" + status + "', '" + model_id + "', '" + date + "', '" + channel_no + "',  '" + type + "','" + time_slot + "','" + time_stamp + "')";
        console.log(sql);
        con.query(sql, function (err, result) {
            if (err) throw err;

            console.log("1 record inserted");
        });
        var request = require('request');
        var options = {
            'method': 'POST',
            'url': 'https://mangotv.co.in/api/SocketGift',
            formData: {
                'channel_no': channel_no
            }
        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);

            const res = JSON.parse(response.body);


            if (res.status == true) {
                const data = {
                    data: {
                        model_id: model_id,
                        name: name,
                        text: `${name.toUpperCase()} has joined! `,
                        image: image,
                        date: date,
                        type: type,
                        audience: count,
                        total_gift_price: res.total_gift_price,
                        total_gift_count: res.total_gift_count,
                        time_ms: Time_ms
                    }
                }

                socket.emit('roomData', data);
                socket.in(user.room).emit('roomData', data);

            }
        });





        // socket.broadcast.to(user.room_id).emit('roomData', {
        //   user: 'adminX',
        //   text: `${user_id.toUpperCase()} has joined!`
        // });

        // io.to(user.room_id).emit('roomData', {

        //   room: user.room,
        //   users: getUsersInRoom(user.room) // get user data based on user's room
        // });

        // callback();
    });
    socket.on('sendMessage', ({ name, user_id, image, model_id, channel_no, message, date, type, gift_id = '1' }, callback) => {
        const user = getUser(socket.id);
        console.log('sendMessage');
        console.log(user.room)
        var count1 = (socket.conn.server.clientsCount);

        const status = 1;
        const time_slot = '';
        const time_stamp = Date.now();
        if (type) {
            var select = "SELECT * FROM `gift_card` WHERE  id= '" + gift_id + "'";

            con.query(select, function (err, result, fields) {
                var jsonMessages = JSON.stringify(result);


                //model amount update
                var select_model = "SELECT * FROM `users` WHERE  id= '" + model_id + "'";

                con.query(select_model, function (err, result3, fields) {
                    var current_bal = (parseFloat(result3[0].wallet_amount) + parseFloat(result[0].coins));
                    var update1 = "UPDATE `users` SET `wallet_amount`='" + current_bal + "' WHERE  id='" + model_id + "'";
                    con.query(update1, function (err, result_update1) {

                    })
                })



                var select_user = "SELECT * FROM `users` WHERE  id= '" + user_id + "'";

                con.query(select_user, function (err, result1, fields) {
                    var current_bal = (parseFloat(result1[0].wallet_amount) - parseFloat(result[0].coins));


                    var sql_tans = "INSERT INTO tbl_transction (transction_id,user_id,type,amount_type,amount,channel_no,message,receiver,status) VALUES ('" + gift_id + "' , '" + user_id + "' , 'gift', '0', '" + parseFloat(result[0].coins) + "', '" + channel_no + "',  '" + message + "','" + model_id + "','0')";


                    console.log(sql_tans);
                    con.query(sql_tans, function (err, result_insert) {
                        if (err) throw err;
                        var update = "UPDATE `users` SET `wallet_amount`='" + current_bal + "' WHERE  id='" + user_id + "'";
                        con.query(update, function (err, result_update) {

                        })


                        console.log("1 record trans inserted");
                    });





                })

            })
        }


        var sql = "INSERT INTO chat (user_id , message,status,model_id,date,channel_no,type,time_slot,time_stamp) VALUES ('" + user_id + "' , '" + message.trim() + "' , '" + status + "', '" + model_id + "', '" + date + "', '" + channel_no + "',  '" + type + "','" + time_slot + "','" + time_stamp + "')";
        console.log(sql);
        con.query(sql, function (err, result) {
            if (err) throw err;

            console.log("1 record inserted");
        });
        var total_coin = 0;
        // function sum(channel_no){
        //   var total_amount_coin= "select sum(amount) as amount from tbl_transction where channel_no= '"+channel_no+"' " ;
        // // console.log(total_amount_coin);

        // con.query(total_amount_coin, async function (err, total_amount_res) {

        //   console.log('total_amount_res');
        //   return 480;

        // })
        // // return 500;

        //  }


        // var total_coin=  sum(channel_no);
        console.log(total_coin);



        //   io.to(user.room).emit('roomData', { user: user.name, text: message });
        //   io.to(user.room).emit('roomData', {
        // 	room: user.room,
        // 	users: { user: user.name, text: message }  // get user data based on user's room
        //   });

        var request = require('request');
        var options = {
            'method': 'POST',
            'url': 'https://mangotv.co.in/api/SocketGift',
            formData: {
                'channel_no': channel_no
            }
        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);

            const res = JSON.parse(response.body);


            if (res.status == true) {
                const data = {
                    data: {
                        model_id: model_id,
                        name: name,
                        text: message,
                        image: image,
                        date: date,
                        type: type,
                        audience: count1,
                        total_gift_price: res.total_gift_price,
                        total_gift_count: res.total_gift_count,

                    }
                }
                socket.emit('roomData', data);
                const message_data = {
                    data: {
                        model_id: model_id,
                        model_id: channel_no,
                        name: name,
                        text: message,
                        image: image,
                        date: date,
                        type: type,
                        audience: count1,
                        total_gift_price: res.total_gift_price,
                        total_gift_count: res.total_gift_count,
                    }
                }

                socket.in(user.room).emit('roomData', message_data);
            }
        })
        // socket.to('myroom').emit('roomData', 'enjoy the game'); 



        //   callback();
    });




    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        console.log('disconnect');
        if (user) {
            // io.to(user.room).emit('message', {
            //   user: 'adminX',
            //   text: `${user.name.toUpperCase()} has left.`
            // });
            // io.to(user.room).emit('roomData', {
            //   room: user.room,
            //   users: getUsersInRoom(user.room)
            // });
        }
    });
})
server.listen(process.env.PORT || 3000, () =>
    console.log('Server is running')
);