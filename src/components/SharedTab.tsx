'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar } from 'lucide-react';
import GroupManager from './GroupManager';
import GroupScheduleView from './GroupScheduleView';

interface Group {
  id: number;
  name: string;
  description: string | null;
  createdBy: string;
  inviteCode: string;
  createdAt: string;
  role: string;
  joinedAt: string;
}

export default function SharedTab() {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  console.log('SharedTab rendered');

  const handleGroupSelect = (group: Group | null) => {
    console.log('Group selected:', group);
    setSelectedGroup(group);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">共有タブ</h1>
        <p className="text-white/70">
          グループで時間割を共有し、共通の空きコマを見つけましょう
        </p>
      </div>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/20 backdrop-blur-md border-white/20">
          <TabsTrigger 
            value="groups" 
            className="flex items-center space-x-2 data-[state=active]:bg-white/10 text-white"
          >
            <Users className="h-4 w-4" />
            <span>グループ管理</span>
          </TabsTrigger>
          <TabsTrigger 
            value="schedule" 
            className="flex items-center space-x-2 data-[state=active]:bg-white/10 text-white"
            disabled={!selectedGroup}
          >
            <Calendar className="h-4 w-4" />
            <span>共通空きコマ</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-4">
          <GroupManager 
            onGroupSelect={handleGroupSelect}
            selectedGroup={selectedGroup}
          />
          
          {selectedGroup && (
            <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
              <CardContent className="p-4">
                <div className="text-center text-white/70">
                  <p>「{selectedGroup.name}」を選択しています</p>
                  <p className="text-sm mt-1">
                    <span className="text-indigo-400">共通空きコマ</span>タブで空き時間を確認できます
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          {selectedGroup ? (
            <GroupScheduleView group={selectedGroup} />
          ) : (
            <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
              <CardContent className="p-6 text-center">
                <div className="space-y-2">
                  <Calendar className="h-12 w-12 text-white/50 mx-auto" />
                  <h3 className="text-lg font-semibold text-white">グループを選択してください</h3>
                  <p className="text-white/70">
                    グループ管理タブでグループを選択すると、そのグループの共通空きコマが表示されます
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* 使い方ガイド */}
      <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">使い方</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-white/70">
            <div className="space-y-2">
              <h4 className="font-medium text-white">グループ管理</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>新しいグループを作成する</li>
                <li>招待コードでグループに参加する</li>
                <li>招待コードを友達に共有する</li>
                <li>不要になったグループから脱退する</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-white">共通空きコマ</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>グループメンバー全員の空き時間を表示</li>
                <li>緑色：全員が空いている時間</li>
                <li>オレンジ・黄色：一部の人が空いている時間</li>
                <li>赤色：ほとんどの人が授業を受けている時間</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 