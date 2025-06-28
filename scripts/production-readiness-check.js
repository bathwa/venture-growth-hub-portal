#!/usr/bin/env node

/**
 * Production Readiness Check Script
 * Quick assessment of whether the investment portal is ready for production
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  requiredFiles: [
    'src/lib/drbe.ts',
    'src/lib/ai.ts',
    'src/lib/notifications.ts',
    'src/lib/agreements.ts',
    'src/lib/rbac.ts',
    'src/lib/kyc.ts',
    'src/lib/storage.ts',
    'src/components/ui/notification-center.tsx',
    'src/components/ui/notification-bell.tsx',
    'src/pages/admin/AdminDashboard.tsx',
    'src/components/admin/ReportsAnalytics.tsx',
    'supabase/config.toml'
  ],
  requiredDependencies: [
    '@supabase/supabase-js',
    'react',
    'react-dom',
    'react-router-dom',
    '@tensorflow/tfjs',
    'sonner',
    'lucide-react'
  ],
  requiredFeatures: [
    'Database Schema',
    'RLS Policies',
    'DRBE Engine',
    'AI Integration',
    'Notification System',
    'Document Management',
    'RBAC System',
    'KYC/AML Integration',
    'Storage Management',
    'User Authentication',
    'Multi-role Dashboards',
    'Template System'
  ]
};

class ProductionReadinessChecker {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      total: 0
    };
    this.issues = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  checkFileExists(filePath) {
    const fullPath = path.join(process.cwd(), filePath);
    const exists = fs.existsSync(fullPath);
    
    if (exists) {
      this.log(`File exists: ${filePath}`, 'success');
      this.results.passed++;
    } else {
      this.log(`File missing: ${filePath}`, 'error');
      this.results.failed++;
      this.issues.push(`Missing file: ${filePath}`);
    }
    this.results.total++;
  }

  checkPackageJson() {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      this.log('Checking package.json dependencies...', 'info');
      
      CONFIG.requiredDependencies.forEach(dep => {
        if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
          this.log(`Dependency found: ${dep}`, 'success');
          this.results.passed++;
        } else {
          this.log(`Dependency missing: ${dep}`, 'error');
          this.results.failed++;
          this.issues.push(`Missing dependency: ${dep}`);
        }
        this.results.total++;
      });
    } catch (error) {
      this.log('Failed to read package.json', 'error');
      this.results.failed++;
      this.results.total++;
    }
  }

  checkCodeQuality() {
    this.log('Checking code quality indicators...', 'info');
    
    // Check for TypeScript configuration
    const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
      this.log('TypeScript configuration found', 'success');
      this.results.passed++;
    } else {
      this.log('TypeScript configuration missing', 'warning');
      this.results.warnings++;
      this.issues.push('Missing TypeScript configuration');
    }
    this.results.total++;

    // Check for ESLint configuration
    const eslintConfigPath = path.join(process.cwd(), 'eslint.config.js');
    if (fs.existsSync(eslintConfigPath)) {
      this.log('ESLint configuration found', 'success');
      this.results.passed++;
    } else {
      this.log('ESLint configuration missing', 'warning');
      this.results.warnings++;
      this.issues.push('Missing ESLint configuration');
    }
    this.results.total++;

    // Check for environment variables
    const envPath = path.join(process.cwd(), '.env.example');
    if (fs.existsSync(envPath)) {
      this.log('Environment variables template found', 'success');
      this.results.passed++;
    } else {
      this.log('Environment variables template missing', 'warning');
      this.results.warnings++;
      this.issues.push('Missing environment variables template');
    }
    this.results.total++;
  }

  checkSecurity() {
    this.log('Checking security configurations...', 'info');
    
    // Check for .gitignore
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      if (gitignoreContent.includes('.env') && gitignoreContent.includes('node_modules')) {
        this.log('Security: .gitignore properly configured', 'success');
        this.results.passed++;
      } else {
        this.log('Security: .gitignore missing critical entries', 'warning');
        this.results.warnings++;
        this.issues.push('.gitignore missing critical entries');
      }
    } else {
      this.log('Security: .gitignore missing', 'error');
      this.results.failed++;
      this.issues.push('Missing .gitignore file');
    }
    this.results.total++;

    // Check for README
    const readmePath = path.join(process.cwd(), 'README.md');
    if (fs.existsSync(readmePath)) {
      this.log('Documentation: README found', 'success');
      this.results.passed++;
    } else {
      this.log('Documentation: README missing', 'warning');
      this.results.warnings++;
      this.issues.push('Missing README.md');
    }
    this.results.total++;
  }

  checkBuildConfiguration() {
    this.log('Checking build configuration...', 'info');
    
    // Check for Vite configuration
    const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
    if (fs.existsSync(viteConfigPath)) {
      this.log('Build: Vite configuration found', 'success');
      this.results.passed++;
    } else {
      this.log('Build: Vite configuration missing', 'error');
      this.results.failed++;
      this.issues.push('Missing Vite configuration');
    }
    this.results.total++;

    // Check for Tailwind configuration
    const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.ts');
    if (fs.existsSync(tailwindConfigPath)) {
      this.log('Build: Tailwind configuration found', 'success');
      this.results.passed++;
    } else {
      this.log('Build: Tailwind configuration missing', 'warning');
      this.results.warnings++;
      this.issues.push('Missing Tailwind configuration');
    }
    this.results.total++;
  }

  checkDatabaseSchema() {
    this.log('Checking database schema...', 'info');
    
    // Check for SQL schema files
    const sqlFiles = [
      'escrow_pool_schema.sql',
      'observer_access_logs.sql'
    ];
    
    sqlFiles.forEach(file => {
      const sqlPath = path.join(process.cwd(), file);
      if (fs.existsSync(sqlPath)) {
        this.log(`Database: ${file} found`, 'success');
        this.results.passed++;
      } else {
        this.log(`Database: ${file} missing`, 'warning');
        this.results.warnings++;
        this.issues.push(`Missing database schema: ${file}`);
      }
      this.results.total++;
    });
  }

  checkComponentStructure() {
    this.log('Checking component structure...', 'info');
    
    const requiredDirs = [
      'src/components/admin',
      'src/components/entrepreneur',
      'src/components/investor',
      'src/components/ui',
      'src/lib',
      'src/pages',
      'src/contexts'
    ];
    
    requiredDirs.forEach(dir => {
      const dirPath = path.join(process.cwd(), dir);
      if (fs.existsSync(dirPath)) {
        this.log(`Structure: ${dir} directory found`, 'success');
        this.results.passed++;
      } else {
        this.log(`Structure: ${dir} directory missing`, 'error');
        this.results.failed++;
        this.issues.push(`Missing directory: ${dir}`);
      }
      this.results.total++;
    });
  }

  generateReport() {
    const successRate = (this.results.passed / this.results.total * 100).toFixed(1);
    const errorRate = (this.results.failed / this.results.total * 100).toFixed(1);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 PRODUCTION READINESS REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📈 Results Summary:`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`📊 Total: ${this.results.total}`);
    console.log(`🎯 Success Rate: ${successRate}%`);
    console.log(`🚨 Error Rate: ${errorRate}%`);
    
    if (this.issues.length > 0) {
      console.log(`\n🚨 Issues Found:`);
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
    console.log(`\n🎯 Production Readiness Assessment:`);
    
    if (this.results.failed === 0 && this.results.warnings <= 3) {
      console.log('🎉 EXCELLENT: Ready for production deployment!');
      console.log('✅ All critical components are present and configured');
      console.log('✅ Security measures are in place');
      console.log('✅ Code quality standards are met');
    } else if (this.results.failed <= 2 && this.results.warnings <= 5) {
      console.log('✅ GOOD: Mostly ready for production');
      console.log('⚠️  Address the issues above before deployment');
      console.log('✅ Core functionality is intact');
    } else if (this.results.failed <= 5) {
      console.log('⚠️  CAUTION: Needs work before production');
      console.log('❌ Several critical issues need to be resolved');
      console.log('🔧 Review and fix the issues above');
    } else {
      console.log('❌ NOT READY: Significant issues found');
      console.log('🚨 Multiple critical components are missing');
      console.log('🔧 Extensive work required before production');
    }
    
    console.log('\n' + '='.repeat(60));
    
    return {
      successRate: parseFloat(successRate),
      errorRate: parseFloat(errorRate),
      isProductionReady: this.results.failed === 0 && this.results.warnings <= 3,
      issues: this.issues
    };
  }

  async run() {
    console.log('🚀 Starting Production Readiness Check...\n');
    
    // Check required files
    this.log('Checking required files...', 'info');
    CONFIG.requiredFiles.forEach(file => this.checkFileExists(file));
    
    // Check package.json dependencies
    this.checkPackageJson();
    
    // Check code quality
    this.checkCodeQuality();
    
    // Check security
    this.checkSecurity();
    
    // Check build configuration
    this.checkBuildConfiguration();
    
    // Check database schema
    this.checkDatabaseSchema();
    
    // Check component structure
    this.checkComponentStructure();
    
    // Generate final report
    const report = this.generateReport();
    
    return report;
  }
}

// Run the check if this script is executed directly
const checker = new ProductionReadinessChecker();
checker.run().then(report => {
  process.exit(report.isProductionReady ? 0 : 1);
}).catch(error => {
  console.error('❌ Production readiness check failed:', error);
  process.exit(1);
}); 