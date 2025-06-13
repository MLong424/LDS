import csv
import psycopg2
from psycopg2.extras import RealDictCursor
import argparse
import os
import re

class MediaImporter:
    def __init__(self, db_config):
        self.conn = psycopg2.connect(**db_config)
        
    def import_books(self, products_csv, details_csv):
        """Import books from CSV files into the database"""
        print(f"\nImporting books from {products_csv} and {details_csv}...")
        successful = 0
        failed = 0
        
        try:
            # Import product base data
            with open(products_csv, 'r', newline='', encoding='utf-8') as file:
                products_reader = csv.DictReader(file)
                
                for product_row in products_reader:
                    try:
                        # Begin transaction
                        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
                            # Insert into products table
                            cur.execute(
                                """
                                INSERT INTO products (
                                    title, barcode, base_value, current_price, stock, 
                                    media_type, product_description, dimensions, weight, 
                                    warehouse_entry_date
                                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                                RETURNING id
                                """,
                                (
                                    product_row['title'],
                                    product_row['barcode'],
                                    float(product_row['base_value']),
                                    float(product_row['current_price']),
                                    int(product_row['stock']),
                                    'BOOK',
                                    product_row['product_description'],
                                    product_row['dimensions'],
                                    float(product_row['weight']),
                                    product_row['warehouse_entry_date']
                                )
                            )
                            
                            product_id = cur.fetchone()['id']
                            
                            # Find corresponding book details
                            with open(details_csv, 'r', newline='', encoding='utf-8') as details_file:
                                details_reader = csv.DictReader(details_file)
                                for detail_row in details_reader:
                                    if int(detail_row['product_id']) == (successful + 1):  # Match by position
                                        # Convert string array format "{item1,item2}" to actual PostgreSQL array
                                        authors_str = detail_row['authors']
                                        authors = self._parse_array(authors_str)
                                        
                                        # Insert into books table
                                        cur.execute(
                                            """
                                            INSERT INTO books (
                                                product_id, authors, cover_type, publisher, 
                                                publication_date, pages, language, genre
                                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                                            """,
                                            (
                                                product_id,
                                                authors,
                                                detail_row['cover_type'],
                                                detail_row['publisher'],
                                                detail_row['publication_date'],
                                                int(detail_row['pages']),
                                                detail_row['language'],
                                                detail_row['genre']
                                            )
                                        )
                                        break
                            
                            # Add to edit history
                            cur.execute(
                                """
                                INSERT INTO product_edit_history (
                                    product_id, operation_type, changed_by, operation_details
                                ) VALUES (%s, %s, %s, %s)
                                """,
                                (
                                    product_id,
                                    'ADD',
                                    '00000000-0000-0000-0000-000000000000',  # System ID for import
                                    '{"source": "data_import", "media_type": "BOOK"}'
                                )
                            )
                            
                            self.conn.commit()
                            successful += 1
                            print(f"Successfully imported book: {product_row['title']}")
                            
                    except Exception as e:
                        self.conn.rollback()
                        failed += 1
                        print(f"Error importing book {product_row.get('title', 'unknown')}: {str(e)}")
                        
            print(f"Book import complete: {successful} books imported successfully, {failed} failed")
            
        except Exception as e:
            print(f"Error opening or reading CSV files: {str(e)}")

    def import_cds(self, products_csv, details_csv):
        """Import CDs from CSV files into the database"""
        print(f"\nImporting CDs from {products_csv} and {details_csv}...")
        successful = 0
        failed = 0
        
        try:
            # Import product base data
            with open(products_csv, 'r', newline='', encoding='utf-8') as file:
                products_reader = csv.DictReader(file)
                
                for product_row in products_reader:
                    try:
                        # Begin transaction
                        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
                            # Insert into products table
                            cur.execute(
                                """
                                INSERT INTO products (
                                    title, barcode, base_value, current_price, stock, 
                                    media_type, product_description, dimensions, weight, 
                                    warehouse_entry_date
                                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                                RETURNING id
                                """,
                                (
                                    product_row['title'],
                                    product_row['barcode'],
                                    float(product_row['base_value']),
                                    float(product_row['current_price']),
                                    int(product_row['stock']),
                                    'CD',
                                    product_row['product_description'],
                                    product_row['dimensions'],
                                    float(product_row['weight']),
                                    product_row['warehouse_entry_date']
                                )
                            )
                            
                            product_id = cur.fetchone()['id']
                            
                            # Find corresponding CD details
                            with open(details_csv, 'r', newline='', encoding='utf-8') as details_file:
                                details_reader = csv.DictReader(details_file)
                                for detail_row in details_reader:
                                    if int(detail_row['product_id']) == (successful + 1):  # Match by position
                                        # Convert string array formats to actual PostgreSQL arrays
                                        artists = self._parse_array(detail_row['artists'])
                                        tracklist = self._parse_array(detail_row['tracklist'])
                                        
                                        # Insert into cds table
                                        cur.execute(
                                            """
                                            INSERT INTO cds (
                                                product_id, artists, record_label, tracklist, 
                                                genre, release_date
                                            ) VALUES (%s, %s, %s, %s, %s, %s)
                                            """,
                                            (
                                                product_id,
                                                artists,
                                                detail_row['record_label'],
                                                tracklist,
                                                detail_row['genre'],
                                                detail_row['release_date']
                                            )
                                        )
                                        break
                            
                            # Add to edit history
                            cur.execute(
                                """
                                INSERT INTO product_edit_history (
                                    product_id, operation_type, changed_by, operation_details
                                ) VALUES (%s, %s, %s, %s)
                                """,
                                (
                                    product_id,
                                    'ADD',
                                    '00000000-0000-0000-0000-000000000000',  # System ID for import
                                    '{"source": "data_import", "media_type": "CD"}'
                                )
                            )
                            
                            self.conn.commit()
                            successful += 1
                            print(f"Successfully imported CD: {product_row['title']}")
                            
                    except Exception as e:
                        self.conn.rollback()
                        failed += 1
                        print(f"Error importing CD {product_row.get('title', 'unknown')}: {str(e)}")
                        
            print(f"CD import complete: {successful} CDs imported successfully, {failed} failed")
            
        except Exception as e:
            print(f"Error opening or reading CSV files: {str(e)}")

    def import_lps(self, products_csv, details_csv):
        """Import LP records from CSV files into the database"""
        print(f"\nImporting LP records from {products_csv} and {details_csv}...")
        successful = 0
        failed = 0
        
        try:
            # Import product base data
            with open(products_csv, 'r', newline='', encoding='utf-8') as file:
                products_reader = csv.DictReader(file)
                
                for product_row in products_reader:
                    try:
                        # Begin transaction
                        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
                            # Insert into products table
                            cur.execute(
                                """
                                INSERT INTO products (
                                    title, barcode, base_value, current_price, stock, 
                                    media_type, product_description, dimensions, weight, 
                                    warehouse_entry_date
                                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                                RETURNING id
                                """,
                                (
                                    product_row['title'],
                                    product_row['barcode'],
                                    float(product_row['base_value']),
                                    float(product_row['current_price']),
                                    int(product_row['stock']),
                                    'LP_RECORD',
                                    product_row['product_description'],
                                    product_row['dimensions'],
                                    float(product_row['weight']),
                                    product_row['warehouse_entry_date']
                                )
                            )
                            
                            product_id = cur.fetchone()['id']
                            
                            # Find corresponding LP details
                            with open(details_csv, 'r', newline='', encoding='utf-8') as details_file:
                                details_reader = csv.DictReader(details_file)
                                for detail_row in details_reader:
                                    if int(detail_row['product_id']) == (successful + 1):  # Match by position
                                        # Convert string array formats to actual PostgreSQL arrays
                                        artists = self._parse_array(detail_row['artists'])
                                        tracklist = self._parse_array(detail_row['tracklist'])
                                        
                                        # Insert into lp_records table
                                        cur.execute(
                                            """
                                            INSERT INTO lp_records (
                                                product_id, artists, record_label, tracklist, 
                                                genre, release_date
                                            ) VALUES (%s, %s, %s, %s, %s, %s)
                                            """,
                                            (
                                                product_id,
                                                artists,
                                                detail_row['record_label'],
                                                tracklist,
                                                detail_row['genre'],
                                                detail_row['release_date']
                                            )
                                        )
                                        break
                            
                            # Add to edit history
                            cur.execute(
                                """
                                INSERT INTO product_edit_history (
                                    product_id, operation_type, changed_by, operation_details
                                ) VALUES (%s, %s, %s, %s)
                                """,
                                (
                                    product_id,
                                    'ADD',
                                    '00000000-0000-0000-0000-000000000000',  # System ID for import
                                    '{"source": "data_import", "media_type": "LP_RECORD"}'
                                )
                            )
                            
                            self.conn.commit()
                            successful += 1
                            print(f"Successfully imported LP record: {product_row['title']}")
                            
                    except Exception as e:
                        self.conn.rollback()
                        failed += 1
                        print(f"Error importing LP record {product_row.get('title', 'unknown')}: {str(e)}")
                        
            print(f"LP record import complete: {successful} LP records imported successfully, {failed} failed")
            
        except Exception as e:
            print(f"Error opening or reading CSV files: {str(e)}")

    def import_dvds(self, products_csv, details_csv):
        """Import DVDs from CSV files into the database"""
        print(f"\nImporting DVDs from {products_csv} and {details_csv}...")
        successful = 0
        failed = 0
        
        try:
            # Import product base data
            with open(products_csv, 'r', newline='', encoding='utf-8') as file:
                products_reader = csv.DictReader(file)
                
                for product_row in products_reader:
                    try:
                        # Begin transaction
                        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
                            # Insert into products table
                            cur.execute(
                                """
                                INSERT INTO products (
                                    title, barcode, base_value, current_price, stock, 
                                    media_type, product_description, dimensions, weight, 
                                    warehouse_entry_date
                                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                                RETURNING id
                                """,
                                (
                                    product_row['title'],
                                    product_row['barcode'],
                                    float(product_row['base_value']),
                                    float(product_row['current_price']),
                                    int(product_row['stock']),
                                    'DVD',
                                    product_row['product_description'],
                                    product_row['dimensions'],
                                    float(product_row['weight']),
                                    product_row['warehouse_entry_date']
                                )
                            )
                            
                            product_id = cur.fetchone()['id']
                            
                            # Find corresponding DVD details
                            with open(details_csv, 'r', newline='', encoding='utf-8') as details_file:
                                details_reader = csv.DictReader(details_file)
                                for detail_row in details_reader:
                                    if int(detail_row['product_id']) == (successful + 1):  # Match by position
                                        # Convert string array format to actual PostgreSQL array
                                        subtitles = self._parse_array(detail_row['subtitles'])
                                        
                                        # Insert into dvds table
                                        cur.execute(
                                            """
                                            INSERT INTO dvds (
                                                product_id, disc_type, director, runtime,
                                                studio, language, subtitles, release_date, genre
                                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                                            """,
                                            (
                                                product_id,
                                                detail_row['disc_type'],
                                                detail_row['director'],
                                                int(detail_row['runtime']),
                                                detail_row['studio'],
                                                detail_row['language'],
                                                subtitles,
                                                detail_row['release_date'],
                                                detail_row['genre']
                                            )
                                        )
                                        break
                            
                            # Add to edit history
                            cur.execute(
                                """
                                INSERT INTO product_edit_history (
                                    product_id, operation_type, changed_by, operation_details
                                ) VALUES (%s, %s, %s, %s)
                                """,
                                (
                                    product_id,
                                    'ADD',
                                    '00000000-0000-0000-0000-000000000000',  # System ID for import
                                    '{"source": "data_import", "media_type": "DVD"}'
                                )
                            )
                            
                            self.conn.commit()
                            successful += 1
                            print(f"Successfully imported DVD: {product_row['title']}")
                            
                    except Exception as e:
                        self.conn.rollback()
                        failed += 1
                        print(f"Error importing DVD {product_row.get('title', 'unknown')}: {str(e)}")
                        
            print(f"DVD import complete: {successful} DVDs imported successfully, {failed} failed")
            
        except Exception as e:
            print(f"Error opening or reading CSV files: {str(e)}")

    def import_all_media(self, csv_dir):
        """Import all media types from a directory with CSV files"""
        print(f"\nImporting all media types from directory: {csv_dir}")
        
        # Import books
        books_products = os.path.join(csv_dir, 'books_products.csv')
        books_details = os.path.join(csv_dir, 'books_details.csv')
        if os.path.exists(books_products) and os.path.exists(books_details):
            self.import_books(books_products, books_details)
        else:
            print(f"Warning: Book CSV files not found in {csv_dir}")
        
        # Import CDs
        cds_products = os.path.join(csv_dir, 'cds_products.csv')
        cds_details = os.path.join(csv_dir, 'cds_details.csv')
        if os.path.exists(cds_products) and os.path.exists(cds_details):
            self.import_cds(cds_products, cds_details)
        else:
            print(f"Warning: CD CSV files not found in {csv_dir}")
        
        # Import LPs
        lps_products = os.path.join(csv_dir, 'lps_products.csv')
        lps_details = os.path.join(csv_dir, 'lps_details.csv')
        if os.path.exists(lps_products) and os.path.exists(lps_details):
            self.import_lps(lps_products, lps_details)
        else:
            print(f"Warning: LP CSV files not found in {csv_dir}")
        
        # Import DVDs
        dvds_products = os.path.join(csv_dir, 'dvds_products.csv')
        dvds_details = os.path.join(csv_dir, 'dvds_details.csv')
        if os.path.exists(dvds_products) and os.path.exists(dvds_details):
            self.import_dvds(dvds_products, dvds_details)
        else:
            print(f"Warning: DVD CSV files not found in {csv_dir}")
    
    def _parse_array(self, array_str):
        """Parse PostgreSQL array format from string"""
        if not array_str or not array_str.startswith('{') or not array_str.endswith('}'):
            return []
        
        # Remove the curly braces
        content = array_str[1:-1]
        
        # Split by commas, but respect quoted strings
        items = []
        if content:
            # Using regex to handle quoted elements with commas inside
            pattern = r'(?:[^,"]|"(?:\\.|[^"])*")+'
            items = [item.strip() for item in re.findall(pattern, content)]
            
            # Strip quotes if present
            items = [item[1:-1] if (item.startswith('"') and item.endswith('"')) else item for item in items]
        
        return items
    
    def close(self):
        """Close the database connection"""
        if self.conn is not None:
            self.conn.close()
            print("Database connection closed.")

def main():
    parser = argparse.ArgumentParser(description='Import media products from CSV files to AIMS database')
    parser.add_argument('--host', default='localhost', help='Database host')
    parser.add_argument('--port', type=int, default=5432, help='Database port')
    parser.add_argument('--dbname', default='aims', help='Database name')
    parser.add_argument('--user', default='postgres', help='Database user')
    parser.add_argument('--password', required=True, help='Database password')
    parser.add_argument('--csv-dir', default='data', help='Directory containing CSV files')
    parser.add_argument('--media-type', choices=['all', 'books', 'cds', 'lps', 'dvds'], default='all',
                        help='Specific media type to import (default: all)')
    
    args = parser.parse_args()
    
    db_config = {
        'host': args.host,
        'port': args.port,
        'dbname': args.dbname,
        'user': args.user,
        'password': args.password
    }
    
    try:
        importer = MediaImporter(db_config)
        print(f"Connected to database {args.dbname} at {args.host}")
        
        if args.media_type == 'all':
            importer.import_all_media(args.csv_dir)
        else:
            csv_dir = args.csv_dir
            if args.media_type == 'books':
                products_csv = os.path.join(csv_dir, 'books_products.csv')
                details_csv = os.path.join(csv_dir, 'books_details.csv')
                importer.import_books(products_csv, details_csv)
            elif args.media_type == 'cds':
                products_csv = os.path.join(csv_dir, 'cds_products.csv')
                details_csv = os.path.join(csv_dir, 'cds_details.csv')
                importer.import_cds(products_csv, details_csv)
            elif args.media_type == 'lps':
                products_csv = os.path.join(csv_dir, 'lps_products.csv')
                details_csv = os.path.join(csv_dir, 'lps_details.csv')
                importer.import_lps(products_csv, details_csv)
            elif args.media_type == 'dvds':
                products_csv = os.path.join(csv_dir, 'dvds_products.csv')
                details_csv = os.path.join(csv_dir, 'dvds_details.csv')
                importer.import_dvds(products_csv, details_csv)
        
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        if 'importer' in locals():
            importer.close()

if __name__ == "__main__":
    main()