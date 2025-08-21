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
    CheckboxGroup,
} from "@radix-ui/themes";
import { PageProps } from "@/types";
import DataTable from "react-data-table-component";
import { Icon } from "@iconify/react/dist/iconify.js";
import { toast } from "react-toastify";
import DataTableStyles from "@/Components/DataTableStyles";

interface Auth {
    user: {
        name: string;
    };
}

interface Props {
    auth: Auth;
}

interface Warehouse {
    id: string;
    name: string;
    location?: {
        phone: string;
        email: string;
        address: string;
    };
    is_active: boolean;
}
export default function WarehousesManagement({ auth }: Props) {
    const { warehouses } =
        usePage<PageProps<{ warehouses: Warehouse[] }>>().props;
    const [pending, setPending] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filteredWarehouses, setFilteredWarehouses] = useState<Warehouse[]>(
        []
    );
    const [search, setSearch] = useState("");
    useEffect(() => {
        const lowercasedSearch = search.toLowerCase();

        const filtered = warehouses.filter((warehouse) => {
            // Pastikan location sudah berupa object
            const contactInfo =
                typeof warehouse.location === "string"
                    ? JSON.parse(warehouse.location)
                    : warehouse.location ?? {};
            const statusText = warehouse.is_active ? "active" : "inactive";
            return (
                warehouse.name.toLowerCase().includes(lowercasedSearch) ||
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

        setFilteredWarehouses(filtered);
    }, [search, warehouses]);

    const columns = [
        {
            name: "No",
            cell: (row: Warehouse, index: number) =>
                (currentPage - 1) * rowsPerPage + index + 1,
            width: "70px",
        },
        {
            name: "Name",
            selector: (row: Warehouse) => row.name,
            sortable: true,
        },
        {
            name: "Location",
            cell: (row: Warehouse) => {
                const contactInfo =
                    typeof row.location === "string"
                        ? JSON.parse(row.location)
                        : row.location;
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
            cell: (row: Warehouse) => (
                <Badge color={row.is_active ? "green" : "red"} variant="soft">
                    {row.is_active ? "Active" : "Inactive"}
                </Badge>
            ),
            sortable: true,
        },
        {
            name: "Action",
            cell: (row: Warehouse) => {
                const [open, setOpen] = React.useState(false);
                const contactInfo =
                    typeof row.location === "string"
                        ? JSON.parse(row.location)
                        : row.location;
                const [formData, setFormData] = React.useState({
                    name: row.name,
                    phone: contactInfo?.phone || "",
                    email: contactInfo?.email || "",
                    address: contactInfo?.address || "",
                    is_active: row.is_active,
                });
                const [pending, setPending] = React.useState(false);

                const handleUpdate = () => {
                    setPending(true);
                    router.put(route("warehouses.update", row.id), formData, {
                        onSuccess: () => {
                            toast.success("Warehouse updated successfully");
                            setOpen(false); // tutup dialog
                        },
                        onError: (errors) => {
                            // Tampilkan error yang lebih spesifik jika ada
                            const message =
                                typeof errors === "string"
                                    ? errors
                                    : errors?.message ||
                                      "Failed to update warehouse";
                            toast.error(message);
                            console.error(errors);
                        },
                        onFinish: () => setPending(false),
                    });
                };
                const [openDocument, setOpenDocument] = React.useState(false);

                return (
                    <div className="flex justify-center items-center gap-2">
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
                                <Dialog.Title>Edit Warehouse</Dialog.Title>
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
                                                placeholder="Enter warehouse name"
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
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        email: e.target.value,
                                                    }))
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
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        address: e.target.value,
                                                    }))
                                                }
                                            />
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
                                                Active Warehouse
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
                                    Delete Warehouse
                                </AlertDialog.Title>
                                <AlertDialog.Description size="2">
                                    Are you sure? This action cannot be undone.
                                    This will permanently delete the warehouse{" "}
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
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPending(true);

        router.post(route("warehouses.store"), formData, {
            onSuccess: () => {
                toast.success("Warehouse added successfully");
                setFormData({
                    name: "",
                    phone: "",
                    email: "",
                    address: "",
                    is_active: true,
                });
                setOpen(false);
            },
            onError: (errors) => {
                toast.error("Failed to add warehouse " + errors.message);
            },
            onFinish: () => setPending(false),
        });
    };

    const handleDelete = (id: string) => {
        setPending(true);
        router.delete(route("warehouses.destroy", id), {
            onSuccess: () => {
                toast.success("Warehouse deleted successfully");
            },
            onError: (errors) => {
                toast.error("Failed to delete warehouse: " + errors.message);
            },
            onFinish: () => setPending(false),
        });
    };
    const [openExport, setOpenExport] = React.useState(false);
    const [selectedFields, setSelectedFields] = useState<string[]>([
        "name",
        "location",
        "is_active",
    ]);
    const handleExport = async () => {
        setPending(true);

        // POST request
        const res = await fetch(route("warehouses.export.start"), {
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
            fetch(route("warehouses.export.status", { fileName }))
                .then((res) => res.json())
                .then((data) => {
                    if (data.ready) {
                        clearInterval(interval);
                        setOpenExport(false);
                        setPending(false);
                        window.location.href = route(
                            "warehouses.export.download",
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
            const res = await fetch(route("warehouses.import"), {
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
        <AuthenticatedLayout auth={auth} title="Warehouses Management">
            <Head title="Warehouses Management" />
            <div className="bg-white shadow rounded-lg p-4 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredWarehouses}
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
                    noDataComponent="No warehouses found"
                    subHeader
                    subHeaderComponent={
                        <div className="flex justify-between items-center w-full">
                            <div className="flex gap-3 items-center w-full">
                                <Dialog.Root open={open} onOpenChange={setOpen}>
                                    <Dialog.Trigger>
                                        <Button variant="soft">
                                            <Icon
                                                icon="mdi:plus"
                                                width={20}
                                                height={20}
                                            />
                                            Add Warehouse
                                        </Button>
                                    </Dialog.Trigger>

                                    <Dialog.Content maxWidth="450px">
                                        <Dialog.Title>
                                            Add Warehouse
                                        </Dialog.Title>
                                        <hr className="mb-4" />

                                        <form onSubmit={handleSubmit}>
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
                                                        placeholder="Enter warehouse name"
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
                                                        Active Warehouse
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
                                            Import Excel Warehouse Data
                                        </Dialog.Title>
                                        <hr className="mb-4" />
                                        {/* added file template download from storage */}
                                        <p className="mb-2 text-sm">
                                            Please upload a valid Excel file
                                            containing warehouse data.
                                            <br />
                                            You can download the{" "}
                                            <a
                                                href={route(
                                                    "warehouses.import.template"
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
                                            Export Excel Warehouse Data
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
                                                <CheckboxGroup.Item value="location">
                                                    Location
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
