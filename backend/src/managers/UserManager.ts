import { WebSocket } from "ws";
import { v4 as uuid } from 'uuid'
import { RoomManager } from "./RoomManager";

export interface User {
    id: string,
    name: string,
    socket: WebSocket
}

export class UserManager {
    private users: User[];
    private queue: string[];
    private roomManager: RoomManager;

    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager;
    }

    generateID() {
        return uuid();
    }

    addUser(name: string, socket: WebSocket) {
        const id = this.generateID();
        this.users.push({
            name,
            socket,
            id
        });
        this.queue.push(id);
        socket.send(JSON.stringify({
            type: 'lobby'
        }));
        this.initHandlers(socket, id);
        this.clearQueue();
    }

    removeUser(socket: WebSocket) {
        const user = this.users.find(u => u.socket === socket)
        this.users = this.users.filter(u => u.id !== user?.id);
        this.queue = this.queue.filter(u => u !== user?.id);
    }

    clearQueue() {
        if (this.queue.length < 2) {
            console.log('length of queue', this.queue.length);

            return;
        }

        let id = this.queue.pop();
        const user1 = this.users.find(u => u.id === id);

        id = this.queue.pop();
        const user2 = this.users.find(u => u.id === id);

        if (!user1 || !user2) {
            return;
        }

        this.roomManager.createRoom(user1, user2);
        console.log('room created');

    }

    initHandlers(socket: WebSocket, id: string) {

        socket.onmessage = (event) => {
            try {
                const parsedData = JSON.parse(event.data as string);

                if (parsedData.type === 'offer') {
                    this.roomManager.onOffer(parsedData.roomId, parsedData.sdp, id);
                }
                else if (parsedData.type === 'answer') {
                    this.roomManager.onAnswer(parsedData.roomId, parsedData.sdp, id);
                }
                else if (parsedData.type === 'ice candidate') {
                    // console.log('ice candidate from ', parsedData.from);
                    this.roomManager.onIceCandidate(parsedData.roomId, parsedData.sdp, id, parsedData.from);
                }

            }
            catch (e) {
                console.error(e);
            }
        }

        socket.onclose = () => {
            this.removeUser(socket)
        }

    }
}