
import {useState} from "react";
import LoadingPage from "../LoadingPage/LoadingPage";

const ImageWithLoader = ({
    src,
    alt,
    className = "",
    spinnerColor = "black",
    variant = "",
    size = "md",
    product="",
    onClick,
    }) => {

    const [loaded,setLoaded] = useState(false);

    return (
        <>
        <div
        onClick={onClick}
        className={`relative ${className}`}>
            {
                !loaded && (
                    <div
                    className="absolute inset-0 flex 
                    items-center 
                    justify-center z-10 bg-gray-200"
                    >
                        <LoadingPage 
                        variant={variant} 
                        size={size} 
                        color={spinnerColor}
                        />
                    </div>
                )
            }
            <img 
            src={src} 
            alt={alt} 
            loading="lazy"
            decoding="async"
            onLoad={()=>{
                setTimeout(() => setLoaded(true), 500);
            }}
            className={` w-full h-full object-cover  
                transition-opacity duration-500
                ${loaded ? "opacity-100" : "opacity-0"}
                `}
            />
        </div>
        </>
    );
}

export default ImageWithLoader;
