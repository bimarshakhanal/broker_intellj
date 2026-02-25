import os
from typing import Dict

from google.adk.agents import Agent
from google.genai import types
from neo4j import GraphDatabase

# Neo4j connection details
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASS = os.getenv("NEO4J_PASSWORD", "")
MODEL = os.getenv("MODEL", "gemini-2.5-flash")

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASS))


async def get_person_details_from_neo4j(person_name: str) -> Dict:
    """
    Fetch details of a broker (Person node) from Neo4j.
    Returns all properties stored in the Person node.
    """
    query = """
    MATCH (p:Person)
    WHERE p.name = $name
    RETURN p
    """

    with driver.session() as session:
        result = session.run(query, name=person_name)
        record = result.single()
        if not record:
            return {"broker": None}

        person_node = record["p"]
        # convert Node properties to dict
        return {"broker": dict(person_node)}


def fetch_broker_deals(broker_url: str):
    """
    Returns a list of deals a broker is involved in with all relevant info
    """
    query = """
    MATCH (p:Person {url: $broker_url})-[pi:PARTICIPATED_IN]->(d:Deal)
  OPTIONAL MATCH (d)-[:INVOLVES]->(prop:Property)
    OPTIONAL MATCH (p)-[:WORKS_FOR]->(org:Organization)
    RETURN d, pi.role AS deal_role,
           prop.address AS property_address, prop.url AS property_url,
           org.name AS organization_name, org.url AS organization_url, org.type as organization_type
    ORDER BY d.date DESC
    """
    with driver.session() as session:
        result = session.run(query, broker_url=broker_url)
        deals = []
        for record in result:
            deals.append({
                "deal_info": dict(record["d"]),
                "property_address": record["property_address"],
                "property_url": record["property_url"],
                "organization_name": record["organization_name"],
                "organization_url": record["organization_url"],
                "organization_type": record["organization_type"]
            })
    return (deals)


def fetch_broker_organizations(broker_url: str) -> Dict:
    query = """
    MATCH (p:Person {url: $broker_url})-[:WORKS_FOR]->(org:Organization)
    RETURN org.name AS name, org.type AS type, org.url AS url
    """
    with driver.session() as session:
        result = session.run(query, broker_url=broker_url)
        organizations = []
        for record in result:
            organizations.append({
                "name": record["name"],
                "type": record["type"],
                "url": record["url"]
            })
    return organizations


def fetch_broker_locations(broker_url: str) -> Dict:
    query = """
    MATCH (p:Person {url: $broker_url})-[:PARTICIPATED_IN]->(d:Deal)-[:INVOLVES]->(prop:Property)
    WHERE prop.address IS NOT NULL
    RETURN DISTINCT prop.address AS location
    """
    with driver.session() as session:
        result = session.run(query, broker_url=broker_url)
        locations = [record["location"] for record in result]
    return locations


broker_query_agent = Agent(
    name="broker_query_agent",
    model=MODEL,
    description="Fetches broker information from Neo4j graph database.",
    instruction="""
    You are a Broker Query Agent.

    Your task:

    1. Receive broker names from Root Agent or Broker Extraction Agent.
    2. **ALWAYS** call `get_person_details_from_neo4j` first with the broker name to fetch basic properties of the Person node.
    3. Extract the broker's URL (url field) from the result.
    4. **THEN** call the following tools sequentially using the extracted broker URL:
       - `fetch_broker_deals` to get all deals the broker participated in
       - `fetch_broker_organizations` to get all organizations the broker is associated with
       - `fetch_broker_locations` to get all property locations involved in deals
    5. **You MUST call all four tools in sequence** for every broker queried. Do not skip any tool.
    6. Do NOT add, modify or hallucinate data. Only use data returned by the tools.
    7. If broker not found in first query: Inform the user that no information was found for the broker in natural language. Do NOT call the remaining tools.
    8. Present the information in a clear and concise manner, using bullet points or headings if necessary for readability.
    9. **Follow this format strictly when broker information is found:**
    ```
    ## Broker Profile: **John Doe**  
    **Title:** President and CEO at Rent Busy  
    **Profile:** [View Details](/people/john-doe)  

    ---

    ### 🏢 Organizations
    John is affiliated with the following organizations, reflecting his professional network and deal collaborations:  
    - **Rent Busy**  
    - **CBRE**  
    - **Faropoint**  

    ---

    ### 📊 Deal Highlights
    **Recent Deals:**  
    - Sale of **123 Main Street** for **$5.2M** – Role: Seller  
    - Lease of **45 Park Avenue** – Role: Seller  
    - Acquisition of **78 Oak Road** – Role: Seller  

    **Most Frequent Deal Partners:** CBRE, Faropoint  

    ---

    ### 📍 Locations
    The majority of John's deals are concentrated in:  
    - New York, NY  
    - New Jersey, NJ  

    ---

    ### 📝 Summary
    John has been actively involved in high-value real estate transactions, primarily serving as a seller. His deal activity shows a strong presence in the New York/New Jersey market and frequent collaboration with prominent organizations like CBRE and Faropoint.

    ```
    * Strictly follow the output samples above and include all relevant details from all tool results in this format. You can use markdown formatting for better readability.
    * Lenght of the response should depend on the amount of information found, but always aim to be concise and informative.
    * Do not response with anything other than
""",
    tools=[
        get_person_details_from_neo4j,
        fetch_broker_deals,
        fetch_broker_organizations,
        fetch_broker_locations,
    ],
    generate_content_config=types.GenerateContentConfig(
        temperature=0.1
    )
)
