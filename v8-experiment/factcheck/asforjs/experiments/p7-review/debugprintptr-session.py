# Drive `d8 --allow-natives-syntax --shell dsum.js`: %DebugPrint(doSum), take the
# bytecode / context addresses from the output, feed them to %DebugPrintPtr.
import subprocess, re, sys, time, os, fcntl
d8 = sys.argv[1]
p = subprocess.Popen([d8, '--allow-natives-syntax', '--shell', 'dsum.js'],
                     stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
fl = fcntl.fcntl(p.stdout, fcntl.F_GETFL); fcntl.fcntl(p.stdout, fcntl.F_SETFL, fl | os.O_NONBLOCK)
def read_until_prompt(timeout=30):
    buf = b''; t0 = time.time()
    while time.time() - t0 < timeout:
        try:
            chunk = p.stdout.read()
            if chunk: buf += chunk
        except BlockingIOError: pass
        if buf.endswith(b'd8> '): break
        time.sleep(0.05)
    return buf.decode(errors='replace')
def send(cmd):
    p.stdin.write((cmd + '\n').encode()); p.stdin.flush()
    out = read_until_prompt(); print('>>> ' + cmd); print(out); return out
read_until_prompt()
out = send('%DebugPrint(doSum)')
bc = re.search(r'- bytecode: (0x[0-9a-f]+)', out)
ctx = re.search(r'- context: (0x[0-9a-f]+)', out)
if bc: send('%DebugPrintPtr(' + bc.group(1) + ')')
if ctx: send('%DebugPrintPtr(' + ctx.group(1) + ')')
p.stdin.close(); p.wait()
