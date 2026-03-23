import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, Briefcase, Building, Calendar, BookOpen, 
  Users, Award, MapPin, HelpCircle, Image as ImageIcon
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PromptTemplate {
  id: string;
  icon: React.ElementType;
  label: string;
  prompt: string;
  category: 'admissions' | 'placements' | 'campus' | 'academics' | 'general' | 'creative';
}

const templates: PromptTemplate[] = [
  { id: '1', icon: GraduationCap, label: 'Admission Requirements', prompt: 'What are the admission requirements for B.Tech programs at IARE? Include eligibility criteria, entrance exams, and important dates.', category: 'admissions' },
  { id: '2', icon: GraduationCap, label: 'Fee Structure', prompt: 'Provide the complete fee structure for all B.Tech programs at IARE for the academic year 2025-2026.', category: 'admissions' },
  { id: '3', icon: Briefcase, label: 'Placement Statistics', prompt: 'Show me the latest placement statistics for IARE including top recruiters, highest packages, and average salary.', category: 'placements' },
  { id: '4', icon: Briefcase, label: 'Top Recruiters', prompt: 'List the top recruiting companies that visit IARE for campus placements with the roles they hire for.', category: 'placements' },
  { id: '5', icon: Building, label: 'Campus Facilities', prompt: 'Describe all the campus facilities available at IARE including labs, library, hostels, sports, and Wi-Fi.', category: 'campus' },
  { id: '6', icon: MapPin, label: 'How to Reach', prompt: 'How to reach IARE campus from Hyderabad city? Provide directions from airport, railway station, and bus stand.', category: 'campus' },
  { id: '7', icon: Calendar, label: 'Academic Calendar', prompt: 'Show the academic calendar for 2025-2026 including semester dates, exam schedules, and holidays.', category: 'academics' },
  { id: '8', icon: BookOpen, label: 'Available Courses', prompt: 'List all undergraduate and postgraduate courses offered at IARE with their specializations.', category: 'academics' },
  { id: '9', icon: Users, label: 'Faculty Information', prompt: 'Tell me about the faculty at IARE - their qualifications, experience, and notable achievements.', category: 'academics' },
  { id: '10', icon: Award, label: 'Accreditations', prompt: 'What accreditations and rankings does IARE hold? Include NAAC, NBA, NIRF details.', category: 'general' },
  { id: '11', icon: HelpCircle, label: 'Scholarships', prompt: 'What scholarships are available for students at IARE? Include merit-based and need-based options.', category: 'general' },
  { id: '12', icon: ImageIcon, label: 'Generate Campus Image', prompt: 'Generate an image of a modern aeronautical engineering campus with lush green surroundings and futuristic buildings', category: 'creative' },
];

const categoryColors: Record<string, string> = {
  admissions: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  placements: 'bg-green-500/10 text-green-600 dark:text-green-400',
  campus: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  academics: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  general: 'bg-muted text-muted-foreground',
  creative: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
};

interface PromptTemplatesProps {
  onSelect: (prompt: string) => void;
}

export const PromptTemplates = ({ onSelect }: PromptTemplatesProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8">
          <BookOpen className="h-3.5 w-3.5" />
          Templates
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b border-border">
          <h4 className="font-semibold text-sm">Quick Prompts</h4>
          <p className="text-xs text-muted-foreground">Select a template to get started</p>
        </div>
        <ScrollArea className="h-72">
          <div className="p-2 space-y-1">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelect(t.prompt)}
                className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
              >
                <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <t.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t.label}</span>
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${categoryColors[t.category]}`}>
                      {t.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{t.prompt}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
