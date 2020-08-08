class Users {
    constructor () {
        this.listOfUsers = []
    }
    addUser(id, name, room) { // create user
        var users = {id , name, room};
        this.listOfUsers.push(users);
    }
    getUserById(id) { // find user in id
        var user = this.listOfUsers.filter(user => user.id === id)[0];
        return user;
    }
    removeUser(id) { //Xóa user theo id, return về user bị xóa để có thể gửi thông
        //báo đến các clients khác: user/client bị xóa đã rời phòng chat
        var user = this.getUserById(id);
        var theList = this.listOfUsers.filter(user => user.id === id);
        this.listOfUsers = theList;
        return user;
    }
    getListUserOnRoom(room) { //Lấy danh sách user trong cùng một phòng chat
        var theList  = this.listOfUsers.filter(user => user.room === room);
        return theList;
    }
}

module.exports = {Users}