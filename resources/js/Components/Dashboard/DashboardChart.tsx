import React from "react";
import Chart from "react-apexcharts";

interface ChartProps {
    purchaseOrderStatus: { status: string; total: number }[];
    stockSummary: { movement_type: string; total: number }[];
}

const DashboardCharts: React.FC<ChartProps> = ({
    purchaseOrderStatus,
    stockSummary,
}) => {
    // Pie Chart untuk Purchase Order Status
    const purchaseOrderOptions = {
        chart: {
            type: "pie",
        },
        labels: purchaseOrderStatus.map((item) => item.status),
        legend: {
            position: "bottom" as const,
        },
    };

    const purchaseOrderSeries = purchaseOrderStatus.map((item) => item.total);

    // Donut Chart untuk Stock Summary
    const stockSummaryOptions = {
        chart: {
            type: "donut",
        },
        labels: stockSummary.map((item) => item.movement_type),
        legend: {
            position: "bottom" as const,
        },
        plotOptions: {
            pie: {
                donut: {
                    size: "65%",
                },
            },
        },
    };

    const stockSummarySeries = stockSummary.map((item) => item.total);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 shadow rounded-2xl">
                <h2 className="text-lg font-semibold mb-3">
                    Purchase Order Status (Last 30 Days)
                </h2>
                <Chart
                    options={{
                        ...purchaseOrderOptions,
                        chart: {
                            type: "pie" as const,
                        },
                    }}
                    series={purchaseOrderSeries}
                    type="pie"
                    height={300}
                />
            </div>

            <div className="bg-white p-4 shadow rounded-2xl">
                <h2 className="text-lg font-semibold mb-3">
                    Stock Movement Summary (Last 30 Days)
                </h2>
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
        </div>
    );
};

export default DashboardCharts;
