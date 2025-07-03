// PrefillUI.tsx  (sketch)
import { useState } from "react";
import PrefillModal from "./PrefillModal";
import utils from "@/scripts/utilities";

export default function PrefillUI({blueprint, currentNodeId, formResponses, onSetMapping, prefillMap}) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedField, setSelectedField] = useState<string | null>(null);

    const node = blueprint.nodes.find((n) => n.id === currentNodeId);
    const form = blueprint.forms.find((f) => f.id === node.data.component_id);
    const fields = utils.filterPrefillableFields(form.field_schema);

    const options = modalOpen
        ? utils.getPrefillOptions(currentNodeId, blueprint, formResponses)
        : [];


    const openModalFor = (field: string) => {
        setSelectedField(field);
        setModalOpen(true);
    };

    const handleSelect = (sourceString: string) => {
        const [formId, fieldKey] = sourceString.split(".");
        onSetMapping(currentNodeId, selectedField, { formId, fieldKey });
        setModalOpen(false);
    };

    return (
        <div className="border p-4 w-72">
            <h3 className="font-semibold">Prefill</h3>

            {fields.map((field) => (
                <button
                    key={field}
                    className="block text-left w-full py-1 hover:bg-gray-100"
                    onClick={() => openModalFor(field)}
                >
                    {field}
                </button>
            ))}

            <PrefillModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSelect={handleSelect}
                options={options}
            />
        </div>
    );
}
