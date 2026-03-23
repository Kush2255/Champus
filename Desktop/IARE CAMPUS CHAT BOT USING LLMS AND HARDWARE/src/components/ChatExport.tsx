import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatExportProps {
  messages: Message[];
  disabled?: boolean;
}

export const ChatExport = ({ messages, disabled }: ChatExportProps) => {
  const { toast } = useToast();

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ description: `Exported as ${filename}` });
  };

  const exportAsMarkdown = () => {
    const date = new Date().toISOString().split('T')[0];
    let md = `# IARE Chat Export\n\n**Date:** ${date}\n**Messages:** ${messages.length}\n\n---\n\n`;
    messages.forEach((m) => {
      const role = m.role === 'user' ? '👤 You' : '🤖 IARE Assistant';
      md += `### ${role}\n_${m.timestamp}_\n\n${m.content}\n\n---\n\n`;
    });
    downloadFile(md, `iare-chat-${date}.md`, 'text/markdown');
  };

  const exportAsText = () => {
    const date = new Date().toISOString().split('T')[0];
    const content = messages.map(m => `[${m.timestamp}] ${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    downloadFile(`IARE Chat Export - ${date}\n${'='.repeat(40)}\n\n${content}`, `iare-chat-${date}.txt`, 'text/plain');
  };

  const exportAsJSON = () => {
    const date = new Date().toISOString().split('T')[0];
    const data = { exportDate: date, messageCount: messages.length, messages: messages.map(m => ({ role: m.role, content: m.content, timestamp: m.timestamp })) };
    downloadFile(JSON.stringify(data, null, 2), `iare-chat-${date}.json`, 'application/json');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={disabled}>
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsMarkdown}>
          <FileText className="h-4 w-4 mr-2" />Markdown (.md)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsText}>
          <FileText className="h-4 w-4 mr-2" />Plain Text (.txt)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsJSON}>
          <Code className="h-4 w-4 mr-2" />JSON (.json)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
