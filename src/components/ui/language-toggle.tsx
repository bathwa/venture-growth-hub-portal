
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageToggle() {
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'nd'>('en');

  const handleLanguageChange = (language: 'en' | 'nd') => {
    setCurrentLanguage(language);
    // TODO: Implement i18n language switching
    console.log(`Language changed to: ${language}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          {currentLanguage === 'en' ? 'EN' : 'ND'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white">
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('en')}
          className={currentLanguage === 'en' ? 'bg-blue-50' : ''}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('nd')}
          className={currentLanguage === 'nd' ? 'bg-blue-50' : ''}
        >
          isiNdebele
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
