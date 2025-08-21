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

interface Role {
    uuid: string;
    name: string;
}
export default function RolesManagement({ auth }: Props) {
    const { roles } = usePage<PageProps<{ roles: Role[] }>>().props;
    const [pending, setPending] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const lowercasedSearch = search.toLowerCase();
        const filtered = roles.filter((roles) =>
            roles.name.toLowerCase().includes(lowercasedSearch)
        );
        setFilteredRoles(filtered);
    }, [search, roles]);
    const columns = [
        {
            name: "No",
            cell: (row: Role, index: number) =>
                (currentPage - 1) * rowsPerPage + index + 1,
            width: "70px",
        },
        {
            name: "Name",
            selector: (row: Role) => row.name,
            sortable: true,
        },
        {
            name: "Action",
            cell: (row: Role) => {
                const [open, setOpen] = React.useState(false);
                const [formData, setFormData] = React.useState({
                    name: row.name,
                });
                const [pending, setPending] = React.useState(false);

                const handleUpdate = () => {
                    setPending(true);
                    router.put(route("roles.update", row.uuid), formData, {
                        onSuccess: () => {
                            toast.success("Role updated successfully");
                            setOpen(false); // tutup dialog
                        },
                        onError: (errors) => {
                            // Tampilkan error yang lebih spesifik jika ada
                            const message =
                                typeof errors === "string"
                                    ? errors
                                    : errors?.message ||
                                      "Failed to update role";
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
                                <Dialog.Title>Edit Role</Dialog.Title>
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
                                                placeholder="Enter role name"
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
                        {row.name !== "Administrator" && (
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
                                        Delete Role
                                    </AlertDialog.Title>
                                    <AlertDialog.Description size="2">
                                        Are you sure? This action cannot be
                                        undone. This will permanently delete the
                                        role <strong>{row.name}</strong> and all
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
                                                        handleDelete(row.uuid)
                                                    }
                                                >
                                                    Delete
                                                </span>
                                            </Button>
                                        </AlertDialog.Action>
                                    </Flex>
                                </AlertDialog.Content>
                            </AlertDialog.Root>
                        )}
                    </div>
                );
            },
            sortable: false,
        },
    ];
    const [open, setOpen] = React.useState(false);
    const [formData, setFormData] = useState({
        name: "",
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPending(true);

        router.post(route("roles.store"), formData, {
            onSuccess: () => {
                toast.success("Role added successfully");
                setFormData({ name: "" });
                setOpen(false);
            },
            onError: () => {
                toast.error("Failed to add role");
            },
            onFinish: () => setPending(false),
        });
    };

    const handleDelete = (uuid: string) => {
        setPending(true);
        router.delete(route("roles.destroy", uuid), {
            onSuccess: () => {
                toast.success("Role deleted successfully");
            },
            onError: (errors) => {
                toast.error("Failed to delete role: " + errors.message);
                console.error(errors);
            },
            onFinish: () => setPending(false),
        });
    };
    return (
        <AuthenticatedLayout auth={auth} title="Roles Management">
            <Head title="Roles Management" />
            <div className="bg-white shadow rounded-lg p-4 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredRoles}
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
                    noDataComponent="No roles found"
                    subHeader
                    subHeaderComponent={
                        <div className="flex justify-between items-center w-full">
                            <Dialog.Root open={open} onOpenChange={setOpen}>
                                <Dialog.Trigger>
                                    <Button variant="soft">
                                        <Icon
                                            icon="mdi:plus"
                                            width={20}
                                            height={20}
                                        />
                                        Add Role
                                    </Button>
                                </Dialog.Trigger>

                                <Dialog.Content maxWidth="450px">
                                    <Dialog.Title>Add Role</Dialog.Title>
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
                                                    placeholder="Enter role name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            name: e.target
                                                                .value,
                                                        }))
                                                    }
                                                    required
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
