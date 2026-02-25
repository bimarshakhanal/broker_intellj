import os

from dotenv import load_dotenv
from google.adk.agents import Agent
from google.adk.agents.llm_agent import LlmAgent
from google.adk.agents.sequential_agent import SequentialAgent

from intellj_agent.subagents.broker_extraction import broker_extraction_agent
from intellj_agent.subagents.broker_query import broker_query_agent

load_dotenv()

MODEL = os.getenv("MODEL", "gemini-2.5-flash")

presentation_agent = LlmAgent(
    name="PresentationAgent",
    model=MODEL,
    description="Formats the final output for presentation to the user.",
    instruction="""
    You are a Presentation Agent. Your task is to take the structured output from the Broker Query Agent and format it into a user-friendly presentation format.
    1. Receive the structured JSON output from the Broker Query Agent.
    2. Format the output into a clear and concise presentation format.
    3. Use bullet points, headings, and clear language to make the information easy to understand.
    4. Do NOT add any new information or modify the data received from the Broker Query Agent. Your role is purely to format the existing data for presentation.
    5. If the broker information is None, present a message indicating that no information was found for the broker.
    6. Do not present any other information beyond what is provided in the structured JSON.
    7. 
    """
)

root_agent = SequentialAgent(
    name="CodePipelineAgent",
    sub_agents=[broker_extraction_agent, broker_query_agent],
    description="Executes a sequence of broker name extraction and querying.",
)
