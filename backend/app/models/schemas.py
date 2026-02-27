from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List


# Story Models
class StoryBase(BaseModel):
    title: str
    source: str
    url: str


class Story(StoryBase):
    model_config = ConfigDict(populate_by_name=True, serialization_by_alias=False)
    id: int = Field(..., alias="_id")


# Person Models
class PersonBase(BaseModel):
    name: str
    title: str
    role: Optional[str] = None
    url: Optional[str] = None


class Person(PersonBase):
    model_config = ConfigDict(populate_by_name=True, serialization_by_alias=False)
    id: int = Field(..., alias="_id")


class PersonDetail(Person):
    email: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    image: Optional[str] = None
    deals: List['Deal'] = []
    organizations: List['Organization'] = []
    stories: List[Story] = []


# Deal Models
class DealBase(BaseModel):
    property: str
    url: str
    date: str
    title: Optional[str] = None
    type: Optional[str] = None
    role: Optional[str] = None
    price: Optional[str] = None
    price_per_square_foot: Optional[str] = None
    floors: Optional[str] = None
    term_years: Optional[str] = None
    square_feet: Optional[str] = None
    acquirer_stake: Optional[str] = None
    amount: Optional[str] = None
    financing_types: Optional[str] = None
    interest_rate: Optional[str] = None
    structure: Optional[str] = None
    fixed_vs_floating: Optional[str] = None


class Deal(DealBase):
    model_config = ConfigDict(populate_by_name=True, serialization_by_alias=False)
    id: int = Field(..., alias="_id")
    property_address: Optional[str] = None


class Participant(BaseModel):
    model_config = ConfigDict(populate_by_name=True, serialization_by_alias=False)
    id: int = Field(..., alias="_id")
    name: Optional[str] = None
    type: str  # "Person" or "Organization"
    role: Optional[str] = None
    url: Optional[str] = None


class DealDetail(Deal):
    participants: List[Participant] = []
    properties: List['Property'] = []
    stories: List[Story] = []


# Organization Models
class OrganizationBase(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    url: Optional[str] = None
    role: Optional[str] = None


class Organization(OrganizationBase):
    model_config = ConfigDict(populate_by_name=True, serialization_by_alias=False)
    id: int = Field(..., alias="_id")


class OrganizationDetail(Organization):
    members: List[Person] = []
    deals: List[Deal] = []
    stories: List[Story] = []


# Property Models
class PropertyBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    address: str
    url: str
    name: Optional[str] = None
    type: Optional[str] = None
    square_feet: Optional[str] = Field(None, alias="square feet")
    year_built: Optional[str] = Field(None, alias="year built")
    credifi_score: Optional[str] = Field(None, alias="credifi score")


class Property(PropertyBase):
    model_config = ConfigDict(populate_by_name=True, serialization_by_alias=False)
    id: int = Field(..., alias="_id")


class PropertyDetail(Property):
    deals: List[Deal] = []
    stories: List[Story] = []
    participants: List['Participant'] = []


# Pagination Models
class PaginatedResponse(BaseModel):
    data: List[Person]
    total: int
    page: int
    limit: int


# Update forward references
PersonDetail.model_rebuild()
DealDetail.model_rebuild()
OrganizationDetail.model_rebuild()
PropertyDetail.model_rebuild()
