from google.genai import types
from google.adk.agents import Agent
from google.adk.tools import google_search



search_agent = Agent(
    name="basic_search_agent",
    model="gemini-2.5-flash",
    description="Agent to answer questions using Google Search.",
    instruction=""" 
    You are a real state broker intelligence agent capable of looking up information about a specific real state broker
    using Google Search, you should use the Google Search tool to find the answer.  The results must include real state brokers operating in USA only. You should use the Google Search tool to find the answer.

    Input:
    -  broker name, email, organization name, or URL.
    - All of the above information is optional, use all the available information to find details about the broker.

    Output:
    I need information about broker John Morris. I need them in structured format. Need deals he has been involved, his organizational involvement
    the location where he is mostly active. Provide them in json format. Also, return the information sources/links used to generate the response.
    If multiple persons are found, make list of detailed json objects.
    """,
    tools=[google_search],
    generate_content_config=types.GenerateContentConfig(
        temperature=0.1,
        thinking_config=types.ThinkingConfig(thinking_budget=0)
    )
)
