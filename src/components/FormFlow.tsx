"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { JsonForms } from "@jsonforms/react";
import { materialRenderers } from "@jsonforms/material-renderers";
import PrefillUI from "@/components/PrefillUI";
import utils from "@/scripts/utilities";
import DynamicButtonRenderer, {dynamicButtonTester} from "@/components/Button";

const renderers = [
    ...materialRenderers,
    { tester: dynamicButtonTester, renderer: DynamicButtonRenderer },
];

export default function FormFlow() {
    const [blueprint, setBlueprint] = useState(null);
    const [currentNodeId, setCurrentNodeId] = useState(null);
    const [formData, setFormData] = useState({});
    const [formResponses, setFormResponses] = useState<Record<string, any>>({});
    const [prefillMap, setPrefillMap] = useState<Record<string, any>>({});
    const [formQueue, setFormQueue] = useState<string[]>([]);
    const [visited, setVisited] = useState<Set<string>>(new Set());

    useEffect(() => {
        axios
            .get("http://localhost:3000/api/v1/1/actions/blueprints/1/graph")
            .then((res) => {
                const bp = res.data;
                setBlueprint(bp);

                const startingForm = bp.nodes.find(n => n.data.prerequisites.length === 0);
                if (startingForm) {
                    setFormQueue([startingForm.id]);
                    setCurrentNodeId(startingForm.id);
                }
            })
            .catch(console.error);
    }, []);

    // Safe to compute derived variables after all hooks
    let formId = null;
    let formSchema = null;
    let currentNode = null;

    if (blueprint && currentNodeId) {
        currentNode = blueprint.nodes.find(n => n.id === currentNodeId);
        formId = currentNode?.data?.component_id;
        formSchema = blueprint.forms.find(f => f.id === formId);
    }

    console.log(formSchema);

    useEffect(() => {
        if (!formSchema || !prefillMap[currentNodeId]) return;

        const newData: Record<string, any> = {};
        const props = formSchema.field_schema.properties ?? {};

        for (const key of Object.keys(props)) {
            const source = prefillMap[currentNodeId]?.[key];
            if (!source) continue;

            const sourceValue = formResponses[source.formId]?.[source.fieldKey];
            const prop = props[key];

            // Handle object-enum types
            if (prop.avantos_type === "object-enum" && Array.isArray(prop.enum)) {
                const selector =
                    formSchema.dynamic_field_config?.[key]?.selector_field ?? "title";

                const match = prop.enum.find(opt => {
                    if (typeof sourceValue === "object") {
                        return opt?.title === sourceValue?.title;
                    }
                    return opt?.[selector] === sourceValue;
                });

                if (match) {
                    newData[key] = match;
                } else if (sourceValue) {
                    // Build value to inject
                    const valueToInject =
                        typeof sourceValue === "object"
                            ? sourceValue
                            : { [selector]: sourceValue, title: sourceValue };

                    // Only inject if not already in enum
                    const exists = prop.enum.some(
                        opt =>
                            opt?.title === valueToInject.title &&
                            (selector === "title" ||
                                opt?.[selector] === valueToInject[selector])
                    );

                    if (!exists) {
                        prop.enum.push(valueToInject);
                    }

                    newData[key] = valueToInject;
                }
            } else {
                // Plain fields
                newData[key] = sourceValue;
            }
        }

        // ✅ Preserve existing values and only update prefilled fields
        setFormData(prev => ({ ...prev, ...newData }));
    }, [formSchema, prefillMap, currentNodeId, formResponses, blueprint, formId]);

    if (!blueprint || !currentNodeId || !formSchema) return <div>Loading form...</div>;

    const handleSubmit = () => {
        console.log("Submitted:", formData);

        setFormResponses(prev => ({
            ...prev,
            [formId]: formData,
        }));

        const updatedVisited = new Set(visited);
        updatedVisited.add(currentNodeId);

        const nextEdges = blueprint.edges.filter(e => e.source === currentNodeId);
        const nextNodes = nextEdges.map(e => e.target);

        const newQueue = [
            ...formQueue.filter(id => !updatedVisited.has(id)), // remove any already visited
            ...nextNodes.filter(id => !updatedVisited.has(id)), // add next nodes
        ];

        const nextNode = newQueue.shift();

        setVisited(updatedVisited);
        setFormQueue(newQueue);
        setFormData({});

        if (nextNode) {
            setCurrentNodeId(nextNode);
        } else {
            alert("Workflow complete!");
        }
    };

    const setMapping = (nodeId, fieldKey, source) => {
        setPrefillMap(prev => ({
            ...prev,
            [nodeId]: { ...prev[nodeId], [fieldKey]: source },
        }));
    };

    return (
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <PrefillUI
                blueprint={blueprint}
                currentNodeId={currentNodeId}
                formResponses={formResponses}
                onSetMapping={setMapping}
            />

            <span className="text-3xl">{currentNode.data.name}</span>
            <JsonForms
                schema={utils.sanitizeSchema(formSchema.field_schema, formData)}
                uischema={utils.sanitizeUiSchema(formSchema.ui_schema, formSchema.field_schema)}
                data={formData}
                onChange={({ data }) => setFormData(data)}
                renderers={renderers}
            />


            <button onClick={handleSubmit} style={{ marginTop: 20 }}>
                Next
            </button>
        </div>
    );
}
