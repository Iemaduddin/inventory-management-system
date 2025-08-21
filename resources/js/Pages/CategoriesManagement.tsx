import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
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

interface Category {
    id: string;
    name: string;
    description: string;
}
export default function CategoriesManagement({ auth }: Props) {
    const { categories } =
        usePage<PageProps<{ categories: Category[] }>>().props;
    const [pending, setPending] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filteredCategories, setFilteredCategories] = useState<Category[]>(
        []
    );
    const [search, setSearch] = useState("");

    useEffect(() => {
        const lowercasedSearch = search.toLowerCase();
        const filtered = categories.filter(
            (categories) =>
                categories.name.toLowerCase().includes(lowercasedSearch) ||
                (categories.description &&
                    categories.description
                        .toLowerCase()
                        .includes(lowercasedSearch))
        );
        setFilteredCategories(filtered);
    }, [search, categories]);
    const columns = [
        {
            name: "No",
            cell: (row: Category, index: number) =>
                (currentPage - 1) * rowsPerPage + index + 1,
            width: "70px",
        },
        {
            name: "Name",
            selector: (row: Category) => row.name,
            sortable: true,
        },
        {
            name: "Description",
            cell: (row: Category) => (
                <div className="truncate max-w-xs" title={row.description}>
                    {row.description}
                </div>
            ),
            sortable: true,
        },
        {
            name: "Action",
            cell: (row: Category) => {
                const [open, setOpen] = React.useState(false);
                const [formData, setFormData] = React.useState({
                    name: row.name,
                    description: row.description ?? "",
                });
                const [pending, setPending] = React.useState(false);

                const handleUpdate = () => {
                    setPending(true);
                    router.put(route("categories.update", row.id), formData, {
                        onSuccess: () => {
                            toast.success("Category updated successfully");
                            setOpen(false); // tutup dialog
                        },
                        onError: (errors) => {
                            // Tampilkan error yang lebih spesifik jika ada
                            const message =
                                typeof errors === "string"
                                    ? errors
                                    : errors?.message ||
                                      "Failed to update category";
                            toast.error(message);
                            console.error(errors);
                        },
                        onFinish: () => setPending(false),
                    });
                };

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

                            <Dialog.Content maxWidth="450px">
                                <Dialog.Title>Edit Category</Dialog.Title>
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
                                                placeholder="Enter category name"
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
                                                Description
                                            </Text>
                                            <TextArea
                                                rows={3}
                                                resize="vertical"
                                                name="description"
                                                placeholder="Enter description (optional)"
                                                value={formData.description}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        description:
                                                            e.target.value,
                                                    }))
                                                }
                                            />
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
                                    Delete Category
                                </AlertDialog.Title>
                                <AlertDialog.Description size="2">
                                    Are you sure? This action cannot be undone.
                                    This will permanently delete the category{" "}
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
        description: "",
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPending(true);

        router.post(route("categories.store"), formData, {
            onSuccess: () => {
                toast.success("Category added successfully");
                setFormData({ name: "", description: "" });
                setOpen(false);
            },
            onError: () => {
                toast.error("Failed to add category");
            },
            onFinish: () => setPending(false),
        });
    };

    const handleDelete = (id: string) => {
        setPending(true);
        router.delete(route("categories.destroy", id), {
            onSuccess: () => {
                toast.success("Category deleted successfully");
            },
            onError: (errors) => {
                toast.error("Failed to delete category: " + errors.message);
                console.error(errors);
            },
            onFinish: () => setPending(false),
        });
    };
    const [openExport, setOpenExport] = React.useState(false);
    const [selectedFields, setSelectedFields] = useState<string[]>([
        "name",
        "description",
    ]);
    const handleExport = async () => {
        setPending(true);

        // POST request
        const res = await fetch(route("categories.export.start"), {
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
            fetch(route("categories.export.status", { fileName }))
                .then((res) => res.json())
                .then((data) => {
                    if (data.ready) {
                        clearInterval(interval);
                        setOpenExport(false);
                        setPending(false);
                        window.location.href = route(
                            "categories.export.download",
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
            const res = await fetch(route("categories.import"), {
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
        <AuthenticatedLayout auth={auth} title="Categories Management">
            <Head title="Categories Management" />
            <div className="bg-white shadow rounded-lg p-4 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredCategories}
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
                    noDataComponent="No categories found"
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
                                            Add Category
                                        </Button>
                                    </Dialog.Trigger>

                                    <Dialog.Content maxWidth="450px">
                                        <Dialog.Title>
                                            Add Category
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
                                                        placeholder="Enter category name"
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
                                                        Description
                                                    </Text>
                                                    <TextArea
                                                        rows={3}
                                                        resize="vertical"
                                                        name="description"
                                                        placeholder="Enter description (optional)"
                                                        value={
                                                            formData.description
                                                        }
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    description:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            )
                                                        }
                                                    />
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
                                            Import Excel Category Product Data
                                        </Dialog.Title>
                                        <hr className="mb-4" />
                                        {/* added file template download from storage */}
                                        <p className="mb-2 text-sm">
                                            Please upload a valid Excel file
                                            containing category product data.
                                            <br />
                                            You can download the{" "}
                                            <a
                                                href={route(
                                                    "categories.import.template"
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
                                            Export Excel Product Categories Data
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
                                                <CheckboxGroup.Item value="description">
                                                    Description
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
