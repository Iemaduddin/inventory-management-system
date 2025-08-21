import { Link, usePage } from "@inertiajs/react";
import React, { useState, useEffect } from "react";

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Ambil data user dari props Inertia
    const { auth }: any = usePage().props;
    const user = auth?.user;

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                {/* Logo */}
                <a
                    href="#home"
                    className={`text-2xl font-bold ${
                        isScrolled ? "text-blue-600" : "text-white"
                    }`}
                >
                    AROBIDSH - IMS
                </a>

                {/* Menu Links (Desktop) */}
                <div className="hidden md:flex space-x-6 font-medium">
                    {["Features", "Architecture", "Security", "Team"].map(
                        (item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className={`transition hover:text-yellow-400 ${
                                    isScrolled ? "text-gray-700" : "text-white"
                                }`}
                            >
                                {item}
                            </a>
                        )
                    )}
                </div>

                {/* Auth Section */}
                {user ? (
                    <div className="relative hidden md:block">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
                        >
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full">
                                {getInitials(user.name)}
                            </div>
                            <span className="font-medium text-gray-700">
                                {user.name}
                            </span>
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                                <Link
                                    href={route("dashboard")}
                                    className="block px-4 py-2 text-gray-700 hover:bg-blue-100 hover:text-blue-600 hover:font-bold"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    method="post"
                                    href={route("logout")}
                                    as="button"
                                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-100 hover:text-red-600 hover:font-bold"
                                >
                                    Logout
                                </Link>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link
                        href={route("login")}
                        className={`hidden md:inline-block px-5 py-2 rounded-lg font-semibold transition ${
                            isScrolled
                                ? "bg-blue-600 text-white hover:bg-blue-500"
                                : "bg-yellow-400 text-blue-800 hover:bg-yellow-300"
                        }`}
                    >
                        Login
                    </Link>
                )}

                {/* Hamburger Menu (Mobile) */}
                <button
                    className="md:hidden text-white focus:outline-none"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 6h16M4 12h16m-7 6h7"
                        />
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div
                    className={`md:hidden bg-white shadow-lg border-t border-gray-200`}
                >
                    <div className="flex flex-col space-y-2 px-4 py-4">
                        {["Features", "Architecture", "Security", "Team"].map(
                            (item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    className="text-gray-700 hover:text-blue-600 transition"
                                >
                                    {item}
                                </a>
                            )
                        )}
                        {user ? (
                            <>
                                <Link
                                    href={route("dashboard")}
                                    className="text-gray-700 hover:text-blue-600 transition"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    method="post"
                                    href={route("logout")}
                                    as="button"
                                    className="text-gray-700 hover:text-red-600 transition"
                                >
                                    Logout
                                </Link>
                            </>
                        ) : (
                            <Link
                                href={route("login")}
                                className="text-gray-700 hover:text-blue-600 transition"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
