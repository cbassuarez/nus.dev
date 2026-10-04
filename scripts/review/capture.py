#!/usr/bin/env python3
"""Capture a published macOS build with disposable profile, project and shell state.

python3 scripts/review/capture.py --app /tmp/nus.app --archive /tmp/nus.zip \
  --manifest /tmp/release.json --out /tmp/nus-review-take
Exports unretouched native PNG stills, plus public provenance.
Masters and logs remain in --out. Never rebuilds the app.
"""
import argparse, hashlib, json, os, shutil, socket, subprocess, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sha = lambda data: hashlib.sha256(data).hexdigest()

def main():
    p = argparse.ArgumentParser(description=__doc__)
    for arg in ('app', 'archive', 'manifest', 'out'):
        p.add_argument('--' + arg, type=Path, required=True)
    a = p.parse_args()
    evidence = json.loads((ROOT/'assets/review/release-evidence.json').read_text())
    manifest = json.loads(a.manifest.read_text())
    assert (manifest['version'], manifest['revision']) == (evidence['tag'], evidence['revision'])
    package = next(x for x in manifest['assets'] if x['target'] == 'macos-arm64')
    archive_hash = sha(a.archive.read_bytes())
    assert archive_hash == package['sha256'], 'archive differs from published manifest'
    exe = a.app.resolve()/'Contents/MacOS/nus'
    with zipfile.ZipFile(a.archive) as archive:
        member = next(x for x in archive.namelist() if x.endswith('.app/Contents/MacOS/nus'))
        assert sha(exe.read_bytes()) == sha(archive.read(member)), 'app differs from published archive'
    if a.out.exists():
        p.error('choose a fresh --out; existing captures are retained')
    with socket.socket() as test:
        assert test.connect_ex(('127.0.0.1', 4187)) != 0, 'fixture port 4187 is occupied'
    a.out.mkdir(parents=True)
    profile = a.out/'profile'; profile.mkdir()
    project = a.out/'fieldnotes'; shutil.copytree(ROOT/'scripts/review/fixture', project)
    shell = a.out/'shell'; shell.mkdir()
    (shell/'.zshrc').write_text("PROMPT='fieldnotes › '\nRPROMPT=''\nHISTFILE=/dev/null\nSAVEHIST=0\nunsetopt share_history\n")
    (profile/'onboarded').write_text('skip')
    (profile/'me.json').write_text(json.dumps({'name':'Review','face':'Initial','created':evidence['checked_at']}))
    (profile/'settings.json').write_text(json.dumps({'schema':2,'window_name':'Fieldnotes','sidebar_pinned':True,'behavior':{'splash':'None','then':'Prompt','keep_alive':'Off','remember':False,'close_asks':False,'update_checks':False,'hatch_background':False,'hatch_status':False},'motion':{'register':0.5,'reduce':True}}))
    steps = ['wait 1400','newshell','wait 1600',f"shell cd '{project}'; clear",'wait 400',
             'line python3 -m http.server 4187 --bind 127.0.0.1','key enter','wait 2000',
             'shot shell','url http://127.0.0.1:4187','focus page','wait 1600','shot opened','awaitpage Fieldnotes / review','awaitpaint','wait 600','shot split',
             'focus page','palette go keep this page','key enter','wait 300','assertkept yes','key escape','wait 200',
             f'openfile {project}/notes.txt','wait 600','asserteditorready','key cmd+f','findquery review','wait 300','shot find',
             'key escape','library','libraryfilter 1','wait 600','assertlibrary Fieldnotes | Fieldnotes','shot kept',
             'orrery','wait 600','shot workspace']
    shot = a.out/'capture.shot'; shot.write_text('\n'.join(steps)+'\n')
    env = dict({k:v for k,v in os.environ.items() if not k.startswith('NUS_')},
               NUS_SHOT=str(shot.resolve()),NUS_SHOT_DIR=str(a.out.resolve()),
               NUS_SHOT_OUT=str((a.out/'masters').resolve()),NUS_SHOT_SIZE='1280x850',
               NUS_MODE='paper',NUS_SOFTWARE_PAINT='1',NUS_CEF_LOG=str((a.out/'chromium.log').resolve()),SHELL='/bin/zsh',ZDOTDIR=str(shell.resolve()),NUS_HOLD='/nonexistent')
    try:
        with (a.out/'capture.log').open('w') as log:
            result = subprocess.run([str(exe),'-ApplePersistenceIgnoreState','YES','-NSQuitAlwaysKeepsWindows','NO'],cwd=project,env=env,stdout=log,stderr=subprocess.STDOUT,timeout=90)
        log = (a.out/'capture.log').read_text()
        assert result.returncode == 0 and not any(x in log for x in ('panicked','unknown step','never came')), log[-4000:]
        captures=[]
        for name in ('shell','split','find','kept','workspace'):
            master=a.out/'masters'/f'{name}-paper.png'
            assert master.exists(), master
            output=ROOT/'assets/review'/f'{name}.png'
            shutil.copyfile(master,output)
            captures.append({'name':name,'file':output.name,'sha256':sha(output.read_bytes()),'master_sha256':sha(master.read_bytes())})
        record={'schema':1,'recorded_at':evidence['checked_at'],'tag':manifest['version'],'revision':manifest['revision'],
                'platform':'macOS / Apple silicon','archive':package['name'],'archive_sha256':archive_hash,
                'app_sha256':sha(exe.read_bytes()),'logical_size':[1280,850],'capture_pixels':[2560,1700],
                'method':'NUS_SHOT native renderer; Chromium software-paint upload; scripted local task; original PNGs with no retouching',
                'limits':'Disposable fixture and profile; onboarding skipped; reduced motion; NUS_SOFTWARE_PAINT=1. Stills demonstrate UI state, not timing, default accelerated rendering, full event-pump acceptance or cross-platform parity.',
                'captures':captures}
        (ROOT/'assets/review/walkthrough.json').write_text(json.dumps(record,indent=2)+'\n')
        print('Captured published build:', manifest['version'], 'Masters and logs:', a.out)
    finally:
        marker=profile/'.vault-id'
        if marker.exists():
            subprocess.run(['/usr/bin/security','delete-generic-password','-s','dev.nus.local-state.v1','-a',marker.read_text().strip()],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)

if __name__ == '__main__':
    main()
