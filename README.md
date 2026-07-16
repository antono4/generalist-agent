# 🤖 Generalist Agent

> **Created by Antono**


<div align="center">

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/Version-2.0-green.svg)
![OpenHands](https://img.shields.io/badge/Powered%20by-OpenHands-8b5cf6)

**AI assistant agent untuk development, automation, dan task lainnya.**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [API](#-api) • [License](#-license)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🌙 **Dark/Light Theme** | Toggle antar tema dengan Ctrl+T |
| ⌨️ **Keyboard Shortcuts** | Ctrl+Enter send, Ctrl+E export, Ctrl+L clear |
| 📤 **Export Chat** | Download conversation sebagai Markdown |
| 🔌 **Custom LLM API** | Gunakan API key dari free-llm-api-keys (GPT-5.5, Claude, Gemini, dll) |
| ⚡ **Real-time Response** | Fast polling dengan rate limit compliance |
| 🎯 **Quick Actions** | Pre-built prompts untuk task umum |

### Core Capabilities

| Capability | Description |
|------------|-------------|
| 📁 **File Operations** | View, create, edit files |
| 💻 **Terminal Access** | Execute shell commands |
| 🌐 **Web Browsing** | Navigate, scrape, interact |
| 🔧 **Code Assistance** | Debug, refactor, write code |
| ⚡ **Automation** | Automate repetitive tasks |

---

## 🚀 Quick Start

### Prerequisites

- OpenHands API key
- Modern web browser

### Usage

1. Buka `index.html` di browser
2. Ketik pesan dan tekan **Ctrl+Enter** atau klik send
3. Gunakan **Quick Actions** untuk task umum
4. Export chat sebagai Markdown dengan Ctrl+E

---

## 📖 Documentation

### Project Structure

```
generalist-agent/
├── index.html       # Web chat interface
├── generalist.md     # Agent configuration
└── README.md        # This file
```

### Architecture

```
┌─────────────────────────────────────┐
│          User Interface              │
│           (index.html)              │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         OpenHands API                │
│    (app.all-hands.dev/api/v1)       │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
    ┌──────┐ ┌──────┐ ┌──────┐
    │ File │ │ Term │ │Browser│
    └──────┘ └──────┘ └──────┘
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Send message |
| `Ctrl + T` | Toggle theme |
| `Ctrl + E` | Export chat |
| `Ctrl + L` | Clear chat |

---

## 🔧 Available Tools

### File Operations

| Tool | Description |
|------|-------------|
| `file_editor` | View, create, edit files |
| `terminal` | Execute shell commands |

### Web Browsing

| Tool | Description |
|------|-------------|
| `browser_navigate` | Navigate to URLs |
| `browser_get_state` | Get page state |
| `browser_click` | Click elements |
| `browser_type` | Type input |
| `browser_scroll` | Scroll pages |

---

## 💡 Usage Examples

```bash
# Code generation
"Write a Python script to scrape a website"

# Debug
"Debug this error and explain the root cause"

# Research  
"Research the latest trends in AI agents"

# Automation
"Create a script to automate my daily tasks"
```

---

## 🤝 Contributing

Kontribusi sangat diterima! Silakan buat issue atau pull request.

## 📄 License

MIT License

---

## 👥 Authors

- [antono4](https://github.com/antono4)
- [openhands-agent](https://github.com/openhands-agent)

---

<div align="center">

**Built with ❤️ using [OpenHands](https://github.com/All-Hands-AI/OpenHands)**

</div>
