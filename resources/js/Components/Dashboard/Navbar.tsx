export default function Navbar({
    user,
    title,
}: {
    user: { name: string; roles?: { name: string }[] | null };
    title: string;
}) {
    return (
        <header className="flex justify-between items-center bg-white shadow px-6 h-14">
            <div className="text-xl font-semibold text-gray-700">{title}</div>
            <div className="hidden sm:ms-6 sm:flex sm:items-center">
                <div className="relative flex justify-end items-center ms-3">
                    <span className="mr-2 font-semibold">
                        {user.name} - {user.roles?.[0]?.name || "User"}
                    </span>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold">
                        {user.name
                            ? user.name
                                  .split(" ")
                                  .map((word) => word[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)
                            : "NA"}
                    </div>
                </div>
            </div>
        </header>
    );
}
