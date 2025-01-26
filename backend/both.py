import subprocess

subprocess.Popen(['start', 'cmd', '/k', 'python backend/app.py'], shell=True)
subprocess.Popen(['start', 'cmd', '/k', 'python backend/websocket.py'], shell=True)
