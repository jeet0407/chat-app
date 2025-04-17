import { formatDistanceToNow } from 'date-fns';

interface Group {
  name: string;
  role?: string;
  description?: string;
  joinedAt: string;
  memberCount?: number;
}

interface GroupCardProps {
  group: Group;
  onClick: () => void;
}

export default function GroupCard({ group, onClick }: GroupCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg text-black font-semibold truncate">{group.name}</h3>
          {group.role && (
            <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {group.role}
            </span>
          )}
        </div>
        
        {group.description && (
          <p className="mt-2 text-gray-600 text-sm line-clamp-2">
            <span>Description : </span>{group.description}
          </p>
        )}
        
        <div className="mt-4 pt-3 border-t flex justify-between text-xs text-gray-500">
          <span>
            {formatDistanceToNow(new Date(group.joinedAt), { addSuffix: true })}
          </span>
          {group.memberCount && (
            <span>{group.memberCount} members</span>
          )}
        </div>
      </div>
    </div>
  );
}