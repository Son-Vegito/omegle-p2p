import { useState } from "react"
import { useNavigate } from "react-router-dom"

const Landing = () => {
    const navigate = useNavigate();
    const [name, setName] = useState<string>()


    
    return (
        <div className="p-3 flex justify-center items-center h-screen gap-2">
            <input type="text" placeholder="Name"
                className="p-1 rounded-md border"
                onChange={(e) => {
                    setName(e.target.value)
                }} />
            <button
                className="p-2 border rounded-md font-semibold"
                onClick={() => {
                    navigate(`/room?name=${name}`)
                }}>
                Join
            </button>
        </div>
    )
}

export default Landing