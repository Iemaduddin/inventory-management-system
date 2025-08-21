import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    Box,
    Card,
    Text,
    Flex,
    Button,
    TextField,
    Dialog,
    TextArea,
    AlertDialog,
    Badge,
    Code,
    DataList,
    IconButton,
    Switch,
    Select,
    RadioCards,
} from "@radix-ui/themes";
import { PageProps } from "@/types";
import DataTable from "react-data-table-component";
import { Icon } from "@iconify/react/dist/iconify.js";
import { toast } from "react-toastify";
import type { PageProps as InertiaPageProps } from "@inertiajs/core";
import z from "zod";
import DataTableStyles from "@/Components/DataTableStyles";

interface Auth {
    user: {
        name: string;
    };
}

interface Props {
    auth: Auth;
}
type Warehouse = { id: string; name: string };
type Product = { id: string; name: string };

interface Props {
    warehouses: Warehouse[];
    // products initial optional
    products?: Product[];
}

interface StockMovement {
    id: string;
    product_id: string;
    warehouse_id: string;
    product: {
        id: string;
        name: string;
    };
    warehouse: {
        id: string;
        name: string;
    };
    movement_type: string;
    movement_reason: string;
    quantity: number;
    notes: string;
    movement_date: Date;
}
const adjustStockSchema = z.object({
    warehouse_id: z.string().min(1, "Warehouse is required"),
    product_id: z.string().min(1, "Product is required"),
    movement_type: z.enum(["in", "out"], {
        message: "Adjustment type is required",
    }),
    quantity: z
        .number()
        .min(1, "Quantity must be greater than 0")
        .int("Quantity must be an integer"),
    notes: z.string().min(1, "Notes are required"),
});

const transferStockSchema = z.object({
    product_id: z.string().min(1, "Product is required"),
    current_warehouse_id: z.string().min(1, "Currect Warehouse is required"),
    destination_warehouse_id: z
        .string()
        .min(1, "Destination Warehouse is required"),
    quantity: z
        .number()
        .min(1, "Quantity must be greater than 0")
        .int("Quantity must be an integer"),
    notes: z.string().min(1, "Notes are required"),
});

export default function stockMovementsManagement({ auth }: Props) {
    const { stockMovements } = usePage<
        PageProps<{
            stockMovements: StockMovement[];
        }>
    >().props;
    const [pending, setPending] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filteredstockMovements, setFilteredstockMovements] = useState<
        StockMovement[]
    >([]);
    const [search, setSearch] = useState("");
    const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

    useEffect(() => {
        const lowercasedSearch = search.toLowerCase();

        const filtered = stockMovements.filter((stockmovement) => {
            return (
                stockmovement.product?.name
                    .toLowerCase()
                    .includes(lowercasedSearch) ||
                stockmovement.warehouse?.name
                    .toLowerCase()
                    .includes(lowercasedSearch) ||
                stockmovement.movement_type
                    .toLowerCase()
                    .includes(lowercasedSearch) ||
                stockmovement.movement_reason
                    .toLowerCase()
                    .includes(lowercasedSearch) ||
                stockmovement.notes.toLowerCase().includes(lowercasedSearch) ||
                (stockmovement.movement_date
                    ? new Date(stockmovement.movement_date).toLocaleDateString(
                          "id-ID"
                      )
                    : ""
                ).includes(lowercasedSearch) ||
                stockmovement.quantity.toString().includes(lowercasedSearch)
            );
        });

        setFilteredstockMovements(filtered);
    }, [search, stockMovements]);

    const columns = [
        {
            name: "No",
            cell: (row: StockMovement, index: number) =>
                (currentPage - 1) * rowsPerPage + index + 1,
            width: "70px",
        },
        {
            name: "Product",
            selector: (row: StockMovement) => row.product?.name,
            sortable: true,
        },
        {
            name: "Warehouse",
            selector: (row: StockMovement) => row.warehouse?.name,
            sortable: true,
        },
        {
            name: "Movement Type",
            cell: (row: StockMovement) => {
                return (
                    <Badge color={row.movement_type === "in" ? "cyan" : "red"}>
                        {row.movement_type.toUpperCase()}
                    </Badge>
                );
            },
            sortable: true,
        },
        {
            name: "Movement Reason",
            cell: (row: StockMovement) => {
                let badgeColors:
                    | "green"
                    | "orange"
                    | "blue"
                    | "purple"
                    | "yellow"
                    | undefined = undefined;
                if (row.movement_reason === "purchase") {
                    badgeColors = "green";
                } else if (row.movement_reason === "sale") {
                    badgeColors = "orange";
                } else if (row.movement_reason === "return") {
                    badgeColors = "blue";
                } else if (row.movement_reason === "transfer") {
                    badgeColors = "purple";
                } else if (row.movement_reason === "adjustment") {
                    badgeColors = "yellow";
                }
                return (
                    <Badge color={badgeColors}>
                        {row.movement_reason.charAt(0).toUpperCase() +
                            row.movement_reason.slice(1)}
                    </Badge>
                );
            },
            sortable: true,
        },
        {
            name: "Quantity",
            selector: (row: StockMovement) => row.quantity,
            sortable: true,
            right: true,
        },
        {
            name: "Notes",
            selector: (row: StockMovement) => row.notes,
            sortable: true,
            wrap: true,
        },
        {
            name: "Movement Date",
            cell: (row: StockMovement) => {
                const date = new Date(row.movement_date);
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
    ];
    const [open, setOpen] = React.useState(false);
    const [openTransfer, setOpenTransfer] = React.useState(false);

    const page = usePage() as unknown as InertiaPageProps & { props: Props };
    const warehouses = (page.props.warehouses || []) as Warehouse[];

    const [formDataTransfer, setFormDataTransfer] = useState({
        product_id: "",
        current_warehouse_id: "",
        destination_warehouse_id: "",
        quantity: 1,
        notes: "",
    });
    const [formData, setFormData] = useState({
        product_id: "",
        warehouse_id: "",
        movement_type: "",
        movement_reason: "",
        quantity: 1,
        notes: "",
        movement_date: new Date().toISOString().split("T")[0],
    });
    const [products, setProducts] = useState<Product[]>([]); // dynamic products
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleWarehouseChange = async (warehouseId: string) => {
        setFormData((p) => ({
            ...p,
            warehouse_id: warehouseId,
            product_id: "",
        }));
        setFormDataTransfer((p) => ({
            ...p,
            current_warehouse_id: warehouseId,
            product_id: "",
        }));
        setProducts([]);
        setError(null);

        if (!warehouseId) {
            return;
        }

        setLoadingProducts(true);
        try {
            // Gunakan fetch dan minta JSON (Accept header)
            const res = await fetch(route("warehouses.products", warehouseId), {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
                credentials: "same-origin",
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data = (await res.json()) as Product[];
            setProducts(data || []);
        } catch (err: any) {
            console.error("Failed to load products:", err);
            setError("Failed to load products. Please try again later.");
            setProducts([]);
        } finally {
            setLoadingProducts(false);
        }
    };
    const handleAdjustmentStock = async (e: React.FormEvent) => {
        e.preventDefault();
        setPending(true);

        const result = adjustStockSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors: { [key: string]: string } = {};
            result.error.issues.forEach((issue) => {
                const fieldName = issue.path[0] as string;
                fieldErrors[fieldName] = issue.message;
            });
            setErrors(fieldErrors);
            setPending(false);
            return;
        }

        router.post(
            route("stock-movements.adjustStock"),
            {
                ...formData,
                quantity: parseInt(formData.quantity.toString(), 10),
            },
            {
                onSuccess: () => {
                    toast.success("Stock adjustment successful");
                    setFormData({
                        product_id: "",
                        warehouse_id: "",
                        movement_type: "",
                        movement_reason: "",
                        quantity: 1,
                        notes: "",
                        movement_date: new Date().toISOString().split("T")[0],
                    });
                    setOpen(false);
                    setErrors({});
                },
                onError: (errors) => {
                    if (typeof errors === "string") {
                        toast.error(errors);
                    } else if (errors && typeof errors === "object") {
                        const messages = Object.values(errors)
                            .flat()
                            .join("\n");
                        toast.error(messages);
                    } else {
                        toast.error("Failed to adjust stock");
                    }
                    console.error(errors);
                },
                onFinish: () => setPending(false),
            }
        );
    };
    useEffect(() => {
        if (
            formData.movement_reason === "damage" ||
            formData.movement_reason === "sale"
        ) {
            setFormData((prev) => ({
                ...prev,
                movement_type: "out",
            }));
        }
    }, [formData.movement_reason]);

    const handleTransferStock = async (e: React.FormEvent) => {
        e.preventDefault();
        setPending(true);

        const result = transferStockSchema.safeParse(formDataTransfer);
        console.log("Transfer Stock Data:", result);

        if (!result.success) {
            const fieldErrors: { [key: string]: string } = {};
            result.error.issues.forEach((issue) => {
                const fieldName = issue.path[0] as string;
                fieldErrors[fieldName] = issue.message;
            });
            setErrors(fieldErrors);
            setPending(false);
            return;
        }

        router.post(
            route("stock-movements.transferStock"),
            {
                ...formDataTransfer,
                quantity: parseInt(formDataTransfer.quantity.toString(), 10),
            },
            {
                onSuccess: () => {
                    toast.success("Stock adjustment successful");
                    setFormDataTransfer({
                        product_id: "",
                        current_warehouse_id: "",
                        destination_warehouse_id: "",
                        quantity: 1,
                        notes: "",
                    });
                    setOpenTransfer(false);
                    setErrors({});
                },
                onError: (errors) => {
                    if (typeof errors === "string") {
                        toast.error(errors);
                    } else if (errors && typeof errors === "object") {
                        const messages = Object.values(errors)
                            .flat()
                            .join("\n");
                        toast.error(messages);
                    } else {
                        toast.error("Failed to adjust stock");
                    }
                    console.error(errors);
                },
                onFinish: () => setPending(false),
            }
        );
    };
    return (
        <AuthenticatedLayout auth={auth} title="Stock Movements Management">
            <Head title="Stock Movements Management" />
            <div className="bg-white shadow rounded-lg p-4 overflow-hidden">
                <DataTable
                    columns={columns.map((column) => ({
                        ...column,
                        selector: column.selector
                            ? (row: StockMovement) =>
                                  String(column.selector(row))
                            : undefined,
                    }))}
                    data={filteredstockMovements}
                    pagination
                    paginationPerPage={rowsPerPage}
                    paginationRowsPerPageOptions={[5, 10, 15, 20, 50]}
                    onChangePage={(page) => setCurrentPage(page)}
                    onChangeRowsPerPage={(newPerPage, page) => {
                        setRowsPerPage(newPerPage);
                        setCurrentPage(page);
                    }}
                    highlightOnHover
                    striped
                    customStyles={DataTableStyles}
                    responsive
                    pointerOnHover
                    noDataComponent="No stockMovements found"
                    subHeader
                    subHeaderComponent={
                        <div className="flex justify-between items-center w-full">
                            <div className="flex items-center w-full gap-2">
                                <Dialog.Root open={open} onOpenChange={setOpen}>
                                    <Dialog.Trigger>
                                        <Button variant="soft">
                                            <Icon
                                                icon="mdi:plus-minus-variant"
                                                width={20}
                                                height={20}
                                            />
                                            Stock Adjusment
                                        </Button>
                                    </Dialog.Trigger>

                                    <Dialog.Content maxWidth="450px">
                                        <Dialog.Title>
                                            Stock Adjusment
                                        </Dialog.Title>
                                        <hr className="mb-4" />

                                        <form onSubmit={handleAdjustmentStock}>
                                            <Flex direction="column" gap="3">
                                                {/* Select Warehouse */}
                                                <label className="w-full">
                                                    <Text
                                                        as="div"
                                                        size="2"
                                                        mb="1"
                                                        weight="bold"
                                                    >
                                                        Warehouse
                                                    </Text>
                                                    <Select.Root
                                                        name="warehouse_id"
                                                        value={
                                                            formData.warehouse_id
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) => {
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    warehouse_id:
                                                                        value,
                                                                    product_id:
                                                                        "",
                                                                })
                                                            );
                                                            handleWarehouseChange(
                                                                value
                                                            );
                                                        }}
                                                        required
                                                    >
                                                        <Select.Trigger
                                                            placeholder="Select warehouse"
                                                            className="w-full"
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                        />
                                                        <Select.Content
                                                            className="w-full"
                                                            style={{
                                                                width: "var(--radix-select-trigger-width)",
                                                            }}
                                                        >
                                                            {warehouses.map(
                                                                (warehouse) => (
                                                                    <Select.Item
                                                                        key={
                                                                            warehouse.id
                                                                        }
                                                                        value={warehouse.id.toString()}
                                                                    >
                                                                        {
                                                                            warehouse.name
                                                                        }
                                                                    </Select.Item>
                                                                )
                                                            )}
                                                        </Select.Content>
                                                    </Select.Root>
                                                    {errors?.warehouse_id && (
                                                        <span className="text-red-500 text-sm">
                                                            {
                                                                errors.warehouse_id
                                                            }
                                                        </span>
                                                    )}
                                                </label>

                                                {/* Select Product */}
                                                <label className="w-full">
                                                    <Text
                                                        as="div"
                                                        size="2"
                                                        mb="1"
                                                        weight="bold"
                                                    >
                                                        Product
                                                    </Text>
                                                    <Select.Root
                                                        name="product_id"
                                                        value={
                                                            formData.product_id
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    product_id:
                                                                        value,
                                                                })
                                                            )
                                                        }
                                                        required
                                                        disabled={
                                                            !formData.warehouse_id ||
                                                            loadingProducts
                                                        }
                                                    >
                                                        <Select.Trigger
                                                            placeholder={
                                                                loadingProducts
                                                                    ? "Loading..."
                                                                    : products.length >
                                                                      0
                                                                    ? "Select product"
                                                                    : "No products available"
                                                            }
                                                            className="w-full"
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                        />
                                                        <Select.Content
                                                            className="w-full"
                                                            style={{
                                                                width: "var(--radix-select-trigger-width)",
                                                            }}
                                                        >
                                                            {products.map(
                                                                (product) => (
                                                                    <Select.Item
                                                                        key={
                                                                            product.id
                                                                        }
                                                                        value={product.id.toString()}
                                                                    >
                                                                        {
                                                                            product.name
                                                                        }
                                                                    </Select.Item>
                                                                )
                                                            )}
                                                        </Select.Content>
                                                    </Select.Root>
                                                    {errors?.product_id && (
                                                        <span className="text-red-500 text-sm">
                                                            {errors.product_id}
                                                        </span>
                                                    )}
                                                </label>
                                                <label className="w-full">
                                                    <Text
                                                        as="div"
                                                        size="2"
                                                        mb="1"
                                                        weight="bold"
                                                    >
                                                        Adjustment Reason
                                                    </Text>
                                                    <Select.Root
                                                        value={
                                                            formData.movement_reason
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    movement_reason:
                                                                        value,
                                                                })
                                                            )
                                                        }
                                                    >
                                                        <Select.Trigger
                                                            placeholder="Select adjustment reason"
                                                            className="w-full"
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                        />
                                                        <Select.Content
                                                            className="w-full"
                                                            style={{
                                                                width: "var(--radix-select-trigger-width)",
                                                            }}
                                                        >
                                                            <Select.Item
                                                                value="sale"
                                                                key="sale"
                                                            >
                                                                Sale
                                                            </Select.Item>
                                                            <Select.Item
                                                                value="adjustment"
                                                                key="adjustment"
                                                            >
                                                                Adjustment
                                                            </Select.Item>
                                                            <Select.Item
                                                                value="damage"
                                                                key="damage"
                                                            >
                                                                Damage
                                                            </Select.Item>
                                                        </Select.Content>
                                                    </Select.Root>
                                                    {errors?.movement_reason && (
                                                        <span className="text-red-500 text-sm">
                                                            {
                                                                errors.movement_reason
                                                            }
                                                        </span>
                                                    )}
                                                </label>
                                                <label className="w-full">
                                                    <Text
                                                        as="div"
                                                        size="2"
                                                        mb="1"
                                                        weight="bold"
                                                    >
                                                        Adjustment Type
                                                    </Text>
                                                    <RadioCards.Root
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    movement_type:
                                                                        value,
                                                                })
                                                            )
                                                        }
                                                    >
                                                        <RadioCards.Item
                                                            value="in"
                                                            disabled={
                                                                formData.movement_reason ===
                                                                    "sale" ||
                                                                formData.movement_reason ===
                                                                    "damage"
                                                            }
                                                        >
                                                            <Icon
                                                                icon="mdi:plus-circle-multiple-outline"
                                                                width={20}
                                                                height={20}
                                                            />
                                                            <span>
                                                                Add Stock
                                                            </span>
                                                        </RadioCards.Item>
                                                        <RadioCards.Item
                                                            value="out"
                                                            disabled={
                                                                formData.movement_reason ===
                                                                "adjustment"
                                                                    ? false
                                                                    : false
                                                            }
                                                        >
                                                            <Icon
                                                                icon="mdi:minus-circle-multiple-outline"
                                                                width={20}
                                                                height={20}
                                                            />
                                                            <span>
                                                                Reduce Stock
                                                            </span>
                                                        </RadioCards.Item>
                                                    </RadioCards.Root>
                                                    {errors?.movement_type && (
                                                        <span className="text-red-500 text-sm">
                                                            {
                                                                errors.movement_type
                                                            }
                                                        </span>
                                                    )}
                                                </label>
                                                <label>
                                                    <Text
                                                        as="div"
                                                        size="2"
                                                        mb="1"
                                                        weight="bold"
                                                    >
                                                        Quantity
                                                    </Text>
                                                    <TextField.Root
                                                        placeholder="Enter Quantity"
                                                        type="number"
                                                        name="quantity"
                                                        min={0}
                                                        value={
                                                            formData.quantity
                                                        }
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    quantity:
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        ),
                                                                })
                                                            )
                                                        }
                                                        required
                                                    />
                                                    {errors?.quantity && (
                                                        <span className="text-red-500 text-sm">
                                                            {errors.quantity}
                                                        </span>
                                                    )}
                                                </label>
                                                <label>
                                                    <Text
                                                        as="div"
                                                        size="2"
                                                        mb="1"
                                                        weight="bold"
                                                    >
                                                        Notes
                                                    </Text>
                                                    <TextArea
                                                        rows={3}
                                                        resize="vertical"
                                                        placeholder="Enter notes"
                                                        name="notes"
                                                        value={formData.notes}
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    notes: e
                                                                        .target
                                                                        .value,
                                                                })
                                                            )
                                                        }
                                                        required
                                                    />
                                                    {errors?.notes && (
                                                        <span className="text-red-500 text-sm">
                                                            {errors.notes}
                                                        </span>
                                                    )}
                                                </label>
                                            </Flex>

                                            <hr className="my-4" />

                                            <Flex gap="3" mt="4" justify="end">
                                                <Dialog.Close>
                                                    <Button
                                                        variant="soft"
                                                        color="gray"
                                                        type="button"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </Dialog.Close>
                                                <Button
                                                    type="submit"
                                                    disabled={pending}
                                                >
                                                    {pending
                                                        ? "Saving..."
                                                        : "Save"}
                                                </Button>
                                            </Flex>
                                        </form>
                                    </Dialog.Content>
                                </Dialog.Root>
                                <Dialog.Root
                                    open={openTransfer}
                                    onOpenChange={setOpenTransfer}
                                >
                                    <Dialog.Trigger>
                                        <Button variant="soft" color="amber">
                                            <Icon
                                                icon="mdi:bank-transfer"
                                                width={20}
                                                height={20}
                                            />
                                            Stock Transfer
                                        </Button>
                                    </Dialog.Trigger>

                                    <Dialog.Content maxWidth="450px">
                                        <Dialog.Title>
                                            Stock Transfer
                                        </Dialog.Title>
                                        <hr className="mb-4" />

                                        <form onSubmit={handleTransferStock}>
                                            <Flex direction="column" gap="3">
                                                {/* Select Current Warehouse */}
                                                <label className="w-full">
                                                    <Text
                                                        as="div"
                                                        size="2"
                                                        mb="1"
                                                        weight="bold"
                                                    >
                                                        Current Warehouse
                                                    </Text>
                                                    <Select.Root
                                                        name="current_warehouse_id"
                                                        value={
                                                            formDataTransfer.current_warehouse_id
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) => {
                                                            setFormDataTransfer(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    current_warehouse_id:
                                                                        value,
                                                                })
                                                            );
                                                            handleWarehouseChange(
                                                                value
                                                            );
                                                        }}
                                                        required
                                                    >
                                                        <Select.Trigger
                                                            placeholder="Select current warehouse"
                                                            className="w-full"
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                        />
                                                        <Select.Content
                                                            className="w-full"
                                                            style={{
                                                                width: "var(--radix-select-trigger-width)",
                                                            }}
                                                        >
                                                            {warehouses.map(
                                                                (warehouse) => (
                                                                    <Select.Item
                                                                        key={
                                                                            warehouse.id
                                                                        }
                                                                        value={warehouse.id.toString()}
                                                                    >
                                                                        {
                                                                            warehouse.name
                                                                        }
                                                                    </Select.Item>
                                                                )
                                                            )}
                                                        </Select.Content>
                                                    </Select.Root>
                                                    {errors?.current_warehouse_id && (
                                                        <span className="text-red-500 text-sm">
                                                            {
                                                                errors.current_warehouse_id
                                                            }
                                                        </span>
                                                    )}
                                                </label>

                                                {/* Select Destination Warehouse */}
                                                <label className="w-full">
                                                    <Text
                                                        as="div"
                                                        size="2"
                                                        mb="1"
                                                        weight="bold"
                                                    >
                                                        Destination Warehouse
                                                    </Text>
                                                    <Select.Root
                                                        name="destination_warehouse_id"
                                                        value={
                                                            formDataTransfer.destination_warehouse_id
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) => {
                                                            setFormDataTransfer(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    destination_warehouse_id:
                                                                        value,
                                                                })
                                                            );
                                                        }}
                                                        required
                                                    >
                                                        <Select.Trigger
                                                            placeholder="Select destination warehouse"
                                                            className="w-full"
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                        />
                                                        <Select.Content
                                                            className="w-full"
                                                            style={{
                                                                width: "var(--radix-select-trigger-width)",
                                                            }}
                                                        >
                                                            {warehouses.map(
                                                                (warehouse) => (
                                                                    <Select.Item
                                                                        key={
                                                                            warehouse.id
                                                                        }
                                                                        value={warehouse.id.toString()}
                                                                    >
                                                                        {
                                                                            warehouse.name
                                                                        }
                                                                    </Select.Item>
                                                                )
                                                            )}
                                                        </Select.Content>
                                                    </Select.Root>
                                                    {errors?.destination_warehouse_id && (
                                                        <span className="text-red-500 text-sm">
                                                            {
                                                                errors.destination_warehouse_id
                                                            }
                                                        </span>
                                                    )}
                                                </label>
                                                {/* Select Product */}
                                                <label className="w-full">
                                                    <Text
                                                        as="div"
                                                        size="2"
                                                        mb="1"
                                                        weight="bold"
                                                    >
                                                        Product
                                                    </Text>
                                                    <Select.Root
                                                        name="product_id"
                                                        value={
                                                            formDataTransfer.product_id
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setFormDataTransfer(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    product_id:
                                                                        value,
                                                                })
                                                            )
                                                        }
                                                        required
                                                        disabled={
                                                            !formData.warehouse_id ||
                                                            loadingProducts
                                                        }
                                                    >
                                                        <Select.Trigger
                                                            placeholder={
                                                                loadingProducts
                                                                    ? "Loading..."
                                                                    : products.length >
                                                                      0
                                                                    ? "Select product"
                                                                    : "No products available"
                                                            }
                                                            className="w-full"
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                        />
                                                        <Select.Content
                                                            className="w-full"
                                                            style={{
                                                                width: "var(--radix-select-trigger-width)",
                                                            }}
                                                        >
                                                            {products.map(
                                                                (product) => (
                                                                    <Select.Item
                                                                        key={
                                                                            product.id
                                                                        }
                                                                        value={product.id.toString()}
                                                                    >
                                                                        {
                                                                            product.name
                                                                        }
                                                                    </Select.Item>
                                                                )
                                                            )}
                                                        </Select.Content>
                                                    </Select.Root>
                                                    {errors?.product_id && (
                                                        <span className="text-red-500 text-sm">
                                                            {errors.product_id}
                                                        </span>
                                                    )}
                                                </label>
                                                <label>
                                                    <Text
                                                        as="div"
                                                        size="2"
                                                        mb="1"
                                                        weight="bold"
                                                    >
                                                        Quantity
                                                    </Text>
                                                    <TextField.Root
                                                        placeholder="Enter Quantity"
                                                        type="number"
                                                        name="quantity"
                                                        min={0}
                                                        value={
                                                            formDataTransfer.quantity
                                                        }
                                                        onChange={(e) =>
                                                            setFormDataTransfer(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    quantity:
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        ),
                                                                })
                                                            )
                                                        }
                                                        required
                                                    />
                                                    {errors?.quantity && (
                                                        <span className="text-red-500 text-sm">
                                                            {errors.quantity}
                                                        </span>
                                                    )}
                                                </label>
                                                <label>
                                                    <Text
                                                        as="div"
                                                        size="2"
                                                        mb="1"
                                                        weight="bold"
                                                    >
                                                        Notes
                                                    </Text>
                                                    <TextArea
                                                        rows={3}
                                                        resize="vertical"
                                                        placeholder="Enter price"
                                                        name="notes"
                                                        value={
                                                            formDataTransfer.notes
                                                        }
                                                        onChange={(e) =>
                                                            setFormDataTransfer(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    notes: e
                                                                        .target
                                                                        .value,
                                                                })
                                                            )
                                                        }
                                                        required
                                                    />
                                                    {errors?.notes && (
                                                        <span className="text-red-500 text-sm">
                                                            {errors.notes}
                                                        </span>
                                                    )}
                                                </label>
                                            </Flex>

                                            <hr className="my-4" />

                                            <Flex gap="3" mt="4" justify="end">
                                                <Dialog.Close>
                                                    <Button
                                                        variant="soft"
                                                        color="gray"
                                                        type="button"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </Dialog.Close>
                                                <Button
                                                    type="submit"
                                                    disabled={pending}
                                                >
                                                    {pending
                                                        ? "Saving..."
                                                        : "Save"}
                                                </Button>
                                            </Flex>
                                        </form>
                                    </Dialog.Content>
                                </Dialog.Root>
                            </div>
                            <TextField.Root
                                placeholder="Search...."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            >
                                <TextField.Slot>
                                    <Icon
                                        icon="mdi:magnify"
                                        width={20}
                                        height={20}
                                    />
                                </TextField.Slot>
                            </TextField.Root>
                        </div>
                    }
                    className="overflow-hidden"
                />
            </div>
        </AuthenticatedLayout>
    );
}
