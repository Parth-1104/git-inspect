// Comprehensive test script for enhanced breaking changes detection
const { detectBreakingChanges } = require('./src/lib/gemini.ts');

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
    const result = await detectBreakingChanges(apiChangeDiff, apiChangeMessage);
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
    const result = await detectBreakingChanges(dbChangeDiff, dbChangeMessage);
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
    const result = await detectBreakingChanges(packageDiff, packageMessage);
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
    const result = await detectBreakingChanges(buildDiff, buildMessage);
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
    const result = await detectBreakingChanges(removalDiff, removalMessage);
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
    const result = await detectBreakingChanges(featureDiff, featureMessage);
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
    const result = await detectBreakingChanges(complexDiff, complexMessage);
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