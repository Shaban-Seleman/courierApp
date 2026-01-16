import { Clock } from 'lucide-react';

const ActivityList = () => {
  const activities = [
    { id: 1, text: 'Order #1234 assigned to Driver Mike', time: '2 mins ago' },
    { id: 2, text: 'Order #1230 delivered', time: '5 mins ago' },
    { id: 3, text: 'New shipment #1235 created', time: '10 mins ago' },
    { id: 4, text: 'Driver Sarah went online', time: '15 mins ago' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-slate-400" />
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start border-b border-slate-50 pb-3 last:border-0 last:pb-0">
            <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm text-slate-700">{activity.text}</p>
              <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityList;
