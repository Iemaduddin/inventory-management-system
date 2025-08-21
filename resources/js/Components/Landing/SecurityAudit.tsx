import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const securityPoints = [
    {
        title: "Otentikasi & Otorisasi",
        icon: "mdi:lock-check-outline",
        desc: "Setiap pengguna memiliki akses sesuai peran (Role-Based Access Control) sehingga data hanya bisa diakses oleh pihak yang berwenang.",
    },
    {
        title: "Audit Log",
        icon: "mdi:clipboard-list-outline",
        desc: "Seluruh aktivitas sistem terekam secara otomatis, mencakup siapa yang mengubah data, kapan, dan detail perubahan yang dilakukan.",
    },
    {
        title: "Backup & Recovery",
        icon: "mdi:database-refresh-outline",
        desc: "Backup data dilakukan secara berkala dengan opsi restore cepat jika terjadi kehilangan atau kerusakan data.",
    },
    {
        title: "Enkripsi Data",
        icon: "mdi:shield-lock-outline",
        desc: "Data sensitif terenkripsi baik saat disimpan (at-rest) maupun saat dikirim (in-transit) untuk mencegah kebocoran.",
    },
    {
        title: "Compliance & Standar Keamanan",
        icon: "mdi:certificate-outline",
        desc: "Mendukung praktik keamanan sesuai standar ISO 27001 & GDPR untuk perlindungan data dan privasi pengguna.",
    },
    {
        title: "Monitoring & Notifikasi",
        icon: "mdi:bell-ring-outline",
        desc: "Pemantauan sistem real-time dan notifikasi otomatis jika terdeteksi aktivitas mencurigakan.",
    },
];

const SecurityAudit = () => {
    return (
        <section id="security" className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h2 className="text-4xl font-bold mb-6 animate-fadeIn">
                    Keamanan & Audit Sistem
                </h2>
                <p className="text-gray-600 mb-16 max-w-2xl mx-auto">
                    Sistem dirancang dengan fokus pada keamanan, transparansi,
                    dan kepatuhan, memastikan seluruh data dan proses
                    terlindungi secara optimal.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                    {securityPoints.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-lg transition border border-gray-100"
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-lg mr-3">
                                    <Icon
                                        icon={item.icon}
                                        className="text-blue-600"
                                        width={26}
                                        height={26}
                                    />
                                </div>
                                <h3 className="font-semibold text-lg text-blue-700">
                                    {item.title}
                                </h3>
                            </div>
                            <p className="text-gray-600">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SecurityAudit;
