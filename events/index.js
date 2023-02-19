

const index = (io, socket) => {
    console.log(socket.handshake.headers.cookie);
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

}

module.exports = index;