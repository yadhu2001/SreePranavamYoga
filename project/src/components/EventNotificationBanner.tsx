import { useEffect, useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface Event {
  id: string;
  title: string;
  event_date: string;
  end_date: string | null;
}

export default function EventNotificationBanner() {
  const { currentLanguage, translateContent } = useLanguage();
  const [event, setEvent] = useState<Event | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    loadUpcomingEvent();
  }, [currentLanguage]);

  const loadUpcomingEvent = async () => {
    const { data } = await supabase
      .from('events')
      .select('id, title, event_date, end_date')
      .eq('is_published', true)
      .order('event_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (data) {
      const now = new Date();
      const eventDate = new Date(data.event_date);
      const oneDayBeforeEvent = new Date(eventDate);
      oneDayBeforeEvent.setDate(oneDayBeforeEvent.getDate() - 1);

      if (now < oneDayBeforeEvent) {
        const dismissedEventId = localStorage.getItem('dismissedEventId');
        if (dismissedEventId !== data.id) {
          const translated = await translateContent(data, ['title']);
          setEvent(translated);
        } else {
          setIsVisible(false);
        }
      } else {
        setIsVisible(false);
      }
    }
  };

  const handleDismiss = () => {
    if (event) {
      localStorage.setItem('dismissedEventId', event.id);
    }
    setIsVisible(false);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateStr} at ${timeStr}`;
  };

  if (!event || !isVisible) return null;

  return (
    <div className="bg-green-500 text-white py-3 shadow-md relative overflow-hidden">
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .marquee {
          animation: marquee 25s linear infinite;
          white-space: nowrap;
        }
        .marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="relative flex items-center">
        <div className="marquee flex items-center gap-3 px-4">
          <Calendar size={20} className="flex-shrink-0" />
          <span className="font-medium text-lg">
            {event.title} - {formatDateTime(event.event_date)} - Register Now!
          </span>
          <span className="mx-8">•</span>
          <Calendar size={20} className="flex-shrink-0" />
          <span className="font-medium text-lg">
            {event.title} - {formatDateTime(event.event_date)} - Register Now!
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="absolute right-4 p-1.5 hover:bg-green-600 rounded transition bg-green-500 z-10"
          aria-label="Close notification"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
