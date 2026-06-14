# Generalist Agent 🤖

<div align="center">

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-green.svg)
![OpenHands](https://img.shields.io/badge/Powered%20by-OpenHands-6366f1)

**A versatile AI assistant agent built with OpenHands that handles development and automation tasks with ease.**

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [API Reference](#api-reference) • [License](#license)

</div>

---

## ✨ Features

| Capability | Description |
|------------|-------------|
| 📁 **File Operations** | View, create, edit files with full editor capabilities |
| 💻 **Terminal Access** | Execute shell commands, run scripts, manage processes |
| 🌐 **Web Browsing** | Navigate, scrape content, interact with web pages |
| 🔧 **Code Assistance** | Debug, refactor, review, and write code |
| ⚡ **Task Automation** | Automate repetitive development tasks |

---

## 🚀 Quick Start

### Prerequisites

- OpenHands API account
- API Key for authentication

### Web Interface Setup

1. **Deploy** the `index.html` to any web server or open locally
2. **Configure** your API credentials in the interface
3. **Start chatting** with the agent

### Configuration

| Variable | Description |
|----------|-------------|
| `OPENHANDS_API_KEY` | Your OpenHands API key |
| `API_BASE` | OpenHands API endpoint URL |

---

## 📚 Documentation

### Project Structure

```
generalist-agent/
├── README.md          # Project documentation
├── generalist.md      # Agent configuration & system prompt
└── index.html         # Web-based chat interface
```

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│                  (index.html - Chat UI)                  │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   OpenHands API                          │
│              (generalist Agent - AI Brain)               │
└─────────────────────────┬───────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │  File    │   │ Terminal│   │ Browser  │
    │ Editor   │   │  Shell  │   │  Tools   │
    └──────────┘   └──────────┘   └──────────┘
```

---

## 🛠️ Available Tools

### File Operations

| Tool | Description |
|------|-------------|
| `file_editor` | View, create, edit files (create, str_replace, undo_edit) |
| `terminal` | Execute shell commands, run scripts, manage processes |

### Web Browsing

| Tool | Description |
|------|-------------|
| `browser_navigate` | Navigate to URLs |
| `browser_get_state` | Get current page state with interactive elements |
| `browser_get_content` | Extract main content from page |
| `browser_click` | Click interactive elements |
| `browser_type` | Type into input fields |
| `browser_scroll` | Scroll page up/down |

---

## 🔌 LLM Support

The agent supports various LLM providers through LiteLLM proxy:

- **OpenAI** - GPT-4, GPT-3.5
- **MiniMax M2.7** - High-performance model
- **Custom** - Any LiteLLM-compatible provider

### LiteLLM Configuration

```yaml
# config.yaml
model_list:
  - model_name: minimax/m2.7
    litellm_params:
      model: minimax/m2.7
      api_key: your-api-key
      api_base: https://api.minimax.chat/v1
```

---

## 📖 Usage Examples

### Example 1: Code Debugging
```
"Debug this error and explain the root cause"
```

### Example 2: File Manipulation
```
"Edit index.html to add a new feature"
```

### Example 3: Web Research
```
"Research the latest trends in AI agents"
```

### Example 4: Task Automation
```
"Create a script to automate my daily workflow"
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📄 License

This project is licensed under the **MIT License**.

---

## 👥 Authors

- [antono4](https://github.com/antono4)
- [openhands-agent](https://github.com/openhands-agent)

---

<div align="center">

**Built with ❤️ using [OpenHands](https://github.com/All-Hands-AI/OpenHands)**

</div>