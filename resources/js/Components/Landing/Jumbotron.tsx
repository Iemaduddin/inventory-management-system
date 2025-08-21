import React from "react";

const Jumbotron = () => {
    return (
        <section className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white pt-32 pb-24 overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10 pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 text-center animate-fadeIn relative z-10">
                <h1 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
                    Inventory Management System <br />
                    <span className="text-yellow-300">
                        Efisien, Aman, & Auditable
                    </span>
                </h1>
                <p className="text-md md:text-xl mb-10 max-w-3xl mx-auto text-blue-100">
                    Solusi lengkap untuk pengelolaan inventaris internal
                    perusahaan. Dirancang untuk keamanan data, kemudahan
                    monitoring, dan pengambilan keputusan cepat.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="#features"
                        className="bg-yellow-400 text-blue-800 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition shadow-lg"
                    >
                        Lihat Fitur
                    </a>
                    <a
                        href="#contact"
                        className="bg-white/20 backdrop-blur-sm px-8 py-4 rounded-lg font-semibold border border-white/30 hover:bg-white/30 transition"
                    >
                        Hubungi Kami
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Jumbotron;
