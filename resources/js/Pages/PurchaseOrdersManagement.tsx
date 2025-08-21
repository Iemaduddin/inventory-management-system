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
    Grid,
    CheckboxGroup,
} from "@radix-ui/themes";
import { PageProps } from "@/types";
import DataTable from "react-data-table-component";
import { Icon } from "@iconify/react/dist/iconify.js";
import { toast } from "react-toastify";
import z from "zod";
import SpecificationForm from "@/Components/Dashboard/Products/SpecificationForm";
import { log } from "console";
import DataTableStyles from "@/Components/DataTableStyles";

interface Auth {
    user: {
        name: string;
    };
}

interface Props {
    auth: Auth;
}
interface WarehousePivot {
    stock: number;
}

interface Warehouse {
    id: string;
    name: string;
    location: {
        phone?: string;
        email?: string;
        address?: string;
    };
    pivot?: WarehousePivot;
}
interface Product {
    id: string;
    name: string;
    category: {
        id: string;
        name: string;
    };
    supplier: {
        id: string;
        name: string;
    };
    warehouses: Warehouse[];
    pivot?: { stock: number };
}

interface PurchaseOrder {
    id: string;
    supplier_id: string;
    supplier: {
        id: string;
        name: string;
    };
    warehouse: {
        id: string;
        name: string;
    };
    products: {
        id: string;
        name: string;
        category: {
            id: string;
            name: string;
        };
    };
    items: {
        id: string;
        product_id: string;
        purchase_order_id: string;
        product: {
            id: string;
            name: string;
            category: {
                id: string;
                name: string;
            };
        };
        quantity: number;
        price: number;
    }[];
    order_date: Date;
    status: string;
    notes: string;
}

const purchaseOrderschema = z.object({
    // supplier_id: z.string().min(1, "Supplier is required"),
    product_id: z.string().min(1, "Product is required"),
    order_date: z.date(),
    status: z.enum(["draft", "confirmed", "completed", "cancelled"]),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    price: z.coerce.number().min(0, "Price must be positive"),
});

const purchaseOrderschemaConfirm = z
    .object({
        status: z.enum(["completed", "cancelled"]),
        warehouse_id: z.string().optional(),
        notes: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.status === "completed" && !data.warehouse_id) {
            ctx.addIssue({
                path: ["warehouse_id"],
                message: "Warehouse is required when status is completed",
                code: z.ZodIssueCode.custom,
            });
        }

        if (data.status === "cancelled" && !data.notes) {
            ctx.addIssue({
                path: ["notes"],
                message: "Notes are required when status is cancelled",
                code: z.ZodIssueCode.custom,
            });
        }
    });

export default function PurchaseOrdersManagement({ auth }: Props) {
    const { purchaseOrders, products, suppliers, warehouses } = usePage<
        PageProps<{
            purchaseOrders: PurchaseOrder[];
            products: Product[];
            suppliers: { id: string; name: string }[];
            warehouses: { id: string; name: string }[];
        }>
    >().props;

    const [pending, setPending] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filteredPurchaseOrders, setFilteredPurchaseOrders] = useState<
        PurchaseOrder[]
    >([]);
    const [search, setSearch] = useState("");
    const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

    useEffect(() => {
        const lowercasedSearch = search.toLowerCase();

        const filtered = purchaseOrders.filter((po) => {
            return (
                po.supplier?.name.toLowerCase().includes(lowercasedSearch) ||
                po.products?.name.toLowerCase().includes(lowercasedSearch) ||
                po.status.toLowerCase().includes(lowercasedSearch) ||
                po.items.some((item) =>
                    item.product.name.toLowerCase().includes(lowercasedSearch)
                ) ||
                po.items.some((item) =>
                    item.product.category.name
                        .toLowerCase()
                        .includes(lowercasedSearch)
                )
            );
        });

        setFilteredPurchaseOrders(filtered);
    }, [search, purchaseOrders]);

    const columns = [
        {
            name: "No",
            cell: (row: PurchaseOrder, index: number) =>
                (currentPage - 1) * rowsPerPage + index + 1,
            width: "70px",
        },
        {
            name: "Product",
            cell: (row: PurchaseOrder) => {
                return (
                    <div>
                        {row.items.map((item) => (
                            <div key={item.id}>
                                <Text size="2" className="font-bold">
                                    {item.product.name}
                                </Text>
                                <br />
                                <Text size="1" className="text-gray-600">
                                    (
                                    {item.product.category.name
                                        .charAt(0)
                                        .toUpperCase() +
                                        item.product.category.name.slice(1)}
                                    )
                                </Text>
                            </div>
                        ))}
                    </div>
                );
            },
            sortable: false,
        },
        {
            name: "Supplier",
            selector: (row: PurchaseOrder) => row.supplier?.name,
            sortable: true,
        },
        {
            name: "Price",
            cell: (row: PurchaseOrder) => (
                <div>
                    {row.items.map((item) => (
                        <div key={item.id}>
                            {item.price.toLocaleString()} {/* format angka */}
                        </div>
                    ))}
                </div>
            ),
            sortable: false,
        },
        {
            name: "Quantity",
            cell: (row: PurchaseOrder) => (
                <div>
                    {row.items.map((item) => (
                        <div key={item.id}>{item.quantity}</div>
                    ))}
                </div>
            ),
            sortable: false,
        },
        {
            name: "Status",
            cell: (row: PurchaseOrder) => {
                let badgeColors:
                    | "green"
                    | "orange"
                    | "red"
                    | "purple"
                    | "yellow"
                    | "gray"
                    | undefined = undefined;
                if (row.status === "draft") {
                    badgeColors = "gray";
                } else if (row.status === "confirmed") {
                    badgeColors = "orange";
                } else if (row.status === "completed") {
                    badgeColors = "green";
                } else if (row.status === "cancelled") {
                    badgeColors = "red";
                }
                return (
                    <div>
                        <Badge color={badgeColors}>
                            {row.status.charAt(0).toUpperCase() +
                                row.status.slice(1)}
                        </Badge>
                        <br />
                        {row.notes && (
                            <div>
                                <Text
                                    size="1"
                                    className="text-gray-600 font-bold"
                                >
                                    Reason:
                                </Text>
                                &nbsp;
                                <Text size="1" className="text-gray-600 ">
                                    {row.notes}
                                </Text>
                            </div>
                        )}
                    </div>
                );
            },
            sortable: true,
        },
        {
            name: "Order Date",
            cell: (row: PurchaseOrder) => {
                return new Date(row.order_date).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                });
            },
            sortable: true,
        },
        {
            name: "Action",
            cell: (row: PurchaseOrder) => {
                const [open, setOpen] = React.useState(false);
                const [openConfirm, setOpenConfirm] = React.useState(false);
                const [pending, setPending] = React.useState(false);

                const [formData, setFormData] = useState({
                    order_date: new Date(row.order_date),
                    product_id: row.items[0]?.product_id || "",
                    status: row.status,
                    quantity: row.items[0]?.quantity || 1,
                    price: row.items[0]?.price || 1,
                });

                const handleUpdate = () => {
                    setPending(true);

                    const result = purchaseOrderschema.safeParse(formData);

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
                    router.put(
                        route("purchase-orders.update", row.id),
                        formData,
                        {
                            onSuccess: () => {
                                toast.success(
                                    "Purchase Order updated successfully"
                                );
                                setOpen(false);
                            },
                            onError: (errors) => {
                                if (typeof errors === "string") {
                                    toast.error(errors);
                                }
                                // Tangani error object (validation errors per field)
                                else if (errors && typeof errors === "object") {
                                    // Gabungkan semua pesan error jadi satu string, dipisah baris baru
                                    const messages = Object.values(errors)
                                        .flat()
                                        .map((msg) =>
                                            typeof msg === "string" ? msg : ""
                                        )
                                        .join("\n");
                                    toast.error(
                                        messages || "Failed to update Product"
                                    );
                                } else {
                                    // Pesan default jika error tidak diketahui
                                    toast.error("Failed to update Product");
                                }
                            },
                            onFinish: () => setPending(false),
                        }
                    );
                };
                const [formDataConfim, setFormDataConfirm] = useState({
                    status: "",
                    warehouse_id: row.warehouse?.id || "",
                    notes: "",
                });
                const handleUpdateConfirm = () => {
                    setPending(true);

                    const result =
                        purchaseOrderschemaConfirm.safeParse(formDataConfim);

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
                    const payload = new FormData();
                    payload.append("status", formDataConfim.status);
                    if (formDataConfim.warehouse_id) {
                        payload.append(
                            "warehouse_id",
                            formDataConfim.warehouse_id
                        );
                    }
                    if (formDataConfim.notes) {
                        payload.append("notes", formDataConfim.notes);
                    }

                    router.post(
                        route("purchase-orders.confirm", row.id),
                        payload,
                        {
                            onSuccess: () => {
                                toast.success(
                                    "Purchase Order confirmed successfully"
                                );
                                setOpenConfirm(false);
                            },
                            onError: (errors) => {
                                if (typeof errors === "string") {
                                    toast.error(errors);
                                } else if (
                                    errors &&
                                    typeof errors === "object"
                                ) {
                                    const messages = Object.values(errors)
                                        .flat()
                                        .map((msg) =>
                                            typeof msg === "string" ? msg : ""
                                        )
                                        .join("\n");
                                    toast.error(
                                        messages ||
                                            "Failed to confirm purchase order"
                                    );
                                } else {
                                    toast.error(
                                        "Failed to confirm purchase order"
                                    );
                                }
                            },
                            onFinish: () => setPending(false),
                        }
                    );
                };
                return (
                    <div className="flex justify-center items-center gap-2">
                        {row.status !== "completed" &&
                            row.status !== "cancelled" && (
                                <Dialog.Root
                                    open={openConfirm}
                                    onOpenChange={setOpenConfirm}
                                >
                                    <Dialog.Trigger>
                                        <Button variant="soft" color="green">
                                            <Icon
                                                icon="mdi:check-circle-outline"
                                                width={20}
                                                height={20}
                                            />
                                        </Button>
                                    </Dialog.Trigger>

                                    <Dialog.Content maxWidth="450px">
                                        <Dialog.Title>
                                            Confirm Purchase Order
                                        </Dialog.Title>
                                        <hr className="mb-4" />

                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleUpdateConfirm();
                                            }}
                                        >
                                            <Flex direction="column" gap="3">
                                                {/* Status */}
                                                <label className="w-full">
                                                    <Text
                                                        as="div"
                                                        size="2"
                                                        mb="1"
                                                        weight="bold"
                                                    >
                                                        Status
                                                    </Text>
                                                    <Select.Root
                                                        value={
                                                            formDataConfim.status
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setFormDataConfirm(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    status: value,
                                                                    notes:
                                                                        value ===
                                                                        "completed"
                                                                            ? ""
                                                                            : prev.notes,
                                                                })
                                                            )
                                                        }
                                                    >
                                                        <Select.Trigger
                                                            placeholder="Select status"
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
                                                            <Select.Item value="completed">
                                                                Completed
                                                            </Select.Item>
                                                            <Select.Item value="cancelled">
                                                                Cancelled
                                                            </Select.Item>
                                                        </Select.Content>
                                                    </Select.Root>
                                                    {errors?.status && (
                                                        <span className="text-red-500 text-sm">
                                                            {errors.status}
                                                        </span>
                                                    )}
                                                </label>

                                                {/* Warehouse */}
                                                {formDataConfim.status ===
                                                    "completed" && (
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
                                                            value={
                                                                formDataConfim.warehouse_id
                                                            }
                                                            onValueChange={(
                                                                val
                                                            ) =>
                                                                setFormDataConfirm(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        warehouse_id:
                                                                            val,
                                                                    })
                                                                )
                                                            }
                                                        >
                                                            <Select.Trigger
                                                                placeholder="Select warehouse"
                                                                className="w-full"
                                                                style={{
                                                                    width: "100%",
                                                                }}
                                                            />
                                                            <Select.Content>
                                                                {warehouses.map(
                                                                    (
                                                                        warehouse
                                                                    ) => (
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
                                                )}

                                                {formDataConfim.status ===
                                                    "cancelled" && (
                                                    <label className="w-full">
                                                        <Text
                                                            as="div"
                                                            size="2"
                                                            mb="1"
                                                            weight="bold"
                                                        >
                                                            Notes
                                                        </Text>
                                                        <TextArea
                                                            placeholder="Enter notes"
                                                            name="notes"
                                                            value={
                                                                formDataConfim.notes
                                                            }
                                                            onChange={(e) =>
                                                                setFormDataConfirm(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        notes: e
                                                                            .target
                                                                            .value,
                                                                    })
                                                                )
                                                            }
                                                            rows={3}
                                                        />
                                                        {errors?.notes && (
                                                            <span className="text-red-500 text-sm">
                                                                {errors.notes}
                                                            </span>
                                                        )}
                                                    </label>
                                                )}
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
                            )}
                        {row.status !== "completed" &&
                            row.status !== "cancelled" && (
                                <Dialog.Root open={open} onOpenChange={setOpen}>
                                    <Dialog.Trigger>
                                        <Button variant="soft">
                                            <Icon
                                                icon="mdi:pencil-outline"
                                                width={20}
                                                height={20}
                                            />
                                        </Button>
                                    </Dialog.Trigger>

                                    <Dialog.Content maxWidth="450px">
                                        <Dialog.Title>
                                            Add Purchase Order
                                        </Dialog.Title>
                                        <hr className="mb-4" />

                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleUpdate();
                                            }}
                                        >
                                            <Flex direction="column" gap="3">
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
                                                        onValueChange={(val) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    product_id:
                                                                        val,
                                                                })
                                                            )
                                                        }
                                                        required
                                                    >
                                                        <Select.Trigger
                                                            placeholder="Select product"
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
                                                        Order Date
                                                    </Text>
                                                    <input
                                                        type="datetime-local"
                                                        className="w-full p-1"
                                                        style={{
                                                            width: "100%",
                                                            borderRadius:
                                                                "var(--radius-2)",
                                                            border: "1px solid var(--gray-7)",
                                                            fontSize:
                                                                "var(--font-size-2)",
                                                        }}
                                                        name="order_date"
                                                        value={formData.order_date
                                                            .toISOString()
                                                            .substring(0, 16)}
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    order_date:
                                                                        new Date(
                                                                            e.target.value
                                                                        ),
                                                                })
                                                            )
                                                        }
                                                    />
                                                    {errors?.order_date && (
                                                        <span className="text-red-500 text-sm">
                                                            {errors.order_date}
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
                                                        Price
                                                    </Text>
                                                    <TextField.Root
                                                        placeholder="Enter price"
                                                        type="number"
                                                        name="price"
                                                        min={0}
                                                        value={formData.price}
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    price: parseFloat(
                                                                        e.target
                                                                            .value
                                                                    ),
                                                                })
                                                            )
                                                        }
                                                        required
                                                    />
                                                    {errors?.price && (
                                                        <span className="text-red-500 text-sm">
                                                            {errors.price}
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
                                                        placeholder="Enter quantity"
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
                                                <label className="w-full">
                                                    <Text
                                                        as="div"
                                                        size="2"
                                                        mb="1"
                                                        weight="bold"
                                                    >
                                                        Status
                                                    </Text>
                                                    <Select.Root
                                                        value={formData.status}
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    status: value,
                                                                })
                                                            )
                                                        }
                                                    >
                                                        <Select.Trigger
                                                            placeholder="Select status"
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
                                                                value="draft"
                                                                key="draft"
                                                            >
                                                                Draft
                                                            </Select.Item>
                                                            <Select.Item
                                                                value="confirmed"
                                                                key="confirmed"
                                                            >
                                                                Confirmed
                                                            </Select.Item>
                                                        </Select.Content>
                                                    </Select.Root>
                                                    {errors?.status && (
                                                        <span className="text-red-500 text-sm">
                                                            {errors.status}
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
                            )}
                    </div>
                );
            },
        },
    ];
    const [open, setOpen] = React.useState(false);
    const [openExistingProduct, setOpenExistingProduct] = React.useState(false);
    const [formData, setFormData] = useState({
        // supplier_id: "",
        order_date: new Date(),
        product_id: "",
        status: "draft",
        quantity: 1,
        price: 1,
    });

    // Handle form submission for adding a new product
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPending(true);

        const result = purchaseOrderschema.safeParse(formData);
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
        const payload = new FormData();
        // payload.append("supplier_id", formData.supplier_id);
        payload.append("product_id", formData.product_id);
        payload.append("order_date", formData.order_date.toISOString());
        payload.append("status", formData.status);
        payload.append("price", formData.price.toString());
        payload.append("quantity", formData.quantity.toString());

        router.post(route("purchase-orders.store"), payload, {
            onSuccess: () => {
                toast.success("Purchase Order added successfully");
                setFormData({
                    // supplier_id: "",
                    order_date: new Date(),
                    product_id: "",
                    status: "draft",
                    quantity: 1,
                    price: 1,
                });
                setErrors({});
                setOpen(false);
            },
            onError: (errors) => {
                if (typeof errors === "string") {
                    toast.error(errors);
                } else if (errors && typeof errors === "object") {
                    const messages = Object.values(errors).flat().join("\n");
                    toast.error(messages);
                } else {
                    toast.error("Failed to add Purchase Order");
                }
                console.error(errors);
            },
            onFinish: () => setPending(false),
        });
    };
    const [openExport, setOpenExport] = React.useState(false);
    const [selectedFields, setSelectedFields] = useState<string[]>([
        "product",
        "category",
        "supplier",
        "price",
        "quantity",
        "status",
        "order_date",
    ]);
    const handleExport = async () => {
        setPending(true);

        // POST request
        const res = await fetch(route("purchase-orders.export.start"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN":
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content") || "",
            },
            body: JSON.stringify({ fields: selectedFields }),
        });

        const data = await res.json();

        if (data.status === "queued") {
            setOpenExport(false);
            pollForFile(data.file);
        }
    };

    const pollForFile = (fileName: string) => {
        const interval = setInterval(() => {
            fetch(route("purchase-orders.export.status", { fileName }))
                .then((res) => res.json())
                .then((data) => {
                    if (data.ready) {
                        clearInterval(interval);
                        setOpenExport(false);
                        setPending(false);
                        window.location.href = route(
                            "purchase-orders.export.download",
                            { fileName }
                        );
                    }
                })
                .catch(() => {
                    clearInterval(interval);
                    setPending(false);
                });
        }, 2000);
    };
    const [openImport, setOpenImport] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error("Please select a file to import");
            return;
        }

        setPending(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(route("purchase-orders.import"), {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to import file");
            }
            if (data.status === "queued") {
                toast.success(
                    "Import started successfully. Please wait for the process to complete."
                );
                setFile(null);
                setOpenImport(false);
            } else {
                toast.error(data.message || "Import failed");
            }
        } catch (error) {
            toast.error("Failed to import file");
        } finally {
            setPending(false);
        }
    };
    return (
        <AuthenticatedLayout auth={auth} title="Purchase Orders Management">
            <Head title="Purchase Orders Management" />
            <div className="bg-white shadow rounded-lg p-4 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredPurchaseOrders}
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
                    noDataComponent="No purchase order found"
                    subHeader
                    subHeaderComponent={
                        <div className="flex justify-between items-center w-full">
                            <div className="flex items-center w-full gap-3">
                                <Dialog.Root open={open} onOpenChange={setOpen}>
                                    <Dialog.Trigger>
                                        <Button variant="soft">
                                            <Icon
                                                icon="mdi:plus"
                                                width={20}
                                                height={20}
                                            />
                                            Add Purchase Order
                                        </Button>
                                    </Dialog.Trigger>

                                    <Dialog.Content maxWidth="450px">
                                        <Dialog.Title>
                                            Add Purchase Order
                                        </Dialog.Title>
                                        <hr className="mb-4" />

                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleSubmit(e);
                                            }}
                                        >
                                            <Flex direction="column" gap="3">
                                                {/* <label className="w-full">
                                                <Text
                                                    as="div"
                                                    size="2"
                                                    mb="1"
                                                    weight="bold"
                                                >
                                                    Supplier
                                                </Text>
                                                <Select.Root
                                                    name="supplier_id"
                                                    value={formData.supplier_id}
                                                    onValueChange={(val) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            supplier_id: val,
                                                        }))
                                                    }
                                                    required
                                                >
                                                    <Select.Trigger
                                                        placeholder="Select supplier"
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
                                                        {suppliers.map(
                                                            (supplier) => (
                                                                <Select.Item
                                                                    key={
                                                                        supplier.id
                                                                    }
                                                                    value={supplier.id.toString()}
                                                                >
                                                                    {
                                                                        supplier.name
                                                                    }
                                                                </Select.Item>
                                                            )
                                                        )}
                                                    </Select.Content>
                                                </Select.Root>
                                                {errors?.supplier_id && (
                                                    <span className="text-red-500 text-sm">
                                                        {errors.supplier_id}
                                                    </span>
                                                )}
                                            </label> */}
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
                                                        onValueChange={(val) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    product_id:
                                                                        val,
                                                                })
                                                            )
                                                        }
                                                        required
                                                    >
                                                        <Select.Trigger
                                                            placeholder="Select product"
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
                                                        Order Date
                                                    </Text>
                                                    <input
                                                        type="datetime-local"
                                                        className="w-full p-1"
                                                        style={{
                                                            width: "100%",
                                                            borderRadius:
                                                                "var(--radius-2)",
                                                            border: "1px solid var(--gray-7)",
                                                            fontSize:
                                                                "var(--font-size-2)",
                                                        }}
                                                        name="order_date"
                                                        value={formData.order_date
                                                            .toISOString()
                                                            .substring(0, 16)}
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    order_date:
                                                                        new Date(
                                                                            e.target.value
                                                                        ),
                                                                })
                                                            )
                                                        }
                                                    />
                                                    {errors?.order_date && (
                                                        <span className="text-red-500 text-sm">
                                                            {errors.order_date}
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
                                                        Price
                                                    </Text>
                                                    <TextField.Root
                                                        placeholder="Enter price"
                                                        type="number"
                                                        name="price"
                                                        min={0}
                                                        value={formData.price}
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    price: parseFloat(
                                                                        e.target
                                                                            .value
                                                                    ),
                                                                })
                                                            )
                                                        }
                                                        required
                                                    />
                                                    {errors?.price && (
                                                        <span className="text-red-500 text-sm">
                                                            {errors.price}
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
                                                        placeholder="Enter quantity"
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
                                                <label className="w-full">
                                                    <Text
                                                        as="div"
                                                        size="2"
                                                        mb="1"
                                                        weight="bold"
                                                    >
                                                        Status
                                                    </Text>
                                                    <Select.Root
                                                        value={formData.status}
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    status: value,
                                                                })
                                                            )
                                                        }
                                                    >
                                                        <Select.Trigger
                                                            placeholder="Select status"
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
                                                                value="draft"
                                                                key="draft"
                                                            >
                                                                Draft
                                                            </Select.Item>
                                                            <Select.Item
                                                                value="confirmed"
                                                                key="confirmed"
                                                            >
                                                                Confirmed
                                                            </Select.Item>
                                                        </Select.Content>
                                                    </Select.Root>
                                                    {errors?.status && (
                                                        <span className="text-red-500 text-sm">
                                                            {errors.status}
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
                                    open={openImport}
                                    onOpenChange={setOpenImport}
                                >
                                    <Dialog.Trigger>
                                        <Button variant="soft" color="amber">
                                            <Icon
                                                icon="mdi:upload"
                                                width={20}
                                                height={20}
                                            />
                                            Import Excel
                                        </Button>
                                    </Dialog.Trigger>

                                    <Dialog.Content maxWidth="450px">
                                        <Dialog.Title>
                                            Import Excel Purchase Orders Data
                                        </Dialog.Title>
                                        <hr className="mb-4" />
                                        <p className="mb-2 text-sm">
                                            Please upload a valid Excel file
                                            containing purchase orders data.
                                            <br />
                                            You can download the{" "}
                                            <a
                                                href={route(
                                                    "purchase-orders.import.template"
                                                )}
                                                className="text-blue-600 hover:underline"
                                            >
                                                template here
                                            </a>
                                        </p>

                                        <form onSubmit={handleImport}>
                                            <input
                                                type="file"
                                                accept=".xlsx,.xls,.csv"
                                                onChange={(e) => {
                                                    if (
                                                        e.target.files &&
                                                        e.target.files.length >
                                                            0
                                                    ) {
                                                        setFile(
                                                            e.target.files[0]
                                                        );
                                                    }
                                                }}
                                                disabled={pending}
                                                className="block w-full text-sm text-gray-600
                                                            file:mr-4 file:py-2 file:px-4
                                                            file:rounded file:border-0
                                                            file:text-sm file:font-semibold
                                                            file:bg-indigo-50 file:text-blue-700
                                                            hover:file:bg-indigo-100"
                                            />

                                            <Flex gap="3" mt="4" justify="end">
                                                <Dialog.Close>
                                                    <Button
                                                        variant="soft"
                                                        color="gray"
                                                        type="button"
                                                        disabled={pending}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </Dialog.Close>
                                                <Button
                                                    type="submit"
                                                    disabled={pending}
                                                >
                                                    {pending
                                                        ? "Importing..."
                                                        : "Import"}
                                                </Button>
                                            </Flex>
                                        </form>
                                    </Dialog.Content>
                                </Dialog.Root>
                                <Dialog.Root
                                    open={openExport}
                                    onOpenChange={setOpenExport}
                                >
                                    <Dialog.Trigger>
                                        <Button variant="soft" color="violet">
                                            <Icon
                                                icon="mdi:export-variant"
                                                width={20}
                                                height={20}
                                            />
                                            Export Excel
                                        </Button>
                                    </Dialog.Trigger>

                                    <Dialog.Content maxWidth="450px">
                                        <Dialog.Title>
                                            Export Excel Purchase Orders Data
                                        </Dialog.Title>
                                        <hr className="mb-4" />

                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleExport();
                                            }}
                                        >
                                            <CheckboxGroup.Root
                                                value={selectedFields}
                                                onValueChange={(
                                                    values: string[]
                                                ) => setSelectedFields(values)}
                                            >
                                                <CheckboxGroup.Item value="product">
                                                    Product
                                                </CheckboxGroup.Item>
                                                <CheckboxGroup.Item value="category">
                                                    Category
                                                </CheckboxGroup.Item>
                                                <CheckboxGroup.Item value="supplier">
                                                    Supplier
                                                </CheckboxGroup.Item>
                                                <CheckboxGroup.Item value="price">
                                                    Price
                                                </CheckboxGroup.Item>
                                                <CheckboxGroup.Item value="quantity">
                                                    Quantity
                                                </CheckboxGroup.Item>
                                                <CheckboxGroup.Item value="status">
                                                    Status
                                                </CheckboxGroup.Item>
                                                <CheckboxGroup.Item value="order_date">
                                                    Order Date
                                                </CheckboxGroup.Item>
                                            </CheckboxGroup.Root>

                                            <Flex gap="3" mt="4" justify="end">
                                                <Dialog.Close>
                                                    <Button
                                                        variant="soft"
                                                        color="gray"
                                                        type="button"
                                                        disabled={pending}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </Dialog.Close>
                                                <Button
                                                    type="submit"
                                                    disabled={pending}
                                                >
                                                    {pending
                                                        ? "Exporting..."
                                                        : "Export"}
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
