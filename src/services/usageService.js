;
const vscode = require('vscode');

export interface UsageStats {
    totalRequests: number;
    generateCode: number;
    fixCode: number;
    checkErrors: number;
    codeReview: number;
    lastActive: string;
}

async function trackUsage(action: keyof Omit<UsageStats, 'totalRequests' | 'lastActive'>): Promise<void> {
    const config = vscode.workspace.getConfiguration('aiExtension');
    const currentStats = config.get<UsageStats>('usageStats', {
        totalRequests: 0,
        generateCode: 0,
        fixCode: 0,
        checkErrors: 0,
        codeReview: 0,
        lastActive: new Date().toISOString()
    });

    const updatedStats: UsageStats = {
        ...currentStats,
        totalRequests: currentStats.totalRequests + 1,
        [action]action] + 1,
        lastActive: new Date().toISOString()
    };

    await config.update('usageStats', updatedStats, vscode.ConfigurationTarget.Global);
}

function getUsageStats(): UsageStats {
    const config = vscode.workspace.getConfiguration('aiExtension');
    return config.get<UsageStats>('usageStats', {
        totalRequests: 0,
        generateCode: 0,
        fixCode: 0,
        checkErrors: 0,
        codeReview: 0,
        lastActive: 'Never'
    });
}

function formatLastActive(dateString: string): string {
    if (dateString === 'Never') return 'Never';

    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    } catch {
        return 'Unknown';
    }
}