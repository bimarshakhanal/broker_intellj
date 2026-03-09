import json
from neo4j import GraphDatabase

# Neo4j connection details
URI = "bolt://localhost:7687"
USERNAME = "neo4j"
PASSWORD = "password"

driver = GraphDatabase.driver(URI, auth=(USERNAME, PASSWORD))

# ------------------------------
# Helper: clean a dictionary by removing keys with value "N/A"
# ------------------------------
def clean_dict(d):
    return {k: v for k, v in d.items() if k != "N/A"}

# ------------------------------
# Ingest Properties
# ------------------------------
def ingest_properties(tx, properties):
    for prop_url, prop_data in properties.items():
        props = clean_dict(prop_data)
        props['url'] = prop_url
        tx.run("""
            MERGE (p:Property {url: $url})
            SET p += $props
        """, url=prop_url, props=props)

# ------------------------------
# Ingest People
# ------------------------------
def ingest_people(tx, people):
    for person_url, person_data in people.items():
        props = clean_dict(person_data.get("basic_info", {}))
        props['url'] = person_url

        tx.run("""
            MERGE (p:Person {url: $url})
            SET p += $props
        """, url=person_url, props=props)

        # Deal relationships
        for deal_url in person_data.get("deal_urls", []):
            tx.run("""
                MERGE (d:Deal {url: $deal_url})
                MERGE (p:Person {url: $person_url})
                MERGE (p)-[:PARTICIPATED_IN]->(d)
            """, person_url=person_url, deal_url=deal_url)

        # Organizations
        for org in person_data.get("organization_details", []):
            org_props = clean_dict(org)
            org_props['url'] = org.get("url")
            tx.run("""
                MERGE (o:Organization {url: $url})
                SET o += $props
                MERGE (p:Person {url: $person_url})
                MERGE (p)-[:WORKS_FOR]->(o)
            """, url=org.get("url"), props=org_props, person_url=person_url)

        # Stories
        for story in person_data.get("story_details", []):
            story_props = clean_dict(story)
            story_props['url'] = story.get("url")
            tx.run("""
                MERGE (s:Story {url: $url})
                SET s += $props
                MERGE (p:Person {url: $person_url})
                MERGE (p)-[:MENTIONED_IN]->(s)
            """, url=story.get("url"), props=story_props, person_url=person_url)

# ------------------------------
# Ingest Deals
# ------------------------------
def ingest_deals(tx, deals):
    for deal_url, deal_data in deals.items():

        # Combine all properties from "info" and "details"
        props = clean_dict(deal_data.get("info", {}))
        props.update(clean_dict(deal_data.get("details", {})))
        props['url'] = deal_url

        # Create / Update Deal with all properties
        tx.run("""
            MERGE (d:Deal {url: $url})
            SET d += $props
        """, url=deal_url, props=props)

        # Involved Properties
        for prop_url in deal_data.get("involved_properties", []):
            tx.run("""
                MERGE (p:Property {url: $prop_url})
                MERGE (d:Deal {url: $deal_url})
                MERGE (d)-[:INVOLVES]->(p)
            """, prop_url=prop_url, deal_url=deal_url)

        # Involved People
        for person in deal_data.get("involved_people", []):
            person_props = clean_dict(person)
            person_props['url'] = person.get("url")
            tx.run("""
                MERGE (p:Person {url: $person_url})
                SET p += $props
                MERGE (d:Deal {url: $deal_url})
                MERGE (p)-[:PARTICIPATED_IN {role: $role}]->(d)
            """, person_url=person.get("url"), props=person_props, deal_url=deal_url, role=person.get("role"))

        # Involved Organizations
        for org in deal_data.get("involved_organizations", []):
            org_props = clean_dict(org)
            org_props['url'] = org.get("url")
            tx.run("""
                MERGE (o:Organization {url: $org_url})
                SET o += $props
                MERGE (d:Deal {url: $deal_url})
                MERGE (o)-[:PARTICIPATED_IN {role: $role}]->(d)
            """, org_url=org.get("url"), props=org_props, deal_url=deal_url, role=org.get("role"))

# ------------------------------
# Main Function
# ------------------------------

people_path = "../scrape_gen/data/persons.json"
deals_path = "../scrape_gen/data/deals.json"
properties_path = "../scrape_gen/data/properties.json"

if __name__ == "__main__":
    with driver.session() as session:
        # Load JSON files
        with open(properties_path) as f:
            properties = json.load(f)

        with open(people_path) as f:
            people = json.load(f)

        with open(deals_path) as f:
            deals = json.load(f)

        # Ingest
        session.execute_write(ingest_properties, properties)
        print("Properties ingested.")
        session.execute_write(ingest_people, people)
        print("People ingested.")
        session.execute_write(ingest_deals, deals)
        print("Deals ingested.")

    driver.close()
    print("Data ingestion complete!")
