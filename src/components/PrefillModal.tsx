// PrefillModal.tsx
import { Modal, Box, Typography, Button, Select, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";

export default function PrefillModal({ open, onClose, onSelect, options }) {
    const [selectedOption, setSelectedOption] = useState("");

    // Reset selection when modal reopens
    useEffect(() => {
        if (open) setSelectedOption("");
    }, [open]);

    const handleSubmit = () => {
        if (selectedOption) {
            onSelect(selectedOption);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "background.paper",
                    p: 4,
                    borderRadius: 2,
                    width: 400,
                    boxShadow: 24,
                }}
            >
                <Typography variant="h6" gutterBottom>
                    Select a source field
                </Typography>

                <Select
                    fullWidth
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                >
                    {options.map((opt, i) => (
                        <MenuItem
                            key={i}
                            value={`${opt.formId}.${opt.fieldKey}`}
                        >
                            {`${opt.formName}: ${opt.fieldKey}`}
                        </MenuItem>
                    ))}
                </Select>

                <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={handleSubmit}
                    disabled={!selectedOption}
                >
                    Confirm
                </Button>
            </Box>
        </Modal>
    );
}
