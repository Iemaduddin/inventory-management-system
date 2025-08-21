import { TextArea, Button } from "@radix-ui/themes";
import { Icon } from "@iconify/react/dist/iconify.js";

type SpecItem = {
    title: string;
    value: string;
};

interface Props {
    specs: SpecItem[];
    setSpecs: (specs: SpecItem[]) => void;
}

export default function SpecificationForm({ specs, setSpecs }: Props) {
    const handleChange = (
        index: number,
        field: keyof SpecItem,
        val: string
    ) => {
        const updated = [...specs];
        updated[index][field] = val;
        setSpecs(updated);
    };

    const handleAdd = () => {
        setSpecs([...specs, { title: "", value: "" }]);
    };

    const handleRemove = (index: number) => {
        setSpecs(specs.filter((_, i) => i !== index));
    };

    return (
        <div>
            <label>
                <div
                    style={{
                        marginBottom: "1em",
                        fontWeight: "bold",
                    }}
                >
                    Specification
                </div>
            </label>

            {specs.map((spec, index) => (
                <div key={index}>
                    <div className="flex gap-2 mb-2">
                        <TextArea
                            rows={2}
                            resize="vertical"
                            placeholder="Judul (contoh: berat, warna, dll)"
                            value={spec.title}
                            onChange={(e) =>
                                handleChange(index, "title", e.target.value)
                            }
                            className="w-2/5"
                            required
                        />
                        <TextArea
                            rows={2}
                            resize="vertical"
                            placeholder="Nilai (contoh: 500 gram, merah, dll)"
                            value={spec.value}
                            onChange={(e) =>
                                handleChange(index, "value", e.target.value)
                            }
                            required
                            className="flex-1"
                        />
                    </div>
                    {specs.length > 1 && (
                        <div className="mb-2">
                            <Button
                                type="button"
                                variant="soft"
                                color="red"
                                onClick={() => handleRemove(index)}
                                disabled={specs.length <= 1}
                                className="bg-red-500 text-white px-2 rounded"
                            >
                                Hapus
                            </Button>
                        </div>
                    )}
                </div>
            ))}

            <div className="flex justify-center items-center mt-5">
                <Button
                    type="button"
                    radius="full"
                    variant="soft"
                    onClick={handleAdd}
                >
                    <Icon icon="mdi:plus" /> Add Specification
                </Button>
            </div>
        </div>
    );
}
