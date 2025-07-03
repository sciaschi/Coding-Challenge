import React from "react";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { rankWith } from "@jsonforms/core";

export const dynamicButtonTester = rankWith(
    5,
    (uischema, schema) => uischema?.type === "Button"
);

function DynamicButtonRenderer({ schema, path }) {
    const handleClick = () => {
        console.log("Dynamic button clicked for", path);
        // Example: call API or do something custom
    };

    return (
        <button type="button" onClick={handleClick} style={{ margin: "10px 0" }}>
            {schema?.title || "Click"}
        </button>
    );
}


export default withJsonFormsControlProps(DynamicButtonRenderer);
