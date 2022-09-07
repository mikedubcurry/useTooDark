import { useRef, useEffect, useState } from "react";

export function useTooDark(videoRef) {
    const requestRef = useRef();
    const [tooDark, setTooDark] = useState(false);
    const [errors, setErrors] = useState([]);
    const [value, setValue] = useState(null);
    const canvas = document.createElement("canvas");

    const ctx = canvas.getContext("2d");
    let overPercent = 0;
    let underPercent = 0;

    const update = () => {
        try {
            ctx.drawImage(videoRef, 0, 0);

            let data = threshold(
                ctx.getImageData(0, 0, canvas.width, canvas.height),
                55,
                200
            );
            setValue(overPercent / underPercent);
            if (overPercent / underPercent < 1.2) {
                setTooDark(true);
            } else {
                setTooDark(false);
            }

            ctx.putImageData(data, 0, 0);

            if (!window.requestAnimationFrame) {
                throw Error(
                    "your browser does not support requestAnimationFrame"
                );
            }

            requestRef.current = window.requestAnimationFrame(update);
        } catch (err) {
            setErrors([err]);
        }
    };

    const threshold = (imgData, floor, ceil) => {
        try {
            underPercent = 1;
            overPercent = 1;
            const data = imgData.data;
            let relativeLuminance;
            for (let i = 0; i < data.length; i += 4) {
                relativeLuminance =
                    0.2126 * data[i] +
                    0.7152 * data[i + 1] +
                    0.0722 * data[i + 2];
                if (relativeLuminance >= ceil) {
                    data[i] = 255;
                    data[i + 1] = 255;
                    data[i + 2] = 0;
                    overPercent++;
                } else if (relativeLuminance <= floor) {
                    data[i] = 255;
                    data[i + 1] = 0;
                    data[i + 2] = 0;
                    underPercent++;
                }
            }
            setValue(relativeLuminance);
            overPercent = overPercent / (data.length / 4);
            underPercent = underPercent / (data.length / 4);
            return imgData;
        } catch (err) {
            setErrors([err]);
        }
    };

    useEffect(() => {
        if (videoRef) requestRef.current = window.requestAnimationFrame(update);
        return () => {
            cancelAnimationFrame(requestRef.current);
        };
    }, [videoRef]);

    return [tooDark, value, errors];
}
