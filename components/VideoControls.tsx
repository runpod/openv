import { Grid2X2, Grid3X3, List, Search, SortAsc } from 'lucide-react'
import React from 'react';

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type GridView = '2x2' | '3x3' | 'list'
type SortOption = 'newest' | 'oldest' | 'name_asc' | 'name_desc'

type VideoControlsProps = {
  gridView: GridView
  setGridView: (view: GridView) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  sortOption: SortOption
  setSortOption: (option: SortOption) => void
}

const VideoControls: React.FC<VideoControlsProps> = ({
  gridView,
  setGridView,
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption
}) => {
  return (
    <div className="flex items-center justify-end">
      <div className="flex items-center space-x-2 mr-4">
          <Label htmlFor="grid-view" className="sr-only">View:</Label>
          <Button
            variant={gridView === '2x2' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setGridView('2x2')}
          >
            <Grid2X2 className="h-4 w-4" />
          </Button>
          <Button
            variant={gridView === '3x3' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setGridView('3x3')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={gridView === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setGridView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <SortAsc className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortOption('newest')}>
              Newest
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOption('oldest')}>
              Oldest
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOption('name_asc')}>
              Name (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOption('name_desc')}>
              Name (Z-A)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="relative w-64 ml-4">
        <Input
          type="text"
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
};

export default VideoControls;

