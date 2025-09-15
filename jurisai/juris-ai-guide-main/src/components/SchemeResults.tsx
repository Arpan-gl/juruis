
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Search, ExternalLink } from 'lucide-react';

interface Scheme {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  applicationLink: string;
  category: string;
}

interface SchemeResultsProps {
  results: {
    schemes: Scheme[];
  };
  onReset: () => void;
}

const SchemeResults = ({ results, onReset }: SchemeResultsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = ['all', ...Array.from(new Set(results.schemes.map(scheme => scheme.category)))];
  
  const filteredSchemes = results.schemes.filter(scheme => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      scheme.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schemes..."
            className="pl-8"
          />
        </div>
        
        <ToggleGroup type="single" value={selectedCategory} onValueChange={(value) => value && setSelectedCategory(value)}>
          {categories.map((category) => (
            <ToggleGroupItem key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        
        <Button variant="outline" onClick={onReset}>
          Start Over
        </Button>
      </div>
      
      {filteredSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <Card key={scheme.id}>
              <CardHeader>
                <CardTitle>{scheme.name}</CardTitle>
                <CardDescription>{scheme.category} Scheme</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{scheme.description}</p>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm">
                  <strong>Eligibility:</strong> {scheme.eligibility}
                </div>
              </CardContent>
              <CardFooter>
                <a 
                  href={scheme.applicationLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 text-juris-primary hover:underline"
                >
                  Apply Now
                  <ExternalLink className="h-4 w-4" />
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No matching schemes found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
          <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default SchemeResults;
