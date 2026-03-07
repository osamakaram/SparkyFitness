const fs = require('fs');
const path = require('path');
const axios = require('axios');

const GITHUB_RELEASES_URL = 'https://api.github.com/repos/CodeWithCJ/SparkyFitness/releases/latest';
const GITHUB_RELEASES_FALLBACK_URL = 'https://github.com/CodeWithCJ/SparkyFitness/releases';
const GITHUB_RELEASE_TIMEOUT_MS = 5000;

// Function to get the application version from package.json
function getAppVersion() {
    try {
        const packageJsonPath = path.resolve(__dirname, '../package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return packageJson.version;
    } catch (error) {
        console.error('Failed to read version from package.json:', error);
        return 'unknown';
    }
}

async function getLatestGitHubRelease() {
    const currentVersion = getAppVersion();
    const normalizedCurrentVersion = currentVersion.startsWith('v')
        ? currentVersion
        : `v${currentVersion}`;

    try {
        const response = await axios.get(GITHUB_RELEASES_URL, {
            headers: {
                'Accept': 'application/vnd.github+json',
                'User-Agent': 'SparkyFitness-Version-Check'
            },
            timeout: GITHUB_RELEASE_TIMEOUT_MS
        });
        const latestRelease = response.data;
        const latestVersion = latestRelease.tag_name.replace('v', ''); // Assumes tags are like 'v1.2.3'

        return {
            version: `v${latestVersion}`,
            releaseNotes: latestRelease.body,
            publishedAt: latestRelease.published_at,
            htmlUrl: latestRelease.html_url,
            isNewVersionAvailable: latestVersion !== currentVersion
        };
    } catch (error) {
        console.warn('Falling back to current version after GitHub release check failed:', error.message);
        return {
            version: normalizedCurrentVersion,
            releaseNotes: '',
            publishedAt: '',
            htmlUrl: GITHUB_RELEASES_FALLBACK_URL,
            isNewVersionAvailable: false
        };
    }
}

module.exports = { getAppVersion, getLatestGitHubRelease };
