import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";

const InternalWorkflow = () => {
    return (
        <section id="workflow" className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h2 className="text-4xl font-bold mb-6">
                    Alur Penggunaan Internal
                </h2>
                <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
                    Sistem Inventory Management digunakan oleh pihak internal
                    dengan alur kerja terstruktur untuk memastikan keamanan
                    data, efisiensi operasional, dan transparansi proses.
                </p>

                {/* Flowchart */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center">
                        <Icon
                            icon="mdi:login"
                            className="w-12 h-12 text-blue-600 mb-2"
                        />
                        <p className="font-semibold">Login Pengguna Internal</p>
                        <span className="text-gray-500 text-sm">
                            Hanya untuk akun terdaftar
                        </span>
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:block w-12 h-[2px] bg-blue-300"></div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center">
                        <Icon
                            icon="mdi:database-import"
                            className="w-12 h-12 text-blue-600 mb-2"
                        />
                        <p className="font-semibold">Input Data Stok</p>
                        <span className="text-gray-500 text-sm">
                            Barang masuk & keluar
                        </span>
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:block w-12 h-[2px] bg-blue-300"></div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center">
                        <Icon
                            icon="mdi:warehouse"
                            className="w-12 h-12 text-blue-600 mb-2"
                        />
                        <p className="font-semibold">Proses Gudang</p>
                        <span className="text-gray-500 text-sm">
                            Pengelolaan dan penyimpanan
                        </span>
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:block w-12 h-[2px] bg-blue-300"></div>

                    {/* Step 4 */}
                    <div className="flex flex-col items-center">
                        <Icon
                            icon="mdi:account-cog"
                            className="w-12 h-12 text-blue-600 mb-2"
                        />
                        <p className="font-semibold">Laporan & Analisis</p>
                        <span className="text-gray-500 text-sm">
                            Keputusan berbasis data
                        </span>
                    </div>
                </div>

                {/* Note */}
                <div className="mt-12 p-4 bg-blue-50 rounded-lg inline-flex items-center gap-3">
                    <Icon
                        icon="mdi:information"
                        className="w-6 h-6 text-blue-800"
                    />
                    <span className="text-blue-800 font-medium">
                        Akses terbatas: hanya pihak internal yang berwenang
                    </span>
                </div>
            </div>
        </section>
    );
};

export default InternalWorkflow;
