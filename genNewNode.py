import json
import requests
import subprocess
import time
import re
import random
import string
import sys
import argparse

PASSWORD = "testpassword"

def find_url(string):
    regex = r"(?i)\b((?:https?://|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'\".,<>?«»“”‘’]))"
    url = re.findall(regex, string)
    return [x[0] for x in url]

class MegaAccount:
    def __init__(self, name, password):
        self.name = name
        self.password = password

    def register(self):
        mail_req = requests.get(
            "https://api.guerrillamail.com/ajax.php?f=get_email_address&lang=en"
        ).json()
        self.email = mail_req["email_addr"]
        self.email_token = mail_req["sid_token"]

        # begin registration
        registration = subprocess.run(
            [
                "megatools",
                "reg",
                "--scripted",
                "--register",
                "--email",
                self.email,
                "--name",
                self.name,
                "--password",
                self.password,
            ],
            universal_newlines=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

        self.verify_command = registration.stdout

    def verify(self, addToDataNodes=False):
        # check if there is mail
        mail_id = None
        for i in range(5):
            if mail_id is not None:
                break
            time.sleep(10)
            check_mail = requests.get(
                f"https://api.guerrillamail.com/ajax.php?f=get_email_list&offset=0&sid_token={self.email_token}"
            ).json()
            for email in check_mail["list"]:
                if "MEGA" in email["mail_subject"]:
                    mail_id = email["mail_id"]
                    break

        # get verification link
        if mail_id is None:
            return
        view_mail = requests.get(
            f"https://api.guerrillamail.com/ajax.php?f=fetch_email&email_id={mail_id}&sid_token={self.email_token}"
        )
        mail_body = view_mail.json()["mail_body"]
        links = find_url(mail_body)

        self.verify_command = str(self.verify_command).replace("@LINK@", links[2])

        # perform verification
        verification = subprocess.run(
            self.verify_command,
            shell=True,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
        )
        if "registered successfully!" in str(verification.stdout):
            print("Success. Account details:")
            print(f"{self.email} - {self.password}")

            # Update datanode.config if addToDataNodes is True
            if addToDataNodes:
                try:
                    with open("datanode.config", "r+") as f:
                        data = json.load(f)
                        datanodes = data.get('datanodes', [])

                        # Append the new object to the datanodes array
                        datanodes.append({
                            "email": self.email,
                            "password": self.password
                        })

                        # Reset file pointer to beginning and rewrite the file
                        f.seek(0)
                        json.dump(data, f, indent=4)
                        f.truncate()

                except FileNotFoundError:
                    sys.stderr.write("Error: datanode.config file not found.\n")
                except Exception as e:
                    sys.stderr.write(f"Error: {e}\n")

        else:
            sys.stderr.write("Verification failed.\n")


def new_account(addToDataNodes=False):
    name = "".join(random.choice(string.ascii_letters) for x in range(12))
    acc = MegaAccount(name, PASSWORD)
    acc.register()
    print("Registered. Waiting for verification email...")
    acc.verify(addToDataNodes)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Register a new Mega account.')
    parser.add_argument('--addToDataNodes', action='store_true', help='Add the account details to datanode.config')
    args = parser.parse_args()
    new_account(args.addToDataNodes)
