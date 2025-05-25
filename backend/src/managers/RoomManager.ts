import { User } from "./UserManager"

interface Room {
    user1: User,
    user2: User
}

let GLOBAL_ROOM_ID = 1;

export class RoomManager {

    private rooms: Map<number, Room>

    constructor() {
        this.rooms = new Map<number, Room>();
    }

    createRoom(user1: User, user2: User) {
        const roomId = this.generateId();
        this.rooms.set(roomId, {
            user1,
            user2
        })
        console.log('room created with id', roomId);


        user1.socket.send(JSON.stringify({
            type: 'send offer',
            roomId
        }))
        user2.socket.send(JSON.stringify({
            type: 'send offer',
            roomId
        }))

    }

    generateId() {
        return GLOBAL_ROOM_ID++;
    }

    onOffer(roomId: number, sdp: string, senderId: string) {
        console.log('offer room id', roomId);

        const room = this.rooms.get(roomId);
        const receivingUser = room?.user1.id === senderId ? room.user2 : room?.user1;

        receivingUser?.socket.send(JSON.stringify({
            type: 'offer',
            sdp,
            roomId
        }));
    }

    onAnswer(roomId: number, sdp: string, senderId: string) {
        console.log('answer room id ', roomId);

        const room = this.rooms.get(roomId);
        const receivingUser = room?.user1.id === senderId ? room.user2 : room?.user1;

        receivingUser?.socket.send(JSON.stringify({
            type: 'answer',
            sdp,
            roomId
        }))
    }

    onIceCandidate(roomId: number, sdp: string, senderId: string, from: string) {
        console.log('ice room no', roomId);

        const room = this.rooms.get(roomId);
        if (!room) {
            console.log('no room');
            return;
        }
        // const receivingUser = (room.user1.id === senderId) ? room.user2 : room.user1;
        let receivingUser;

        if (senderId === room.user1.id)
            receivingUser = room.user2
        if (senderId === room.user2.id)
            receivingUser = room.user1

        if (!receivingUser) {
            console.log('no receivingUser');
            return;
        }

        console.log(receivingUser === room?.user1 ? 'ice from user1' : 'ice from user2');

        receivingUser?.socket.send(JSON.stringify({
            type: 'ice candidate',
            sdp,
            roomId,
            from
        }))
    }

}