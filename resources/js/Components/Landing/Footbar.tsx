import { Icon } from "@iconify/react/dist/iconify.js";

const Footbar = () => {
    return (
        <footer id="contact" className="bg-blue-700 text-white pt-12 pb-6">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* About Section */}
                <div>
                    <h3 className="text-2xl font-bold mb-4">IMS System</h3>
                    <p className="text-blue-100 text-sm leading-relaxed">
                        Inventory Management System dirancang untuk membantu
                        perusahaan mengelola inventaris dengan efisien, aman,
                        dan real-time. Mendukung proses audit dan analisis yang
                        lebih cepat.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-blue-100">
                        <li>
                            <a
                                href="#workflow"
                                className="hover:text-white transition"
                            >
                                Workflow
                            </a>
                        </li>
                        <li>
                            <a
                                href="#features"
                                className="hover:text-white transition"
                            >
                                Features
                            </a>
                        </li>
                        <li>
                            <a
                                href="#dashboard"
                                className="hover:text-white transition"
                            >
                                Dashboard
                            </a>
                        </li>
                        <li>
                            <a
                                href="#security"
                                className="hover:text-white transition"
                            >
                                Security
                            </a>
                        </li>
                        <li>
                            <a
                                href="#contact"
                                className="hover:text-white transition"
                            >
                                Contact
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Contact Persons */}
                <div>
                    <h4 className="text-lg font-semibold mb-4">
                        Contact Persons
                    </h4>
                    <ul className="space-y-4 text-blue-100 text-sm">
                        <li>
                            <p className="font-medium">Prof. Xyz</p>
                            <p>IT Manager</p>
                            <p>
                                <Icon
                                    icon="mdi:email"
                                    className="inline mr-2"
                                />{" "}
                                xyz@ims.com
                            </p>
                            <p>
                                <Icon
                                    icon="mdi:phone"
                                    className="inline mr-2"
                                />{" "}
                                +62 812-3456-7890
                            </p>
                        </li>
                        <li>
                            <p className="font-medium">Lorem Ipsum</p>
                            <p>System Administrator</p>
                            <p>
                                <Icon
                                    icon="mdi:email"
                                    className="inline mr-2"
                                />{" "}
                                lorem@ims.com
                            </p>
                            <p>
                                <Icon
                                    icon="mdi:phone"
                                    className="inline mr-2"
                                />{" "}
                                +62 812-3456-7890
                            </p>
                        </li>
                    </ul>
                </div>

                {/* Social Media */}
                <div>
                    <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
                    <div className="flex space-x-4">
                        <a
                            href="https://www.linkedin.com/in/iemaduddin/"
                            className="hover:text-gray-200 transition"
                            target="_blank"
                        >
                            <Icon
                                icon="mdi:linkedin"
                                className="text-blue-100"
                                width={22}
                            />
                        </a>
                        <a
                            href="https://github.com/Iemaduddin"
                            className="hover:text-gray-200 transition"
                            target="_blank"
                        >
                            <Icon
                                icon="mdi:github"
                                className="text-blue-100"
                                width={22}
                            />
                        </a>
                    </div>
                    <div className="mt-4 text-blue-100 text-sm">
                        Bangkalan, Indonesia
                    </div>
                </div>
            </div>

            <div className="mt-10 border-t border-blue-500 pt-4 text-center text-blue-200 text-sm">
                &copy; {new Date().getFullYear()} Pifacia Inventory Management
                System. All rights reserved.
            </div>
        </footer>
    );
};

export default Footbar;
