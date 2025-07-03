# Coding Challenge – Dynamic Form Builder (JSON Forms)

This project is a form-driven workflow tool built with React and [JSON Forms](https://jsonforms.io/). It dynamically renders forms based on a JSON schema and allows for intelligent form prefill mapping between nodes in a workflow graph.

### 🧠 Features

- Dynamic form rendering with JSON schema + UI schema
- Custom renderer support (e.g., API-triggering button)
- Prefill mapping UI to pull answers from previous forms
- Support for `object-enum` dropdowns with missing-value fallback
- Local Git history viewable via JetBrains IDEs (per project folder)

---

## 📁 Project Structure

```
Coding-Challenge/
├── .idea/                  # JetBrains project settings
├── FormBuilder/            # Main application code
│   ├── components/         # Custom renderers, Prefill UI, etc.
│   ├── pages/              # Next.js route entries
│   ├── scripts/            # Utility functions (schema sanitizer, etc.)
│   ├── public/             # Static assets (if any)
│   └── ...                 # Configuration, styling, etc.
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Yarn or npm

### Youtube Video of Coding
https://youtu.be/6ISHqUIjvnk

### Installation

```bash
npm install
```

### Development Server

```bash
npm next dev
```

Open your browser at [http://localhost:3000](http://localhost:3000).

---

## 🧩 How It Works

- The system loads a **blueprint graph** consisting of form nodes and their relationships.
- Each form is driven by a JSON schema (for data structure) and a UI schema (for layout).
- Custom components like a `DynamicButtonRenderer` and an intelligent `object-enum` dropdown enhance form behavior.
- The **Prefill UI** allows users to map answers from previous forms to fields in the current form, supporting real-time value injection even if values weren't originally in the schema.

---

## 🛠️ Custom Renderers

Custom renderers are registered in the `renderers` array via `@jsonforms/react`:

```tsx
const renderers = [
  ...materialRenderers,
  { tester: dynamicButtonTester, renderer: DynamicButtonRenderer },
];
```

---

## 💡 Notes

- The project is structured for JetBrains IDE compatibility to support local history view during code review.
- Fallback logic ensures missing enum values (e.g., from previous form submissions) are still accepted and rendered.

---

## 📬 Feedback

If you're reviewing this for a technical assignment or interview, please feel free to inspect local history and structure for context and decisions made.

---

## License

MIT
