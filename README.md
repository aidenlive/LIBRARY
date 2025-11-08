# ASSET LIBRARY

A centralized repository for design assets accessible remotely across projects.

## Structure

```
LIBRARY/
├── SKILLS/              # CLAUDE SKILLS (Agent Guidelines)
├── typefaces/           # Custom font files (TTF, OTF)
├── icons/               # Icon collections
│   ├── phosphor/        # Phosphor icons (web/React/Swift)
│   └── scripts/         # Generation and optimization scripts
│       └── phosphor/    # Platform-specific scripts (React, Swift, Web)
├── progress-tracker.md  # Development progress tracking
└── README.md            # This file
```

## Usage

This asset library is designed to be accessed remotely from other projects. Assets are organized by type and collection for easy navigation and maintenance.

## Collections

### Typefaces
Custom font files organized by font family. Contains TTF and OTF formats. See [typefaces/README.md](./typefaces/README.md) for usage instructions and platform-specific guides.

### Icons
Icon assets organized by collection or project. See [icons/README.md](./icons/README.md) for details.

## Remote Access

To use assets from this library in other projects, reference this repository as a remote dependency or submodule.

## Contributing

When adding new assets:
1. Follow the existing directory structure
2. Use consistent naming conventions
3. Update relevant README files
4. Document any special requirements or usage notes
