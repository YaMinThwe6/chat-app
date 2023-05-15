let users = [];

const addUser = ({ id, username, room}) => {
    username = username.trim();
    room = room.trim().toLocaleLowerCase();

    if(!username || !room) return {error: 'Username and Room are required!'};

    const existingUser = users.find((user) => {
       return user.room === room && user.username === username;
    });

    if (existingUser) return {error: 'Username already in use!'};

    let user = {id, username, room};
    users.push(user);

    return {user};

};

const removeUser = (id) => {
    let index = users.findIndex((obj) => obj.id === id);

    if (index === -1) {
        return {error: 'User Not Found!'};
    }

    return users.splice(index, 1)[0];
};

const getUser = (id) => {

    let user = users.find((obj) => obj.id === id);

    if (!user) return {error: 'User Not Found!'};

    return {user};

};

const getUsersInRoom = (room) => {
    room = room?.trim()?.toLocaleLowerCase();
    return users.filter((obj) => obj.room === room);
};

module.exports= {
    addUser, removeUser, getUser, getUsersInRoom
}