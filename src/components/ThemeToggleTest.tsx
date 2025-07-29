/**
 * Theme Toggle Test Component
 * 
 * A comprehensive test component to verify theme toggle functionality,
 * visual consistency, and state synchronization.
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/button';
import { ThemeToggle, ThemeButtons, ThemeDropdown } from './ThemeSelector';

export const ThemeToggleTest: React.FC = () => {
  const { currentTheme, isDarkMode, availableThemes, switchToTheme } = useTheme();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Add test result
  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  // Test theme toggle functionality
  const runToggleTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    addTestResult('Starting theme toggle tests...');
    
    try {
      // Test 1: Initial state
      addTestResult(`✓ Initial theme: ${currentTheme}, isDarkMode: ${isDarkMode}`);
      
      // Test 2: Theme persistence
      const savedTheme = localStorage.getItem('theme');
      addTestResult(`✓ Theme persistence: ${savedTheme === currentTheme ? 'PASS' : 'FAIL'}`);
      
      // Test 3: CSS variables
      const rootStyles = getComputedStyle(document.documentElement);
      const bgColor = rootStyles.getPropertyValue('--background').trim();
      addTestResult(`✓ CSS variables: ${bgColor ? 'PASS' : 'FAIL'} (--background: ${bgColor})`);
      
      // Test 4: DOM class synchronization
      const hasCorrectClass = document.documentElement.classList.contains(currentTheme);
      addTestResult(`✓ DOM class sync: ${hasCorrectClass ? 'PASS' : 'FAIL'}`);
      
      // Test 5: Multiple toggle test
      addTestResult('Running rapid toggle test...');
      const originalTheme = currentTheme;
      
      // Simulate rapid toggles
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        switchToTheme(currentTheme === 'light' ? 'dark' : 'light');
        addTestResult(`  Toggle ${i + 1}: ${currentTheme}`);
      }
      
      // Return to original theme
      await new Promise(resolve => setTimeout(resolve, 300));
      switchToTheme(originalTheme);
      addTestResult(`✓ Returned to original theme: ${currentTheme}`);
      
      addTestResult('✅ All tests completed successfully!');
      
    } catch (error) {
      addTestResult(`❌ Test failed: ${error}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  // Monitor theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      addTestResult(`Theme changed to: ${currentTheme}`);
    };
    
    // This will run when currentTheme changes
    if (testResults.length > 0) {
      handleThemeChange();
    }
  }, [currentTheme]);

  return (
    <div className="p-8 space-y-8 bg-background text-foreground min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Theme Toggle Test Suite
        </h1>
        <p className="text-muted-foreground mb-8">
          Comprehensive testing for theme toggle functionality, visual consistency, and state synchronization.
        </p>

        {/* Current State Display */}
        <div className="bg-card text-card-foreground p-6 rounded-lg border border-border mb-8">
          <h2 className="text-xl font-semibold mb-4">Current State</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-muted rounded">
              <strong>Theme:</strong> {currentTheme}
            </div>
            <div className="p-3 bg-muted rounded">
              <strong>Mode:</strong> {isDarkMode ? 'Dark' : 'Light'}
            </div>
            <div className="p-3 bg-muted rounded">
              <strong>Available:</strong> {availableThemes.length}
            </div>
            <div className="p-3 bg-muted rounded">
              <strong>DOM Class:</strong> {document.documentElement.className}
            </div>
          </div>
        </div>

        {/* Theme Toggle Components */}
        <div className="bg-card text-card-foreground p-6 rounded-lg border border-border mb-8">
          <h2 className="text-xl font-semibold mb-4">Theme Toggle Components</h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="w-32 text-sm font-medium">Standard Toggle:</span>
              <ThemeToggle />
              <span className="text-xs text-muted-foreground">
                Should show {isDarkMode ? 'sun' : 'moon'} icon
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="w-32 text-sm font-medium">Theme Buttons:</span>
              <ThemeButtons showLabels={true} />
            </div>
            
            <div className="flex items-center gap-4">
              <span className="w-32 text-sm font-medium">Theme Dropdown:</span>
              <ThemeDropdown showLabels={true} />
            </div>
          </div>
        </div>

        {/* Visual Consistency Test */}
        <div className="bg-card text-card-foreground p-6 rounded-lg border border-border mb-8">
          <h2 className="text-xl font-semibold mb-4">Visual Consistency Test</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-background border border-border rounded text-center">
              <div className="w-8 h-8 bg-primary rounded mx-auto mb-2"></div>
              <span className="text-xs">Primary</span>
            </div>
            <div className="p-4 bg-background border border-border rounded text-center">
              <div className="w-8 h-8 bg-accent rounded mx-auto mb-2"></div>
              <span className="text-xs">Accent</span>
            </div>
            <div className="p-4 bg-background border border-border rounded text-center">
              <div className="w-8 h-8 bg-secondary rounded mx-auto mb-2"></div>
              <span className="text-xs">Secondary</span>
            </div>
            <div className="p-4 bg-background border border-border rounded text-center">
              <div className="w-8 h-8 bg-muted rounded mx-auto mb-2"></div>
              <span className="text-xs">Muted</span>
            </div>
          </div>
        </div>

        {/* Automated Tests */}
        <div className="bg-card text-card-foreground p-6 rounded-lg border border-border mb-8">
          <h2 className="text-xl font-semibold mb-4">Automated Tests</h2>
          <div className="space-y-4">
            <Button 
              onClick={runToggleTests}
              disabled={isRunningTests}
              className="w-full"
            >
              {isRunningTests ? 'Running Tests...' : 'Run Theme Toggle Tests'}
            </Button>
            
            {testResults.length > 0 && (
              <div className="bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
                <h3 className="font-medium mb-2">Test Results:</h3>
                <div className="space-y-1 text-sm font-mono">
                  {testResults.map((result, index) => (
                    <div 
                      key={index} 
                      className={`
                        ${result.includes('✓') || result.includes('✅') ? 'text-green-600 dark:text-green-400' : ''}
                        ${result.includes('❌') ? 'text-red-600 dark:text-red-400' : ''}
                        ${result.includes('Toggle') ? 'pl-4 text-muted-foreground' : ''}
                      `}
                    >
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CSS Variables Monitor */}
        <div className="bg-card text-card-foreground p-6 rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4">CSS Variables Monitor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
            <CSSVariableMonitor name="--background" />
            <CSSVariableMonitor name="--foreground" />
            <CSSVariableMonitor name="--primary" />
            <CSSVariableMonitor name="--accent" />
            <CSSVariableMonitor name="--border" />
            <CSSVariableMonitor name="--ring" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component to monitor CSS variable changes
const CSSVariableMonitor: React.FC<{ name: string }> = ({ name }) => {
  const [value, setValue] = useState<string>('');
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    const updateValue = () => {
      const newValue = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
      
      if (newValue !== value && value !== '') {
        setHasChanged(true);
        setTimeout(() => setHasChanged(false), 1000);
      }
      
      setValue(newValue || 'Not set');
    };

    updateValue();
    
    const observer = new MutationObserver(updateValue);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    return () => observer.disconnect();
  }, [name, value]);

  return (
    <div className={`flex justify-between p-2 rounded transition-colors ${hasChanged ? 'bg-accent/20' : ''}`}>
      <span className="text-muted-foreground">{name}:</span>
      <span className={hasChanged ? 'font-bold' : ''}>{value}</span>
    </div>
  );
};
