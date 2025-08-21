import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const architecturePoints = [
    {
        title: "Modul User & Roles",
        icon: "mdi:account-key-outline",
        desc: "Mengelola akun, hak akses, dan peran pengguna dengan kontrol penuh berbasis Role-Based Access Control (RBAC).",
    },
    {
        title: "Modul Inventory",
        icon: "mdi:warehouse",
        desc: "Manajemen pemasok, gudang, kategori, produk, dan pergerakan stok secara real-time dengan notifikasi otomatis.",
    },
    {
        title: "Modul Transaksi & Audit",
        icon: "mdi:clipboard-list-outline",
        desc: "Pencatatan semua transaksi, termasuk Purchase Order, Stock Movement, dan perubahan data, dilengkapi audit log yang terperinci.",
    },
    {
        title: "Frontend React",
        icon: "mdi:react",
        desc: "Antarmuka modern berbasis React + TailwindCSS untuk pengalaman pengguna yang cepat, responsif, dan intuitif.",
    },
    {
        title: "Backend API",
        icon: "mdi:server",
        desc: "Backend modular dengan arsitektur REST/GraphQL yang aman, mendukung integrasi sistem lain jika dibutuhkan.",
    },
    {
        title: "Database & Keamanan",
        icon: "mdi:database-lock-outline",
        desc: "Database terstruktur dengan enkripsi data at-rest dan in-transit, serta backup otomatis berkala.",
    },
];

const SystemOverview = () => {
    return (
        <section id="architecture" className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h2 className="text-4xl font-bold mb-6 animate-fadeIn">
                    Arsitektur Sistem
                </h2>
                <p className="text-gray-700 mb-16 max-w-2xl mx-auto">
                    Inventory Management System ini dibangun dengan arsitektur
                    modular dan keamanan berlapis, dirancang khusus untuk
                    digunakan oleh pihak internal perusahaan.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
                    {architecturePoints.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border border-gray-100"
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

export default SystemOverview;
