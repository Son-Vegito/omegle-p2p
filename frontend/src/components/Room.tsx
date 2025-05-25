import { useEffect, useRef, useState } from "react";


const Room = ({
    name,
    localAudioStream,
    localVideoStream
}: {
    name: string | undefined,
    localVideoStream: MediaStreamTrack,
    localAudioStream: MediaStreamTrack,
}) => {

    // const [socket, setSocket] = useState<WebSocket>();
    const [lobby, setLobby] = useState<boolean>(true);
    // const [sendingPC, setSendingPC] = useState<RTCPeerConnection>();
    // const [receivingPC, setReceivingPC] = useState<RTCPeerConnection>();

    const sendingPC = useRef<RTCPeerConnection>(new RTCPeerConnection())
    const receivingPC = useRef<RTCPeerConnection>(new RTCPeerConnection())

    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8080?name=${name}`);

        function attachLocalMedia() {
            if (localVideoRef.current && localAudioStream && localVideoStream) {
                localVideoRef.current.srcObject = new MediaStream([localAudioStream, localVideoStream]);
            }
        }

        attachLocalMedia();

        ws.onmessage = async (event) => {
            try {
                const parsedData = JSON.parse(event.data);
                console.log('log type', parsedData.type);

                if (parsedData.type === 'send offer') {

                    console.log('send offer');

                    sendingPC.current.addTrack(localAudioStream);
                    sendingPC.current.addTrack(localVideoStream);

                    sendingPC.current.onnegotiationneeded = async () => {
                        console.log('negotiation needed');

                        const offer = await sendingPC.current.createOffer();
                        await sendingPC.current.setLocalDescription(offer);

                        ws.send(JSON.stringify({
                            type: 'offer',
                            sdp: offer,
                            roomId: parsedData.roomId
                        }))
                    }

                    sendingPC.current.onicecandidate = (e) => {
                        if (!e.candidate) {
                            return;
                        }
                        console.log('on ice candidate sender side');

                        ws.send(JSON.stringify({
                            type: 'ice candidate',
                            sdp: e.candidate,
                            from: 'sender',
                            roomId: parsedData.roomId
                        }))
                    }

                    setLobby(false);
                }
                else if (parsedData.type === 'offer') {
                    console.log('offer');

                    receivingPC.current.ontrack = (e) => {
                        console.log(e.track);
                        // alert('track');
                        if (remoteVideoRef.current) {
                            remoteVideoRef.current.srcObject = new MediaStream([e.track]);
                        }
                    }

                    await receivingPC.current.setRemoteDescription(parsedData.sdp);
                    const answer = await receivingPC.current.createAnswer();
                    await receivingPC.current.setLocalDescription(answer);

                    receivingPC.current.onicecandidate = (e) => {
                        if (!e.candidate) {
                            return;
                        }

                        console.log('on ice candidate receiver side');

                        ws.send(JSON.stringify({
                            type: 'ice candidate',
                            sdp: e.candidate,
                            from: 'receiver',
                            roomId: parsedData.roomId
                        }))
                    }

                    ws.send(JSON.stringify({
                        type: 'answer',
                        sdp: answer,
                        roomId: parsedData.roomId
                    }))

                    setLobby(false);
                }
                else if (parsedData.type === 'answer') {

                    await sendingPC.current.setRemoteDescription(parsedData.sdp);

                    console.log('answer');

                    setLobby(false);
                }
                else if (parsedData.type === 'ice candidate') {
                    // console.log('add ice candidate');

                    if (parsedData.from === 'sender') {
                        receivingPC.current.addIceCandidate(parsedData.sdp)
                        console.log('add ice candidate receiving side');
                    }
                    else {
                        sendingPC.current.addIceCandidate(parsedData.sdp);
                        console.log('add ice candidate sender side');
                    }
                }
                else if (parsedData.type === 'lobby') {
                    setLobby(true);
                }
                else {
                    console.log('invalid message type', parsedData.type);
                }

            }
            catch (e) {
                console.error(e);
            }
        }
    }, [localAudioStream, localVideoStream, name])

    return (
        <div className="h-screen p-3">

            Hi {name}

            <div className="flex gap-4 mt-4 flex-row">
                <div className="border-2 rounded-md p-2">
                    <video width={600} ref={localVideoRef} autoPlay />
                </div>
                {
                    lobby ? "Connecting you to someone" : <div className="border-2 rounded-md p-2 w-96">
                        <video width={600} ref={remoteVideoRef} autoPlay />
                    </div>
                }
            </div>
        </div>
    )
}

export default Room