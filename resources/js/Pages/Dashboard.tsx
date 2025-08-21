import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import { Icon } from "@iconify/react/dist/iconify.js";
import DataTable, { TableStyles } from "react-data-table-component";
import DataTableStyles from "@/Components/DataTableStyles";
import Chart from "react-apexcharts";

interface Auth {
    user: {
        name: string;
    };
}

interface Props {
    auth: Auth;
}

interface Audit {
    id: string;
    user_id: string;
    user: {
        name: string;
    };
    event: string;
    auditable_type: string;
    created_at: string;
}
interface DashboardData {
    audits: Audit[];
    total_users: number;
    total_suppliers: number;
    total_warehouses: number;
    total_categories: number;
    total_products: number;
    purchase_order_status: { status: string; total: number }[];
    stock_summary: { movement_type: string; total: number }[];
    low_stock_summary: {
        product_name: string;
        stock: number;
        warehouse: string;
    }[];
    [key: string]: unknown;
}

// Chart
interface ChartProps {
    purchaseOrderStatus: { status: string; total: number }[];
    stockSummary: { movement_type: string; total: number }[];
}
export default function Dashboard({ auth }: Props) {
    const {
        audits,
        total_users,
        total_suppliers,
        total_warehouses,
        total_categories,
        total_products,
        purchase_order_status,
        stock_summary,
        low_stock_summary,
        purchase_order_monthly,
    } = usePage<PageProps<DashboardData>>().props;

    const [pending, setPending] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const auditColumns = [
        {
            name: "Date",
            cell: (row: Audit) => {
                const date = new Date(row.created_at);
                const formattedDate = new Intl.DateTimeFormat("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                }).format(date);

                const formattedTime = date.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                });

                return `${formattedDate} (${formattedTime} WIB)`;
            },
            sortable: true,
        },
        {
            name: "Action",
            selector: (row: Audit) =>
                row.event.charAt(0).toUpperCase() + row.event.slice(1),
            sortable: true,
        },
        {
            name: "User",
            selector: (row: Audit) => row.user?.name,
            sortable: true,
        },
        {
            name: "Note",
            selector: (row: Audit) => {
                const modelName = row.auditable_type?.split("\\").pop() || "";
                const formattedModelName = modelName.replace(
                    /([a-z])([A-Z])/g,
                    "$1 $2"
                );
                const formattedEvent =
                    row.event.charAt(0).toUpperCase() + row.event.slice(1);
                return `${formattedEvent} ${formattedModelName}`;
            },
            sortable: true,
        },
    ];

    const purchaseOrderOptions = {
        chart: {
            type: "pie",
        },
        labels: purchase_order_status.map(
            (item) => item.status.charAt(0).toUpperCase() + item.status.slice(1)
        ),
        legend: {
            position: "bottom" as const,
        },
        colors: purchase_order_status.map((item) => {
            switch (item.status) {
                case "completed":
                    return "#00E396";
                case "draft":
                    return "#808080";
                case "confirmed":
                    return "#FEB019";
                case "cancelled":
                    return "#FF4560";
                default:
                    return "#775DD0";
            }
        }),
    };

    const purchaseOrderSeries = purchase_order_status.map((item) => item.total);

    // Donut Chart untuk Stock Summary
    const stockSummaryOptions = {
        chart: {
            type: "donut",
        },
        labels: stock_summary.map(
            (item) =>
                item.movement_type.charAt(0).toUpperCase() +
                item.movement_type.slice(1)
        ),
        legend: {
            position: "bottom" as const,
        },
        colors: stock_summary.map((item) => {
            switch (item.movement_type) {
                case "in":
                    return "#00E396";
                case "out":
                    return "#FF4560";
                default:
                    return "#808080";
            }
        }),
    };
    const statusGroups: { [key: string]: number[] } = {};
    const purchaseOrderMonthly: {
        status: string;
        month: number;
        total: number;
    }[] = purchase_order_monthly as any;
    purchaseOrderMonthly.forEach((item) => {
        if (!statusGroups[item.status]) {
            statusGroups[item.status] = Array(12).fill(0);
        }
        statusGroups[item.status][item.month - 1] = item.total;
    });

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const barSeries = Object.keys(statusGroups).map((status) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        data: statusGroups[status],
    }));

    const barOptions = {
        chart: { stacked: true },
        xaxis: { categories: months },
        colors: purchaseOrderMonthly.map((item) => {
            switch (item.status) {
                case "completed":
                    return "#00E396";
                case "draft":
                    return "#808080";
                case "confirmed":
                    return "#FEB019";
                case "cancelled":
                    return "#FF4560";
                default:
                    return "#775DD0";
            }
        }),
    };
    const stockSummarySeries = stock_summary.map((item) => item.total);
    return (
        <AuthenticatedLayout auth={auth} title="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Welcome back, {auth.user.name} 👋
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Here’s what’s happening in your system today.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-blue-600">
                                Total Users
                            </span>
                            <span className="text-2xl font-bold mt-1">
                                {total_users}
                            </span>
                        </div>
                        <div className="ml-auto text-blue-600">
                            <Icon
                                icon="mdi:account-multiple"
                                className="w-12 h-12"
                            />
                        </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-green-600">
                                Total Suppliers
                            </span>
                            <span className="text-2xl font-bold mt-1">
                                {total_suppliers}
                            </span>
                        </div>
                        <div className="ml-auto text-green-600">
                            <Icon
                                icon="mdi:people-switch"
                                className="w-12 h-12"
                            />
                        </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-amber-600">
                                Total Warehouses
                            </span>
                            <span className="text-2xl font-bold mt-1">
                                {total_warehouses}
                            </span>
                        </div>
                        <div className="ml-auto text-amber-600">
                            <Icon icon="mdi:warehouse" className="w-12 h-12" />
                        </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-violet-600">
                                Total Products
                            </span>
                            <span className="text-2xl font-bold mt-1">
                                {total_products}
                            </span>
                        </div>
                        <div className="ml-auto text-violet-600">
                            <Icon
                                icon="mdi:package-variant-closed"
                                className="w-12 h-12"
                            />
                        </div>
                    </div>
                </div>

                {/* Purchase Order Status & Stock Movement & Low Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Purchase Orders */}
                    <div className="bg-white shadow rounded-2xl p-5 flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                            <Icon
                                icon="mdi:clipboard-list"
                                className="w-5 h-5 text-blue-600"
                            />
                            <h2 className="text-lg font-semibold text-gray-800">
                                Purchase Orders (30 days)
                            </h2>
                        </div>
                        {/* <ul className="space-y-3">
                            {purchase_order_status.map((po, idx) => (
                                <li key={idx}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="capitalize text-gray-700">
                                            {po.status}
                                        </span>
                                        <span className="font-bold text-gray-900">
                                            {po.total}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul> */}
                        <div className="h-64">
                            <Chart
                                options={{
                                    ...purchaseOrderOptions,
                                    chart: {
                                        ...purchaseOrderOptions.chart,
                                        type: "pie",
                                    },
                                }}
                                series={purchaseOrderSeries}
                                type="pie"
                                height="100%"
                            />
                        </div>
                    </div>

                    {/* Stock Movements */}
                    <div className="bg-white shadow rounded-2xl p-5 flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                            <Icon
                                icon="mdi:arrow-left-right"
                                className="w-5 h-5 text-green-600"
                            />
                            <h2 className="text-lg font-semibold text-gray-800">
                                Stock Movements (30 days)
                            </h2>
                        </div>
                        {/* <ul className="space-y-3">
                            {stock_summary.map((sm, idx) => (
                                <li key={idx}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="capitalize text-gray-700">
                                            {sm.movement_type}
                                        </span>
                                        <span className="font-bold text-gray-900">
                                            {sm.total}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul> */}
                        <Chart
                            options={{
                                ...stockSummaryOptions,
                                chart: {
                                    type: "donut" as const,
                                },
                            }}
                            series={stockSummarySeries}
                            type="donut"
                            height={300}
                        />
                    </div>
                    {/* Low Stock Alerts */}
                    <div className="bg-white shadow rounded-2xl p-5 flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                            <Icon
                                icon="mdi:alert-circle"
                                className="w-5 h-5 text-red-600"
                            />
                            <h2 className="text-lg font-semibold text-gray-800">
                                Low Stock Alerts
                            </h2>
                        </div>
                        {low_stock_summary.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {low_stock_summary.map((item, idx) => (
                                    <li
                                        key={idx}
                                        className="py-2 flex justify-between items-center text-sm"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">
                                                {item.product_name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {item.warehouse}
                                            </span>
                                        </div>
                                        <span
                                            className={`font-bold px-2 py-1 rounded-lg text-xs ${
                                                item.stock <= 10
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}
                                        >
                                            {item.stock}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex items-center gap-2 text-green-600 text-sm">
                                🎉 No products with low stock
                            </div>
                        )}
                    </div>
                </div>
                {/* Purchase Orders per status per month */}
                <div className="bg-white shadow rounded-2xl p-5 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <Icon
                            icon="mdi:arrow-left-right"
                            className="w-5 h-5 text-green-600"
                        />
                        <h2 className="text-lg font-semibold text-gray-800">
                            PO per Status per Month ({new Date().getFullYear()})
                        </h2>
                    </div>
                    <Chart
                        options={barOptions}
                        series={barSeries}
                        type="bar"
                        height={300}
                    />
                </div>
                {/* Data Table */}
                <div className="bg-white shadow rounded-lg p-4 overflow-hidden">
                    <div className="flex items-center gap-2 mb-3">
                        <Icon
                            icon="mdi:clipboard-text"
                            className="w-5 h-5 text-violet-600"
                        />
                        <h2 className="text-lg font-semibold text-gray-800">
                            Recent Audits
                        </h2>
                    </div>
                    <DataTable
                        columns={auditColumns}
                        data={audits}
                        highlightOnHover
                        striped
                        customStyles={DataTableStyles}
                        responsive
                        pointerOnHover
                        noDataComponent="No audits found"
                        progressPending={pending}
                        className="overflow-hidden"
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
