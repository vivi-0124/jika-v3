'use client';

import { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface LectureSearchProps {
  onSearch: (results: Lecture[]) => void;
}

interface Lecture {
  id: number;
  term: string;
  dayOfWeek: string;
  period: string;
  classroom: string;
  classroomCapacity: number;
  targetCommon: string;
  targetIntlStudies: string;
  targetIntlCulture: string;
  targetIntlTourism: string;
  targetSportsHealth: string;
  targetNursing: string;
  targetHealthInfo: string;
  isRemoteClass: string;
  subjectName: string;
  className: string;
  credits: number;
  concurrentSlots: string;
  isPartTimeLecturer: string;
  instructorName: string;
}

export default function LectureSearch({ onSearch }: LectureSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    dayOfWeek: 'all',
    period: 'all',
    term: '前学期',
    target: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (filters.dayOfWeek && filters.dayOfWeek !== 'all') params.append('dayOfWeek', filters.dayOfWeek);
      if (filters.period && filters.period !== 'all') params.append('period', filters.period);
      if (filters.term) params.append('term', filters.term);
      if (filters.target && filters.target !== 'all') params.append('target', filters.target);

      const response = await fetch(`/api/lectures?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      onSearch(data);
    } catch (error) {
      console.error('検索エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      dayOfWeek: 'all',
      period: 'all',
      term: '前学期',
      target: 'all'
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== 'all' && value !== '前学期').length;

  return (
    <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
      <CardContent className="space-y-4 p-6">
        {/* 検索バー */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-5 w-5 text-white" />
            <h2 className="text-xl font-bold text-white">授業検索</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              type="text"
              placeholder="科目名、教員名、クラス名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 border-white/20 focus:border-indigo-400 focus:ring-indigo-400 bg-black/20 backdrop-blur-sm text-white placeholder:text-white/60"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
            >
              <Filter className="h-4 w-4" />
              <span>フィルター</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                  {activeFiltersCount}
                </Badge>
              )}
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
            >
              {loading ? '検索中...' : '検索'}
            </Button>
          </div>
        </div>

        {/* フィルター */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t border-white/20">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">曜日</label>
                <Select value={filters.dayOfWeek} onValueChange={(value) => setFilters({ ...filters, dayOfWeek: value })}>
                  <SelectTrigger className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
                    <SelectValue placeholder="すべて" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20 text-white/80">
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="月">月曜日</SelectItem>
                    <SelectItem value="火">火曜日</SelectItem>
                    <SelectItem value="水">水曜日</SelectItem>
                    <SelectItem value="木">木曜日</SelectItem>
                    <SelectItem value="金">金曜日</SelectItem>
                    <SelectItem value="土">土曜日</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">時限</label>
                <Select value={filters.period} onValueChange={(value) => setFilters({ ...filters, period: value })}>
                  <SelectTrigger className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
                    <SelectValue placeholder="すべて" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20 text-white/80">
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="１限">1限</SelectItem>
                    <SelectItem value="２限">2限</SelectItem>
                    <SelectItem value="３限">3限</SelectItem>
                    <SelectItem value="４限">4限</SelectItem>
                    <SelectItem value="５限">5限</SelectItem>
                    <SelectItem value="６限">6限</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">学期</label>
                <Select value={filters.term} onValueChange={(value) => setFilters({ ...filters, term: value })}>
                  <SelectTrigger className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20 text-white/80">
                    <SelectItem value="前学期">前学期</SelectItem>
                    <SelectItem value="後学期">後学期</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">対象学科</label>
                <Select value={filters.target} onValueChange={(value) => setFilters({ ...filters, target: value })}>
                  <SelectTrigger className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
                    <SelectValue placeholder="すべて" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20 text-white/80">
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="共１">共通科目</SelectItem>
                    <SelectItem value="群１">国際教養学科</SelectItem>
                    <SelectItem value="群２">国際文化学科</SelectItem>
                    <SelectItem value="群３">国際観光学科</SelectItem>
                    <SelectItem value="群４">スポーツ健康学科</SelectItem>
                    <SelectItem value="看護">看護学科</SelectItem>
                    <SelectItem value="情１">健康情報学科</SelectItem>
                    <SelectItem value="情２">健康情報学科（情報系）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button
                onClick={clearFilters}
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1 text-white/60 hover:text-white"
              >
                <X className="h-3 w-3" />
                <span>フィルターをクリア</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 