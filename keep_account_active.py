import json
import subprocess

def main():
    with open("datanode.config") as config_file:
        config = json.load(config_file)
        datanodes = config["datanodes"]
        for node in datanodes:
            email = node["email"].strip()
            password = node["password"].strip()

            # login
            login = subprocess.run(
                [
                    "megatools",
                    "ls",
                    "-u",
                    email,
                    "-p",
                    password,
                ],
                universal_newlines=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            if "/Root" in login.stdout:
                print("Logged In", email)
            else:
                print("Error", email)

if __name__ == "__main__":
    main()