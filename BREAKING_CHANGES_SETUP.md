# Breaking Changes Feature Setup Guide

## 🚀 Quick Start

The breaking changes tracking feature has been successfully implemented! Here's what you need to know:

### ✅ What's Been Added

1. **Database Schema Updates**
   - New fields added to Commit model for breaking changes tracking
   - Migration completed with `npx prisma db push`

2. **AI-Powered Detection**
   - Enhanced Gemini AI integration for breaking changes analysis
   - Automatic severity classification and migration step generation

3. **Dashboard Components**
   - Breaking Changes Monitor with statistics and trends
   - Alert system for critical breaking changes
   - Enhanced commit log with breaking change indicators

4. **API Endpoints**
   - New `getBreakingChangesStats` endpoint for analytics
   - Enhanced commit processing with breaking changes detection

### 🔧 Setup Requirements

1. **Environment Variables**
   ```env
   GEMINI_API_KEY_1=your_first_api_key
   GEMINI_API_KEY_2=your_second_api_key
   ```

2. **Dependencies**
   - `recharts` package installed for chart components
   - All existing dependencies remain the same

### 🧪 Testing the Feature

1. **Start the Development Server**
   ```bash
   npm run dev
   ```

2. **Navigate to Dashboard**
   - Go to your project dashboard
   - You should see the new "Breaking Changes Monitor" section

3. **Test with New Commits**
   - Click "Fetch New Commits" to process recent commits
   - The system will automatically analyze commits for breaking changes
   - Check the breaking changes monitor for results

4. **Expected Behavior**
   - Commits with breaking changes will have red backgrounds
   - Severity badges will appear on breaking change commits
   - Migration warnings will show for commits requiring migration
   - Statistics will update in real-time

### 📊 Dashboard Features

#### Breaking Changes Monitor
- **Header Stats**: Total commits, breaking changes count, risk level, migration requirements
- **Trend Analysis**: Simple bar charts showing breaking changes over time
- **Severity Distribution**: Visual breakdown of breaking change severity levels
- **Recent Breaking Changes**: Detailed view of recent breaking changes

#### Alert System
- **Critical Alerts**: High/critical breaking changes appear at the top
- **Visual Indicators**: Color-coded badges and warnings
- **Migration Guidance**: Step-by-step migration instructions

#### Enhanced Commit Log
- **Visual Indicators**: Red backgrounds for breaking change commits
- **Severity Badges**: Color-coded severity indicators
- **Migration Badges**: Special indicators for migration requirements
- **Detailed Information**: Expandable breaking change details

### 🔍 How Breaking Changes Detection Works

The AI analyzes commits for:
- **API Signature Changes**: Function parameters, return types, interface modifications
- **Database Schema Changes**: Field additions, removals, type changes
- **Configuration Changes**: Breaking configuration file modifications
- **Removed Functionality**: Deleted functions, classes, or features
- **Behavioral Changes**: Changes that could break existing integrations

### 🎯 Severity Levels

- **Low**: Minor changes that might cause warnings but not failures
- **Medium**: Changes that could break some integrations but are easily fixable
- **High**: Significant changes that will break most integrations
- **Critical**: Major changes that require complete refactoring

### 🚨 Troubleshooting

#### Common Issues

1. **No Breaking Changes Detected**
   - Ensure commits contain actual code changes
   - Check that Gemini API keys are properly configured
   - Verify the commit diff is being processed correctly

2. **Chart Import Errors**
   - The simple version uses basic HTML/CSS instead of complex charts
   - If you want advanced charts, ensure `recharts` is properly installed

3. **Database Errors**
   - Run `npx prisma generate` to update Prisma client
   - Run `npx prisma db push` to apply schema changes

4. **Performance Issues**
   - Breaking changes analysis uses AI and may take time
   - The system processes commits in batches for optimization
   - Multiple API keys help with rate limiting

### 📈 Next Steps

1. **Test with Real Data**
   - Connect to a real GitHub repository
   - Fetch commits and observe breaking changes detection
   - Review the generated migration steps

2. **Customize Severity Rules**
   - Modify the AI prompt in `src/lib/gemini.ts` for custom detection rules
   - Adjust severity thresholds based on your team's needs

3. **Integration Planning**
   - Consider adding email/Slack notifications for critical breaking changes
   - Plan integration with CI/CD pipelines for automated alerts

### 📚 Documentation

- **Feature Documentation**: See `BREAKING_CHANGES_FEATURE.md` for detailed documentation
- **API Reference**: Check the tRPC router for available endpoints
- **Component Usage**: Review the component files for customization options

### 🎉 Success Indicators

You'll know the feature is working when:
- ✅ Breaking changes monitor appears on the dashboard
- ✅ Commits show breaking change indicators
- ✅ Statistics update when new commits are fetched
- ✅ Critical breaking changes trigger alerts
- ✅ Migration steps are generated for breaking changes

The breaking changes tracking feature is now ready to help your team manage releases more effectively! 🚀 