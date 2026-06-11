# Generalist Agent

A versatile AI assistant agent built with OpenHands that can handle various development and automation tasks.

## Overview

Generalist Agent is a multi-purpose AI agent capable of:
- Reading, writing, and editing files
- Executing terminal commands
- Web browsing and research
- Debugging and code refactoring
- Automation and task execution

## Features

- **File Operations** - View, create, edit files with full editor capabilities
- **Terminal Access** - Execute shell commands, run scripts, manage processes
- **Web Browsing** - Navigate, scrape content, interact with web pages
- **Code Assistance** - Debug, refactor, review, and write code
- **Task Automation** - Automate repetitive development tasks

## Architecture

- `generalist.md` - Agent configuration and system prompt
- `index.html` - Web-based chat interface for interacting with the agent

## Setup

### Using the Web Interface

1. Deploy the `index.html` to any web server
2. Configure your API endpoint and credentials
3. Start chatting with the agent

### Configuration

Set your OpenHands API credentials in the interface:
- `OPENHANDS_API_KEY` - Your API key
- `API_BASE` - OpenHands API endpoint URL

## Available Tools

### File Operations
| Tool | Description |
|------|-------------|
| `file_editor` | View, create, edit files |
| `terminal` | Execute shell commands |

### Web Browsing
| Tool | Description |
|------|-------------|
| `browser_navigate` | Navigate to URLs |
| `browser_get_state` | Get page state with interactive elements |
| `browser_get_content` | Extract page content |
| `browser_click` | Click elements |
| `browser_type` | Type into input fields |
| `browser_scroll` | Scroll pages |

## LLM Support

The agent supports various LLM providers through LiteLLM proxy:
- OpenAI
- MiniMax M2.7
- Custom LiteLLM configurations

## License

MIT License

## Author

- [antono4](https://github.com/antono4)
- [openhands-agent](https://github.com/openhands-agent)