# Breaking Changes Tracking Feature

## Overview

The Breaking Changes Tracking feature helps development teams monitor and manage breaking changes during release cycles. It uses AI-powered analysis to automatically detect breaking changes in commits and provides comprehensive monitoring tools.

## Features

### 🔍 Automatic Breaking Changes Detection
- **AI-Powered Analysis**: Uses Gemini AI to analyze git diffs and commit messages
- **Severity Classification**: Categorizes breaking changes as Low, Medium, High, or Critical
- **Component Impact**: Identifies affected components and APIs
- **Migration Guidance**: Provides step-by-step migration instructions when needed

### 📊 Monitoring Dashboard
- **Real-time Statistics**: Track breaking changes over time
- **Trend Analysis**: Visualize breaking changes patterns with charts
- **Risk Assessment**: Automated risk level calculation based on breaking change frequency
- **Migration Tracking**: Monitor commits that require migration steps

### 🚨 Alert System
- **Critical Alerts**: Immediate notifications for high/critical breaking changes
- **Visual Indicators**: Color-coded badges and alerts in the commit log
- **Migration Warnings**: Highlight commits that require migration steps

## How It Works

### 1. Commit Analysis
When new commits are fetched, the system:
1. Extracts the git diff for each commit
2. Analyzes the diff using AI to detect breaking changes
3. Determines severity level and affected components
4. Generates migration steps if needed
5. Stores the analysis results in the database

### 2. Breaking Changes Detection
The AI analyzes the following types of changes:
- **API Signature Changes**: Function parameters, return types, interface modifications
- **Database Schema Changes**: Field additions, removals, type changes
- **Configuration Changes**: Breaking configuration file modifications
- **Removed Functionality**: Deleted functions, classes, or features
- **Behavioral Changes**: Changes that could break existing integrations

### 3. Severity Levels
- **Low**: Minor changes that might cause warnings but not failures
- **Medium**: Changes that could break some integrations but are easily fixable
- **High**: Significant changes that will break most integrations
- **Critical**: Major changes that require complete refactoring

## Usage

### Dashboard Overview
The Breaking Changes Monitor provides:
- **Header Stats**: Total commits, breaking changes count, risk level, migration requirements
- **Trend Charts**: Weekly breaking changes trend and severity distribution
- **Recent Breaking Changes**: Detailed view of recent breaking changes with migration steps

### Commit Log Integration
Breaking changes are highlighted in the commit log with:
- **Visual Indicators**: Red background for breaking change commits
- **Severity Badges**: Color-coded severity indicators
- **Migration Badges**: Special indicators for commits requiring migration
- **Detailed Information**: Expandable sections with breaking change details

### Alert System
Critical breaking changes appear as alerts at the top of the dashboard with:
- **Immediate Visibility**: Prominent placement for urgent attention
- **Detailed Information**: Complete breaking change analysis
- **Migration Steps**: Collapsible migration instructions

## Configuration

### Environment Variables
Ensure your Gemini API keys are configured:
```env
GEMINI_API_KEY_1=your_first_api_key
GEMINI_API_KEY_2=your_second_api_key
```

### Database Schema
The feature adds the following fields to the Commit model:
- `hasBreakingChanges`: Boolean flag for breaking changes
- `breakingChangeSeverity`: Severity level (low/medium/high/critical)
- `breakingChangeDetails`: Detailed description of breaking changes
- `affectedComponents`: JSON array of affected components
- `migrationRequired`: Boolean flag for migration requirement
- `migrationSteps`: Step-by-step migration guide

## Best Practices

### For Development Teams
1. **Regular Monitoring**: Check the breaking changes dashboard regularly during development
2. **Review Alerts**: Pay immediate attention to critical breaking change alerts
3. **Migration Planning**: Use the provided migration steps to plan updates
4. **Communication**: Share breaking changes information with stakeholders

### For Release Management
1. **Pre-release Review**: Review all breaking changes before releases
2. **Risk Assessment**: Use the risk level indicators to assess release impact
3. **Migration Coordination**: Coordinate migration efforts based on affected components
4. **Documentation**: Use the generated migration steps for release notes

## API Endpoints

### Get Breaking Changes Statistics
```typescript
GET /api/trpc/project.getBreakingChangesStats
{
  projectId: string,
  days?: number // Default: 30
}
```

Returns:
- Total commits and breaking changes count
- Breaking change percentage
- Severity distribution
- Weekly trend data
- Migration requirement count
- Recent breaking changes list

## Troubleshooting

### Common Issues
1. **No Breaking Changes Detected**: Ensure commits contain actual code changes
2. **Incorrect Severity**: Review the AI analysis and adjust if needed
3. **Missing Migration Steps**: Check if the breaking change requires manual migration planning

### Performance Considerations
- Breaking changes analysis uses AI, which may take time for large diffs
- The system processes commits in batches to optimize performance
- Multiple API keys are used for better rate limiting and reliability

## Future Enhancements

Planned improvements include:
- **Custom Rules**: Allow teams to define custom breaking change detection rules
- **Integration Alerts**: Notify external systems about breaking changes
- **Historical Analysis**: Long-term trend analysis and predictions
- **Team Notifications**: Email/Slack notifications for critical breaking changes
- **Release Impact Assessment**: Automated impact analysis for release planning 