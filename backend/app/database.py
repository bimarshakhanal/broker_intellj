from neo4j import GraphDatabase, Session
from app.config import settings
from typing import Optional


class Neo4jConnection:
    """Neo4j database connection handler"""
    
    _instance: Optional['Neo4jConnection'] = None
    _driver = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Neo4jConnection, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self._driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
        )
        self._initialized = True
    
    def get_session(self) -> Session:
        """Get a new database session"""
        return self._driver.session()
    
    def close(self):
        """Close the database connection"""
        if self._driver:
            self._driver.close()


# Singleton instance
db = Neo4jConnection()
