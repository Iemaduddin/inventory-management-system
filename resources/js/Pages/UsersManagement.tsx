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
    Badge,
    Select,
} from "@radix-ui/themes";
import { PageProps } from "@/types";
import DataTable from "react-data-table-component";
import { Icon } from "@iconify/react/dist/iconify.js";
import { toast } from "react-toastify";
import { email } from "zod";
import DataTableStyles from "@/Components/DataTableStyles";

interface Auth {
    user: {
        name: string;
    };
}

interface Props {
    auth: Auth;
}

interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    roles?: Array<{
        uuid: number;
        name: string;
    }>;
}
export default function UsersManagement({ auth }: Props) {
    const { users, roles } =
        usePage<
            PageProps<{ users: User[]; roles: { uuid: string; name: string } }>
        >().props;
    const [pending, setPending] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const lowercasedSearch = search.toLowerCase();
        const filtered = users.filter(
            (users) =>
                users.name.toLowerCase().includes(lowercasedSearch) ||
                users.email.toLowerCase().includes(lowercasedSearch) ||
                (users.roles &&
                    users.roles.some((role) =>
                        role.name.toLowerCase().includes(lowercasedSearch)
                    ))
        );
        setFilteredUsers(filtered);
    }, [search, users]);
    const columns = [
        {
            name: "No",
            cell: (row: User, index: number) =>
                (currentPage - 1) * rowsPerPage + index + 1,
            width: "70px",
        },
        {
            name: "Name",
            selector: (row: User) => row.name,
            sortable: true,
        },
        {
            name: "Email",
            selector: (row: User) => row.email,
            sortable: true,
        },
        {
            name: "Role",
            cell: (row: User) => {
                // Ambil role pertama atau default
                const role =
                    row.roles && row.roles.length > 0 ? row.roles[0] : null;

                let badgeColors:
                    | "green"
                    | "orange"
                    | "blue"
                    | "purple"
                    | "yellow" = "yellow";

                switch (role?.name) {
                    case "Administrator":
                        badgeColors = "green";
                        break;
                    case "Manager":
                        badgeColors = "orange";
                        break;
                    case "Staff":
                        badgeColors = "blue";
                        break;
                    case "Viewer":
                        badgeColors = "purple";
                        break;
                    default:
                        badgeColors = "yellow";
                }

                const roleName = role?.name
                    ? role.name.charAt(0).toUpperCase() + role.name.slice(1)
                    : "Unknown";

                return <Badge color={badgeColors}>{roleName}</Badge>;
            },
            sortable: true,
        },
        {
            name: "Action",
            cell: (row: User) => {
                const [open, setOpen] = React.useState(false);
                const [formData, setFormData] = React.useState({
                    name: row.name,
                    email: row.email,
                    password: "",
                    role:
                        row.roles && row.roles.length > 0
                            ? row.roles[0].uuid.toString()
                            : "",
                });
                const [pending, setPending] = React.useState(false);

                const handleUpdate = () => {
                    setPending(true);
                    router.put(route("users.update", row.id), formData, {
                        onSuccess: () => {
                            toast.success("User updated successfully");
                            setOpen(false);
                        },
                        onError: (errors) => {
                            // Tampilkan error yang lebih spesifik jika ada
                            const message =
                                typeof errors === "string"
                                    ? errors
                                    : errors?.message ||
                                      "Failed to update user";
                            toast.error(message);
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
                                <Dialog.Title>Edit User</Dialog.Title>
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
                                                placeholder="Enter user name"
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
                                                Email
                                            </Text>
                                            <TextField.Root
                                                type="email"
                                                placeholder="Enter email"
                                                name="email"
                                                value={formData.email}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        email: e.target.value,
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
                                                Password
                                            </Text>
                                            <TextField.Root
                                                type="password"
                                                placeholder="Enter password"
                                                name="password"
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        password:
                                                            e.target.value,
                                                    }))
                                                }
                                            />
                                        </label>
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
                                                name="role"
                                                value={formData.role}
                                                onValueChange={(val) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        role: val,
                                                    }))
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
                                                    {Array.isArray(roles) &&
                                                        roles.map((role) => (
                                                            <Select.Item
                                                                key={role.uuid}
                                                                value={
                                                                    role.uuid
                                                                }
                                                            >
                                                                {role.name}
                                                            </Select.Item>
                                                        ))}
                                                </Select.Content>
                                            </Select.Root>
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

                        {row.roles?.[0]?.name !== "Administrator" && (
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
                                        Delete User
                                    </AlertDialog.Title>
                                    <AlertDialog.Description size="2">
                                        Are you sure? This action cannot be
                                        undone. This will permanently delete the
                                        user <strong>{row.name}</strong> and all
                                        associated data.
                                    </AlertDialog.Description>

                                    <Flex gap="3" mt="4" justify="end">
                                        <AlertDialog.Cancel>
                                            <Button variant="soft" color="gray">
                                                Cancel
                                            </Button>
                                        </AlertDialog.Cancel>
                                        <AlertDialog.Action>
                                            <Button
                                                variant="solid"
                                                color="red"
                                                onClick={() =>
                                                    handleDelete(row.id)
                                                }
                                            >
                                                Delete
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
        email: "",
        password: "",
        role: "",
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPending(true);

        router.post(route("users.store"), formData, {
            onSuccess: () => {
                toast.success("User added successfully");
                setFormData({ name: "", email: "", password: "", role: "" });
                setOpen(false);
            },
            onError: (errors) => {
                toast.error("Failed to add user");
                console.error(errors);
            },
            onFinish: () => setPending(false),
        });
    };

    const handleDelete = (id: string) => {
        setPending(true);
        router.delete(route("users.destroy", id), {
            onSuccess: () => {
                toast.success("User deleted successfully");
            },
            onError: (errors) => {
                toast.error("Failed to delete user: " + errors.message);
                console.error(errors);
            },
            onFinish: () => setPending(false),
        });
    };
    return (
        <AuthenticatedLayout auth={auth} title="Users Management">
            <Head title="Users Management" />
            <div className="bg-white shadow rounded-lg p-4 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredUsers}
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
                    noDataComponent="No users found"
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
                                        Add User
                                    </Button>
                                </Dialog.Trigger>

                                <Dialog.Content maxWidth="450px">
                                    <Dialog.Title>Add User</Dialog.Title>
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
                                                    placeholder="Enter user name"
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
                                                    type="email"
                                                    placeholder="Enter email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            email: e.target
                                                                .value,
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
                                                    Password
                                                </Text>
                                                <TextField.Root
                                                    type="password"
                                                    placeholder="Enter password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            password:
                                                                e.target.value,
                                                        }))
                                                    }
                                                    required
                                                />
                                            </label>
                                            <label className="w-full">
                                                <Text
                                                    as="div"
                                                    size="2"
                                                    mb="1"
                                                    weight="bold"
                                                >
                                                    Role
                                                </Text>
                                                <Select.Root
                                                    name="role"
                                                    value={formData.role}
                                                    onValueChange={(val) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            role: val,
                                                        }))
                                                    }
                                                    required
                                                >
                                                    <Select.Trigger
                                                        placeholder="Select role"
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
                                                        {Array.isArray(roles) &&
                                                            roles.map(
                                                                (role) => (
                                                                    <Select.Item
                                                                        key={
                                                                            role.uuid
                                                                        }
                                                                        value={
                                                                            role.uuid
                                                                        }
                                                                    >
                                                                        {
                                                                            role.name
                                                                        }
                                                                    </Select.Item>
                                                                )
                                                            )}
                                                    </Select.Content>
                                                </Select.Root>
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
