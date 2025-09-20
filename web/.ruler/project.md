# Introduction

This is a project built for the AWS x FirstNet Hackathon. As this is a hackathon project, it will be evolving very quickly. We want to have good, maintainable code as much as possible. I'm giving you this information so you have as much context about this project as possible to write excellent code and give good ideas.

# Hackathon Prompt from the Organizers

About the event
In collaboration with AT&T and Deloitte, AWS is hosting an innovative developer challenge focused on transforming the future of networks through agents and generative AI. This three-day hackathon, hosted on Southern Methodist University’s campus, will unite the Dallas-based community of students, startups, and enterprises to develop ideas that may shape the future of FirstNet, America’s largest network for first responders.

Challenge 1 | Network Intelligence Enhancement
Develop an innovative solution that leverages AI technologies (LLMs, Digital Twins, and Intelligent Agents) to optimize FirstNet's network performance and resource allocation. Examples include:
• Create predictive models for network demand during emergencies
• Implement smart load balancing using digital twin simulation
• Enable autonomous network optimization through AI agents
• Enhance network resilience and efficiency during critical situations

Challenge 2 | Community Safety & Health Innovation
Design a novel application or service that utilizes FirstNet's dedicated public safety network to enhance community well being and emergency response. Examples include:
• Connect first responders with real-time health/safety data
• Enable faster coordination between emergency services
• Improve disaster preparedness and response
• Create new ways for communities to interact with emergency services

# More Context

We are specifically addressing challenge 1. However, as college students studying computer science none of us have experience in this space and have to do a lot of research to learn more about it. Feel free to make suggestions or any pointers where you see that we might have a misunderstanding or could include something to make the project better.

# Our Project Proposal

Imagine a massive pileup on the highway during rush hour. Dozens of 911 calls flood in at the same time. Drivers reporting injuries, families panicking, and responders racing to the scene. In the middle of that chaos, the most urgent calls need to reach the right teams immediately, but the network can quickly become overwhelmed.
We recognize the critical importance of prioritization during emergencies and crises like this. 

Our solution creates a digital twin of FirstNet’s network to design, test, and deploy an AI-driven model for intelligent call dispatching and circulation. By dynamically assigning priority based on incident urgency, responder location, and resource availability, the system ensures that first responders are connected to the right channels within a defined search perimeter. This targeted and context-aware communication framework enhances efficiency, coordination, and response speed, empowering first responders to act decisively during moments of dire need.

We plan to utilize a novel agent-first approach, capable of simulating the impact of real-world emergent scenarios on any network, especially the general-purpose cellular networks used by civilians. This is critical because emergencies develop fast, and in unpredictable and irregular ways. While they often start local and only affect a relatively small geographic region, they can very quickly spread to have far-reaching impacts, leading to network saturation and a whole host of other performance issues that have potentially deadly ramifications.

Our agentic load testing approach allows for an entirely new kind of synthetic load testing that gets closer to simulating real-world emergencies than ever before. Imagine watching a virtual emergency, simulated in a region of your choosing, develop on a digital twin of a real-world network - driven by AI agents that simulate phone calls, accessing government websites for realtime updates, and other actions that a human would take in these situations. These agents act much like a human would in an emergency - making decisions and reacting to developing situations in real-time by utilizing data, news articles, social media posts, and any sort of updates that they can see. Providing this incredibly realistic simulation of what it might look like for the current system architecture to encounter an emergency allows for planning for additional capacity and support to support an emergency of any scale. 

We recognise that redundancy is key in critical situations like emergencies. That's why we plan to include ways to simulate downtime on critical system components to test failovers, or to see how much additional capacity would be needed to support unexpected events in a certain region. 
Additionally, we plan to include ways to model falling back to other networks and alternate uplinks such as Bluetooth, Wi-Fi, and LoRa mesh networks for communication.

# Current Plans / Focus

The project has slightly pivoted to focus on two things:
1. Cellular architecture planning
2. Network load testing on digital twin, simulation, observability using AI

We're now focusing on a scenario in which FirstNet does not exist. If network engineers and other experts in the space were building FirstNet from the ground up in 2025 with the knowledge they had now, what tools would they be wanting to use? What new architectural decisions might they make? How can we utilise generative AI to make design faster, and streamline planning, deployment, and observability?

For point 1, we'll build a tool to support planning out new sites for cell tower deployments and hopefully including some extra tooling to make it easy to evaluate sites for that. 

For point 2, we really want to see what the capacity of a network is to handle emergency situations and see where additional capacity and equipment is going to need to be deployed as a result.