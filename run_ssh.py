import paramiko

host = 'tad-min.io.vn'
port = 4404
username = 'amin'
password = '0404dat'

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, port=port, username=username, password=password)
    
    stdin, stdout, stderr = ssh.exec_command("docker logs --tail 100 smashhub_api")
    print("STDOUT:\n", stdout.read().decode())
    print("STDERR:\n", stderr.read().decode())
except Exception as e:
    print("Exception:", e)
finally:
    ssh.close()
