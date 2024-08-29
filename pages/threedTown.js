import { useState } from "react"
import { createRoot } from "react-dom/client"
import "../styles/globalThreed.module.css"
import "../styles/threedStyles.module.css"
import InfiniteStreet from "../components/InfiniteStreet";

export default  function Overlay() {
    const [ready, set] = useState(false)
    return (
        <div className={"threed-body"}>
            <InfiniteStreet/>
        </div>
    )
}
