import csv
from faker import Faker
import random
import os
import string

# Initialize Faker
fake = Faker()
Faker.seed(42)  # For reproducible results

# Define constants
OUTPUT_DIR = 'data'
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'aims_users.csv')
COMMON_PASSWORD = "Admin123!"
TOTAL_USERS = 30  # 30 users as requested
MIN_USERNAME_LENGTH = 8  # Minimum username length

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Create a list to store user data
users = []

# Function to generate random string of specified length
def generate_random_string(length):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

# Function to generate a unique email
def generate_unique_email(used_emails, first_name, last_name):
    email = f"{first_name.lower()}.{last_name.lower()}@example.com"
    if email in used_emails:
        email = f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 999)}@example.com"
    return email

# Function to generate a unique username with minimum length
def generate_unique_username(used_usernames, first_name, last_name):
    # Create base username using first initial and last name
    base_username = f"{first_name[0].lower()}{last_name.lower()}"
    
    # If too short, add more from first name
    if len(base_username) < MIN_USERNAME_LENGTH and len(first_name) > 1:
        chars_to_add = min(len(first_name) - 1, MIN_USERNAME_LENGTH - len(base_username))
        base_username = f"{first_name[:chars_to_add+1].lower()}{last_name.lower()}"
    
    # If still too short, add random characters
    if len(base_username) < MIN_USERNAME_LENGTH:
        additional_chars = generate_random_string(MIN_USERNAME_LENGTH - len(base_username))
        base_username = f"{base_username}{additional_chars}"
    
    # Ensure uniqueness
    username = base_username
    if username in used_usernames:
        # Add a random number suffix
        username = f"{base_username}{random.randint(100, 999)}"
        
        # If still too short (unlikely at this point), add more random characters
        if len(username) < MIN_USERNAME_LENGTH:
            additional_chars = generate_random_string(MIN_USERNAME_LENGTH - len(username))
            username = f"{username}{additional_chars}"
    
    return username

# Track used emails and usernames to avoid duplicates
used_emails = set()
used_usernames = set()

# Add admin_user to used usernames since it already exists
used_usernames.add('admin_user')

# Create users
for i in range(TOTAL_USERS):
    first_name = fake.first_name()
    last_name = fake.last_name()
    
    username = generate_unique_username(used_usernames, first_name, last_name)
    
    # Double-check length and add random chars if needed (defensive programming)
    if len(username) < MIN_USERNAME_LENGTH:
        username += generate_random_string(MIN_USERNAME_LENGTH - len(username))
    
    email = generate_unique_email(used_emails, first_name, last_name)
    phone = fake.phone_number()
    address = fake.address().replace('\n', ', ')
    
    # All users will be CUSTOMER role
    role = 'CUSTOMER'
    
    users.append({
        'username': username,
        'password': COMMON_PASSWORD,
        'email': email,
        'first_name': first_name,
        'last_name': last_name,
        'role': role,
        'phone': phone,
        'address': address
    })
    
    used_emails.add(email)
    used_usernames.add(username)

# Write data to CSV
with open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as csvfile:
    fieldnames = ['username', 'password', 'email', 'first_name', 'last_name', 'role', 'phone', 'address']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    
    writer.writeheader()
    for user in users:
        writer.writerow(user)

print(f"Successfully generated {TOTAL_USERS} users")
print(f"Data saved to {OUTPUT_FILE}")