import { useState, useRef, useEffect } from "react";

import { useTooDark } from "./useTooDark";

function App() {
    const ref = useRef(null);
    const [stream, setStream] = useState(null);
    const [tooDark, value, errors] = useTooDark(ref.current);

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({
                video: { facingMode: "environment" },
            })
            .then((stream) => {
                setStream(stream);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    useEffect(() => {
        if (ref.current) {
            ref.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div>
            <video id="video" ref={ref} playsInline autoPlay></video>
            {tooDark ? "too dark" : "ok"}
            <div>{value}</div>
            <div>
                {errors.map((er) => {
                    return <p key={er}>{er.message}</p>;
                })}
            </div>
        </div>
    );
}

export default App;
