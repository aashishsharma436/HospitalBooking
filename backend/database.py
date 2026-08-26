import mysql.connector

def get_db_connection():
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Anshul@123",
        database="hospital_saas"
    )

    return connection
