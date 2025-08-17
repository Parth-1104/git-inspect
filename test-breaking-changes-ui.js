// Test script to simulate UI breaking changes detection
// This helps debug why breaking changes aren't showing in the UI

// Simulate the data structure that would come from the database
const mockCommits = [
  {
    id: '1',
    commitMessage: 'feat: add includeProfile parameter to getUser function',
    hasBreakingChanges: true,
    breakingChangeSeverity: 'high',
    breakingChangeDetails: 'API signature change detected: getUser function now requires includeProfile parameter',
    affectedComponents: JSON.stringify(['src/api/user.ts']),
    migrationRequired: true,
    migrationSteps: 'Update all calls to getUser() to include the new includeProfile parameter',
    commitDate: new Date(),
    commitAuthorName: 'John Doe'
  },
  {
    id: '2',
    commitMessage: 'refactor: change age field to birthDate in User model',
    hasBreakingChanges: true,
    breakingChangeSeverity: 'critical',
    breakingChangeDetails: 'Database schema change: age field replaced with birthDate',
    affectedComponents: JSON.stringify(['prisma/schema.prisma']),
    migrationRequired: true,
    migrationSteps: 'Run database migration and update application code',
    commitDate: new Date(),
    commitAuthorName: 'Jane Smith'
  },
  {
    id: '3',
    commitMessage: 'chore: upgrade axios to v1.0.0',
    hasBreakingChanges: true,
    breakingChangeSeverity: 'medium',
    breakingChangeDetails: 'Dependency upgrade: axios from v0.27.0 to v1.0.0',
    affectedComponents: JSON.stringify(['package.json']),
    migrationRequired: false,
    migrationSteps: 'Review axios changelog for breaking changes',
    commitDate: new Date(),
    commitAuthorName: 'Bob Wilson'
  },
  {
    id: '4',
    commitMessage: 'feat: add new utility function',
    hasBreakingChanges: false,
    breakingChangeSeverity: null,
    breakingChangeDetails: null,
    affectedComponents: null,
    migrationRequired: false,
    migrationSteps: null,
    commitDate: new Date(),
    commitAuthorName: 'Alice Brown'
  }
];

// Simulate the UI filtering logic
function simulateUILogic(commits) {
  console.log('🔍 All commits:', commits.map(c => ({
    id: c.id,
    message: c.commitMessage,
    hasBreakingChanges: c.hasBreakingChanges,
    severity: c.breakingChangeSeverity,
    details: c.breakingChangeDetails
  })));
  
  const breakingChanges = commits
    .filter(commit => 
      commit.hasBreakingChanges && 
      (commit.breakingChangeSeverity === 'critical' || commit.breakingChangeSeverity === 'high')
    )
    .slice(0, 3); // Show only the 3 most recent critical breaking changes
  
  console.log('🚨 Critical breaking changes found:', breakingChanges.length);
  
  // Show all breaking changes regardless of severity
  const allBreakingChanges = commits.filter(commit => commit.hasBreakingChanges);
  console.log('📊 All breaking changes:', allBreakingChanges.length);
  
  return {
    criticalBreakingChanges: breakingChanges,
    allBreakingChanges: allBreakingChanges
  };
}

// Test with mock data
console.log('🧪 Testing UI breaking changes logic with mock data...\n');

const result = simulateUILogic(mockCommits);

console.log('\n📋 Results:');
console.log('Critical/High breaking changes:', result.criticalBreakingChanges.length);
console.log('All breaking changes:', result.allBreakingChanges.length);

if (result.criticalBreakingChanges.length > 0) {
  console.log('\n✅ Critical breaking changes that should show in UI:');
  result.criticalBreakingChanges.forEach(commit => {
    console.log(`- ${commit.commitMessage} (${commit.breakingChangeSeverity})`);
  });
} else {
  console.log('\n⚠️ No critical breaking changes found, but there are breaking changes:');
  result.allBreakingChanges.forEach(commit => {
    console.log(`- ${commit.commitMessage} (${commit.breakingChangeSeverity})`);
  });
}

// Test edge cases
console.log('\n🔍 Testing edge cases...');

// Test with null/undefined values
const edgeCaseCommits = [
  {
    id: '5',
    commitMessage: 'test: edge case with null values',
    hasBreakingChanges: true,
    breakingChangeSeverity: null, // This should not show up
    breakingChangeDetails: null,
    affectedComponents: null,
    migrationRequired: false,
    migrationSteps: null,
    commitDate: new Date(),
    commitAuthorName: 'Test User'
  },
  {
    id: '6',
    commitMessage: 'test: edge case with undefined severity',
    hasBreakingChanges: true,
    breakingChangeSeverity: undefined, // This should not show up
    breakingChangeDetails: 'Some details',
    affectedComponents: JSON.stringify(['test.ts']),
    migrationRequired: true,
    migrationSteps: 'Test migration',
    commitDate: new Date(),
    commitAuthorName: 'Test User'
  }
];

console.log('\n🧪 Edge case test:');
const edgeCaseResult = simulateUILogic(edgeCaseCommits);
console.log('Edge case critical breaking changes:', edgeCaseResult.criticalBreakingChanges.length);
console.log('Edge case all breaking changes:', edgeCaseResult.allBreakingChanges.length); 