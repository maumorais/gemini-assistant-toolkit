import * as fs from "fs";
import * as path from "path";

export class CodeService {
    private projectRoot: string;

    constructor() {
        this.projectRoot = process.cwd();
    }

    private isIgnored(filePath: string): boolean {
        // Basic ignores. Ideally we'd read .gitignore, but for now strict common ignores.
        const ignored = ["node_modules", ".git", "dist", "coverage"];
        return ignored.some(i => filePath.includes(path.sep + i) || filePath.endsWith(path.sep + i));
    }

    public listFiles(dir: string = ".", recursive: boolean = true): string[] {
        const fullPath = path.resolve(this.projectRoot, dir);
        if (!fs.existsSync(fullPath)) throw new Error(`Directory not found: ${dir}`);

        const results: string[] = [];
        const items = fs.readdirSync(fullPath, { withFileTypes: true });

        for (const item of items) {
            const itemPath = path.join(dir, item.name);
            if (this.isIgnored(itemPath)) continue;

            if (item.isDirectory()) {
                if (recursive) {
                    results.push(...this.listFiles(itemPath, true));
                } else {
                    results.push(itemPath + "/");
                }
            } else {
                results.push(itemPath);
            }
        }
        return results;
    }

    public searchFiles(pattern: string): { file: string; line: number; content: string }[] {
        const regex = new RegExp(pattern); // Case sensitive by default unless user adds flags to pattern string? No, simple string for now.
        // Actually, let's treat simple string as literal or support basic regex.
        // Let's implement simple substring search for safety/ease, or regex if provided.
        // For 'search_files', let's assume Regex.

        const files = this.listFiles(".", true);
        const matches: { file: string; line: number; content: string }[] = [];

        for (const file of files) {
            if (file.endsWith("/")) continue; // skip dirs

            try {
                const absPath = path.resolve(this.projectRoot, file);
                const content = fs.readFileSync(absPath, 'utf-8');
                const lines = content.split('\n');

                lines.forEach((lineContent, index) => {
                    if (regex.test(lineContent)) {
                        matches.push({
                            file: file,
                            line: index + 1,
                            content: lineContent.trim()
                        });
                    }
                });
            } catch (err) {
                // Ignore read errors (binary files etc)
            }
        }
        return matches;
    }

    public scanTodos(): { file: string; line: number; content: string; type: string }[] {
        const todoRegex = /\/\/\s*(TODO|FIXME|HACK):?(.*)/i;
        // Also support <!-- TODO --> for HTML/MD? Maybe just generic textual search.
        // Let's stick to common code comments for now using a broader regex.
        const broaderRegex = /(TODO|FIXME|HACK):/i;

        const files = this.listFiles(".", true);
        const findings: { file: string; line: number; content: string; type: string }[] = [];

        for (const file of files) {
            if (file.endsWith("/")) continue;

            try {
                const absPath = path.resolve(this.projectRoot, file);
                const content = fs.readFileSync(absPath, 'utf-8');
                const lines = content.split('\n');

                lines.forEach((lineContent, index) => {
                    const match = lineContent.match(broaderRegex);
                    if (match) {
                        findings.push({
                            file: file,
                            line: index + 1,
                            content: lineContent.trim(),
                            type: match[1].toUpperCase()
                        });
                    }
                });
            } catch (err) { }
        }
        return findings;
    }
}
