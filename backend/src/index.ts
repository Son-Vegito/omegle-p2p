import { WebSocketServer } from "ws";
import { UserManager } from "./managers/UserManager";

const PORT = 8080;

const wss = new WebSocketServer({ port: PORT });
const userManager = new UserManager;

wss.on('listening', () => {
    console.log(`Server listening on PORT ${PORT}`);
})


wss.on('connection', (ws, req) => {

    const params = new URLSearchParams(req.url?.split('?')[1]);
    const name = params.get('name');

    if (!name) {
        ws.close();
        return;
    }

    userManager.addUser(name, ws);
})