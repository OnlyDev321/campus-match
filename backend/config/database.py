import os
import pymysql
from dotenv import load_dotenv

# Load env variables from .env file
load_dotenv()

# read infomation config from file .env
DB_HOST = os.getenv('DB_HOST')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_NAME = os.getenv('DB_NAME')

# function to create and teturn MySQL connection
def get_db_connection():
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            cursorclass=pymysql.cursors.DictCursor,
            # cursorclass này cực kỳ quan trọng: giúp kết quả trả về dạng dictionary {"id": 1, "title": "React"}
            # thay vì dạng tuple (1, "React"), để bạn trả về JSON cho Frontend rất dễ dàng.
            autocommit=True
        )
        return connection
    except pymysql.Error as e:
        print(f"Error connecting to MySQL database: {e}")
        return None
        
if __name__ == "__main__":
    conn = get_db_connection()
    if conn:
        print("Connect MYSQL successfully!")
        conn.close()
    