export default function Footer() {
    return (
        <footer className="bg-gray-100 text-center text-gray-500 py-4 mt-auto text-sm">
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-extrabold text-blue-600" title="Pifacia">
                AROBIDSH
            </span>{" "}
            Inventory Management System. All rights reserved.
        </footer>
    );
}
