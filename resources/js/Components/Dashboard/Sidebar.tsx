import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import { is } from "zod/locales";
import { Button } from "@radix-ui/themes";

const menuItems = [
    {
        title: "Dashboard",
        name: "Dashboard",
        href: "/dashboard",
        role: ["Administrator", "Manager"],
        icon: "mdi:view-dashboard-outline",
    },
    {
        title: "Master Data",
        name: "Suppliers",
        href: "/suppliers",
        role: ["Administrator", "Manager"],
        icon: "mdi:account-group-outline",
    },
    {
        title: "Master Data",
        name: "Categories",
        href: "/categories",
        role: ["Administrator", "Manager"],
        icon: "mdi:shape-outline",
    },
    {
        title: "Master Data",
        name: "Warehouses",
        href: "/warehouses",
        role: ["Administrator", "Manager"],
        icon: "mdi:warehouse",
    },
    {
        title: "Products Management",
        name: "Products",
        href: "/products",
        role: ["Administrator", "Manager"],
        icon: "mdi:cart-outline",
    },
    {
        title: "Products Management",
        name: "Purchase Orders",
        href: "/purchase-orders",
        role: ["Administrator", "Manager", "Staff"],
        icon: "mdi:file-document-outline",
    },
    {
        title: "Products Management",
        name: "Stock Movements",
        href: "/stock-movements",
        role: ["Administrator", "Manager", "Staff"],
        icon: "mdi:swap-horizontal-bold",
    },
    {
        title: "Authentication Management",
        name: "Roles Management",
        href: "/roles",
        role: ["Administrator", "Manager", "Staff"],
        icon: "mdi:shield-account-outline",
    },
    {
        title: "Authentication Management",
        name: "Users Management",
        href: "/users",
        role: ["Administrator"],
        icon: "mdi:account-multiple-outline",
    },
];

export default function Sidebar({
    user,
    onToggleSidebar,
}: {
    user: {
        name: string;
        roles?: Array<{
            uuid: number;
            name: string;
        }>;
    };
    onToggleSidebar: (open: boolean) => void;
}) {
    const { url } = usePage();
    const [isOpen, setIsOpen] = useState(true);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        onToggleSidebar(!isOpen);
    };

    return (
        <aside
            className={`${
                isOpen ? "w-64" : "w-16"
            } fixed top-0 left-0 h-screen bg-white text-gray-800 flex flex-col transition-all duration-300 border-r border-gray-300 z-50`}
        >
            {/* Header & Hamburger */}
            <div
                className={`flex items-center ${
                    isOpen ? "justify-between" : "justify-center"
                } px-4 py-2 border-b border-gray-200`}
            >
                {isOpen && (
                    <div className="text-xl font-bold text-center">
                        <span
                            className="font-extrabold text-blue-600"
                            title="Pifacia"
                        >
                            AROBIDSH
                        </span>
                        -IMS
                    </div>
                )}
                <button
                    onClick={handleToggle}
                    className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:ring"
                    aria-label="Toggle sidebar"
                >
                    <Icon
                        icon={isOpen ? "mdi:menu-open" : "mdi:menu-close"}
                        width={24}
                        height={24}
                    />
                </button>
            </div>

            {/* Menu */}
            <nav className={`flex-grow mt-3 ${isOpen ? "px-3" : "px-2"}`}>
                {menuItems
                    .filter((item) =>
                        item.role.includes(user.roles?.[0]?.name || "")
                    )
                    .reduce<JSX.Element[]>((acc, item, index, array) => {
                        if (
                            (index === 0 ||
                                item.title !== array[index - 1].title) &&
                            item.title !== "Dashboard" &&
                            isOpen
                        ) {
                            acc.push(
                                <h5
                                    key={`section-${item.title}`}
                                    className="text-gray-500 text-sm font-semibold mt-4 mb-2"
                                >
                                    {item.title}
                                </h5>
                            );
                        }

                        const isActive = url.startsWith(item.href);
                        acc.push(
                            <Link
                                key={`menu-${item.name}`}
                                href={item.href}
                                title={item.name}
                                className={`flex items-center space-x-3 rounded px-3 py-2 mb-1 font-medium text-sm 
                    hover:bg-blue-100 hover:text-blue-700 hover:font-semibold
                    transition
                    ${
                        isActive
                            ? "bg-blue-100 text-blue-700 font-semibold"
                            : "text-gray-700"
                    }
                        `}
                                preserveScroll
                            >
                                <Icon
                                    icon={item.icon}
                                    width={20}
                                    height={20}
                                    className="flex-shrink-0"
                                />
                                {isOpen && <span>{item.name}</span>}
                            </Link>
                        );

                        return acc;
                    }, [])}
            </nav>

            {/* Footer */}
            <div className="mt-auto border-t border-gray-200">
                {isOpen ? (
                    <div className="p-3">
                        <Link
                            href={route("logout")}
                            method="post"
                            as="button"
                            className="w-full flex items-center justify-center gap-2 rounded-md bg-red-100 hover:bg-red-500 text-red-600 hover:text-white py-2 transition-colors"
                        >
                            <Icon icon="mdi:logout" width={20} height={20} />
                            <span className="font-medium">Log Out</span>
                        </Link>
                    </div>
                ) : (
                    <div className="flex justify-center p-3">
                        <Link
                            href={route("logout")}
                            method="post"
                            as="button"
                            className="p-2 rounded-full bg-red-100 hover:bg-red-500 text-red-600 hover:text-white transition-colors"
                            title="Log Out"
                        >
                            <Icon icon="mdi:logout" width={20} height={20} />
                        </Link>
                    </div>
                )}
            </div>
        </aside>
    );
}
