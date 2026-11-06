// Fills the legal pages. Operator details: fill in before the site goes online (German law requires them).
const OPERATOR = { name: '', street: '', city: '', country: 'Germany', email: '' };
const missing = v => v || '[not provided yet]';
const PAGES = {
  imprint: ['Imprint', [
    ['Information according to § 5 DDG', `${missing(OPERATOR.name)}<br>${missing(OPERATOR.street)}<br>${missing(OPERATOR.city)}<br>${OPERATOR.country}`],
    ['Contact', `Email: ${missing(OPERATOR.email)}`],
    ['Responsible for content according to § 18 (2) MStV', `${missing(OPERATOR.name)}, address as above`],
    ['Non-commercial project', 'AFTERLIGHT is a free, non-commercial hobby project. There is no shop, no subscription and no advertising.'],
    ['Trademarks', 'AFTERLIGHT is an independent community project and is not affiliated with, endorsed, sponsored or approved by Valve Corporation. Deadlock, Steam, the Deadlock and Steam logos, hero names and game artwork are trademarks or copyrighted material of Valve Corporation.'],
  ]],
  privacy: ['Privacy policy', [
    ['Controller', 'The maintainer of the AFTERLIGHT project. Contact: open an issue at <a href="https://github.com/prodbycooooooollin-byte/afterlight-releases/issues">github.com/prodbycooooooollin-byte/afterlight-releases</a>.'],
    ['This website', 'This site has no cookies, no analytics, no advertising and no tracking. Fonts and images are loaded from this site itself. The hosting provider processes your IP address and the usual request data to deliver the site (Art. 6 (1) (f) GDPR).'],
    ['Patch notes and download', 'To show the latest patch notes, your browser asks the GitHub API (api.github.com, GitHub Inc.) for the releases of AFTERLIGHT. The download button links to GitHub. GitHub receives your IP address for these requests; GitHub’s privacy statement applies.'],
    ['The app', 'What the AFTERLIGHT app processes is described in its own privacy policy, shown in the app on first start and under Settings → About & legal.'],
    ['Your rights', 'You have the right to access, rectification, erasure, restriction, data portability and objection, and the right to complain to a data protection supervisory authority.'],
  ]],
  terms: ['Terms of use', [
    ['Scope', 'These terms cover the AFTERLIGHT app and this website. The full terms of use are shown in the app on first start and under Settings → About & legal.'],
    ['Free and as is', 'AFTERLIGHT is free and provided as is, without warranty. The operator is liable only for intent and gross negligence; liability for injury to life, body or health and other mandatory liability remain unaffected.'],
    ['Community project', 'AFTERLIGHT is not affiliated with Valve. Using third-party tools with a game is at your own risk; please follow the Steam Subscriber Agreement and the rules of Deadlock.'],
  ]],
};
const [title, sections] = PAGES[document.body.dataset.page];
document.title = `${title} · AFTERLIGHT`;
document.getElementById('legal').innerHTML = `<h1>${title}</h1>` + sections.map(([h, p]) => `<section><h2>${h}</h2><p>${p}</p></section>`).join('');
