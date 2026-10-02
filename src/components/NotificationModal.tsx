import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  Gift,
  ArrowRight,
  Sparkles,
  Zap,
  Smartphone,
  ShieldCheck,
  Check
} from 'lucide-react';
import type { InAppNotification } from '../services/notifications';
import { requestPushPermission, sendOutPushNotification } from '../services/notifications';

interface NotificationModalProps {
  notifications: InAppNotification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigateTab: (tab: string) => void;
  showToast: (msg: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigateTab,
  showToast,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [pushStatus, setPushStatus] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const handleEnablePush = async () => {
    const granted = await requestPushPermission();
    if (granted) {
      setPushStatus('granted');
      showToast('Out-of-App Push Notifications On Ho Gayi! 🔔');
      // Send a test immediate push notification
      sendOutPushNotification('Real Money App 🚀', {
        body: 'Aapki daily earning notifications active hain! Naye offers aane par aapko update milega.',
      });
    } else {
      setPushStatus('denied');
      showToast('Notification permission denied by browser.');
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden animate-slide-up">
        {/* Mobile handle */}
        <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Notifications</h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {unreadCount > 0 ? `${unreadCount} naye unread messages` : 'Sabhi messages padh liye'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* OUT-OF-APP PUSH NOTIFICATION PROMPT BANNER */}
        <div className="px-4 pt-3 pb-1">
          {pushStatus !== 'granted' ? (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-black leading-tight">Out-of-App Push On Karein</div>
                  <div className="text-[10px] text-emerald-100 truncate">App band hone par bhi spin &amp; cash alerts paayein</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleEnablePush}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow-sm shrink-0 cursor-pointer whitespace-nowrap"
              >
                Allow 🔔
              </button>
            </div>
          ) : (
            <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between font-bold">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Out-of-App Mobile Push Active</span>
              </div>
              <span className="text-[10px] bg-emerald-200/60 px-2 py-0.5 rounded-full text-emerald-900">
                Connected
              </span>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-slate-100 px-4 pt-2 gap-4">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`pb-2 text-xs font-bold transition-all relative ${
              filter === 'all'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`pb-2 text-xs font-bold transition-all relative ${
              filter === 'unread'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-100">
          {filteredNotifs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto opacity-30" />
              <div className="text-xs font-bold">Koi notification nahi hai</div>
            </div>
          ) : (
            filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                onClick={() => onMarkAsRead(notif.id)}
                className={`pt-2.5 first:pt-0 p-3 rounded-2xl transition-colors cursor-pointer ${
                  notif.read ? 'bg-white hover:bg-slate-50' : 'bg-emerald-50/60 border border-emerald-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    {notif.type === 'bonus' && <Gift className="w-4 h-4 text-amber-600" />}
                    {notif.type === 'withdrawal' && <Zap className="w-4 h-4 text-emerald-600" />}
                    {notif.type === 'task' && <Sparkles className="w-4 h-4 text-teal-600" />}
                    {notif.type === 'system' && <Bell className="w-4 h-4 text-slate-600" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-black text-slate-900 truncate">{notif.title}</h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug mt-0.5 font-medium">
                      {notif.message}
                    </p>

                    {notif.actionTab && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notif.id);
                          onClose();
                          onNavigateTab(notif.actionTab!);
                        }}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                      >
                        <span>Check Karein</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
