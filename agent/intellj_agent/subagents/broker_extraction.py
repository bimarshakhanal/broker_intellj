import os
import re
from typing import List

from google.adk.agents import Agent
from google.genai import types
from google.adk.agents.llm_agent import LlmAgent
from google.adk.tools import ToolContext


async def normalize_names(names: List[str]) -> List[str]:
    """
    Normalize and clean extracted broker details.
    - Remove titles like Mr., Ms., Broker, etc.
    - Trim whitespace
    - Standardize capitalization
    - Remove duplicates
    """
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
    2. Identify names, email, organization of real estate brokers mentioned.
    3. Extract only human names.
    4. Extract organization name of broker only.
    5. Do NOT extract property names.
    6. Do NOT hallucinate names not present in text.
    7. If any of the broker details (name, email, organization) are not explicitly mentioned, do NOT infer or guess them. Only extract what is clearly stated.
    7. Remember, not every name mentioned is a broker. Use contextual clues to determine if a name is likely a broker.

    After extracting raw names, email and organization, you must clean and standardize the names by following these steps:
    - Call the tool `normalize_names` with list of names to clean and standardize them.
    - Return final structured output in this format:
    - Input to `normalize_names` tool:
        names: List of raw extracted names (may include titles, extra whitespace, etc.)

    {
    "brokers": [
        {
        "name": "<full name>",
        "email": "<email address>",
        "organization": "<organization name>",
        "confidence": <0.0 to 1.0>
        }
    ]
    }

    Rules:
    - If no broker names, emails or organizations are found, return:
    { "brokers": [] }
    - Do not generate explanations.
    - Do not summarize.
    - Only return structured JSON.
""",
    tools=[normalize_names],
    output_key="broker_details",
    generate_content_config=types.GenerateContentConfig(
        temperature=0.1,
        thinking_config=types.ThinkingConfig(thinking_budget=0)
    )
)
