import { Clock } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchRecentActivities } from '../store/slices/activitySlice';

// Helper function to format time (can be moved to a utilities file)
const formatTimeAgo = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

const ActivityList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { activities, loading, error } = useSelector((state: RootState) => state.activity);

  useEffect(() => {
    dispatch(fetchRecentActivities(5)); // Fetch top 5 recent activities
  }, [dispatch]);

  if (loading) return <div className="p-4 text-center text-slate-500">Loading activities...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-slate-400" />
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center text-slate-500">No recent activities.</div>
        ) : (
          activities.map((activity: any) => (
            <div key={activity.id} className="flex items-start border-b border-slate-50 pb-3 last:border-0 last:pb-0">
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-700">{activity.description || `Order #${activity.id.slice(0,8)} ${activity.status}`}</p>
                <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(activity.createdAt || activity.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityList;
