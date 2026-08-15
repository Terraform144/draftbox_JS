# DraftBox

**DraftBox** est un outil de création de jeux directement dans le navigateur. Créez, dessinez et codez vos jeux en JavaScript avec CreateJS, puis exportez-les pour le web et le mobile (Android via Capacitor).

## Fonctionnalités

- Éditeur de code intégré (CodeMirror) avec coloration syntaxique JavaScript
- Éditeur pixel art pour créer vos sprites et tilesets
- Aperçu en direct de votre jeu avec CreateJS
- Sauvegarde et gestion de projets
- Export web et mobile (Android)

## Prérequis

- [Node.js](https://nodejs.org) (version 18 ou plus récente)
- npm

## Installation

```bash
npm install
```

## Démarrage

### Serveur de développement

```bash
npm run dev
```

### Serveur de production

```bash
npm run build
npm run start
```

## Build mobile (Android)

```bash
npm run build
npx cap sync android
npx cap open android
```

## Structure du projet

```
src/             Code source de l'application (React)
public/          Fichiers statiques
dist/            Sortie du build Vite
server.cjs       Serveur Node.js (Express)
capacitor.config.json   Configuration Capacitor
android/         Projet Android généré
```

## License

[MIT](LICENSE)

Copyright (c) 2026 DraftBox
