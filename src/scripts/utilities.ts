let utils = {
    sanitizeSchema(schema: any, data: any = {}) {
        const clone = structuredClone(schema);
        const props = clone.properties ?? clone.field_schema?.properties;
        if (!props) return clone;

        const allowedTypes = [
            "short-text","multi-line-text","checkbox-group","multi-select",
            "dropdown","email","phone","number","object-enum","button"
        ];

        for (const key in props) {
            const prop = props[key];
            if (!prop) continue;

            const type = prop.avantos_type;
            if (!allowedTypes.includes(type)) {
                delete props[key];
                continue;
            }

            if (type === "object-enum") {
                if (!Array.isArray(prop.enum)) prop.enum = [];

                const noneExists = prop.enum.some(
                    (it: any) => it?.title === "(None)" && (it?.value === null || it?.value === "None")
                );
                if (!noneExists) prop.enum.unshift({ title: "(None)", value: null });

                const cur = data[key];
                if (cur && typeof cur === "object") {
                    const already = prop.enum.some((it: any) => it?.title === cur.title);
                    if (!already) prop.enum.push(cur);
                }

                prop.type = "object";
                continue;
            }

            if ("enum" in prop) {
                if (!Array.isArray(prop.enum) || prop.enum.length === 0) {
                    delete props[key];      // remove empty enum fields (avoids runtime error)
                    continue;
                }

                /* turn object enums-for-dropdown into strings */
                if (typeof prop.enum[0] === "object") {
                    prop.enum = prop.enum.map((item: any) =>
                        item?.title ?? item?.label ?? JSON.stringify(item)
                    );
                    prop.type = "string";
                }
            }
        }

        return clone;
    },

    sanitizeUiSchema(uischema: any, schema: any): any {
        const clone = structuredClone(uischema);
        const validProps = Object.keys(schema?.properties ?? {});

        if (clone.type === "VerticalLayout" && Array.isArray(clone.elements)) {
            clone.elements = clone.elements.filter(el => {
                if (el.type === "Button") return true;

                const match = el.scope?.match(/#\/properties\/(.+)/);
                return match ? validProps.includes(match[1]) : false;
            });
        }

        return clone;
    },

    getPrefillOptions: function (
        currentNodeId: string,
        blueprint: any,
        formResponses: Record<string, any>
    ) {
        const visited = new Set<string>();
        const queue = [currentNodeId];
        const result: {
            formName: string;
            formId: string;
            fieldKey: string;
            value: any;
            label?: string;
        }[] = [];

        while (queue.length > 0) {
            const nodeId = queue.pop();
            if (!nodeId || visited.has(nodeId)) continue;
            visited.add(nodeId);

            const node = blueprint.nodes.find(n => n.id === nodeId);
            if (!node) continue;

            const formId = node.data.component_id;
            const formName = node.data.name;
            const values = formResponses[formId];
            const form = blueprint.forms.find(f => f.id === formId);
            const schema = form?.field_schema?.properties;

            if (values) {
                for (const key of Object.keys(values)) {
                    const value = values[key];
                    if (value !== undefined && value !== null && value !== "") {
                        const fieldSchema = schema?.[key];
                        let label = value;

                        if (
                            fieldSchema?.avantos_type === "object-enum" &&
                            Array.isArray(fieldSchema.enum)
                        ) {
                            const match = fieldSchema.enum.find((item: any) =>
                                (item?.title ?? item?.label) === value
                            );
                            if (match) {
                                label = match.title ?? match.label ?? value;
                            }
                        }

                        result.push({ formName, formId, fieldKey: key, value, label });
                    }
                }
            }

            const parentEdges = blueprint.edges.filter(e => e.target === nodeId);
            queue.push(...parentEdges.map(e => e.source));
        }

        return result;
    },

    filterPrefillableFields: function (schema: any): string[] {
        const props = schema.properties ?? schema.field_schema?.properties;
        if (!props) return [];

        const allowedTypes = [
            "short-text", "multi-line-text", "checkbox-group", "multi-select",
            "dropdown", "email", "phone", "number", "object-enum"
        ];

        return Object.entries(props)
            .filter(([_, value]: [string, any]) => allowedTypes.includes(value.avantos_type))
            .map(([key]) => key);
    },
};

export default utils;
