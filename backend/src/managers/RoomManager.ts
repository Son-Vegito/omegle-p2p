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

        user1.socket.send(JSON.stringify({
            type: 'send offer',
            roomId
        }))

    }

    generateId() {
        return GLOBAL_ROOM_ID++;
    }

    onOffer(roomId: number, sdp: string) {
        const room = this.rooms.get(roomId);
        const user2 = room?.user2;
        
        user2?.socket.send(JSON.stringify({
            type: 'offer',
            sdp
        }));
    }

    onAnswer(roomId: number, sdp: string) {
        const room = this.rooms.get(roomId);
        const user1 = room?.user1;

        user1?.socket.send(JSON.stringify({
            type: 'answer',
            sdp
        }))
    }
}