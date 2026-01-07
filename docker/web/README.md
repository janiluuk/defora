# Defora Web UI

This directory contains the web interface for Defora, providing a real-time control panel for live visual performances.

## Setup

### Install Dependencies

Node.js dependencies are **not committed to the repository**. You must install them using npm:

```bash
cd docker/web
npm install
```

This will install all dependencies listed in `package.json` into the `node_modules/` directory.

### Run Tests

```bash
npm test
```

### Start the Server

```bash
npm start
```

Or use the docker-compose stack from the repository root:

```bash
cd ../..
docker-compose up --build
```

Then open http://localhost:8080 in your browser.

## Development

- `public/` - Static HTML/CSS/JS assets for the web UI
- `server.js` - Express server with WebSocket support
- `src/` - Additional JavaScript modules
- `test/` - Test specifications

### Note on node_modules

The `node_modules/` directory is excluded from version control via `.gitignore`. Always run `npm install` after cloning the repository or switching branches to ensure you have the correct dependencies installed.
