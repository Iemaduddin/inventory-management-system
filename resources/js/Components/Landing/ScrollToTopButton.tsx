import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";

const ScrollToTopButton = () => {
    const [visible, setVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.scrollY > 300) setVisible(true);
        else setVisible(false);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    useEffect(() => {
        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-5 right-5 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition ${
                visible ? "block" : "hidden"
            }`}
        >
            <Icon
                icon="mdi:arrow-up"
                width={24}
                height={24}
                className="text-white"
            />
        </button>
    );
};

export default ScrollToTopButton;
