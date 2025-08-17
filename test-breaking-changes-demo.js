// Demo script for enhanced breaking changes detection
// This demonstrates the pattern-based detection without requiring TypeScript modules

function detectBreakingChangesByPattern(diff, commitMessage) {
  const diffLower = diff.toLowerCase();
  const messageLower = commitMessage.toLowerCase();
  
  // High severity patterns
  const highSeverityPatterns = [
    /function\s+\w+\s*\([^)]*\)\s*:\s*\w+/g, // Function signature changes
    /class\s+\w+\s*\{/g, // Class definition changes
    /interface\s+\w+\s*\{/g, // Interface changes
    /export\s+(?:function|class|interface|const|let|var)\s+\w+/g, // Export changes
    /-\s*export\s+/g, // Removed exports
    /model\s+\w+\s*\{/g, // Database model changes
    /column\s+[^:]+:\s*\w+/g, // Database column changes
  ];
  
  // Medium severity patterns
  const mediumSeverityPatterns = [
    /package\.json/g, // Package.json changes
    /dependencies/g, // Dependency changes
    /devDependencies/g, // Dev dependency changes
    /config/g, // Configuration changes
    /environment/g, // Environment variable changes
    /\.env/g, // Environment file changes
  ];
  
  // Critical severity patterns
  const criticalSeverityPatterns = [
    /database/g, // Database changes
    /schema/g, // Schema changes
    /migration/g, // Migration changes
    /table\s+\w+/g, // Table changes
    /model\s+\w+\s*\{/g, // Model changes
  ];
  
  // Check for removed functionality
  const removedPatterns = [
    /-\s*function\s+\w+/g,
    /-\s*class\s+\w+/g,
    /-\s*interface\s+\w+/g,
    /-\s*export\s+/g,
    /deleted/g,
    /removed/g,
  ];
  
  let hasBreakingChanges = false;
  let severity = null;
  let details = null;
  let affectedComponents = [];
  let migrationRequired = false;
  let migrationSteps = null;
  
  // Check for critical patterns
  for (const pattern of criticalSeverityPatterns) {
    if (pattern.test(diffLower)) {
      hasBreakingChanges = true;
      severity = 'critical';
      details = 'Critical database or schema changes detected';
      migrationRequired = true;
      migrationSteps = 'Database migration required. Review schema changes carefully.';
      break;
    }
  }
  
  // Check for high severity patterns
  if (!hasBreakingChanges) {
    for (const pattern of highSeverityPatterns) {
      if (pattern.test(diffLower)) {
        hasBreakingChanges = true;
        severity = 'high';
        details = 'API signature or structural changes detected';
        migrationRequired = true;
        migrationSteps = 'Review API changes and update calling code.';
        break;
      }
    }
  }
  
  // Check for removed functionality
  if (!hasBreakingChanges) {
    for (const pattern of removedPatterns) {
      if (pattern.test(diffLower)) {
        hasBreakingChanges = true;
        severity = 'high';
        details = 'Functionality removal detected';
        migrationRequired = true;
        migrationSteps = 'Update code that uses removed functionality.';
        break;
      }
    }
  }
  
  // Check for medium severity patterns
  if (!hasBreakingChanges) {
    for (const pattern of mediumSeverityPatterns) {
      if (pattern.test(diffLower)) {
        hasBreakingChanges = true;
        severity = 'medium';
        details = 'Configuration or dependency changes detected';
        migrationRequired = false;
        migrationSteps = 'Review configuration changes and update dependencies.';
        break;
      }
    }
  }
  
  // Extract affected components and files from file paths
  const fileMatches = diff.match(/diff --git a\/([^\s]+)/g);
  if (fileMatches) {
    affectedComponents = fileMatches.map(match => {
      const path = match.replace('diff --git a/', '');
      const component = path.split('/')[0]; // Get top-level directory
      return component || 'unknown';
    }).filter((comp, index, arr) => arr.indexOf(comp) === index && comp !== undefined); // Remove duplicates and undefined
  }
  
  const affectedFiles = fileMatches ? fileMatches.map(match => match.replace('diff --git a/', '')) : null;
  
  // Detect dependency issues
  const dependencyIssues = [];
  if (diffLower.includes('package.json')) {
    if (diffLower.includes('dependencies') || diffLower.includes('devdependencies')) {
      dependencyIssues.push('Package.json dependencies modified');
    }
  }
  
  // Detect build issues
  const buildIssues = [];
  if (diffLower.includes('tsconfig') || diffLower.includes('webpack') || diffLower.includes('build')) {
    buildIssues.push('Build configuration changes detected');
  }
  
  // Generate specific fix steps
  const specificFixSteps = [];
  if (hasBreakingChanges) {
    if (severity === 'critical') {
      specificFixSteps.push('Step 1: Review database schema changes');
      specificFixSteps.push('Step 2: Run database migrations');
      specificFixSteps.push('Step 3: Update application code to match new schema');
    } else if (severity === 'high') {
      specificFixSteps.push('Step 1: Review API signature changes');
      specificFixSteps.push('Step 2: Update function calls to match new signatures');
      specificFixSteps.push('Step 3: Test affected components');
    } else if (severity === 'medium') {
      specificFixSteps.push('Step 1: Review configuration changes');
      specificFixSteps.push('Step 2: Update dependencies if needed');
      specificFixSteps.push('Step 3: Test build process');
    }
  }
  
  return {
    hasBreakingChanges,
    severity,
    details,
    affectedComponents: affectedComponents.length > 0 ? affectedComponents : null,
    affectedFiles,
    dependencyIssues: dependencyIssues.length > 0 ? dependencyIssues : null,
    buildIssues: buildIssues.length > 0 ? buildIssues : null,
    migrationRequired,
    migrationSteps,
    specificFixSteps: specificFixSteps.length > 0 ? specificFixSteps : null,
  };
}

async function testComprehensiveBreakingChangesDetection() {
  console.log('🧪 Testing comprehensive breaking changes detection...\n');

  // Test case 1: API signature change with dependency issues
  const apiChangeDiff = `
diff --git a/src/api/user.ts b/src/api/user.ts
index 1234567..abcdefg 100644
--- a/src/api/user.ts
+++ b/src/api/user.ts
@@ -10,7 +10,7 @@ export interface User {
   email: string;
   age: number;
 }
-export function getUser(id: string): User {
+export function getUser(id: string, includeProfile: boolean = false): User {
   // Implementation
 }
`;

  const apiChangeMessage = "feat: add includeProfile parameter to getUser function";

  console.log('Test 1: API signature change (should be HIGH severity)');
  console.log('Commit message:', apiChangeMessage);
  console.log('Diff:', apiChangeDiff);
  
  try {
    const result = detectBreakingChangesByPattern(apiChangeDiff, apiChangeMessage);
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('✅ Expected: hasBreakingChanges=true, severity=high');
    console.log(`   Actual: hasBreakingChanges=${result.hasBreakingChanges}, severity=${result.severity}`);
    if (result.affectedFiles) {
      console.log(`   Affected files: ${result.affectedFiles.join(', ')}`);
    }
    if (result.specificFixSteps) {
      console.log(`   Fix steps: ${result.specificFixSteps.join(' | ')}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test case 2: Database schema change (should be CRITICAL severity)
  const dbChangeDiff = `
diff --git a/prisma/schema.prisma b/prisma/schema.prisma
index 1234567..abcdefg 100644
--- a/prisma/schema.prisma
+++ b/prisma/schema.prisma
@@ -20,7 +20,7 @@ model User {
   id        String   @id @default(cuid())
   email     String   @unique
   name      String
-  age       Int
+  birthDate DateTime
   createdAt DateTime @default(now())
   updatedAt DateTime @updatedAt
 }
`;

  const dbChangeMessage = "refactor: change age field to birthDate in User model";

  console.log('Test 2: Database schema change (should be CRITICAL severity)');
  console.log('Commit message:', dbChangeMessage);
  console.log('Diff:', dbChangeDiff);
  
  try {
    const result = detectBreakingChangesByPattern(dbChangeDiff, dbChangeMessage);
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('✅ Expected: hasBreakingChanges=true, severity=critical');
    console.log(`   Actual: hasBreakingChanges=${result.hasBreakingChanges}, severity=${result.severity}`);
    if (result.affectedFiles) {
      console.log(`   Affected files: ${result.affectedFiles.join(', ')}`);
    }
    if (result.specificFixSteps) {
      console.log(`   Fix steps: ${result.specificFixSteps.join(' | ')}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test case 3: Package.json dependency change (should be MEDIUM severity)
  const packageDiff = `
diff --git a/package.json b/package.json
index 1234567..abcdefg 100644
--- a/package.json
+++ b/package.json
@@ -15,7 +15,7 @@
   "dependencies": {
     "react": "^18.0.0",
     "react-dom": "^18.0.0",
-    "axios": "^0.27.0"
+    "axios": "^1.0.0"
   },
   "devDependencies": {
     "typescript": "^4.9.0"
`;

  const packageMessage = "chore: upgrade axios to v1.0.0";

  console.log('Test 3: Package.json dependency change (should be MEDIUM severity)');
  console.log('Commit message:', packageMessage);
  console.log('Diff:', packageDiff);
  
  try {
    const result = detectBreakingChangesByPattern(packageDiff, packageMessage);
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('✅ Expected: hasBreakingChanges=true, severity=medium');
    console.log(`   Actual: hasBreakingChanges=${result.hasBreakingChanges}, severity=${result.severity}`);
    if (result.dependencyIssues) {
      console.log(`   Dependency issues: ${result.dependencyIssues.join(', ')}`);
    }
    if (result.affectedFiles) {
      console.log(`   Affected files: ${result.affectedFiles.join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test case 4: Build configuration change (should be MEDIUM severity)
  const buildDiff = `
diff --git a/tsconfig.json b/tsconfig.json
index 1234567..abcdefg 100644
--- a/tsconfig.json
+++ b/tsconfig.json
@@ -5,7 +5,7 @@
   "compilerOptions": {
     "target": "es5",
     "lib": ["dom", "dom.iterable", "es6"],
-    "allowJs": true,
+    "allowJs": false,
     "skipLibCheck": true,
     "strict": true,
     "forceConsistentCasingInFileNames": true,
`;

  const buildMessage = "chore: disable allowJs in TypeScript config";

  console.log('Test 4: Build configuration change (should be MEDIUM severity)');
  console.log('Commit message:', buildMessage);
  console.log('Diff:', buildDiff);
  
  try {
    const result = detectBreakingChangesByPattern(buildDiff, buildMessage);
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('✅ Expected: hasBreakingChanges=true, severity=medium');
    console.log(`   Actual: hasBreakingChanges=${result.hasBreakingChanges}, severity=${result.severity}`);
    if (result.buildIssues) {
      console.log(`   Build issues: ${result.buildIssues.join(', ')}`);
    }
    if (result.affectedFiles) {
      console.log(`   Affected files: ${result.affectedFiles.join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test case 5: Function removal (should be HIGH severity)
  const removalDiff = `
diff --git a/src/utils/helpers.ts b/src/utils/helpers.ts
index 1234567..abcdefg 100644
--- a/src/utils/helpers.ts
+++ b/src/utils/helpers.ts
@@ -15,10 +15,6 @@ export function formatDate(date: Date): string {
   return date.toLocaleDateString();
 }
 
-export function oldHelperFunction(data: any): string {
-  return JSON.stringify(data);
-}
-
 export function newHelperFunction(data: any): string {
   return JSON.stringify(data, null, 2);
 }
`;

  const removalMessage = "refactor: remove deprecated oldHelperFunction";

  console.log('Test 5: Function removal (should be HIGH severity)');
  console.log('Commit message:', removalMessage);
  console.log('Diff:', removalDiff);
  
  try {
    const result = detectBreakingChangesByPattern(removalDiff, removalMessage);
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('✅ Expected: hasBreakingChanges=true, severity=high');
    console.log(`   Actual: hasBreakingChanges=${result.hasBreakingChanges}, severity=${result.severity}`);
    if (result.affectedFiles) {
      console.log(`   Affected files: ${result.affectedFiles.join(', ')}`);
    }
    if (result.specificFixSteps) {
      console.log(`   Fix steps: ${result.specificFixSteps.join(' | ')}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test case 6: Non-breaking change (should be false)
  const featureDiff = `
diff --git a/src/components/Button.tsx b/src/components/Button.tsx
index 1234567..abcdefg 100644
--- a/src/components/Button.tsx
+++ b/src/components/Button.tsx
@@ -10,6 +10,7 @@ interface ButtonProps {
   onClick?: () => void;
   disabled?: boolean;
   className?: string;
+  size?: 'small' | 'medium' | 'large';
 }
 
 export function Button({ 
@@ -17,6 +18,7 @@ export function Button({ 
   onClick, 
   disabled = false, 
   className = '',
+  size = 'medium',
   ...props 
 }: ButtonProps) {
   return (
@@ -24,6 +26,7 @@ export function Button({ 
       onClick={onClick}
       disabled={disabled}
       className={\`btn \${className}\`}
+      data-size={size}
       {...props}
     >
       {children}
`;

  const featureMessage = "feat: add size prop to Button component";

  console.log('Test 6: Non-breaking change (should be false)');
  console.log('Commit message:', featureMessage);
  console.log('Diff:', featureDiff);
  
  try {
    const result = detectBreakingChangesByPattern(featureDiff, featureMessage);
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('✅ Expected: hasBreakingChanges=false');
    console.log(`   Actual: hasBreakingChanges=${result.hasBreakingChanges}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test case 7: Complex breaking change with multiple issues
  const complexDiff = `
diff --git a/src/api/auth.ts b/src/api/auth.ts
index 1234567..abcdefg 100644
--- a/src/api/auth.ts
+++ b/src/api/auth.ts
@@ -5,7 +5,7 @@ export interface AuthConfig {
   clientId: string;
   clientSecret: string;
   redirectUri: string;
-  scope: string;
+  scopes: string[];
 }
 
-export function authenticate(config: AuthConfig): Promise<void> {
+export function authenticate(config: AuthConfig, options?: { silent?: boolean }): Promise<AuthResult> {
   // Implementation
 }
diff --git a/package.json b/package.json
index 1234567..abcdefg 100644
--- a/package.json
+++ b/package.json
@@ -15,7 +15,7 @@
   "dependencies": {
     "react": "^18.0.0",
     "react-dom": "^18.0.0",
-    "auth-library": "^2.0.0"
+    "auth-library": "^3.0.0"
   },
`;

  const complexMessage = "feat: upgrade auth system and add silent mode";

  console.log('Test 7: Complex breaking change with multiple issues (should be HIGH severity)');
  console.log('Commit message:', complexMessage);
  console.log('Diff:', complexDiff);
  
  try {
    const result = detectBreakingChangesByPattern(complexDiff, complexMessage);
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('✅ Expected: hasBreakingChanges=true, severity=high');
    console.log(`   Actual: hasBreakingChanges=${result.hasBreakingChanges}, severity=${result.severity}`);
    if (result.affectedFiles) {
      console.log(`   Affected files: ${result.affectedFiles.join(', ')}`);
    }
    if (result.dependencyIssues) {
      console.log(`   Dependency issues: ${result.dependencyIssues.join(', ')}`);
    }
    if (result.specificFixSteps) {
      console.log(`   Fix steps: ${result.specificFixSteps.join(' | ')}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testComprehensiveBreakingChangesDetection().catch(console.error); 