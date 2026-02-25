import os
import re
from typing import List

from google.adk.agents import Agent
from google.adk.agents.llm_agent import LlmAgent
from google.adk.tools import ToolContext


async def normalize_broker_names(names: List[str]) -> List[str]:
    """
    Normalize and clean extracted broker names.
    - Remove titles like Mr., Ms., Broker, etc.
    - Trim whitespace
    - Standardize capitalization
    - Remove duplicates
    """
    print(names)
    cleaned = set()

    for name in names:
        name = re.sub(r"\b(Mr|Ms|Mrs|Broker|Agent)\.?\b",
                      "", name, flags=re.IGNORECASE)
        name = name.strip()
        name = " ".join(word.capitalize() for word in name.split())
        if name:
            cleaned.add(name)

    return list(cleaned)


MODEL = os.getenv("MODEL", "gemini-2.5-flash")

broker_extraction_agent = LlmAgent(
    name="BrokerExtractionAgent",
    model=MODEL,
    description="Extracts broker names from article or email text.",
    instruction="""
    You are a Broker Name Extraction Agent.

    Your task is to:

    1. Analyze the provided text (article, email, or conversation).
    2. Identify names of real estate brokers mentioned.
    3. Extract only human names.
    4. Do NOT extract organizations.
    5. Do NOT extract property names.
    6. Do NOT hallucinate names not present in text.
    7. Remember, not every name mentioned is a broker. Use contextual clues to determine if a name is likely a broker.

    After extracting raw names:
    - Call the tool `normalize_broker_names` with list of names to clean and standardize them.
    - Return final structured output in this format:
    - Input to `normalize_broker_names` tool:
        names: List of raw extracted names (may include titles, extra whitespace, etc.)

    {
    "brokers": [
        {
        "name": "<full name>",
        "confidence": <0.0 to 1.0>
        }
    ]
    }

    Rules:
    - If no broker names are found, return:
    { "brokers": [] }
    - Do not generate explanations.
    - Do not summarize.
    - Only return structured JSON.
""",
    tools=[normalize_broker_names],
    output_key="names"
)
