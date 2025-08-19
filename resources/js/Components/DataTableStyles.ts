import { TableStyles } from "react-data-table-component";

const DataTableStyles: TableStyles = {
    table: {
        style: {
            borderCollapse: "separate", // ✅ sesuai type
            borderSpacing: "0",
            borderRadius: "0.5rem", // rounded-lg
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        },
    },
    rows: {
        style: {
            minHeight: "56px",
            fontSize: "14px",
            backgroundColor: "#fff",
            transition: "background-color 0.2s ease",
            "&:hover": {
                backgroundColor: "#f9fafb", // Tailwind gray-50
            },
        },
    },
    headRow: {
        style: {
            backgroundColor: "#f3f4f6", // Tailwind gray-100
            borderBottom: "2px solid #e5e7eb", // Tailwind gray-200
        },
    },
    headCells: {
        style: {
            paddingLeft: "16px",
            paddingRight: "16px",
            fontSize: "12px",
            fontWeight: "600",
            textTransform: "uppercase",
            color: "#4b5563", // Tailwind gray-700
        },
    },
    cells: {
        style: {
            paddingLeft: "16px",
            paddingRight: "16px",
            color: "#374151", // Tailwind gray-800
        },
    },
    pagination: {
        style: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "12px 0",
            fontSize: "14px",
            fontWeight: "500",
            color: "#374151", // gray-800
            backgroundColor: "#f9fafb", // gray-50
            borderTop: "1px solid #e5e7eb", // gray-200
        },
    },
};
export default DataTableStyles;
