import re 
new_message = message.decode('utf-8', errors='ignore') 
new_message = re.sub(r'\n*Co-Authored-By:\s*Claude[\n]*', '', new_message, flags=re.IGNORECASE) 
new_message = re.sub(r'\n*.*Generated with.*Claude[\n]*', '', new_message, flags=re.IGNORECASE) 
new_message = re.sub(r'\n*.*claude\.ai[\n]*', '', new_message, flags=re.IGNORECASE) 
new_message = re.sub(r'\n*??.*', '', new_message) 
return new_message.encode('utf-8')
