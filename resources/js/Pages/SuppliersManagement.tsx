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
    DropdownMenu,
    CheckboxGroup,
} from "@radix-ui/themes";
import { PageProps } from "@/types";
import DataTable from "react-data-table-component";
import { Icon } from "@iconify/react/dist/iconify.js";
import { toast } from "react-toastify";
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

interface Supplier {
    id: string;
    name: string;
    contact_info?: {
        phone: string;
        email: string;
        address: string;
    };
    document_path?: File | string | null;
    is_active: boolean;
}

const supplierSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(1, "Phone is required"),
    email: z.string().email("Invalid email address"),
    address: z.string().min(1, "Address is required"),
    is_active: z.boolean(),
    document_path: z
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

export default function SuppliersManagement({ auth }: Props) {
    const { suppliers } = usePage<PageProps<{ suppliers: Supplier[] }>>().props;
    const [pending, setPending] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
    const [search, setSearch] = useState("");
    const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

    useEffect(() => {
        const lowercasedSearch = search.toLowerCase();

        const filtered = suppliers.filter((supplier) => {
            const contactInfo =
                typeof supplier.contact_info === "string"
                    ? JSON.parse(supplier.contact_info)
                    : supplier.contact_info ?? {};
            const statusText = supplier.is_active ? "active" : "inactive";
            return (
                supplier.name.toLowerCase().includes(lowercasedSearch) ||
                (typeof contactInfo.phone === "string" &&
                    contactInfo.phone
                        .toLowerCase()
                        .includes(lowercasedSearch)) ||
                (typeof contactInfo.email === "string" &&
                    contactInfo.email
                        .toLowerCase()
                        .includes(lowercasedSearch)) ||
                (typeof contactInfo.address === "string" &&
                    contactInfo.address
                        .toLowerCase()
                        .includes(lowercasedSearch)) ||
                statusText.includes(lowercasedSearch)
            );
        });

        setFilteredSuppliers(filtered);
    }, [search, suppliers]);

    const columns = [
        {
            name: "No",
            cell: (row: Supplier, index: number) =>
                (currentPage - 1) * rowsPerPage + index + 1,
            width: "70px",
        },
        {
            name: "Name",
            selector: (row: Supplier) => row.name,
            sortable: true,
        },
        {
            name: "Contact Info",
            cell: (row: Supplier) => {
                const contactInfo =
                    typeof row.contact_info === "string"
                        ? JSON.parse(row.contact_info)
                        : row.contact_info;
                return (
                    <div className="py-3">
                        <DataList.Root orientation="vertical">
                            <DataList.Item>
                                <DataList.Label minWidth="88px">
                                    Phone
                                </DataList.Label>
                                <DataList.Value>
                                    {contactInfo?.phone}
                                </DataList.Value>
                            </DataList.Item>
                            <DataList.Item>
                                <DataList.Label minWidth="88px">
                                    Email
                                </DataList.Label>
                                <DataList.Value>
                                    <Link href={`mailto:${contactInfo?.email}`}>
                                        {contactInfo?.email}
                                    </Link>
                                </DataList.Value>
                            </DataList.Item>
                            <DataList.Item>
                                <DataList.Label minWidth="88px">
                                    Address
                                </DataList.Label>
                                <DataList.Value>
                                    {contactInfo?.address}
                                </DataList.Value>
                            </DataList.Item>
                        </DataList.Root>
                    </div>
                );
            },
        },
        {
            name: "Status",
            cell: (row: Supplier) => (
                <Badge color={row.is_active ? "green" : "red"} variant="soft">
                    {row.is_active ? "Active" : "Inactive"}
                </Badge>
            ),
            sortable: true,
        },
        {
            name: "Action",
            cell: (row: Supplier) => {
                const [open, setOpen] = React.useState(false);
                const [pending, setPending] = React.useState(false);
                const contactInfo =
                    typeof row.contact_info === "string"
                        ? JSON.parse(row.contact_info)
                        : row.contact_info;

                const [formData, setFormData] = React.useState({
                    name: row.name,
                    phone: contactInfo?.phone || "",
                    email: contactInfo?.email || "",
                    address: contactInfo?.address || "",
                    document_path: row.document_path || null,
                    is_active: row.is_active,
                });

                const handleUpdate = () => {
                    setPending(true);

                    const result = supplierSchema.safeParse(formData);

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
                    payload.append("phone", formData.phone);
                    payload.append("email", formData.email);
                    payload.append("address", formData.address);
                    payload.append("is_active", formData.is_active ? "1" : "0");

                    payload.append("_method", "PUT");
                    // kalau ada file baru, append ke FormData
                    if (
                        formData.document_path &&
                        formData.document_path instanceof File
                    ) {
                        payload.append("document_path", formData.document_path);
                    }

                    router.post(route("suppliers.update", row.id), payload, {
                        forceFormData: true,
                        onSuccess: () => {
                            toast.success("Supplier updated successfully");
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
                                    messages || "Failed to update supplier"
                                );
                            } else {
                                // Pesan default jika error tidak diketahui
                                toast.error("Failed to update supplier");
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
                                    disabled={row.document_path ? false : true}
                                >
                                    <Icon
                                        icon="mdi:file-document-box-search-outline"
                                        width={20}
                                        height={20}
                                    />
                                </Button>
                            </Dialog.Trigger>

                            <Dialog.Content maxWidth="500px">
                                <Dialog.Title>Supplier Document</Dialog.Title>

                                <hr className="my-4" />
                                <object
                                    className="w-full"
                                    data={
                                        typeof row.document_path === "string"
                                            ? `/storage/${row.document_path}`
                                            : row.document_path instanceof File
                                            ? URL.createObjectURL(
                                                  row.document_path
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

                            <Dialog.Content maxWidth="500px">
                                <Dialog.Title>Edit Supplier</Dialog.Title>
                                <hr className="mb-4" />

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleUpdate();
                                    }}
                                >
                                    <Flex direction="column" gap="3">
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
                                                placeholder="Enter supplier name"
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
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </label>
                                        <label>
                                            <Text
                                                as="div"
                                                size="2"
                                                mb="1"
                                                weight="bold"
                                            >
                                                Phone
                                            </Text>
                                            <TextField.Root
                                                placeholder="Enter phone number"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        phone: e.target.value,
                                                    }))
                                                }
                                                required
                                            />
                                            {errors.phone && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.phone}
                                                </p>
                                            )}
                                        </label>
                                        <label>
                                            <Text
                                                as="div"
                                                size="2"
                                                mb="1"
                                                weight="bold"
                                            >
                                                Email
                                            </Text>
                                            <TextField.Root
                                                placeholder="Enter email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        email: e.target.value,
                                                    }))
                                                }
                                                required
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </label>
                                        <label>
                                            <Text
                                                as="div"
                                                size="2"
                                                mb="1"
                                                weight="bold"
                                            >
                                                Address
                                            </Text>
                                            <TextArea
                                                rows={3}
                                                resize="vertical"
                                                placeholder="Enter address"
                                                name="address"
                                                value={formData.address}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        address: e.target.value,
                                                    }))
                                                }
                                                required
                                            />
                                            {errors.address && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.address}
                                                </p>
                                            )}
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
                                                name="document_path"
                                                className="block w-full text-sm text-gray-600
                                                            file:mr-4 file:py-2 file:px-4
                                                            file:rounded file:border-0
                                                            file:text-sm file:font-semibold
                                                            file:bg-indigo-50 file:text-blue-700
                                                            hover:file:bg-indigo-100"
                                                onChange={(e) => {
                                                    const file =
                                                        e.target.files?.[0];
                                                    if (file) {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            document_path: file,
                                                        }));
                                                    }
                                                }}
                                            />
                                            {errors.document_path && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.document_path}
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
                                                Active Supplier
                                            </Text>
                                        </Text>
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
                                            {pending ? "Saving..." : "Save"}
                                        </Button>
                                    </Flex>
                                </form>
                            </Dialog.Content>
                        </Dialog.Root>
                        <AlertDialog.Root>
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
                                    Delete Supplier
                                </AlertDialog.Title>
                                <AlertDialog.Description size="2">
                                    Are you sure? This action cannot be undone.
                                    This will permanently delete the supplier{" "}
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
                        </AlertDialog.Root>
                    </div>
                );
            },
            sortable: false,
        },
    ];
    const [open, setOpen] = React.useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        document_path: null as File | null,
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPending(true);

        const result = supplierSchema.safeParse(formData);
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
        payload.append("phone", formData.phone);
        payload.append("email", formData.email);
        payload.append("address", formData.address);
        payload.append("is_active", formData.is_active ? "1" : "0");

        if (formData.document_path instanceof File) {
            payload.append("document_path", formData.document_path);
        }

        router.post(route("suppliers.store"), payload, {
            forceFormData: true,
            onSuccess: () => {
                toast.success("Supplier added successfully");
                setFormData({
                    name: "",
                    phone: "",
                    email: "",
                    address: "",
                    document_path: null,
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
                    toast.error("Failed to add supplier");
                }
                console.error(errors);
            },
            onFinish: () => setPending(false),
        });
    };

    const handleDelete = (id: string) => {
        setPending(true);
        router.delete(route("suppliers.destroy", id), {
            onSuccess: () => {
                toast.success("Supplier deleted successfully");
            },
            onError: (errors) => {
                toast.error("Failed to delete supplier: " + errors.message);
                console.error(errors);
            },
            onFinish: () => setPending(false),
        });
    };

    const [openExport, setOpenExport] = React.useState(false);
    const [selectedFields, setSelectedFields] = useState<string[]>([
        "name",
        "contact_info",
        "is_active",
    ]);
    const handleExport = async () => {
        setPending(true);

        // POST request
        const res = await fetch(route("suppliers.export.start"), {
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
            fetch(route("suppliers.export.status", { fileName }))
                .then((res) => res.json())
                .then((data) => {
                    if (data.ready) {
                        clearInterval(interval);
                        setOpenExport(false);
                        setPending(false);
                        window.location.href = route(
                            "suppliers.export.download",
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
            const res = await fetch(route("suppliers.import"), {
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
        <AuthenticatedLayout auth={auth} title="Suppliers Management">
            <Head title="Suppliers Management" />
            <div className="bg-white shadow rounded-lg p-4 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredSuppliers}
                    pagination
                    paginationPerPage={rowsPerPage}
                    paginationRowsPerPageOptions={[5, 10, 15, 20, 50]}
                    customStyles={DataTableStyles}
                    onChangePage={(page) => setCurrentPage(page)}
                    onChangeRowsPerPage={(newPerPage, page) => {
                        setRowsPerPage(newPerPage);
                        setCurrentPage(page);
                    }}
                    highlightOnHover
                    striped
                    responsive
                    pointerOnHover
                    noDataComponent="No suppliers found"
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
                                            Add Supplier
                                        </Button>
                                    </Dialog.Trigger>

                                    <Dialog.Content maxWidth="450px">
                                        <Dialog.Title>
                                            Add Supplier
                                        </Dialog.Title>
                                        <hr className="mb-4" />

                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleSubmit(e);
                                            }}
                                        >
                                            <Flex direction="column" gap="3">
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
                                                        placeholder="Enter supplier name"
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
                                                        Phone
                                                    </Text>
                                                    <TextField.Root
                                                        placeholder="Enter phone number"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    phone: e
                                                                        .target
                                                                        .value,
                                                                })
                                                            )
                                                        }
                                                    />
                                                </label>
                                                <label>
                                                    <Text
                                                        as="div"
                                                        size="2"
                                                        mb="1"
                                                        weight="bold"
                                                    >
                                                        Email
                                                    </Text>
                                                    <TextField.Root
                                                        placeholder="Enter email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    email: e
                                                                        .target
                                                                        .value,
                                                                })
                                                            )
                                                        }
                                                    />
                                                </label>
                                                <label>
                                                    <Text
                                                        as="div"
                                                        size="2"
                                                        mb="1"
                                                        weight="bold"
                                                    >
                                                        Address
                                                    </Text>
                                                    <TextArea
                                                        rows={3}
                                                        resize="vertical"
                                                        placeholder="Enter address"
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    address:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            )
                                                        }
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
                                                        name="document_path"
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
                                                                        document_path:
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
                                                                        delete copy.document_path;
                                                                        return copy;
                                                                    }
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    {errors.document_path && (
                                                        <p className="mt-1 text-sm text-red-600">
                                                            {
                                                                errors.document_path
                                                            }
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
                                                        Active Supplier
                                                    </Text>
                                                </Text>
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
                                            Import Excel Supplier Data
                                        </Dialog.Title>
                                        <hr className="mb-4" />
                                        {/* added file template download from storage */}
                                        <p className="mb-2 text-sm">
                                            Please upload a valid Excel file
                                            containing supplier data.
                                            <br />
                                            You can download the{" "}
                                            <a
                                                href={route(
                                                    "suppliers.import.template"
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
                                            Export Excel Supplier Data
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
                                                <CheckboxGroup.Item value="contact_info">
                                                    Contact Info
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
