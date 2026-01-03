import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  title: string;
  breadcrumb?: string[];
}

export const Header = ({ title, breadcrumb = [] }: HeaderProps) => {
  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="h-full flex items-center justify-between px-6">
        {/* Breadcrumb */}
        <div>
          {breadcrumb.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              {breadcrumb.map((item, index) => (
                <span key={index} className="flex items-center gap-2">
                  {item}
                  {index < breadcrumb.length - 1 && <span>/</span>}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents, templates..."
              className="pl-10 bg-muted/50 border-border focus:bg-background"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary">
              3
            </Badge>
          </Button>

          {/* User */}
          <Avatar className="h-9 w-9 cursor-pointer">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=priya" />
            <AvatarFallback>PS</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};
