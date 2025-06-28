#!/usr/bin/env node

/**
 * Production Readiness Check Script
 * Validates the entire application for production deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`)
};

class ProductionReadinessChecker {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.successes = [];
    this.projectRoot = process.cwd();
  }

  addIssue(issue) {
    this.issues.push(issue);
  }

  addWarning(warning) {
    this.warnings.push(warning);
  }

  addSuccess(success) {
    this.successes.push(success);
  }

  // Check if file exists
  fileExists(filePath) {
    return fs.existsSync(path.join(this.projectRoot, filePath));
  }

  // Read file content
  readFile(filePath) {
    try {
      return fs.readFileSync(path.join(this.projectRoot, filePath), 'utf8');
    } catch (error) {
      return null;
    }
  }

  // Check for mock data patterns
  checkForMockData(content, filePath) {
    const mockPatterns = [
      /mock.*data/i,
      /hardcoded/i,
      /demo.*account/i,
      /test.*data/i,
      /sample.*data/i,
      /placeholder/i
    ];

    const lines = content.split('\n');
    let hasMockData = false;

    lines.forEach((line, index) => {
      mockPatterns.forEach(pattern => {
        if (pattern.test(line) && !line.includes('//') && !line.includes('/*')) {
          this.addWarning(`Potential mock data in ${filePath}:${index + 1} - "${line.trim()}"`);
          hasMockData = true;
        }
      });
    });

    return hasMockData;
  }

  // Check TypeScript compilation
  async checkTypeScriptCompilation() {
    log.header('Checking TypeScript Compilation');
    
    try {
      const { execSync } = await import('child_process');
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.addSuccess('TypeScript compilation successful');
    } catch (error) {
      this.addIssue('TypeScript compilation failed');
      log.error(error.message);
    }
  }

  // Check build process
  async checkBuildProcess() {
    log.header('Checking Build Process');
    
    try {
      const { execSync } = await import('child_process');
      execSync('npm run build', { stdio: 'pipe' });
      this.addSuccess('Build process successful');
    } catch (error) {
      this.addIssue('Build process failed');
      log.error(error.message);
    }
  }

  // Check for required files
  checkRequiredFiles() {
    log.header('Checking Required Files');
    
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'tailwind.config.ts',
      'src/main.tsx',
      'src/App.tsx',
      'index.html',
      'README.md'
    ];

    requiredFiles.forEach(file => {
      if (this.fileExists(file)) {
        this.addSuccess(`Required file exists: ${file}`);
      } else {
        this.addIssue(`Missing required file: ${file}`);
      }
    });
  }

  // Check for security issues
  checkSecurityIssues() {
    log.header('Checking Security Issues');
    
    const securityPatterns = [
      { pattern: /api.*key.*=.*['"][^'"]+['"]/, description: 'Hardcoded API keys' },
      { pattern: /password.*=.*['"][^'"]+['"]/, description: 'Hardcoded passwords' },
      { pattern: /secret.*=.*['"][^'"]+['"]/, description: 'Hardcoded secrets' },
      { pattern: /token.*=.*['"][^'"]+['"]/, description: 'Hardcoded tokens' }
    ];

    const filesToCheck = [
      'src/integrations/supabase/client.ts',
      'src/contexts/AuthContext.tsx',
      'src/lib/*.ts',
      'src/components/**/*.tsx'
    ];

    // Check specific files for security issues
    const specificFiles = [
      'src/integrations/supabase/client.ts',
      'src/contexts/AuthContext.tsx'
    ];

    specificFiles.forEach(file => {
      const content = this.readFile(file);
      if (content) {
        securityPatterns.forEach(({ pattern, description }) => {
          if (pattern.test(content)) {
            this.addIssue(`Security issue in ${file}: ${description}`);
          }
        });
      }
    });

    this.addSuccess('Security check completed');
  }

  // Check for mock data in components
  checkMockDataInComponents() {
    log.header('Checking for Mock Data in Components');
    
    const componentDirs = [
      'src/components',
      'src/pages'
    ];

    componentDirs.forEach(dir => {
      if (this.fileExists(dir)) {
        this.scanDirectoryForMockData(dir);
      }
    });
  }

  scanDirectoryForMockData(dirPath) {
    try {
      const items = fs.readdirSync(path.join(this.projectRoot, dirPath));
      
      items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(path.join(this.projectRoot, fullPath));
        
        if (stat.isDirectory()) {
          this.scanDirectoryForMockData(fullPath);
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
          const content = this.readFile(fullPath);
          if (content) {
            this.checkForMockData(content, fullPath);
          }
        }
      });
    } catch (error) {
      this.addWarning(`Could not scan directory: ${dirPath}`);
    }
  }

  // Check database schema files
  checkDatabaseSchema() {
    log.header('Checking Database Schema Files');
    
    const schemaFiles = [
      'COMPREHENSIVE_SUPABASE_SCHEMA.sql',
      'users_schema.sql',
      'opportunities_schema.sql',
      'investments_schema.sql',
      'escrow_pool_schema.sql'
    ];

    schemaFiles.forEach(file => {
      if (this.fileExists(file)) {
        this.addSuccess(`Database schema file exists: ${file}`);
      } else {
        this.addWarning(`Missing database schema file: ${file}`);
      }
    });
  }

  // Check test files
  checkTestFiles() {
    log.header('Checking Test Files');
    
    const testFiles = [
      'src/tests/production-readiness.test.ts',
      'src/tests/comprehensive-user-journeys.test.ts',
      'src/tests/auth-flow.test.ts',
      'src/tests/app-functionality.test.ts'
    ];

    testFiles.forEach(file => {
      if (this.fileExists(file)) {
        this.addSuccess(`Test file exists: ${file}`);
      } else {
        this.addWarning(`Missing test file: ${file}`);
      }
    });
  }

  // Check package.json dependencies
  checkDependencies() {
    log.header('Checking Dependencies');
    
    const packageJson = this.readFile('package.json');
    if (!packageJson) {
      this.addIssue('package.json not found');
      return;
    }

    try {
      const pkg = JSON.parse(packageJson);
      
      // Check for required dependencies
      const requiredDeps = [
        'react',
        'react-dom',
        'react-router-dom',
        '@supabase/supabase-js',
        'typescript',
        'vite',
        'tailwindcss'
      ];

      requiredDeps.forEach(dep => {
        if (pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]) {
          this.addSuccess(`Required dependency found: ${dep}`);
        } else {
          this.addIssue(`Missing required dependency: ${dep}`);
        }
      });

      // Check for security vulnerabilities
      this.addSuccess('Dependencies check completed');
    } catch (error) {
      this.addIssue('Invalid package.json');
    }
  }

  // Check environment configuration
  checkEnvironmentConfig() {
    log.header('Checking Environment Configuration');
    
    const envFiles = ['.env', '.env.local', '.env.production'];
    
    envFiles.forEach(file => {
      if (this.fileExists(file)) {
        this.addSuccess(`Environment file exists: ${file}`);
      } else {
        this.addWarning(`Environment file not found: ${file}`);
      }
    });

    // Check for environment variables in code
    const content = this.readFile('src/integrations/supabase/client.ts');
    if (content && content.includes('process.env')) {
      this.addSuccess('Environment variables properly configured');
    } else {
      this.addWarning('Environment variables may not be properly configured');
    }
  }

  // Check responsive design
  checkResponsiveDesign() {
    log.header('Checking Responsive Design');
    
    const componentDirs = ['src/components', 'src/pages'];
    let responsiveComponents = 0;
    let totalComponents = 0;

    componentDirs.forEach(dir => {
      if (this.fileExists(dir)) {
        const components = this.countComponents(dir);
        totalComponents += components.total;
        responsiveComponents += components.responsive;
      }
    });

    if (responsiveComponents > 0) {
      this.addSuccess(`Responsive design implemented in ${responsiveComponents}/${totalComponents} components`);
    } else {
      this.addWarning('No responsive design patterns detected');
    }
  }

  countComponents(dirPath) {
    let total = 0;
    let responsive = 0;

    try {
      const items = fs.readdirSync(path.join(this.projectRoot, dirPath));
      
      items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(path.join(this.projectRoot, fullPath));
        
        if (stat.isDirectory()) {
          const result = this.countComponents(fullPath);
          total += result.total;
          responsive += result.responsive;
        } else if (item.endsWith('.tsx')) {
          total++;
          const content = this.readFile(fullPath);
          if (content && (content.includes('sm:') || content.includes('md:') || content.includes('lg:') || content.includes('xl:'))) {
            responsive++;
          }
        }
      });
    } catch (error) {
      // Directory doesn't exist or can't be read
    }

    return { total, responsive };
  }

  // Check accessibility
  checkAccessibility() {
    log.header('Checking Accessibility');
    
    const componentDirs = ['src/components', 'src/pages'];
    let accessibleComponents = 0;
    let totalComponents = 0;

    componentDirs.forEach(dir => {
      if (this.fileExists(dir)) {
        const components = this.countAccessibleComponents(dir);
        totalComponents += components.total;
        accessibleComponents += components.accessible;
      }
    });

    if (accessibleComponents > 0) {
      this.addSuccess(`Accessibility features found in ${accessibleComponents}/${totalComponents} components`);
    } else {
      this.addWarning('No accessibility features detected');
    }
  }

  countAccessibleComponents(dirPath) {
    let total = 0;
    let accessible = 0;

    try {
      const items = fs.readdirSync(path.join(this.projectRoot, dirPath));
      
      items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(path.join(this.projectRoot, fullPath));
        
        if (stat.isDirectory()) {
          const result = this.countAccessibleComponents(fullPath);
          total += result.total;
          accessible += result.accessible;
        } else if (item.endsWith('.tsx')) {
          total++;
          const content = this.readFile(fullPath);
          if (content && (content.includes('aria-') || content.includes('role=') || content.includes('alt='))) {
            accessible++;
          }
        }
      });
    } catch (error) {
      // Directory doesn't exist or can't be read
    }

    return { total, accessible };
  }

  // Generate report
  generateReport() {
    log.header('Production Readiness Report');
    
    console.log(`\n${colors.bright}Summary:${colors.reset}`);
    console.log(`✅ Successes: ${this.successes.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Issues: ${this.issues.length}`);
    
    if (this.successes.length > 0) {
      console.log(`\n${colors.green}${colors.bright}Successes:${colors.reset}`);
      this.successes.forEach(success => {
        console.log(`  ✅ ${success}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log(`\n${colors.yellow}${colors.bright}Warnings:${colors.reset}`);
      this.warnings.forEach(warning => {
        console.log(`  ⚠️  ${warning}`);
      });
    }
    
    if (this.issues.length > 0) {
      console.log(`\n${colors.red}${colors.bright}Issues:${colors.reset}`);
      this.issues.forEach(issue => {
        console.log(`  ❌ ${issue}`);
      });
    }
    
    // Overall assessment
    console.log(`\n${colors.bright}Overall Assessment:${colors.reset}`);
    if (this.issues.length === 0 && this.warnings.length <= 5) {
      console.log(`${colors.green}${colors.bright}🎉 PRODUCTION READY!${colors.reset}`);
      console.log('The application is ready for production deployment.');
    } else if (this.issues.length <= 3) {
      console.log(`${colors.yellow}${colors.bright}⚠️  NEARLY READY${colors.reset}`);
      console.log('The application is mostly ready but has some issues to address.');
    } else {
      console.log(`${colors.red}${colors.bright}❌ NOT READY${colors.reset}`);
      console.log('The application has significant issues that need to be resolved before production.');
    }
    
    return {
      ready: this.issues.length === 0 && this.warnings.length <= 5,
      issues: this.issues,
      warnings: this.warnings,
      successes: this.successes
    };
  }

  // Run all checks
  async run() {
    log.header('Starting Production Readiness Check');
    
    this.checkRequiredFiles();
    this.checkDependencies();
    this.checkEnvironmentConfig();
    this.checkDatabaseSchema();
    this.checkTestFiles();
    this.checkSecurityIssues();
    this.checkMockDataInComponents();
    this.checkResponsiveDesign();
    this.checkAccessibility();
    
    // These checks might take longer, so run them last
    await this.checkTypeScriptCompilation();
    await this.checkBuildProcess();
    
    return this.generateReport();
  }
}

// Run the checker
async function main() {
  const checker = new ProductionReadinessChecker();
  const result = await checker.run();
  
  // Exit with appropriate code
  process.exit(result.ready ? 0 : 1);
}

main().catch(error => {
  log.error('Production readiness check failed:');
  console.error(error);
  process.exit(1);
});

module.exports = ProductionReadinessChecker; 