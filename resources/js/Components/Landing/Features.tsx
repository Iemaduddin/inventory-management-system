import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";

const features = [
    {
        title: "Users Management",
        icon: "mdi:account-group-outline",
        desc: "Mengelola akun pengguna dengan kontrol akses berbasis hak otorisasi untuk menjaga keamanan sistem.",
    },
    {
        title: "Roles Management",
        icon: "mdi:shield-account-outline",
        desc: "Mendefinisikan peran dan hak akses untuk setiap tipe pengguna secara fleksibel.",
    },
    {
        title: "Supplier, Warehouse, Category, Product",
        icon: "mdi:warehouse",
        desc: "Pengelolaan pemasok, gudang, kategori, dan produk dalam satu platform terintegrasi.",
    },
    {
        title: "Purchase Order",
        icon: "mdi:cart-arrow-down",
        desc: "Membuat dan melacak pesanan pembelian dengan mudah dan akurat.",
    },
    {
        title: "Stock Movement",
        icon: "mdi:swap-horizontal-bold",
        desc: "Memantau pergerakan stok secara real-time untuk menghindari kekurangan atau kelebihan persediaan.",
    },
    {
        title: "Auditable All Transaction",
        icon: "mdi:clipboard-search-outline",
        desc: "Setiap transaksi terekam dengan jejak audit yang lengkap untuk mendukung kepatuhan dan transparansi.",
    },
    {
        title: "Dashboard Summary",
        icon: "mdi:view-dashboard-outline",
        desc: "Ringkasan data penting dalam bentuk grafik dan statistik untuk mendukung pengambilan keputusan.",
    },
];

const Features = () => {
    return (
        <section id="features" className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-4xl font-bold text-center mb-6 animate-fadeIn">
                    Fitur Sistem
                </h2>
                <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
                    Inventory Management System ini dirancang untuk memberikan
                    kontrol penuh atas stok, transaksi, dan data operasional
                    Anda, dengan fitur-fitur berikut:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition duration-300 cursor-pointer border border-gray-100"
                        >
                            <div className="flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4 mx-auto">
                                <Icon
                                    icon={feature.icon}
                                    className="text-blue-600"
                                    width={28}
                                    height={28}
                                />
                            </div>
                            <h3 className="text-xl font-semibold text-center mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 text-center">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
