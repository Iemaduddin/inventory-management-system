import React from "react";

const team = [
    {
        name: "Iemaduddin",
        role: "Product Manager",
        phone: "123-456-7890",
        email: "iemaduddin@example.net",
    },
    {
        name: "Didin",
        role: "Lead Developer",
        phone: "123-456-7890",
        email: "didin@example.net",
    },
    {
        name: "Cat",
        role: "UX Designer",
        phone: "123-456-7890",
        email: "cat@example.net",
    },
];

const Team = () => {
    return (
        <section id="team" className="pt-12 pb-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h2 className="text-4xl font-bold mb-12 animate-fadeIn">
                    Tim Kami
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {team.map((member, idx) => (
                        <div
                            key={idx}
                            className="p-6 rounded-xl shadow hover:shadow-lg transition"
                        >
                            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                            <h4 className="text-xl font-semibold text-blue-600">
                                {member.name}
                            </h4>
                            <p className="text-gray-700">{member.role}</p>
                            <hr className="my-3" />
                            <p className="text-gray-700">
                                <a
                                    href={`tel:${member.phone}`}
                                    className="hover:text-blue-600 transition"
                                >
                                    {member.phone}
                                </a>
                            </p>
                            <p className="text-gray-700">
                                <a
                                    href={`mailto:${member.email}`}
                                    className="hover:text-blue-600 transition"
                                >
                                    {member.email}
                                </a>
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Team;
