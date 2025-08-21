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
    category: {
        id: string;
        name: string;
    };
    supplier: {
        id: string;
        name: string;
    };
    warehouses: Warehouse[];
    supplier_id: string;
    category_id: string;
    warehouse_id: string;
    name: string;
    price: number;
    stock: number;
    specifications?: JSON;
    manual_pdf?: File | string | null;
    is_active: boolean;
    pivot?: { stock: number };
}

const productschema = z.object({
    supplier_id: z.string().min(1, "Supplier is required"),
    category_id: z.string().min(1, "Category is required"),
    warehouse_id: z.string().min(1, "Warehouse is required"),
    name: z.string().min(1, "Name is required"),
    price: z.coerce.number().min(0, "Price must be positive"),
    stock: z.coerce.number().min(0, "Stock must be positive"),
    specifications: z.json(),
    is_active: z.boolean(),
    manual_pdf: z
        .union([
            z
                .instanceof(File)
                .refine((file) => file.type === "application/pdf", {
                    message: "Document must be a PDF",
                })
                .refine(
                    (file) =>
                        file.size >= 100 * 1024 && file.size <= 500 * 1024,
                    {
                        message:
                            "Document size must be between 100 KB and 500 KB",
                    }
                ),
            z.string(),
            z.null(),
            z.undefined(),
        ])
        .optional(),
});
const existingProductschema = z.object({
    product_id: z.string().min(1, "Product is required"),
    warehouse_id: z.string().min(1, "Warehouse is required"),
    stock: z.coerce.number().min(0, "Stock must be positive"),
});

export default function ProductsManagement({ auth }: Props) {
    const { products, categories, suppliers, warehouses } = usePage<
        PageProps<{
            products: Product[];
            categories: { id: string; name: string }[];
            suppliers: { id: string; name: string }[];
            warehouses: { id: string; name: string }[];
        }>
    >().props;

    const [pending, setPending] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filteredproducts, setFilteredproducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

    useEffect(() => {
        const lowercasedSearch = search.toLowerCase();

        const filtered = products.filter((product) => {
            const statusText = product.is_active ? "active" : "inactive";

            const specifications =
                typeof product.specifications === "string"
                    ? JSON.parse(product.specifications)
                    : product.specifications ?? {};

            const warehouseNames = Array.isArray(product.warehouses)
                ? product.warehouses
                      .map((w) => w.name?.toLowerCase() || "")
                      .join(" ")
                : "";

            return (
                product.name.toLowerCase().includes(lowercasedSearch) ||
                product.category?.name
                    ?.toLowerCase()
                    .includes(lowercasedSearch) ||
                product.supplier?.name
                    ?.toLowerCase()
                    .includes(lowercasedSearch) ||
                warehouseNames.includes(lowercasedSearch) ||
                Object.values(specifications).some((value) =>
                    typeof value === "string"
                        ? value.toLowerCase().includes(lowercasedSearch)
                        : false
                ) ||
                statusText.includes(lowercasedSearch)
            );
        });

        setFilteredproducts(filtered);
    }, [search, products]);

    const columns = [
        {
            name: "No",
            cell: (row: Product, index: number) =>
                (currentPage - 1) * rowsPerPage + index + 1,
            width: "70px",
        },
        {
            name: "Name",
            selector: (row: Product) => row.name,
            sortable: true,
        },
        {
            name: "Price",
            selector: (row: Product) => row.price,
            sortable: true,
        },
        {
            name: "Total Stock",
            selector: (row: Product) =>
                row.warehouses?.reduce(
                    (sum, wh) => sum + (wh.pivot?.stock ?? 0),
                    0
                ) ?? 0,
            sortable: true,
        },
        {
            name: "Category",
            selector: (row: Product) => row.category.name,
            sortable: true,
        },
        {
            name: "Supplier",
            selector: (row: Product) => row.supplier.name,
            sortable: true,
        },
        {
            name: "Warehouse",
            cell: (row: Product) => {
                const warehouses = Array.isArray(row.warehouses)
                    ? row.warehouses
                    : [];

                return (
                    <div className="py-3">
                        <DataList.Root orientation="vertical">
                            {warehouses.map((wh) => {
                                return (
                                    <div key={wh.id}>
                                        {" "}
                                        {/* key harus di sini */}
                                        <DataList.Root orientation="vertical">
                                            <DataList.Item>
                                                <DataList.Value className="font-bold">
                                                    {wh.name || "-"}
                                                </DataList.Value>
                                            </DataList.Item>
                                            <DataList.Item>
                                                <DataList.Label minWidth="88px">
                                                    Stock
                                                </DataList.Label>
                                                <DataList.Value>
                                                    {wh.pivot?.stock ?? 0}
                                                </DataList.Value>
                                            </DataList.Item>
                                        </DataList.Root>
                                        {warehouses.length > 1 && (
                                            <hr className="border border-b-1 border-gray-400" />
                                        )}
                                    </div>
                                );
                            })}
                        </DataList.Root>
                    </div>
                );
            },
        },
        {
            name: "Specifications",
            cell: (row: Product) => {
                const specs =
                    typeof row.specifications === "string"
                        ? JSON.parse(row.specifications)
                        : row.specifications || [];

                return (
                    <div className="py-3">
                        <DataList.Root orientation="vertical">
                            {Array.isArray(specs) &&
                                specs.map((spec, idx) => (
                                    <DataList.Item key={idx}>
                                        <DataList.Label minWidth="88px">
                                            {spec.title}
                                        </DataList.Label>
                                        <DataList.Value>
                                            {spec.value}
                                        </DataList.Value>
                                    </DataList.Item>
                                ))}
                        </DataList.Root>
                    </div>
                );
            },
        },
        {
            name: "Status",
            cell: (row: Product) => (
                <Badge color={row.is_active ? "green" : "red"} variant="soft">
                    {row.is_active ? "Active" : "Inactive"}
                </Badge>
            ),
            sortable: true,
        },
        {
            name: "Action",
            cell: (row: Product) => {
                const [open, setOpen] = React.useState(false);
                const [pending, setPending] = React.useState(false);

                const firstWarehouse = row.warehouses?.[0] || {
                    id: "",
                    pivot: { stock: 0 },
                };
                const specArray =
                    typeof row.specifications === "string"
                        ? JSON.parse(row.specifications)
                        : row.specifications || [{ title: "", value: "" }];

                const [formData, setFormData] = useState({
                    supplier_id: row.supplier_id || "",
                    category_id: row.category_id || "",
                    warehouse_id: firstWarehouse.id || "",
                    name: row.name || "",
                    price: row.price || 0,
                    stock: firstWarehouse.pivot?.stock || 0,
                    specifications:
                        specArray.length > 0
                            ? specArray
                            : [{ title: "", value: "" }],
                    manual_pdf: null as File | null,
                    is_active: row.is_active ?? true,
                });

                const handleUpdate = () => {
                    setPending(true);

                    const result = productschema.safeParse(formData);

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
                    payload.append("name", formData.name);
                    payload.append("supplier_id", formData.supplier_id);
                    payload.append("category_id", formData.category_id);
                    payload.append("warehouse_id", formData.warehouse_id);
                    payload.append("price", formData.price.toString());
                    payload.append("stock", formData.stock.toString());
                    payload.append(
                        "specifications",
                        JSON.stringify(formData.specifications)
                    );
                    payload.append("is_active", formData.is_active ? "1" : "0");

                    payload.append("_method", "PUT");
                    // kalau ada file baru, append ke FormData
                    if (
                        formData.manual_pdf &&
                        formData.manual_pdf instanceof File
                    ) {
                        payload.append("manual_pdf", formData.manual_pdf);
                    }

                    router.post(route("products.update", row.id), payload, {
                        forceFormData: true,
                        onSuccess: () => {
                            toast.success("Product updated successfully");
                            setOpen(false); // tutup dialog
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
                    });
                };
                const [openDocument, setOpenDocument] = React.useState(false);

                return (
                    <div className="flex justify-center items-center gap-2">
                        <Dialog.Root
                            open={openDocument}
                            onOpenChange={setOpenDocument}
                        >
                            <Dialog.Trigger>
                                <Button
                                    color="gray"
                                    variant="soft"
                                    onClick={() => setOpenDocument(true)}
                                    disabled={row.manual_pdf ? false : true}
                                >
                                    <Icon
                                        icon="mdi:file-document-box-search-outline"
                                        width={20}
                                        height={20}
                                    />
                                </Button>
                            </Dialog.Trigger>

                            <Dialog.Content maxWidth="500px">
                                <Dialog.Title>Product Document</Dialog.Title>

                                <hr className="my-4" />
                                <object
                                    className="w-full"
                                    data={
                                        typeof row.manual_pdf === "string"
                                            ? `/storage/${row.manual_pdf}`
                                            : row.manual_pdf instanceof File
                                            ? URL.createObjectURL(
                                                  row.manual_pdf
                                              )
                                            : undefined
                                    }
                                    type="application/pdf"
                                    width="100%"
                                    height="600px"
                                ></object>

                                <hr className="my-4" />

                                <Flex gap="3" mt="4" justify="end">
                                    <Dialog.Close>
                                        <Button
                                            variant="soft"
                                            color="gray"
                                            type="button"
                                        >
                                            Close
                                        </Button>
                                    </Dialog.Close>
                                </Flex>
                            </Dialog.Content>
                        </Dialog.Root>
                        <Dialog.Root open={open} onOpenChange={setOpen}>
                            <Dialog.Trigger>
                                <Button
                                    variant="soft"
                                    onClick={() => setOpen(true)}
                                >
                                    <Icon
                                        icon="mdi:pencil-outline"
                                        width={20}
                                        height={20}
                                    />
                                </Button>
                            </Dialog.Trigger>

                            <Dialog.Content maxWidth="750px" maxHeight="800px">
                                <Dialog.Title>Update Product</Dialog.Title>
                                <hr className="mb-4" />

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleUpdate();
                                    }}
                                >
                                    <Grid columns="2" gap="3">
                                        <label className="w-full">
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
                                                                {supplier.name}
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
                                        </label>
                                        <label className="w-full">
                                            <Text
                                                as="div"
                                                size="2"
                                                mb="1"
                                                weight="bold"
                                            >
                                                Category
                                            </Text>
                                            <Select.Root
                                                name="category_id"
                                                value={formData.category_id}
                                                onValueChange={(val) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        category_id: val,
                                                    }))
                                                }
                                                required
                                            >
                                                <Select.Trigger
                                                    placeholder="Select category"
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
                                                    {categories.map(
                                                        (category) => (
                                                            <Select.Item
                                                                key={
                                                                    category.id
                                                                }
                                                                value={category.id.toString()}
                                                            >
                                                                {category.name}
                                                            </Select.Item>
                                                        )
                                                    )}
                                                </Select.Content>
                                            </Select.Root>
                                            {errors?.category_id && (
                                                <span className="text-red-500 text-sm">
                                                    {errors.category_id}
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
                                                Warehouse
                                            </Text>
                                            <Select.Root
                                                required
                                                name="warehouse_id"
                                                value={formData.warehouse_id}
                                                onValueChange={(val) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        warehouse_id: val,
                                                    }))
                                                }
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
                                                                {warehouse.name}
                                                            </Select.Item>
                                                        )
                                                    )}
                                                </Select.Content>
                                            </Select.Root>
                                            {errors?.warehouse_id && (
                                                <span className="text-red-500 text-sm">
                                                    {errors.warehouse_id}
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
                                                Name
                                            </Text>
                                            <TextField.Root
                                                placeholder="Enter Product name"
                                                name="name"
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        name: e.target.value,
                                                    }))
                                                }
                                                required
                                            />
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
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        price: parseFloat(
                                                            e.target.value
                                                        ),
                                                    }))
                                                }
                                                required
                                            />
                                        </label>
                                        <label>
                                            <Text
                                                as="div"
                                                size="2"
                                                mb="1"
                                                weight="bold"
                                            >
                                                Stock
                                            </Text>
                                            <TextField.Root
                                                placeholder="Enter price"
                                                type="number"
                                                name="stock"
                                                min={0}
                                                value={formData.stock}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        stock: parseInt(
                                                            e.target.value
                                                        ),
                                                    }))
                                                }
                                                required
                                            />
                                        </label>
                                        <label className="block mt-4">
                                            <Text
                                                as="div"
                                                size="2"
                                                mb="1"
                                                weight="bold"
                                            >
                                                Upload Agreement (PDF only)
                                            </Text>
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                name="manual_pdf"
                                                className="block w-full text-sm text-gray-600
                                                            file:mr-4 file:py-2 file:px-4
                                                            file:rounded file:border-0
                                                            file:text-sm file:font-semibold
                                                            file:bg-indigo-50 file:text-blue-700
                                                            hover:file:bg-indigo-100"
                                                onChange={(e) => {
                                                    const file =
                                                        e.target.files &&
                                                        e.target.files.length >
                                                            0
                                                            ? e.target.files[0]
                                                            : null;
                                                    if (file) {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            manual_pdf: file,
                                                        }));
                                                    }
                                                    if (!file) {
                                                        setErrors((prev) => {
                                                            const copy = {
                                                                ...prev,
                                                            };
                                                            delete copy.manual_pdf;
                                                            return copy;
                                                        });
                                                    }
                                                }}
                                            />
                                            {errors.manual_pdf && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.manual_pdf}
                                                </p>
                                            )}
                                        </label>
                                        <Text
                                            as="label"
                                            size="2"
                                            className="flex items-center gap-2 mt-4"
                                        >
                                            <Switch
                                                size="1"
                                                checked={formData.is_active}
                                                onCheckedChange={(checked) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        is_active:
                                                            checked === true,
                                                    }))
                                                }
                                            />
                                            <Text as="span">
                                                Active Product
                                            </Text>
                                        </Text>
                                    </Grid>
                                    <Grid gap="3">
                                        <hr className="my-4" />
                                        <SpecificationForm
                                            specs={formData.specifications}
                                            setSpecs={(newSpecs) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    specifications: newSpecs,
                                                }))
                                            }
                                        />
                                    </Grid>

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
                                            {pending ? "Saving..." : "Save"}
                                        </Button>
                                    </Flex>
                                </form>
                            </Dialog.Content>
                        </Dialog.Root>
                        {/* <AlertDialog.Root>
                            <AlertDialog.Trigger>
                                <Button color="red" variant="soft">
                                    <Icon
                                        icon="mdi:delete-outline"
                                        width={20}
                                        height={20}
                                    />
                                </Button>
                            </AlertDialog.Trigger>
                            <AlertDialog.Content maxWidth="450px">
                                <AlertDialog.Title>
                                    Delete Product
                                </AlertDialog.Title>
                                <AlertDialog.Description size="2">
                                    Are you sure? This action cannot be undone.
                                    This will permanently delete the Product{" "}
                                    <strong>{row.name}</strong> and all
                                    associated data.
                                </AlertDialog.Description>

                                <Flex gap="3" mt="4" justify="end">
                                    <AlertDialog.Cancel>
                                        <Button variant="soft" color="gray">
                                            Cancel
                                        </Button>
                                    </AlertDialog.Cancel>
                                    <AlertDialog.Action>
                                        <Button variant="solid" color="red">
                                            <span
                                                onClick={() =>
                                                    handleDelete(row.id)
                                                }
                                            >
                                                Delete
                                            </span>
                                        </Button>
                                    </AlertDialog.Action>
                                </Flex>
                            </AlertDialog.Content>
                        </AlertDialog.Root> */}
                    </div>
                );
            },
            sortable: false,
        },
    ];
    const [open, setOpen] = React.useState(false);
    const [openExistingProduct, setOpenExistingProduct] = React.useState(false);
    const [formData, setFormData] = useState({
        supplier_id: "",
        category_id: "",
        warehouse_id: "",
        name: "",
        price: 0,
        stock: 0,
        specifications: [{ title: "", value: "" }],
        manual_pdf: null as File | null,
        is_active: true,
    });
    const [formExistingProduct, setFormExistingProduct] = useState({
        product_id: "",
        warehouse_id: "",
        stock: 0,
    });

    // Handle form submission for adding a new product
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPending(true);

        const result = productschema.safeParse(formData);
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
        payload.append("supplier_id", formData.supplier_id);
        payload.append("category_id", formData.category_id);
        payload.append("warehouse_id", formData.warehouse_id);
        payload.append("name", formData.name);
        payload.append("price", formData.price.toString());
        payload.append("stock", formData.stock.toString());
        payload.append(
            "specifications",
            JSON.stringify(formData.specifications)
        );
        payload.append("is_active", formData.is_active ? "1" : "0");

        if (formData.manual_pdf instanceof File) {
            payload.append("manual_pdf", formData.manual_pdf);
        }

        router.post(route("products.store"), payload, {
            forceFormData: true,
            onSuccess: () => {
                toast.success("Product added successfully");
                setFormData({
                    supplier_id: "",
                    category_id: "",
                    warehouse_id: "",
                    name: "",
                    price: 0,
                    stock: 0,
                    specifications: [{ title: "", value: "" }],
                    manual_pdf: null,
                    is_active: true,
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
                    toast.error("Failed to add Product");
                }
                console.error(errors);
            },
            onFinish: () => setPending(false),
        });
    };
    // Handle form submission for adding an existing product to a warehouse
    const handleSubmitExistingProduct = (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
        setPending(true);

        const result = existingProductschema.safeParse(formExistingProduct);
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
        payload.append("product_id", formExistingProduct.product_id);
        payload.append("warehouse_id", formExistingProduct.warehouse_id);
        payload.append("stock", formExistingProduct.stock.toString());

        router.post(
            route("products.storeExistingProductToWarehouse"),
            payload,
            {
                onSuccess: () => {
                    toast.success("Product added to warehouse successfully");
                    setFormExistingProduct({
                        product_id: "",
                        warehouse_id: "",
                        stock: 0,
                    });
                    setErrors({});
                    setOpenExistingProduct(false);
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
                        toast.error("Failed to add Product to warehouse");
                    }
                },
                onFinish: () => setPending(false),
            }
        );
    };

    const handleDelete = (id: string) => {
        setPending(true);
        router.delete(route("products.destroy", id), {
            onSuccess: () => {
                toast.success("Product deleted successfully");
            },
            onError: (errors) => {
                toast.error("Failed to delete Product: " + errors.message);
                console.error(errors);
            },
            onFinish: () => setPending(false),
        });
    };
    const [openExport, setOpenExport] = React.useState(false);
    const [selectedFields, setSelectedFields] = useState<string[]>([
        "name",
        "price",
        "total_stock",
        "category",
        "supplier",
        "warehouse",
        "specifications",
        "is_active",
    ]);
    const handleExport = async () => {
        setPending(true);

        // POST request
        const res = await fetch(route("products.export.start"), {
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
            fetch(route("products.export.status", { fileName }))
                .then((res) => res.json())
                .then((data) => {
                    if (data.ready) {
                        clearInterval(interval);
                        setOpenExport(false);
                        setPending(false);
                        window.location.href = route(
                            "products.export.download",
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
            const res = await fetch(route("products.import"), {
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
        <AuthenticatedLayout auth={auth} title="Products Management">
            <Head title="Products Management" />
            <div className="bg-white shadow rounded-lg p-4 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredproducts}
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
                    noDataComponent="No products found"
                    subHeader
                    subHeaderComponent={
                        <div className="flex justify-between items-center w-full">
                            <div className="flex items-center w-full gap-3">
                                <Dialog.Root open={open} onOpenChange={setOpen}>
                                    <Dialog.Trigger>
                                        <Button variant="soft">
                                            <Icon
                                                icon="mdi:box-variant-add"
                                                width={20}
                                                height={20}
                                            />
                                            Add New Product
                                        </Button>
                                    </Dialog.Trigger>

                                    <Dialog.Content
                                        maxWidth="750px"
                                        maxHeight="800px"
                                    >
                                        <Dialog.Title>Add Product</Dialog.Title>
                                        <hr className="mb-4" />

                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleSubmit(e);
                                            }}
                                        >
                                            <Grid columns="2" gap="3">
                                                <label className="w-full">
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
                                                        value={
                                                            formData.supplier_id
                                                        }
                                                        onValueChange={(val) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    supplier_id:
                                                                        val,
                                                                })
                                                            )
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
                                                </label>
                                                <label className="w-full">
                                                    <Text
                                                        as="div"
                                                        size="2"
                                                        mb="1"
                                                        weight="bold"
                                                    >
                                                        Category
                                                    </Text>
                                                    <Select.Root
                                                        name="category_id"
                                                        value={
                                                            formData.category_id
                                                        }
                                                        onValueChange={(val) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    category_id:
                                                                        val,
                                                                })
                                                            )
                                                        }
                                                        required
                                                    >
                                                        <Select.Trigger
                                                            placeholder="Select category"
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
                                                            {categories.map(
                                                                (category) => (
                                                                    <Select.Item
                                                                        key={
                                                                            category.id
                                                                        }
                                                                        value={category.id.toString()}
                                                                    >
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </Select.Item>
                                                                )
                                                            )}
                                                        </Select.Content>
                                                    </Select.Root>
                                                    {errors?.category_id && (
                                                        <span className="text-red-500 text-sm">
                                                            {errors.category_id}
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
                                                        Warehouse
                                                    </Text>
                                                    <Select.Root
                                                        required
                                                        name="warehouse_id"
                                                        value={
                                                            formData.warehouse_id
                                                        }
                                                        onValueChange={(val) =>
                                                            setFormData(
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

                                                <label>
                                                    <Text
                                                        as="div"
                                                        size="2"
                                                        mb="1"
                                                        weight="bold"
                                                    >
                                                        Name
                                                    </Text>
                                                    <TextField.Root
                                                        placeholder="Enter Product name"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    name: e
                                                                        .target
                                                                        .value,
                                                                })
                                                            )
                                                        }
                                                        required
                                                    />
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
                                                </label>
                                                <label>
                                                    <Text
                                                        as="div"
                                                        size="2"
                                                        mb="1"
                                                        weight="bold"
                                                    >
                                                        Stock
                                                    </Text>
                                                    <TextField.Root
                                                        placeholder="Enter price"
                                                        type="number"
                                                        name="stock"
                                                        min={0}
                                                        value={formData.stock}
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    stock: parseInt(
                                                                        e.target
                                                                            .value
                                                                    ),
                                                                })
                                                            )
                                                        }
                                                        required
                                                    />
                                                </label>
                                                <label className="block mt-4">
                                                    <Text
                                                        as="div"
                                                        size="2"
                                                        mb="1"
                                                        weight="bold"
                                                    >
                                                        Upload Agreement (PDF
                                                        only)
                                                    </Text>
                                                    <input
                                                        type="file"
                                                        accept="application/pdf"
                                                        name="manual_pdf"
                                                        className="block w-full text-sm text-gray-600
                                                            file:mr-4 file:py-2 file:px-4
                                                            file:rounded file:border-0
                                                            file:text-sm file:font-semibold
                                                            file:bg-indigo-50 file:text-blue-700
                                                            hover:file:bg-indigo-100"
                                                        onChange={(e) => {
                                                            const file =
                                                                e.target
                                                                    .files &&
                                                                e.target.files
                                                                    .length > 0
                                                                    ? e.target
                                                                          .files[0]
                                                                    : null;
                                                            if (file) {
                                                                setFormData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        manual_pdf:
                                                                            file,
                                                                    })
                                                                );
                                                            }
                                                            if (!file) {
                                                                setErrors(
                                                                    (prev) => {
                                                                        const copy =
                                                                            {
                                                                                ...prev,
                                                                            };
                                                                        delete copy.manual_pdf;
                                                                        return copy;
                                                                    }
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    {errors.manual_pdf && (
                                                        <p className="mt-1 text-sm text-red-600">
                                                            {errors.manual_pdf}
                                                        </p>
                                                    )}
                                                </label>
                                                <Text
                                                    as="label"
                                                    size="2"
                                                    className="flex items-center gap-2 mt-4"
                                                >
                                                    <Switch
                                                        size="1"
                                                        checked={
                                                            formData.is_active
                                                        }
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    is_active:
                                                                        checked ===
                                                                        true,
                                                                })
                                                            )
                                                        }
                                                    />
                                                    <Text as="span">
                                                        Active Product
                                                    </Text>
                                                </Text>
                                            </Grid>
                                            <Grid gap="3">
                                                <hr className="my-4" />
                                                <SpecificationForm
                                                    specs={
                                                        formData.specifications
                                                    }
                                                    setSpecs={(newSpecs) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            specifications:
                                                                newSpecs,
                                                        }))
                                                    }
                                                />
                                            </Grid>

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
                                            Import Excel Products Data
                                        </Dialog.Title>
                                        <hr className="mb-4" />
                                        <p className="mb-2 text-sm">
                                            Please upload a valid Excel file
                                            containing products data.
                                            <br />
                                            You can download the{" "}
                                            <a
                                                href={route(
                                                    "products.import.template"
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
                                    open={openExistingProduct}
                                    onOpenChange={setOpenExistingProduct}
                                >
                                    <Dialog.Trigger>
                                        <Button variant="soft" color="green">
                                            <Icon
                                                icon="mdi:box-variant-closed-add"
                                                width={20}
                                                height={20}
                                            />
                                            Add Existing Product to Warehouse
                                        </Button>
                                    </Dialog.Trigger>

                                    <Dialog.Content maxWidth="450px">
                                        <Dialog.Title>
                                            Add Existing Product to Warehouse
                                        </Dialog.Title>
                                        <hr className="mb-4" />

                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleSubmitExistingProduct(e);
                                            }}
                                        >
                                            <Grid gap="3">
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
                                                            formExistingProduct.product_id
                                                        }
                                                        onValueChange={(val) =>
                                                            setFormExistingProduct(
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
                                                    {errors?.supplier_id && (
                                                        <span className="text-red-500 text-sm">
                                                            {errors.supplier_id}
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
                                                        Warehouse
                                                    </Text>
                                                    <Select.Root
                                                        required
                                                        name="warehouse_id"
                                                        value={
                                                            formExistingProduct.warehouse_id
                                                        }
                                                        onValueChange={(val) =>
                                                            setFormExistingProduct(
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
                                                <label>
                                                    <Text
                                                        as="div"
                                                        size="2"
                                                        mb="1"
                                                        weight="bold"
                                                    >
                                                        Stock
                                                    </Text>
                                                    <TextField.Root
                                                        placeholder="Enter stock"
                                                        type="number"
                                                        name="stock"
                                                        min={0}
                                                        value={
                                                            formExistingProduct.stock
                                                        }
                                                        onChange={(e) =>
                                                            setFormExistingProduct(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    stock: parseInt(
                                                                        e.target
                                                                            .value
                                                                    ),
                                                                })
                                                            )
                                                        }
                                                        required
                                                    />
                                                </label>
                                            </Grid>

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
                                            Export Excel Products Data
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
                                                <CheckboxGroup.Item value="name">
                                                    Name
                                                </CheckboxGroup.Item>
                                                <CheckboxGroup.Item value="price">
                                                    Price
                                                </CheckboxGroup.Item>
                                                <CheckboxGroup.Item value="total_stock">
                                                    Total Stock
                                                </CheckboxGroup.Item>
                                                <CheckboxGroup.Item value="category">
                                                    Category
                                                </CheckboxGroup.Item>
                                                <CheckboxGroup.Item value="supplier">
                                                    Supplier
                                                </CheckboxGroup.Item>
                                                <CheckboxGroup.Item value="warehouse">
                                                    Warehouse
                                                </CheckboxGroup.Item>
                                                <CheckboxGroup.Item value="specifications">
                                                    Specification
                                                </CheckboxGroup.Item>
                                                <CheckboxGroup.Item value="is_active">
                                                    Status
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
