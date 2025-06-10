# Project Orchestrator - Claude Code CLI Meta-Management System

## Overview

This project demonstrates the creation of a sophisticated orchestrator mode for Claude Code CLI through carefully crafted `CLAUDE.md` instructions. The orchestrator acts as an intelligent project manager that coordinates development work without writing code directly.

## Core Concept

The orchestrator mode transforms Claude Code CLI into a meta-management system that:
- Understands business requirements
- Plans technical solutions
- Delegates coding tasks to other Claude Code CLI instances via command line
- Verifies code quality and adherence to best practices
- Manages git repositories and tracks progress

## Key Features

### 🎯 Orchestrator Capabilities
- **Task Planning**: Breaks down complex requirements into atomic, manageable tasks
- **Delegation Protocol**: Uses structured command formats to delegate work via CLI
- **Quality Gates**: Enforces code quality checks before accepting deliverables
- **Git Management**: Automates repository initialization and commit workflows
- **Progress Tracking**: Maintains project state and reports progress
- **MCP Integration**: Leverages advanced reasoning and research tools

### 🔧 Technical Implementation
- **Automatic Activation**: Orchestrator mode activates immediately when Claude Code CLI is launched in a directory containing the `CLAUDE.md` file
- **Structured Communication**: Uses JSON-formatted responses for consistent task tracking
- **Quality Assurance**: Implements mandatory checks for DRY, KISS, and SOLID principles
- **Error Recovery**: Includes protocols for issue detection and recovery actions

## Demonstration Application: Snake Game

To showcase the orchestrator's capabilities, a complete Snake game application was developed:

### Snake App Features
- **Modern React/TypeScript Implementation**: Full type safety and modern React patterns
- **Comprehensive Test Suite**: Unit and integration tests with high coverage
- **Performance Optimization**: FPS monitoring and performance evaluation
- **Responsive Design**: Touch controls and mobile-friendly interface
- **Dark Mode Support**: Theme toggle with context management
- **Game Mechanics**: Food collection, obstacles, traps, and score tracking
- **Data Persistence**: Local storage for game history and statistics

### Project Structure
```
snake-app/
├── src/
│   ├── components/      # React components
│   ├── hooks/          # Custom React hooks
│   ├── contexts/       # React contexts
│   ├── services/       # Business logic
│   ├── types/          # TypeScript definitions
│   └── __tests__/      # Test files
├── package.json        # Dependencies and scripts
└── vite.config.ts      # Build configuration
```

## How It Works

1. **Place `CLAUDE.md`** in your project root
2. **Run `claude`** in the terminal
3. **Orchestrator activates** automatically
4. **Describe your requirements** in natural language
5. **Watch as tasks are delegated** to Claude Code CLI instances
6. **Review progress** and quality reports

## Use Cases

- **Complex Project Management**: Managing multi-phase development projects
- **Code Quality Enforcement**: Ensuring consistent coding standards
- **Team Simulation**: Simulating a development team workflow
- **Learning Tool**: Understanding software architecture and best practices

## Benefits

- **No Direct Coding**: Orchestrator never writes code, ensuring clean delegation
- **Quality First**: Built-in quality gates prevent substandard code
- **Automated Git Workflow**: Commits are handled automatically with proper messages
- **Progress Visibility**: Clear reporting on task completion and project status
- **Scalable Approach**: Can manage projects of any size through task decomposition

## Getting Started

1. Clone this repository
2. Navigate to the project directory
3. Run `claude` to activate the orchestrator
4. Start with a simple request to see the orchestrator in action

## Future Enhancements

- Extended MCP server integrations
- Multi-project orchestration
- Advanced dependency management
- Automated deployment workflows
- Performance benchmarking

---

This project demonstrates the power of Claude Code CLI's memory system and how carefully crafted instructions can create sophisticated development workflows without traditional programming.