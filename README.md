# Codex Pet Editor

A visual editor for creating and editing desktop pet animations with sprite sheet support.

## Features

- **Sprite Sheet Management**: Import and manage sprite sheets for your desktop pets
- **Animation Timeline**: Visual timeline interface for previewing and editing animations
- **Properties Panel**: Configure pet metadata, frame dimensions, and animation settings
- **9 Animation States**: Support for idle, running, waving, jumping, failed, waiting, and more
- **Export Functionality**: Export pet packages in the standard format
- **Internationalization**: Multi-language support (i18n)
- **Drag & Drop**: Easy file import with drag and drop support

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **i18next** - Internationalization
- **JSZip** - Package export
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Pet Data Format

The editor uses a standard format for desktop pets:

```
pets/
└── {pet-id}/
    ├── pet.json          # Pet metadata and configuration
    └── spritesheet.webp  # Sprite sheet containing all animation frames
```

### Animation States

| Row | State | Frames | Description |
|-----|-------|--------|-------------|
| 0 | `idle` | 6 | Idle animation |
| 1 | `running-right` | 8 | Running right |
| 2 | `running-left` | 8 | Running left |
| 3 | `waving` | 4 | Waving gesture |
| 4 | `jumping` | 5 | Jumping animation |
| 5 | `failed` | 8 | Disappointed/failed state |
| 6 | `waiting` | 6 | Waiting animation |
| 7 | `running` | 6 | Running forward |
| 8 | `review` | 6 | Observing/reviewing |

### Sprite Sheet Specifications

- **Frame Size**: 192px × 208px
- **Layout**: 8 columns × 9 rows
- **Total Frames**: 72 frames (57 used, 15 reserved)
- **Recommended Format**: WebP (supports transparency and high compression)
- **Recommended FPS**: 8 FPS

## Project Structure

```
src/
├── components/       # React components
│   ├── layout/       # Layout components
│   ├── panel/        # Properties panel components
│   └── timeline/     # Timeline and sprite preview
├── hooks/            # Custom React hooks
├── i18n/             # Internationalization
├── store/            # Zustand state management
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── App.tsx           # Main application component
└── main.tsx          # Application entry point
```

## License

MIT License
