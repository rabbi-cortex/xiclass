const { Octokit } = require('@octokit/rest');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { roll, reg, board, year, mobile1, mobile2 } = req.body;

        if (!roll || !reg || !board || !year || !mobile1 || !mobile2) {
            return res.status(400).json({ error: 'সব ফিল্ড পূরণ করুন' });
        }
        if (mobile1 !== mobile2) return res.status(400).json({ error: 'মোবাইল নম্বর মিলছে না' });
        if (!/^01\d{9}$/.test(mobile1)) {
            return res.status(400).json({ error: 'মোবাইল 01 দিয়ে ১১ ডিজিট হতে হবে' });
        }

        const owner = process.env.GITHUB_OWNER;
        const repo = process.env.GITHUB_REPO;
        const filePath = process.env.FILE_PATH || 'data/students.txt';
        const token = process.env.GITHUB_TOKEN;

        if (!token || !owner || !repo) {
            return res.status(500).json({ error: 'GitHub কনফিগ ঠিক নেই' });
        }

        const octokit = new Octokit({ auth: token });

        let currentContent = '';
        let sha = null;
        try {
            const fileRes = await octokit.repos.getContent({ owner, repo, path: filePath });
            currentContent = Buffer.from(fileRes.data.content, 'base64').toString('utf8');
            sha = fileRes.data.sha;
        } catch (err) {
            if (err.status === 404) {
                currentContent = '═══════════════════════════════════════════════\n';
                currentContent += '     🏫 ছাত্র নিবন্ধন তথ্য (GitHub Storage)\n';
                currentContent += '═══════════════════════════════════════════════\n\n';
            } else {
                throw err;
            }
        }

        const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        const entry = `
────────────────────────────────────────────
📅 সময়      : ${timestamp}
🎓 রোল       : ${roll}
📌 রেজি.     : ${reg}
🏫 বোর্ড     : ${board}
📆 বছর       : ${year}
📱 মোবাইল    : ${mobile1}
✅ কনফার্ম    : ${mobile2}
────────────────────────────────────────────
`;
        const newContent = currentContent + entry;

        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: filePath,
            message: `📝 নতুন ডাটা: ${roll} - ${timestamp}`,
            content: Buffer.from(newContent).toString('base64'),
            sha: sha || undefined
        });

        return res.status(200).json({ success: true, message: 'ডাটা সংরক্ষিত হয়েছে' });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'সার্ভার ত্রুটি: ' + error.message });
    }
};