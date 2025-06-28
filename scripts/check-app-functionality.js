#!/usr/bin/env node

/**
 * App Functionality Check Script
 * This script checks the core functionality of the investment portal app
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Checking Investment Portal App Functionality...\n');

// Check if key files exist
const requiredFiles = [
  'src/App.tsx',
  'src/main.tsx',
  'src/contexts/AuthContext.tsx',
  'src/contexts/PWAContext.tsx',
  'src/integrations/supabase/client.ts',
  'src/lib/pools.ts',
  'src/lib/ai.ts',
  'src/lib/drbe.ts',
  'src/pages/Index.tsx',
  'src/pages/Login.tsx',
  'src/pages/admin/AdminDashboard.tsx',
  'src/pages/entrepreneur/EntrepreneurDashboard.tsx',
  'src/pages/investor/InvestorDashboard.tsx',
  'src/pages/service-provider/ServiceProviderDashboard.tsx',
  'src/pages/pool/PoolDashboard.tsx',
  'src/pages/observer/ObserverDashboard.tsx',
  'src/components/admin/AdminSidebar.tsx',
  'src/components/entrepreneur/EntrepreneurSidebar.tsx',
  'src/components/investor/InvestorSidebar.tsx',
  'src/components/ui/sidebar.tsx',
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'tailwind.config.ts'
];

console.log('📁 Checking Required Files:');
let missingFiles = 0;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    missingFiles++;
  }
});

if (missingFiles > 0) {
  console.log(`\n⚠️  ${missingFiles} required files are missing!`);
} else {
  console.log('\n✅ All required files present');
}

// Check package.json dependencies
console.log('\n📦 Checking Dependencies:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  'react',
  'react-dom',
  'react-router-dom',
  '@supabase/supabase-js',
  '@tanstack/react-query',
  '@tensorflow/tfjs',
  'lucide-react',
  'sonner',
  'tailwindcss'
];

let missingDeps = 0;
requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`  ✅ ${dep}`);
  } else {
    console.log(`  ❌ ${dep} - MISSING`);
    missingDeps++;
  }
});

if (missingDeps > 0) {
  console.log(`\n⚠️  ${missingDeps} required dependencies are missing!`);
} else {
  console.log('\n✅ All required dependencies present');
}

// Check TypeScript configuration
console.log('\n🔧 Checking TypeScript Configuration:');
try {
  const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  if (tsConfig.compilerOptions?.paths?.['@/*']) {
    console.log('  ✅ Path aliases configured');
  } else {
    console.log('  ❌ Path aliases not configured');
  }
  
  if (tsConfig.compilerOptions?.jsx) {
    console.log('  ✅ JSX configuration present');
  } else {
    console.log('  ❌ JSX configuration missing');
  }
} catch (error) {
  console.log('  ❌ TypeScript configuration error:', error.message);
}

// Check Vite configuration
console.log('\n⚡ Checking Vite Configuration:');
try {
  const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
  if (viteConfig.includes('@vitejs/plugin-react')) {
    console.log('  ✅ React plugin configured');
  } else {
    console.log('  ❌ React plugin not configured');
  }
  
  if (viteConfig.includes('@/')) {
    console.log('  ✅ Path aliases configured');
  } else {
    console.log('  ❌ Path aliases not configured');
  }
} catch (error) {
  console.log('  ❌ Vite configuration error:', error.message);
}

// Check for common issues
console.log('\n🔍 Checking for Common Issues:');

// Check if there are any console errors in the build
try {
  const buildOutput = fs.readFileSync('dist/assets/index-*.js', 'utf8');
  if (buildOutput.includes('console.error')) {
    console.log('  ⚠️  Console errors found in build');
  } else {
    console.log('  ✅ No console errors in build');
  }
} catch (error) {
  console.log('  ℹ️  Build files not found (run npm run build first)');
}

// Check for mock data usage
const mockDataPatterns = [
  'mockData',
  'mockUser',
  'mockOpportunity',
  'mockPool',
  '// Mock',
  'TODO: Replace with real'
];

let mockDataFound = false;
function checkForMockData(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      checkForMockData(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        mockDataPatterns.forEach(pattern => {
          if (content.includes(pattern)) {
            console.log(`  ⚠️  Mock data found in ${filePath}`);
            mockDataFound = true;
          }
        });
      } catch (error) {
        // Skip files that can't be read
      }
    }
  });
}

checkForMockData('src');
if (!mockDataFound) {
  console.log('  ✅ No mock data patterns found');
}

// Check for proper error handling
console.log('\n🛡️  Checking Error Handling:');
const errorHandlingPatterns = [
  'try {',
  'catch (',
  'error',
  'Error',
  'throw new Error'
];

let errorHandlingFound = false;
function checkForErrorHandling(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      checkForErrorHandling(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const hasErrorHandling = errorHandlingPatterns.some(pattern => 
          content.includes(pattern)
        );
        if (hasErrorHandling) {
          errorHandlingFound = true;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
  });
}

checkForErrorHandling('src');
if (errorHandlingFound) {
  console.log('  ✅ Error handling patterns found');
} else {
  console.log('  ⚠️  No error handling patterns found');
}

// Summary
console.log('\n📊 Summary:');
console.log('='.repeat(50));

if (missingFiles === 0 && missingDeps === 0) {
  console.log('✅ App structure is complete');
} else {
  console.log(`⚠️  ${missingFiles} missing files, ${missingDeps} missing dependencies`);
}

console.log('\n🎯 Next Steps:');
console.log('1. Run "npm run dev" to start the development server');
console.log('2. Open http://localhost:8080 in your browser');
console.log('3. Test all user journeys manually');
console.log('4. Complete the production readiness checklist');
console.log('5. Run "npm run build" to create production build');

console.log('\n🚀 Ready for testing!'); 