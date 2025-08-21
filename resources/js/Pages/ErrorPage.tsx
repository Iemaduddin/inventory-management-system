import { Link } from "@inertiajs/react";
import { Icon } from "@iconify/react";

export default function ErrorPage({ status }: { status: number }) {
    let title = "";
    let message = "";
    let icon = "mdi:alert-circle-outline";
    let color = "text-gray-600";

    switch (status) {
        case 404:
            title = "Halaman Tidak Ditemukan";
            message =
                "Ups! Halaman yang Anda cari tidak tersedia atau sudah dipindahkan.";
            icon = "mdi:magnify-close";
            color = "text-yellow-500";
            break;
        case 500:
            title = "Kesalahan Server";
            message = "Terjadi kesalahan pada server. Silakan coba lagi nanti.";
            icon = "mdi:server-network-off";
            color = "text-red-500";
            break;
        default:
            title = "Terjadi Kesalahan";
            message = "Terjadi kesalahan yang tidak terduga.";
            icon = "mdi:alert-circle-outline";
            color = "text-gray-500";
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center animate-fadeIn">
            {/* Icon */}
            <div className="mb-6 p-4 bg-white rounded-full shadow-lg transform transition-transform hover:scale-110">
                <Icon
                    icon={icon}
                    className={`${color}`}
                    width={80}
                    height={80}
                />
            </div>

            <h1 className="text-7xl font-extrabold text-gray-800">{status}</h1>

            <h2 className="mt-4 text-2xl font-semibold text-gray-800">
                {title}
            </h2>

            <p className="mt-2 text-gray-600 max-w-md">{message}</p>

            <Link
                href="/"
                className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-transform transform hover:scale-105"
            >
                Kembali ke Beranda
            </Link>
        </div>
    );
}
