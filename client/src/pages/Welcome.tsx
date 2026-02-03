import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 4.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4500);

    // Navigate to menu after 5 seconds
    const navTimer = setTimeout(() => {
      setLocation("/menu");
    }, 5000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [setLocation]);

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "linear-gradient(135deg, #f5f1e8 0%, #e8dcc4 100%)",
      }}
    >
      <div className="text-center">
        <h1
          className="text-5xl md:text-7xl font-bold mb-4"
          style={{
            fontFamily: "'Tajawal', sans-serif",
            color: "#1a2332",
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          اهلا بك في مقصف مدرسة الفلاح
        </h1>
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse delay-75"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
}
