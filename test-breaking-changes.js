// Test script for breaking changes detection
const { detectBreakingChanges } = require('./src/lib/gemini.ts');

async function testBreakingChangesDetection() {
  console.log('Testing breaking changes detection...\n');

  // Test case 1: API signature change
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

  console.log('Test 1: API signature change');
  console.log('Commit message:', apiChangeMessage);
  console.log('Diff:', apiChangeDiff);
  
  try {
    const result = await detectBreakingChanges(apiChangeDiff, apiChangeMessage);
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test case 2: Database schema change
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

  console.log('Test 2: Database schema change');
  console.log('Commit message:', dbChangeMessage);
  console.log('Diff:', dbChangeDiff);
  
  try {
    const result = await detectBreakingChanges(dbChangeDiff, dbChangeMessage);
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test case 3: Regular feature addition (should not be breaking)
  const featureDiff = `
diff --git a/src/components/Button.tsx b/src/components/Button.tsx
index 1234567..abcdefg 100644
--- a/src/components/Button.tsx
+++ b/src/components/Button.tsx
@@ -5,6 +5,7 @@ interface ButtonProps {
   children: React.ReactNode;
   onClick?: () => void;
   variant?: 'primary' | 'secondary';
+  size?: 'sm' | 'md' | 'lg';
 }
 
 export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
`;

  const featureMessage = "feat: add size prop to Button component";

  console.log('Test 3: Feature addition (should not be breaking)');
  console.log('Commit message:', featureMessage);
  console.log('Diff:', featureDiff);
  
  try {
    const result = await detectBreakingChanges(featureDiff, featureMessage);
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the test
testBreakingChangesDetection().catch(console.error); 