import { useEffect, useRef, useState } from "react"
import Room from "./Room";

const Landing = () => {
    const [name, setName] = useState<string>()
    const [joined, setJoined] = useState<boolean>(false);
    const [localVideoStream, setLocalVideoStream] = useState<MediaStreamTrack>();
    const [localAudioStream, setLocalAudioStream] = useState<MediaStreamTrack>();
    const videoRef = useRef<HTMLVideoElement | null>(null);

    async function getCam() {
        const stream = await window.navigator.mediaDevices.getUserMedia({ video: true, audio: true })

        const videoStream = stream.getVideoTracks()[0];
        const audioStream = stream.getAudioTracks()[0];
        setLocalAudioStream(audioStream);
        setLocalVideoStream(videoStream);
        if (videoRef.current) {
            videoRef.current.srcObject = new MediaStream([videoStream, audioStream]);
        }
    }

    useEffect(() => {
        getCam();
    }, []);

    if (!joined) {
        return (
            <div className="p-3 flex justify-center items-center h-screen gap-2">
                <div className="rounded-2xl p-4 border-2 max-w-96 border-white">
                    <video ref={videoRef} autoPlay />
                    <p className="text-center">
                        Check hair
                    </p>
                </div>
                <input type="text" placeholder="Name"
                    className="p-1 rounded-md border"
                    onChange={(e) => {
                        setName(e.target.value)
                    }} />
                <button
                    className="p-2 border rounded-md font-semibold"
                    onClick={() => {
                        setJoined(true);
                    }}>
                    Join
                </button>
            </div>
        )
    }

    if (localAudioStream && localVideoStream) {
        return (
            <Room
                name={name}
                localVideoStream={localVideoStream}
                localAudioStream={localAudioStream}
            />
        )
    }
}

export default Landing