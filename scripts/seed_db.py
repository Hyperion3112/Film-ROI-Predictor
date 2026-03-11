import sqlite3
import random
import datetime
import os

DB_PATH = 'film_data.db'

def create_tables(cursor):
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        genre TEXT NOT NULL,
        type TEXT NOT NULL -- 'Blockbuster' or 'Indie'
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS social_signals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        film_id INTEGER,
        date TEXT,
        sentiment_score REAL,
        mention_growth REAL,
        FOREIGN KEY (film_id) REFERENCES movies(id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS theatrical_kpis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        film_id INTEGER,
        date TEXT,
        per_screen_avg REAL,
        occupancy_rate REAL,
        box_office_decay REAL,
        FOREIGN KEY (film_id) REFERENCES movies(id)
    )
    ''')
    
    # Clear existing data
    cursor.execute('DELETE FROM theatrical_kpis')
    cursor.execute('DELETE FROM social_signals')
    cursor.execute('DELETE FROM movies')

def fetch_genres(api_key):
    import requests
    url = f"https://api.themoviedb.org/3/genre/movie/list?api_key={api_key}&language=en-US"
    response = requests.get(url)
    if response.status_code == 200:
        genres = response.json().get('genres', [])
        return {g['id']: g['name'] for g in genres}
    return {}

def fetch_tmdb_movies(api_key, pages=25):
    import requests
    movies = []
    # Fetch top 'pages' of currently playing or popular movies to get a good dataset (~500 movies)
    for page in range(1, pages + 1):
        url = f"https://api.themoviedb.org/3/movie/now_playing?api_key={api_key}&language=en-US&page={page}"
        response = requests.get(url)
        if response.status_code == 200:
            results = response.json().get('results', [])
            movies.extend(results)
            if page >= response.json().get('total_pages', 1):
                break
    return movies

def seed_data(cursor):
    api_key = "63df10aa2cc9b5120dd460c8a698bd1d"  # TMDB API Key from user
    print("Fetching real-time theatrical data from TMDB...")
    
    genre_map = fetch_genres(api_key)
    tmdb_movies = fetch_tmdb_movies(api_key)
    
    # Filter valid movies
    valid_movies = [m for m in tmdb_movies if m.get('title') and m.get('genre_ids')]
    
    # Sort by popularity to rough-guess Blockbuster vs Indie
    valid_movies.sort(key=lambda x: x.get('popularity', 0), reverse=True)
    
    movies = []
    movie_id = 1
    
    # Let's say top 20% are Blockbusters, rest are Indies
    num_blockbusters = max(1, len(valid_movies) // 5)
    
    for i, m in enumerate(valid_movies):
        title = m['title']
        genre_id = m['genre_ids'][0]
        genre = genre_map.get(genre_id, "Unknown")
        m_type = 'Blockbuster' if i < num_blockbusters else 'Indie'
        movies.append((movie_id, title, genre, m_type))
        movie_id += 1
        
    cursor.executemany("INSERT INTO movies (id, title, genre, type) VALUES (?, ?, ?, ?)", movies)
    print(f"Inserted {len(movies)} real-time movies into database.")

    today = datetime.date.today()
    dates = [(today - datetime.timedelta(days=d)).isoformat() for d in range(30, -1, -1)] + \
            [(today + datetime.timedelta(days=d)).isoformat() for d in range(1, 15)]
    
    social_data = []
    kpi_data = []
    
    for movie in movies:
        m_id = movie[0]
        m_type = movie[3]
        
        is_breakout = (m_type == 'Indie' and random.random() > 0.85)
        
        if m_type == 'Blockbuster':
            sentiment = random.uniform(60, 85)
            growth = random.uniform(-10, 5)
            psa = random.uniform(8000, 15000)
            occupancy = random.uniform(50, 85)
            decay = random.uniform(40, 60)
            
            # Daily change factors (gradual decline)
            s_drift = random.uniform(-0.3, 0.1)
            g_drift = random.uniform(-0.5, 0.1)
            p_drift = random.uniform(-150, -50)
            o_drift = random.uniform(-0.8, -0.2)
            d_drift = random.uniform(0.1, 0.5)
        else:
            sentiment = random.uniform(70, 95)
            growth = random.uniform(0, 10)
            psa = random.uniform(1500, 4500)
            occupancy = random.uniform(20, 45)
            decay = random.uniform(15, 30)
            
            if is_breakout:
                s_drift = random.uniform(0.1, 0.4)
                g_drift = random.uniform(0.5, 1.5)
                p_drift = random.uniform(50, 200)
                o_drift = random.uniform(0.5, 1.2)
                d_drift = random.uniform(-0.4, 0)
            else:
                s_drift = random.uniform(-0.1, 0.2)
                g_drift = random.uniform(-0.2, 0.3)
                p_drift = random.uniform(-20, 20)
                o_drift = random.uniform(-0.2, 0.2)
                d_drift = random.uniform(-0.1, 0.2)

        for i, d in enumerate(dates):
            # Apply drift but keep in safe, realistic bounds securely
            sentiment = max(10, min(100, sentiment + s_drift + random.uniform(-1, 1)))
            growth = max(-50, min(100, growth + g_drift + random.uniform(-1, 1)))
            psa = max(100, psa + p_drift + random.uniform(-100, 100))
            occupancy = max(5, min(100, occupancy + o_drift + random.uniform(-1, 1)))
            decay = max(0, min(90, decay + d_drift + random.uniform(-0.5, 0.5)))
            
            social_data.append((None, m_id, d, sentiment, growth))
            kpi_data.append((None, m_id, d, psa, occupancy, decay))

    cursor.executemany("INSERT INTO social_signals (id, film_id, date, sentiment_score, mention_growth) VALUES (?, ?, ?, ?, ?)", social_data)
    cursor.executemany("INSERT INTO theatrical_kpis (id, film_id, date, per_screen_avg, occupancy_rate, box_office_decay) VALUES (?, ?, ?, ?, ?, ?)", kpi_data)

def main():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("Creating tables...")
    create_tables(cursor)
    
    print("Seeding database with live TMDB data...")
    seed_data(cursor)
    
    conn.commit()
    conn.close()
    
    print(f"Database successfully generated at {DB_PATH}")

if __name__ == '__main__':
    main()
