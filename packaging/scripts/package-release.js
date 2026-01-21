const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// -- Configuration --
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const TEMPLATES_DIR = path.join(PROJECT_ROOT, 'packaging', 'templates');
const RELEASES_DIR = path.join(PROJECT_ROOT, 'releases');

// Read version from package.json
const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
const packageJson = require(packageJsonPath);
const version = packageJson.version;
const RELEASE_NAME = `gemini-assistant-toolkit-${version}`;
const TARGET_DIR = path.join(RELEASES_DIR, RELEASE_NAME);

console.log(`\n📦 Packaging Release: ${RELEASE_NAME}`);
console.log(`==========================================`);

// -- Steps --

// 1. Clean/Prepare Releases Dir
if (fs.existsSync(TARGET_DIR)) {
    console.log(`- Removing existing release folder: ${TARGET_DIR}`);
    fs.rmSync(TARGET_DIR, { recursive: true, force: true });
}
if (!fs.existsSync(RELEASES_DIR)) {
    fs.mkdirSync(RELEASES_DIR, { recursive: true });
}
fs.mkdirSync(TARGET_DIR, { recursive: true });
console.log(`- Created directory: ${TARGET_DIR}`);

// 2. Build Project
console.log(`- Compiling TypeScript (npm run build)...`);
try {
    execSync('npm run build', { cwd: PROJECT_ROOT, stdio: 'inherit' });
} catch (error) {
    console.error('❌ Build failed!');
    process.exit(1);
}

// 3. Copy Artifacts
const itemsToCopy = [
    { src: DIST_DIR, dest: path.join(TARGET_DIR, 'dist') },
    { src: path.join(PROJECT_ROOT, 'node_modules'), dest: path.join(TARGET_DIR, 'node_modules') },
    { src: packageJsonPath, dest: path.join(TARGET_DIR, 'package.json') },
    { src: path.join(TEMPLATES_DIR, 'README.txt'), dest: path.join(TARGET_DIR, 'README.txt') },
    { src: path.join(TEMPLATES_DIR, 'global_rules.txt'), dest: path.join(TARGET_DIR, 'global_rules.txt') }
];

console.log(`- Copying files...`);
itemsToCopy.forEach(item => {
    if (fs.existsSync(item.src)) {
        console.log(`  > ${path.basename(item.src)}`);
        fs.cpSync(item.src, item.dest, { recursive: true });
    } else {
        console.warn(`  ⚠️ Warning: Source not found: ${item.src}`);
    }
});

console.log(`\n✅ Release packaged successfully!`);
console.log(`📍 Location: ${TARGET_DIR}`);
