import json
import csv
import random
import os
from datetime import datetime, timedelta

# Function to ensure directories exist
def ensure_dir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

# Function to generate a random barcode
def generate_barcode():
    return ''.join([str(random.randint(0, 9)) for _ in range(13)])

# Function to generate random base value VND
def generate_base_value():
    return round(random.uniform(10000, 500000), 2)

# Function to generate random current price (between 30% and 150% of base value) VND
def generate_current_price(base_value):
    factor = random.uniform(0.3, 1.5)
    return round(base_value * factor, -4)

# Function to generate random stock
def generate_stock():
    return random.randint(5, 500)

# Function to generate random dimensions
def generate_dimensions():
    return f"{random.randint(10, 30)}x{random.randint(10, 20)}x{random.randint(1, 5)} cm"

# Function to generate random weight
def generate_weight():
    return round(random.uniform(0.2, 2.0), 2)

# Function to generate a random date within the past year
def generate_date():
    days_ago = random.randint(1, 365)
    date = datetime.now() - timedelta(days=days_ago)
    return date.strftime('%Y-%m-%d')

# Function to clean strings for CSV
def clean_string(s):
    if s is None:
        return ""
    return str(s).replace('"', '""').replace("'", "''")

# Extract Books data
def extract_books(input_file, output_dir):
    with open(input_file, 'r', encoding='utf-8') as f:
        books_data = json.load(f)
    
    # Ensure output directory exists
    ensure_dir(output_dir)
    
    # Prepare products CSV
    with open(f"{output_dir}/books_products.csv", 'w', encoding='utf-8', newline='') as products_file:
        products_writer = csv.writer(products_file, quoting=csv.QUOTE_ALL)
        products_writer.writerow([
            'title', 'barcode', 'base_value', 'current_price', 'stock', 
            'media_type', 'product_description', 'dimensions', 'weight', 
            'warehouse_entry_date'
        ])
        
        # Prepare books CSV
        with open(f"{output_dir}/books_details.csv", 'w', encoding='utf-8', newline='') as books_file:
            books_writer = csv.writer(books_file, quoting=csv.QUOTE_ALL)
            books_writer.writerow([
                'product_id', 'authors', 'cover_type', 'publisher', 
                'publication_date', 'pages', 'language', 'genre'
            ])
            
            # Process each book (limit to 15)
            for index, book in enumerate(books_data['docs'][:15]):
                # Generate product data
                base_value = generate_base_value()
                current_price = generate_current_price(base_value)
                
                # Write to products CSV
                products_writer.writerow([
                    clean_string(book.get('title', 'Unknown Title')),
                    generate_barcode(),
                    base_value,
                    current_price,
                    generate_stock(),
                    'BOOK',
                    'New condition, direct from publisher',
                    generate_dimensions(),
                    generate_weight(),
                    generate_date()
                ])
                
                # Get author and handle cases where it's missing
                authors = book.get('author_name', ['Unknown Author'])
                author = clean_string(authors[0]) if authors else 'Unknown Author'
                
                # Get language and handle cases where it's missing
                languages = book.get('language', ['eng'])
                language = languages[0] if languages else 'eng'
                
                # Write to books CSV
                books_writer.writerow([
                    index + 1,  # This will be the product_id
                    f"{{{author}}}",  # PostgreSQL array format
                    random.choice(['PAPERBACK', 'HARDCOVER']),
                    'Open Library Press',
                    f"{book.get('first_publish_year', 2000)}-01-01",
                    random.randint(100, 600),
                    language,
                    'Fiction'
                ])
    
    print(f"Extracted {min(len(books_data['docs']), 15)} books to CSV files")

# Extract CDs data
def extract_cds(input_file, output_dir):
    with open(input_file, 'r', encoding='utf-8') as f:
        cds_data = json.load(f)
    
    # Ensure output directory exists
    ensure_dir(output_dir)
    
    # Prepare products CSV
    with open(f"{output_dir}/cds_products.csv", 'w', encoding='utf-8', newline='') as products_file:
        products_writer = csv.writer(products_file, quoting=csv.QUOTE_ALL)
        products_writer.writerow([
            'title', 'barcode', 'base_value', 'current_price', 'stock', 
            'media_type', 'product_description', 'dimensions', 'weight', 
            'warehouse_entry_date'
        ])
        
        # Prepare CDs CSV
        with open(f"{output_dir}/cds_details.csv", 'w', encoding='utf-8', newline='') as cds_file:
            cds_writer = csv.writer(cds_file, quoting=csv.QUOTE_ALL)
            cds_writer.writerow([
                'product_id', 'artists', 'record_label', 'tracklist', 
                'genre', 'release_date'
            ])
            
            # Process each CD (limit to 15)
            for index, cd in enumerate(cds_data['releases'][:15]):
                # Generate product data
                base_value = generate_base_value()
                current_price = generate_current_price(base_value)
                
                # Extract barcode if available, otherwise generate one
                barcode = cd.get('barcode', generate_barcode())
                if not barcode or barcode.strip() == '':
                    barcode = generate_barcode()
                
                # Write to products CSV
                products_writer.writerow([
                    clean_string(cd.get('title', 'Unknown Title')),
                    barcode,
                    base_value,
                    current_price,
                    generate_stock(),
                    'CD',
                    'New sealed CD',
                    generate_dimensions(),
                    generate_weight(),
                    generate_date()
                ])
                
                # Get artist name
                artist_name = 'Unknown Artist'
                if 'artist-credit' in cd and cd['artist-credit']:
                    artist_name = clean_string(cd['artist-credit'][0].get('name', 'Unknown Artist'))
                
                # Get label name
                label_name = 'Unknown Label'
                if 'label-info' in cd and cd['label-info'] and len(cd['label-info']) > 0:
                    label_info = cd['label-info'][0]
                    if 'label' in label_info and 'name' in label_info['label']:
                        label_name = clean_string(label_info['label']['name'])
                
                # Generate tracklist
                tracklist = [f"Track {i+1}" for i in range(cd.get('track-count', 10))]
                
                # Get release date
                release_date = "2000-01-01"
                if 'date' in cd and cd['date']:
                    date_parts = cd['date'].split('-')
                    if len(date_parts) == 1 and date_parts[0]:  # Just year
                        release_date = f"{date_parts[0]}-01-01"
                    elif len(date_parts) >= 3:  # Full date
                        release_date = cd['date']
                    elif len(date_parts) == 2:  # Year and month
                        release_date = f"{cd['date']}-01"
                    elif not date_parts[0]:  # Empty date
                        release_date = "2000-01-01"
                
                # Write to CDs CSV
                cds_writer.writerow([
                    index + 1,  # This will be the product_id
                    f"{{{artist_name}}}",  # PostgreSQL array format
                    label_name,
                    f"{{{','.join(tracklist)}}}",  # PostgreSQL array format
                    'Rock',  # Default genre
                    release_date
                ])
    
    print(f"Extracted {min(len(cds_data['releases']), 15)} CDs to CSV files")

# Extract LPs data
def extract_lps(input_file, output_dir):
    with open(input_file, 'r', encoding='utf-8') as f:
        lps_data = json.load(f)
    
    # Ensure output directory exists
    ensure_dir(output_dir)
    
    # Prepare products CSV
    with open(f"{output_dir}/lps_products.csv", 'w', encoding='utf-8', newline='') as products_file:
        products_writer = csv.writer(products_file, quoting=csv.QUOTE_ALL)
        products_writer.writerow([
            'title', 'barcode', 'base_value', 'current_price', 'stock', 
            'media_type', 'product_description', 'dimensions', 'weight', 
            'warehouse_entry_date'
        ])
        
        # Prepare LPs CSV
        with open(f"{output_dir}/lps_details.csv", 'w', encoding='utf-8', newline='') as lps_file:
            lps_writer = csv.writer(lps_file, quoting=csv.QUOTE_ALL)
            lps_writer.writerow([
                'product_id', 'artists', 'record_label', 'tracklist', 
                'genre', 'release_date'
            ])
            
            # Process each LP (limit to 15)
            for index, lp in enumerate(lps_data['releases'][:15]):
                # Generate product data
                base_value = generate_base_value()
                current_price = generate_current_price(base_value)
                
                # Extract barcode if available, otherwise generate one
                barcode = lp.get('barcode', generate_barcode())
                if not barcode or barcode.strip() == '':
                    barcode = generate_barcode()
                
                # Write to products CSV
                products_writer.writerow([
                    clean_string(lp.get('title', 'Unknown Title')),
                    barcode,
                    base_value,
                    current_price,
                    generate_stock(),
                    'LP_RECORD',
                    'Vinyl record in excellent condition',
                    generate_dimensions(),
                    generate_weight(),
                    generate_date()
                ])
                
                # Get artist name
                artist_name = 'Unknown Artist'
                if 'artist-credit' in lp and lp['artist-credit']:
                    artist_name = clean_string(lp['artist-credit'][0].get('name', 'Unknown Artist'))
                
                # Get label name
                label_name = 'Unknown Label'
                if 'label-info' in lp and lp['label-info'] and len(lp['label-info']) > 0:
                    label_info = lp['label-info'][0]
                    if 'label' in label_info and 'name' in label_info['label']:
                        label_name = clean_string(label_info['label']['name'])
                
                # Generate tracklist
                tracklist = [f"Track {i+1}" for i in range(lp.get('track-count', 10))]
                
                # Get release date
                release_date = "2000-01-01"
                if 'date' in lp and lp['date']:
                    date_parts = lp['date'].split('-')
                    if len(date_parts) == 1 and date_parts[0]:  # Just year
                        release_date = f"{date_parts[0]}-01-01"
                    elif len(date_parts) >= 3:  # Full date
                        release_date = lp['date']
                    elif len(date_parts) == 2:  # Year and month
                        release_date = f"{lp['date']}-01"
                    elif not date_parts[0]:  # Empty date
                        release_date = "2000-01-01"
                
                # Write to LPs CSV
                lps_writer.writerow([
                    index + 1,  # This will be the product_id
                    f"{{{artist_name}}}",  # PostgreSQL array format
                    label_name,
                    f"{{{','.join(tracklist)}}}",  # PostgreSQL array format
                    'Rock',  # Default genre
                    release_date
                ])
    
    print(f"Extracted {min(len(lps_data['releases']), 15)} LPs to CSV files")

# Extract DVDs data
def extract_dvds(input_file, output_dir):
    with open(input_file, 'r', encoding='utf-8') as f:
        dvds_data = json.load(f)
    
    # Ensure output directory exists
    ensure_dir(output_dir)
    
    # Prepare products CSV
    with open(f"{output_dir}/dvds_products.csv", 'w', encoding='utf-8', newline='') as products_file:
        products_writer = csv.writer(products_file, quoting=csv.QUOTE_ALL)
        products_writer.writerow([
            'title', 'barcode', 'base_value', 'current_price', 'stock', 
            'media_type', 'product_description', 'dimensions', 'weight', 
            'warehouse_entry_date'
        ])
        
        # Prepare DVDs CSV
        with open(f"{output_dir}/dvds_details.csv", 'w', encoding='utf-8', newline='') as dvds_file:
            dvds_writer = csv.writer(dvds_file, quoting=csv.QUOTE_ALL)
            dvds_writer.writerow([
                'product_id', 'disc_type', 'director', 'runtime', 
                'studio', 'language', 'subtitles', 'release_date', 'genre'
            ])
            
            # Process each DVD (limit to 15)
            for index, dvd in enumerate(dvds_data['results'][:15]):
                # Generate product data
                base_value = generate_base_value()
                current_price = generate_current_price(base_value)
                
                # Write to products CSV
                products_writer.writerow([
                    clean_string(dvd.get('title', 'Unknown Title')),
                    generate_barcode(),
                    base_value,
                    current_price,
                    generate_stock(),
                    'DVD',
                    'New sealed DVD, region free',
                    generate_dimensions(),
                    generate_weight(),
                    generate_date()
                ])
                
                # Extract release date
                release_date = "2000-01-01"
                if 'release_date' in dvd and dvd['release_date']:
                    release_date = dvd['release_date']
                
                # Extract genres
                genres = []
                if 'genre_ids' in dvd and dvd['genre_ids']:
                    # Map genre IDs to names (simplified version)
                    genre_map = {
                        28: 'Action', 
                        12: 'Adventure', 
                        16: 'Animation',
                        35: 'Comedy',
                        80: 'Crime',
                        99: 'Documentary',
                        18: 'Drama',
                        10751: 'Family',
                        14: 'Fantasy',
                        36: 'History',
                        27: 'Horror',
                        10402: 'Music',
                        9648: 'Mystery',
                        10749: 'Romance',
                        878: 'Science Fiction',
                        10770: 'TV Movie',
                        53: 'Thriller',
                        10752: 'War',
                        37: 'Western'
                    }
                    for genre_id in dvd['genre_ids']:
                        if genre_id in genre_map:
                            genres.append(genre_map[genre_id])
                
                if not genres:
                    genres = ['Drama']  # Default genre
                
                # Write to DVDs CSV
                dvds_writer.writerow([
                    index + 1,  # This will be the product_id
                    random.choice(['BLU_RAY', 'HD_DVD', 'STANDARD']),
                    'Various Directors',  # Missing from TMDB data
                    random.randint(90, 180),  # Runtime in minutes
                    'TMDB Studios',
                    dvd.get('original_language', 'eng'),
                    f"{{eng,fra,spa}}",  # PostgreSQL array format for subtitles
                    release_date,
                    genres[0]  # Just use the first genre
                ])
    
    print(f"Extracted {min(len(dvds_data['results']), 15)} DVDs to CSV files")

# Main function
def main():
    # Create output directory
    output_dir = "data"
    ensure_dir(output_dir)
    
    # Extract data for each media type
    extract_books('data/Books.json', output_dir)
    extract_cds('data/CDs.json', output_dir)
    extract_lps('data/LPs.json', output_dir)
    extract_dvds('data/DVDs.json', output_dir)
    
    print(f"All data extracted to {output_dir} directory")

if __name__ == "__main__":
    main()