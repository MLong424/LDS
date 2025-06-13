import csv
import psycopg2
from psycopg2.extras import RealDictCursor
import argparse

class UserManager:
    def __init__(self, db_config):
        self.conn = psycopg2.connect(**db_config)
    
    def create_user(
        self,
        username,
        password,
        email,
        first_name,
        last_name,
        phone=None,
        address=None
    ):
        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Using register_user which creates a user with CUSTOMER role by default
                cur.execute(
                    """
                    SELECT register_user(
                        %s, %s, %s, %s, %s
                    )
                    """,
                    (username, password, email, first_name, last_name)
                )
                
                user_id = cur.fetchone()['register_user']
                print(f"Created user {username} with default CUSTOMER role")
                self.conn.commit()
                return user_id
                
        except psycopg2.Error as e:
            self.conn.rollback()
            print(f"Failed to create user {username}: {str(e)}")
            return None
    
    def import_users_from_csv(self, csv_file):
        successful = 0
        failed = 0
        
        try:
            with open(csv_file, 'r', newline='', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                
                for row in reader:
                    try:
                        # Ignore 'role' from CSV as we're using default CUSTOMER role
                        user_id = self.create_user(
                            username=row['username'],
                            password=row['password'],
                            email=row['email'],
                            first_name=row['first_name'],
                            last_name=row['last_name'],
                            phone=row.get('phone'),
                            address=row.get('address')
                        )
                        
                        if user_id:
                            successful += 1
                        else:
                            failed += 1
                            
                    except Exception as e:
                        failed += 1
                        self.conn.rollback()
                        print(f"Error importing user {row.get('username', 'unknown')}: {str(e)}")
            
            print(f"\nImport complete: {successful} users imported successfully, {failed} failed")
            
        except Exception as e:
            print(f"Error opening or reading CSV file: {str(e)}")
    
    def close(self):
        self.conn.close()

def main():
    parser = argparse.ArgumentParser(description='Import users from CSV to AIMS database')
    parser.add_argument('--host', default='localhost', help='Database host')
    parser.add_argument('--port', type=int, default=5432, help='Database port')
    parser.add_argument('--dbname', default='aims', help='Database name')
    parser.add_argument('--user', default='postgres', help='Database user')
    parser.add_argument('--password', required=True, help='Database password')
    parser.add_argument('--csv', default='data/aims_users.csv', help='CSV file with user data')
    
    args = parser.parse_args()
    
    db_config = {
        'host': args.host,
        'port': args.port,
        'dbname': args.dbname,
        'user': args.user,
        'password': args.password
    }
    
    try:
        manager = UserManager(db_config)
        print(f"Connected to database {args.dbname} at {args.host}")
        
        manager.import_users_from_csv(args.csv)
        
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        if 'manager' in locals():
            manager.close()

if __name__ == "__main__":
    main()