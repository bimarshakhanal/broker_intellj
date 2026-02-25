from app.database import db
from app.models.schemas import (
    Person, PersonDetail, Deal, DealDetail,
    Organization, OrganizationDetail, Property, PropertyDetail,
    Participant, Story
)
from typing import Optional, Dict, Any
import re
from datetime import datetime


def parse_deal_url(url: str) -> Dict[str, str]:
    """Extract property address, date, and type from deal URL"""
    # URL pattern: /activity/ADDRESS-TYPE-MMDDYYYY-PARTIES
    if not url or '/activity/' not in url:
        return {'property': '', 'date': '', 'type': ''}
    
    parts = url.split('/activity/')[-1].split('-')
    if len(parts) < 3:
        return {'property': '', 'date': '', 'type': ''}
    
    # Find the transaction type (sale, lease, financing)
    trans_types = ['sale', 'lease', 'financing']
    trans_type = ''
    trans_idx = -1
    
    for i, part in enumerate(parts):
        if part.lower() in trans_types:
            trans_type = part.lower()
            trans_idx = i
            break
    
    if trans_idx == -1:
        return {'property': '', 'date': '', 'type': ''}
    
    # Property address is everything before the transaction type
    property_parts = parts[:trans_idx]
    property_addr = ' '.join(property_parts).replace('-', ' ').title()
    
    # Date is the part after transaction type (MMDDYYYY format)
    date_str = ''
    if trans_idx + 1 < len(parts):
        date_part = parts[trans_idx + 1]
        # Try to parse MMDDYYYY format
        if len(date_part) == 8 and date_part.isdigit():
            try:
                month = date_part[:2]
                day = date_part[2:4]
                year = date_part[4:]
                date_str = f"{year}-{month}-{day}"
            except:
                date_str = date_part
        else:
            date_str = date_part
    
    return {
        'property': property_addr,
        'date': date_str,
        'type': trans_type
    }


class PersonService:
    """Service for Person operations"""
    
    @staticmethod
    def get_all_people(page: int = 1, limit: int = 12) -> Dict[str, Any]:
        """Get paginated list of people"""
        session = db.get_session()
        try:
            skip = (page - 1) * limit
            
            # Get total count
            count_result = session.run("MATCH (p:Person) RETURN count(p) as total")
            total = count_result.single()['total']
            
            # Get paginated data
            query = f"""
            MATCH (p:Person)
            RETURN p as node
            SKIP {skip}
            LIMIT {limit}
            """
            result = session.run(query)
            
            people = []
            for record in result:
                node = record['node']
                person = Person(
                    _id=node.id,
                    name=node.get('name', ''),
                    title=node.get('title', ''),
                    role=node.get('role'),
                    url=node.get('url')
                )
                people.append(person)
            
            return {
                "data": people,
                "total": total,
                "page": page,
                "limit": limit
            }
        finally:
            session.close()
    
    @staticmethod
    def get_person_detail(person_url: str) -> Optional[PersonDetail]:
        """Get detailed information about a person by URL"""
        session = db.get_session()
        try:
            # Get person by URL
            person_result = session.run(
                "MATCH (p:Person) WHERE p.url = $url RETURN p as node",
                url=person_url
            )
            person_node = person_result.single()
            
            if not person_node:
                return None
            
            node = person_node['node']
            
            # Get deals (Person -[:PARTICIPATED_IN]-> Deal) with only necessary fields
            deals_result = session.run("""
                MATCH (p:Person)
                WHERE p.url = $url
                MATCH (p)-[r:PARTICIPATED_IN]->(d:Deal)
                OPTIONAL MATCH (d)-[:INVOLVES]->(pr:Property)
                RETURN d.url as url, d.property as property, d.date as date, 
                       d.type as type, r.role as role, pr.address as property_address,
                       id(d) as deal_id
            """, url=person_url)
            
            deals = []
            for record in deals_result:
                url = record.get('url', '')
                parsed = parse_deal_url(url)
                
                deal = Deal(
                    _id=record['deal_id'],
                    property=record.get('property') or parsed['property'],
                    url=url,
                    date=record.get('date') or parsed['date'],
                    type=record.get('type') or parsed['type'],
                    role=record.get('role'),
                    property_address=record.get('property_address')
                )
                deals.append(deal)
            
            # Get organizations (Person -[:WORKS_FOR]-> Organization)
            orgs_result = session.run("""
                MATCH (p:Person)-[r:WORKS_FOR]->(o:Organization)
                WHERE p.url = $url
                RETURN o as node, r.role as role
            """, url=person_url)
            
            organizations = []
            for record in orgs_result:
                org_node = record['node']
                org = Organization(
                    _id=org_node.id,
                    name=org_node.get('name'),
                    type=org_node.get('type'),
                    url=org_node.get('url'),
                    role=record['role']
                )
                organizations.append(org)
            
            # Get stories (Person -[:MENTIONED_IN]-> Story)
            stories_result = session.run("""
                MATCH (p:Person)-[:MENTIONED_IN]->(s:Story)
                WHERE p.url = $url
                RETURN s as node
            """, url=person_url)
            
            stories = []
            for record in stories_result:
                story_node = record['node']
                story = Story(
                    _id=story_node.id,
                    title=story_node.get('title'),
                    source=story_node.get('source'),
                    url=story_node.get('url')
                )
                stories.append(story)
            
            return PersonDetail(
                _id=node.id,
                name=node.get('name', ''),
                title=node.get('title'),
                email=node.get('email'),
                phone=node.get('phone'),
                bio=node.get('bio'),
                image=node.get('image'),
                deals=deals,
                organizations=organizations,
                stories=stories
            )
        finally:
            session.close()

    @staticmethod
    def get_people_with_recent_deals(limit: int = 20) -> list:
        """Get people with most recent deals"""
        session = db.get_session()
        try:
            query = f"""
            MATCH (p:Person)-[:PARTICIPATED_IN]->(d:Deal)
            WITH p, d
            ORDER BY d.date DESC
            WITH p, collect(d)[0] as latest_deal
            RETURN p as node
            LIMIT {limit}
            """
            result = session.run(query)
            
            people = []
            for record in result:
                node = record['node']
                person = Person(
                    _id=node.id,
                    name=node.get('name', ''),
                    title=node.get('title', ''),
                    role=node.get('role'),
                    url=node.get('url')
                )
                people.append(person)
            
            return people
        finally:
            session.close()


class DealService:
    """Service for Deal operations"""
    
    @staticmethod
    def get_all_deals(page: int = 1, limit: int = 12) -> Dict[str, Any]:
        """Get paginated list of deals ordered by most recent"""
        session = db.get_session()
        try:
            skip = (page - 1) * limit
            
            # Get total count
            count_result = session.run("MATCH (d:Deal) RETURN count(d) as total")
            total = count_result.single()['total']
            
            # Get paginated data ordered by date
            # Convert MM/DD/YYYY to YYYY-MM-DD for proper sorting
            query = f"""
            MATCH (d:Deal)
            WITH d,
                 CASE 
                     WHEN d.date IS NOT NULL AND d.date <> '' 
                     THEN substring(d.date, 6, 4) + '-' + substring(d.date, 0, 2) + '-' + substring(d.date, 3, 2)
                     ELSE '0000-00-00'
                 END as sort_date
            RETURN d as node
            ORDER BY sort_date DESC
            SKIP {skip}
            LIMIT {limit}
            """
            result = session.run(query)
            
            deals = []
            for record in result:
                node = record['node']
                url = node.get('url', '')
                parsed = parse_deal_url(url)
                
                deal = Deal(
                    _id=node.id,
                    property=node.get('property') or parsed['property'],
                    url=url,
                    date=node.get('date') or parsed['date'],
                    type=node.get('type') or parsed['type'],
                    price=node.get('price'),
                    square_feet=node.get('square feet')
                )
                deals.append(deal)
            
            return {
                "data": deals,
                "total": total,
                "page": page,
                "limit": limit
            }
        finally:
            session.close()

    @staticmethod
    def get_recent_deals(limit: int = 20) -> list:
        """Get recent deals"""
        session = db.get_session()
        try:
            # Convert MM/DD/YYYY to YYYY-MM-DD for proper sorting
            query = f"""
            MATCH (d:Deal)
            WITH d,
                 CASE 
                     WHEN d.date IS NOT NULL AND d.date <> '' 
                     THEN substring(d.date, 6, 4) + '-' + substring(d.date, 0, 2) + '-' + substring(d.date, 3, 2)
                     ELSE '0000-00-00'
                 END as sort_date
            RETURN d as node
            ORDER BY sort_date DESC
            LIMIT {limit}
            """
            result = session.run(query)
            
            deals = []
            for record in result:
                node = record['node']
                url = node.get('url', '')
                parsed = parse_deal_url(url)
                
                deal = Deal(
                    _id=node.id,
                    property=node.get('property') or parsed['property'],
                    url=url,
                    date=node.get('date') or parsed['date'],
                    type=node.get('type') or parsed['type'],
                    price=node.get('price'),
                    square_feet=node.get('square feet')
                )
                deals.append(deal)
            
            return deals
        finally:
            session.close()
    
    @staticmethod
    def get_deal_detail(deal_url: str) -> Optional[DealDetail]:
        """Get detailed information about a deal by URL"""
        session = db.get_session()
        try:
            # Get deal by URL
            deal_result = session.run(
                "MATCH (d:Deal) WHERE d.url = $url RETURN d as node",
                url=deal_url
            )
            deal_node = deal_result.single()
            
            if not deal_node:
                return None
            
            node = deal_node['node']
            
            # Get participants (Person/Organization -[:PARTICIPATED_IN]-> Deal)
            # Use COLLECT to handle multiple relationships and pick the one with a role
            participants_result = session.run("""
                MATCH (participant)-[r:PARTICIPATED_IN]->(d:Deal)
                WHERE d.url = $url
                WITH participant, labels(participant) as nodeType, COLLECT(r.role) as roles
                RETURN participant as node, nodeType, 
                       CASE 
                           WHEN ANY(role IN roles WHERE role IS NOT NULL) 
                           THEN [role IN roles WHERE role IS NOT NULL][0]
                           ELSE NULL
                       END as role
            """, url=deal_url)
            
            participants = []
            for record in participants_result:
                participant_node = record['node']
                node_type = 'Person' if 'Person' in record['nodeType'] else 'Organization'
                participant = Participant(
                    _id=participant_node.id,
                    name=participant_node.get('name', ''),
                    type=node_type,
                    role=record['role'],
                    url=participant_node.get('url')
                )
                participants.append(participant)
            
            # Get properties (Deal -[:INVOLVES]-> Property)
            props_result = session.run("""
                MATCH (d:Deal)-[:INVOLVES]->(pr:Property)
                WHERE d.url = $url
                RETURN pr as node
            """, url=deal_url)
            
            properties = []
            for record in props_result:
                prop_node = record['node']
                prop = Property(
                    _id=prop_node.id,
                    address=prop_node.get('address', ''),
                    url=prop_node.get('url', ''),
                    name=prop_node.get('name'),
                    type=prop_node.get('type'),
                    square_feet=prop_node.get('square feet'),
                    year_built=prop_node.get('year built'),
                    credifi_score=prop_node.get('credifi score')
                )
                properties.append(prop)
            
            # Get stories (Story -[:MENTIONED_IN]-> Deal or Deal -[:MENTIONED_IN]-> Story)
            stories_result = session.run("""
                MATCH (s:Story)-[:MENTIONED_IN]->(d:Deal)
                WHERE d.url = $url
                RETURN s as node
            """, url=deal_url)
            
            stories = []
            for record in stories_result:
                story_node = record['node']
                story = Story(
                    _id=story_node.id,
                    title=story_node.get('title', ''),
                    source=story_node.get('source', ''),
                    url=story_node.get('url', '')
                )
                stories.append(story)
            
            return DealDetail(
                _id=node.id,
                property=node.get('property', ''),
                url=node.get('url', ''),
                date=node.get('date', ''),
                price_per_square_foot=node.get('price per square foot'),
                floors=node.get('floors'),
                term_years=node.get('term years'),
                square_feet=node.get('square feet'),
                type=node.get('type'),
                acquirer_stake=node.get('acquirer stake'),
                price=node.get('price'),
                amount=node.get('amount'),
                financing_types=node.get('financing types'),
                interest_rate=node.get('interest rate'),
                structure=node.get('structure'),
                fixed_vs_floating=node.get('fixed vs floating'),
                participants=participants,
                properties=properties,
                stories=stories
            )
        finally:
            session.close()


class OrganizationService:
    """Service for Organization operations"""
    
    @staticmethod
    def get_all_organizations(page: int = 1, limit: int = 12) -> Dict[str, Any]:
        """Get paginated list of organizations"""
        session = db.get_session()
        try:
            skip = (page - 1) * limit
            
            # Get total count
            count_result = session.run("MATCH (o:Organization) RETURN count(o) as total")
            total = count_result.single()['total']
            
            # Get paginated data
            query = f"""
            MATCH (o:Organization)
            RETURN o as node
            SKIP {skip}
            LIMIT {limit}
            """
            result = session.run(query)
            
            organizations = []
            for record in result:
                node = record['node']
                organization = Organization(
                    _id=node.id,
                    name=node.get('name', ''),
                    type=node.get('type'),
                    url=node.get('url')
                )
                organizations.append(organization)
            
            return {
                "data": organizations,
                "total": total,
                "page": page,
                "limit": limit
            }
        finally:
            session.close()
    
    @staticmethod
    def get_recent_organizations(limit: int = 20) -> list:
        """Get recent organizations"""
        session = db.get_session()
        try:
            # Get organizations with recent deals
            query = f"""
            MATCH (o:Organization)-[r:PARTICIPATED_IN]->(d:Deal)
            RETURN DISTINCT o as node
            LIMIT {limit}
            """
            result = session.run(query)
            
            organizations = []
            for record in result:
                node = record['node']
                organization = Organization(
                    _id=node.id,
                    name=node.get('name', ''),
                    type=node.get('type'),
                    url=node.get('url')
                )
                organizations.append(organization)
            
            return organizations
        finally:
            session.close()
    
    @staticmethod
    def get_organization_detail(org_url: str) -> Optional[OrganizationDetail]:
        """Get detailed information about an organization by URL"""
        session = db.get_session()
        try:
            # Get organization by URL
            org_result = session.run(
                "MATCH (o:Organization) WHERE o.url = $url RETURN o as node",
                url=org_url
            )
            org_node = org_result.single()
            
            if not org_node:
                return None
            
            node = org_node['node']
            
            # Get members (Person -[:WORKS_FOR]-> Organization)
            members_result = session.run("""
                MATCH (p:Person)-[r:WORKS_FOR]->(o:Organization)
                WHERE o.url = $url
                RETURN p as node, r.role as role
            """, url=org_url)
            
            members = []
            for record in members_result:
                person_node = record['node']
                person = Person(
                    _id=person_node.id,
                    name=person_node.get('name', ''),
                    title=person_node.get('title', ''),
                    role=record['role'],
                    url=person_node.get('url')
                )
                members.append(person)
            
            # Get deals (Organization -[:PARTICIPATED_IN]-> Deal)
            deals_result = session.run("""
                MATCH (o:Organization)-[r:PARTICIPATED_IN]->(d:Deal)
                WHERE o.url = $url
                RETURN d as node, r.role as role
            """, url=org_url)
            
            deals = []
            for record in deals_result:
                deal_node = record['node']
                url = deal_node.get('url', '')
                parsed = parse_deal_url(url)
                
                deal = Deal(
                    _id=deal_node.id,
                    property=deal_node.get('property') or parsed['property'],
                    url=url,
                    date=deal_node.get('date') or parsed['date'],
                    price_per_square_foot=deal_node.get('price per square foot'),
                    floors=deal_node.get('floors'),
                    term_years=deal_node.get('term years'),
                    square_feet=deal_node.get('square feet'),
                    type=deal_node.get('type') or parsed['type'],
                    acquirer_stake=deal_node.get('acquirer stake'),
                    price=deal_node.get('price'),
                    amount=deal_node.get('amount'),
                    financing_types=deal_node.get('financing types'),
                    interest_rate=deal_node.get('interest rate'),
                    structure=deal_node.get('structure'),
                    fixed_vs_floating=deal_node.get('fixed vs floating'),
                    role=record.get('role')
                )
                deals.append(deal)
            
            # Get stories from all members (Organization <-[:WORKS_FOR]- Person -[:MENTIONED_IN]-> Story)
            stories_result = session.run("""
                MATCH (o:Organization)<-[:WORKS_FOR]-(p:Person)-[:MENTIONED_IN]->(s:Story)
                WHERE o.url = $url
                RETURN DISTINCT s as node
                ORDER BY s.date DESC
            """, url=org_url)
            
            stories = []
            for record in stories_result:
                story_node = record['node']
                story = Story(
                    _id=story_node.id,
                    title=story_node.get('title', ''),
                    source=story_node.get('source', ''),
                    url=story_node.get('url', '')
                )
                stories.append(story)
            
            return OrganizationDetail(
                _id=node.id,
                name=node.get('name'),
                type=node.get('type'),
                url=node.get('url'),
                role=node.get('role'),
                members=members,
                deals=deals,
                stories=stories
            )
        finally:
            session.close()


class PropertyService:
    """Service for Property operations"""
    
    @staticmethod
    def get_all_properties(page: int = 1, limit: int = 12) -> Dict[str, Any]:
        """Get paginated list of properties ordered by most recent deals"""
        session = db.get_session()
        try:
            skip = (page - 1) * limit
            
            # Get total count
            count_result = session.run("MATCH (pr:Property) RETURN count(pr) as total")
            total = count_result.single()['total']
            
            # Get paginated data ordered by most recent deal
            query = f"""
            MATCH (pr:Property)<-[:INVOLVES]-(d:Deal)
            WITH pr, max(d.date) as latest_date
            RETURN pr as node
            ORDER BY latest_date DESC
            SKIP {skip}
            LIMIT {limit}
            """
            result = session.run(query)
            
            properties = []
            for record in result:
                node = record['node']
                prop = Property(
                    _id=node.id,
                    address=node.get('address', ''),
                    url=node.get('url', ''),
                    name=node.get('name'),
                    type=node.get('type'),
                    square_feet=node.get('square feet')
                )
                properties.append(prop)
            
            return {
                "data": properties,
                "total": total,
                "page": page,
                "limit": limit
            }
        finally:
            session.close()

    @staticmethod
    def get_recent_properties(limit: int = 20) -> list:
        """Get recent properties (with most recent deals)"""
        session = db.get_session()
        try:
            query = f"""
            MATCH (pr:Property)<-[:INVOLVES]-(d:Deal)
            WITH pr, max(d.date) as latest_date
            RETURN pr as node
            ORDER BY latest_date DESC
            LIMIT {limit}
            """
            result = session.run(query)
            
            properties = []
            for record in result:
                node = record['node']
                prop = Property(
                    _id=node.id,
                    address=node.get('address', ''),
                    url=node.get('url', ''),
                    name=node.get('name'),
                    type=node.get('type'),
                    square_feet=node.get('square feet')
                )
                properties.append(prop)
            
            return properties
        finally:
            session.close()
    
    @staticmethod
    def get_property_detail(property_url: str) -> Optional[PropertyDetail]:
        """Get detailed information about a property by URL"""
        session = db.get_session()
        try:
            # Get property by URL
            prop_result = session.run(
                "MATCH (pr:Property) WHERE pr.url = $url RETURN pr as node",
                url=property_url
            )
            prop_node = prop_result.single()
            
            if not prop_node:
                return None
            
            node = prop_node['node']
            
            # Get deals (Deal -[:INVOLVES]-> Property)
            deals_result = session.run("""
                MATCH (d:Deal)-[:INVOLVES]->(pr:Property)
                WHERE pr.url = $url
                RETURN d as node
            """, url=property_url)
            
            deals = []
            for record in deals_result:
                deal_node = record['node']
                url = deal_node.get('url', '')
                parsed = parse_deal_url(url)
                
                deal = Deal(
                    _id=deal_node.id,
                    property=deal_node.get('property') or parsed['property'],
                    url=url,
                    date=deal_node.get('date') or parsed['date'],
                    price_per_square_foot=deal_node.get('price per square foot'),
                    floors=deal_node.get('floors'),
                    term_years=deal_node.get('term years'),
                    square_feet=deal_node.get('square feet'),
                    type=deal_node.get('type') or parsed['type'],
                    acquirer_stake=deal_node.get('acquirer stake'),
                    price=deal_node.get('price'),
                    amount=deal_node.get('amount'),
                    financing_types=deal_node.get('financing types'),
                    interest_rate=deal_node.get('interest rate'),
                    structure=deal_node.get('structure'),
                    fixed_vs_floating=deal_node.get('fixed vs floating')
                )
                deals.append(deal)
            
            # Get stories (Story -[:MENTIONED_IN]-> Property or Property -[:MENTIONED_IN]-> Story)
            stories_result = session.run("""
                MATCH (s:Story)-[:MENTIONED_IN]->(pr:Property)
                WHERE pr.url = $url
                RETURN s as node
            """, url=property_url)
            
            stories = []
            for record in stories_result:
                story_node = record['node']
                story = Story(
                    _id=story_node.id,
                    title=story_node.get('title', ''),
                    source=story_node.get('source', ''),
                    url=story_node.get('url', '')
                )
                stories.append(story)
            
            # Get participants (people and organizations) involved in deals with this property
            participants_result = session.run("""
                MATCH (participant)-[r:PARTICIPATED_IN]->(d:Deal)-[:INVOLVES]->(pr:Property)
                WHERE pr.url = $url
                WITH participant, labels(participant) as nodeType, COLLECT(DISTINCT r.role) as roles
                RETURN DISTINCT participant as node, nodeType,
                       CASE 
                           WHEN ANY(role IN roles WHERE role IS NOT NULL) 
                           THEN [role IN roles WHERE role IS NOT NULL][0]
                           ELSE NULL
                       END as role
            """, url=property_url)
            
            participants = []
            for record in participants_result:
                participant_node = record['node']
                node_type = record['nodeType']
                participant_type = node_type[0] if node_type else 'Unknown'
                
                participant = Participant(
                    _id=participant_node.id,
                    name=participant_node.get('name'),
                    type=participant_type,
                    role=record.get('role'),
                    url=participant_node.get('url')
                )
                participants.append(participant)
            
            return PropertyDetail(
                _id=node.id,
                address=node.get('address', ''),
                url=node.get('url', ''),
                name=node.get('name'),
                type=node.get('Type'),
                square_feet=node.get('Square Feet'),
                year_built=node.get('Year Built'),
                credifi_score=node.get('CrediFi Score'),
                deals=deals,
                stories=stories,
                participants=participants
            )
        finally:
            session.close()


class StoryService:
    """Service for Story operations"""
    
    @staticmethod
    def get_all_stories(page: int = 1, limit: int = 12) -> Dict[str, Any]:
        """Get paginated list of stories"""
        session = db.get_session()
        try:
            skip = (page - 1) * limit
            
            # Get total count
            count_result = session.run("MATCH (s:Story) RETURN count(s) as total")
            total = count_result.single()['total']
            
            # Get paginated data
            query = f"""
            MATCH (s:Story)
            RETURN s as node
            SKIP {skip}
            LIMIT {limit}
            """
            result = session.run(query)
            
            stories = []
            for record in result:
                node = record['node']
                story = Story(
                    _id=node.id,
                    title=node.get('title', ''),
                    source=node.get('source', ''),
                    url=node.get('url', '')
                )
                stories.append(story)
            
            return {
                "data": stories,
                "total": total,
                "page": page,
                "limit": limit
            }
        finally:
            session.close()
