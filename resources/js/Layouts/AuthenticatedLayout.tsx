import React, { ReactNode, useState } from "react";
import Sidebar from "@/Components/Dashboard/Sidebar";
import Navbar from "@/Components/Dashboard/Navbar";
import Footer from "@/Components/Dashboard/Footer";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { ToastContainer } from "react-toastify";

interface Auth {
    user: {
        name: string;
    };
    title?: string;
}

interface Props {
    auth: Auth;
    header?: ReactNode;
    title?: string;
    children: ReactNode;
}

export default function AuthenticatedLayout({
    auth,
    header,
    children,
    title,
}: Props) {
    const [isOpenSidebar, setIsOpenSidebar] = useState(true);
    return (
        <Theme>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar
                    user={auth.user}
                    onToggleSidebar={(open: boolean) => setIsOpenSidebar(open)}
                />
                <div
                    className={`flex flex-col flex-grow ${
                        isOpenSidebar ? "ml-64" : "ml-16"
                    }`}
                >
                    <Navbar user={auth.user} title={title || ""} />
                    {header && (
                        <header className="bg-white shadow">
                            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                                {header}
                            </div>
                        </header>
                    )}
                    <main className="flex-grow p-6">{children}</main>
                    <ToastContainer />
                    <Footer />
                </div>
            </div>
        </Theme>
    );
}
