import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"

const Room = () => {

    const [searchParams] = useSearchParams();
    const name = searchParams.get('name');
    const [socket, setSocket] = useState<WebSocket>();
    const [lobby, setLobby] = useState<boolean>(true);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8080?name=${name}`);
        ws.onopen = () => {
            setSocket(ws);
        }

        ws.onmessage = (event) => {
            try {
                const parsedData = JSON.parse(event.data);

                if (parsedData.type === 'send offer') {
                    alert('please send offer');
                    ws.send(JSON.stringify({
                        type: 'offer',
                        sdp: "",
                        roomId: parsedData.roomId
                    }))
                    setLobby(false);
                }
                else if (parsedData.type === 'offer') {
                    alert('offer received, send answer');
                    ws.send(JSON.stringify({
                        type: 'answer',
                        sdp: '',
                        roomId: parsedData.roomId
                    }))
                    setLobby(false);
                }
                else if (parsedData.type === 'answer') {
                    alert('answer received, connected')
                    setLobby(false);
                }

            }
            catch (e) {
                console.error(e);
            }
        }

    }, [name])

    if (lobby) {
        return (
            <div className="w-screen h-screen text-center">
                Connecting you to Someone...
            </div>
        )
    }

    return (
        <div>
            Hi {name}
            
            <div className="border-2 rounded-md p-2 w-96">
                <video width={600} />
            </div>
            <div className="border-2 rounded-md p-2 w-96">
                <video width={600} />
            </div>
        </div>
    )
}

export default Room