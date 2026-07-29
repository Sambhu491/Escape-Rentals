
const LoadingPage = ({
  variant = "bars", 
  size = "xs",
  color = "bg-red-500",
  spinnerColor = "red",
}) => {

  const heightMap = {
    "xs": "h-16",
    "sm": "h-32",
    "md": "h-64",
    "lg": "h-96",
    "xl": "h-118",
    "2xl": "h-150",
    "3xl": "h-182",
    "4xl": "h-214",
    "5xl": "h-246",
    "6xl": "h-278",
    "7xl": "h-310",
};

const height = heightMap[size];

  if (variant === "bars") {  
    const barCount = 5;

    return (
      <div className={`flex justify-center items-end gap-2 mb-10 ${height}`}>
        {[...Array(barCount)].map((_, i) => (
          <div
            key={i}
            className={`w-2 ${color} rounded`}
            style={{
              height: "50%",
              animation: `pulse 1.2s infinite ease-in-out`,
              animationDelay: `${i * 0.15}s`,
              transformOrigin: "bottom",
            }}
          />
        ))}
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scaleY(0.4); opacity: 0.7; }
            50% { transform: scaleY(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }
  

  
  if (variant === "spinner") {
    return (
      <div className={`flex justify-center items-center ${height}`}>
        <div
          className={`w-12 h-12 rounded-full border-5 
            border-gray-200 animate-spin `}
            style={{borderTopColor:spinnerColor}}
        />
      </div>
    );
  }



  if (variant === "dots") {
    return (
      <div className={`flex justify-center items-center space-x-2 ${height}`}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 ${color} rounded-full`}
            style={{
              animation: `bounce 0.6s infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
        `}</style>
      </div>
    );
  }


  if (variant === "shimmer") {
    return (
      <div className={`w-full ${height} shimmer-bg `}>
        {/* <div className="w-40 h-6 rounded "></div> */}

        <style>{`
        .shimmer-bg {
        background: linear-gradient(
        120deg,
        rgba(240,240,240,0) 40%,
        rgba(255,255,255,0.95) 50%,
        rgba(240,240,240,0) 60%
        );
        background-color: #e5e5e5;
        background-size: 200% 200%;
        animation: shimmer 1.5s linear infinite;
      }

      @keyframes shimmer {
        0% {
          background-position: 200% 0%;
        }
        100% {
          background-position: -200% -0%;
        }
      }
      `}</style>

      </div>
      );
    }
    

  return null;
};

export default LoadingPage;




