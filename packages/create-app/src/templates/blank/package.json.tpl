{
  "private": true,
  "name": "{{ name }}",
  "description": "An Open Cells application built with Lit",
  "license": "MIT",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "npm run build && vite preview"
  },
  "dependencies": {
    "@open-cells/core": "^1.2.1",
    "@open-cells/element-controller": "^1.0.6",
    "@open-cells/page-controller": "^1.0.6",
    "lit": "^3.3.3"
  },
  "devDependencies": {
    "typescript": "^7.0.2",
    "vite": "^8.2.1"
  },
  "engines": {
    "node": ">=22.0.0"
  }
}
