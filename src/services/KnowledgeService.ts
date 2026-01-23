import * as fs from "fs";
import * as path from "path";

export class KnowledgeService {
    private projectRoot: string;
    private docsDir: string;

    constructor() {
        this.projectRoot = process.cwd();
        this.docsDir = path.join(this.projectRoot, "docs");
    }

    public getProjectMap(): string {
        // High level overview
        const pkgPath = path.join(this.projectRoot, "package.json");
        const readmePath = path.join(this.projectRoot, "README.md");
        const tsconfigPath = path.join(this.projectRoot, "tsconfig.json");

        let summary = "## Project Map\n";

        if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            summary += `- **Name**: ${pkg.name}\n- **Version**: ${pkg.version}\n- **Scripts**: ${Object.keys(pkg.scripts || {}).join(", ")}\n`;
        } else {
            summary += "- **Type**: Unknown (no package.json)\n";
        }

        if (fs.existsSync(readmePath)) {
            const readme = fs.readFileSync(readmePath, 'utf8').split('\n').slice(0, 5).join('\n'); // First 5 lines
            summary += `- **README Preview**:\n${readme}\n...\n`;
        }

        const srcDir = path.join(this.projectRoot, "src");
        if (fs.existsSync(srcDir)) {
            const srcFiles = fs.readdirSync(srcDir).filter(f => !f.startsWith("."));
            summary += `- **SRC Structure**: ${srcFiles.join(", ")}\n`;
        }

        return summary;
    }

    public searchDocs(query: string): string[] {
        if (!fs.existsSync(this.docsDir)) return ["No docs/ directory found."];

        const results: string[] = [];
        const files = fs.readdirSync(this.docsDir).filter(f => f.endsWith(".md"));

        for (const file of files) {
            const content = fs.readFileSync(path.join(this.docsDir, file), 'utf8');
            if (content.toLowerCase().includes(query.toLowerCase())) {
                results.push(`Found in **${file}**:\n...${content.substring(0, 200).replace(/\n/g, ' ')}...`);
            }
        }
        return results.length > 0 ? results : ["No matches found in docs/"];
    }
}
