// Version stamp for both builds: the commit the build is made from (date, short hash, ISO time).
// app/index.html carries an empty APP_VERSION constant, which shows "v dev" in previews.
import {execFileSync} from 'node:child_process';

export function appVersion() {
  try {
    const [date, commit, time] = execFileSync('git', ['log', '-1', '--format=%cs%n%h%n%cI'], {encoding: 'utf8'}).trim().split('\n');
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) && /^[0-9a-f]{7,}$/.test(commit)) return {date, commit: commit.slice(0, 7), time};
  } catch {}
  return {date: '', commit: '', time: ''};
}

export function stampVersion(html, version = appVersion()) {
  const re = /^  const APP_VERSION=\{[^\n]*\};(\r?)$/m;
  if (!re.test(html)) throw Error('APP_VERSION constant not found');
  return html.replace(re, (_, cr) => '  const APP_VERSION=' + JSON.stringify(version) + ';' + cr);
}
