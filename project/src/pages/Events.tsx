// src/pages/Events.tsx
import { useEffect, useMemo, useState } from 'react';
import { Calendar, MapPin, ExternalLink, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { loadPageSettings, PageSettings, createGetSetting } from '../utils/pageSettings';
import RegistrationFormModal from '../components/RegistrationFormModal';

interface Event {
  id: string;
  title?: string | null;
  description?: string | null;
  location?: string | null;
  event_date?: string | null;
  end_date?: string | null;
  image_url?: string | null;
  registration_url?: string | null;
  form_id?: string | null;
  is_featured?: boolean | null;
  is_published?: boolean | null;
}

export default function Events() {
  const { currentLanguage, translateList } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [settings, setSettings] = useState<PageSettings>({});
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // fullscreen poster
  const [posterOpen, setPosterOpen] = useState(false);
  const [posterSrc, setPosterSrc] = useState('');
  const [posterAlt, setPosterAlt] = useState('Event poster');

  useEffect(() => {
    loadEvents();
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage]);

  useEffect(() => {
    if (!posterOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPosterOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [posterOpen]);

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Load events error:', error);
      setEvents([]);
      return;
    }

    if (!data) {
      setEvents([]);
      return;
    }

    const now = new Date();

    // only future events
    const upcomingEvents = (data as Event[]).filter((event) => {
      const base = event.end_date ?? event.event_date ?? null;
      if (!base) return false;

      const d = new Date(base);
      if (Number.isNaN(d.getTime())) return false;

      return d > now;
    });

    const translated = await translateList(upcomingEvents, ['title', 'description', 'location']);
    setEvents(translated as Event[]);
  };

  const loadSettings = async () => {
    const data = await loadPageSettings('events');
    setSettings(data);
  };

  const getSetting = useMemo(() => createGetSetting(settings), [settings]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUpcoming = (dateString?: string | null) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return false;
    return d > new Date();
  };

  const safeHtml = (html?: string | null) => ({ __html: html || '' });

  const openPoster = (src: string, alt: string) => {
    setPosterSrc(src);
    setPosterAlt(alt);
    setPosterOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">{getSetting('page_heading', 'Upcoming Events')}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {getSetting('page_subheading', 'Join us for transformative workshops, retreats, and celebrations')}
          </p>
        </div>

        <div className="flex flex-col items-center gap-8">
          {events.map((event) => {
            const title = event.title || 'Untitled Event';
            const location = event.location || 'Location to be announced';
            const imageUrl = event.image_url || 'https://via.placeholder.com/1200x700?text=Event+Image';

            const hasInternalForm = Boolean(event.form_id);
            const hasExternalUrl = Boolean(!event.form_id && event.registration_url);

            return (
              <div
                key={event.id}
                className={`
                  bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition
                  w-full ${event.is_featured ? 'max-w-5xl' : 'max-w-4xl'}
                `}
              >
                {/* ✅ FIX: poster + FIXED content width (no 1fr stretch) */}
                <div
                  className={
                    event.is_featured
                      ? 'grid md:grid-cols-[280px_minmax(320px,520px)] justify-center'
                      : 'grid md:grid-cols-[280px_minmax(320px,520px)] justify-center'
                  }
                >
                  {/* Poster */}
                  <button
                    type="button"
                    onClick={() => openPoster(imageUrl, title)}
                    className="w-full cursor-zoom-in focus:outline-none"
                    aria-label="Open poster"
                  >
                    <img
                      src={imageUrl}
                      alt={title}
                      loading="lazy"
                      className={`
                        w-full object-contain bg-white
                        ${event.is_featured ? 'h-[240px] sm:h-[280px] md:h-[320px]' : 'h-[220px] sm:h-[240px]'}
                      `}
                    />
                  </button>

                  {/* ✅ FIX: content cannot stretch wider than 520px */}
                  <div className="p-6 flex flex-col w-full max-w-[520px]">
                    <div className="mb-3 min-h-[28px] flex flex-wrap gap-2">
                      {event.is_featured && (
                        <span className="inline-block text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-700 rounded-full">
                          {getSetting('featured_badge', 'Featured Event')}
                        </span>
                      )}
                      {event.event_date && isUpcoming(event.event_date) && (
                        <span className="inline-block text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">
                          {getSetting('upcoming_badge', 'Upcoming')}
                        </span>
                      )}
                    </div>

                    <h3 className={`font-bold mb-4 ${event.is_featured ? 'text-3xl' : 'text-2xl'} leading-tight`}>
                      {title}
                    </h3>

                    <div className="space-y-3 mb-5">
                      <div className="flex items-start gap-3 text-gray-600">
                        <Calendar size={20} className="mt-1 flex-shrink-0" />
                        <div className="leading-relaxed">
                          {event.event_date ? (
                            <>
                              <p className="m-0">{formatDate(event.event_date)}</p>
                              {event.end_date && <p className="m-0 text-sm">to {formatDate(event.end_date)}</p>}
                            </>
                          ) : (
                            <p className="m-0">Date to be announced</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-gray-600">
                        <MapPin size={20} className="mt-1 flex-shrink-0" />
                        <p className="m-0 leading-relaxed">{location}</p>
                      </div>
                    </div>

                    {event.description && (
                      <div
                        className="text-gray-700 leading-relaxed prose max-w-none mb-6"
                        dangerouslySetInnerHTML={safeHtml(event.description)}
                      />
                    )}

                    {(hasInternalForm || hasExternalUrl) && (
                      <div className="mt-auto">
                        {hasInternalForm && (
                          <button
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowRegisterModal(true);
                            }}
                            className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
                          >
                            {getSetting('register_button', 'Register Now')}
                          </button>
                        )}

                        {hasExternalUrl && (
                          <a
                            href={event.registration_url!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
                          >
                            {getSetting('register_button', 'Register Now')}
                            <ExternalLink size={18} className="ml-2" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">
              {getSetting('no_events_message', 'No upcoming events at this time. Check back soon!')}
            </p>
          </div>
        )}
      </div>

      {/* Poster Fullscreen Modal */}
      {posterOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPosterOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-w-6xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPosterOpen(false)}
              className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow hover:bg-gray-100"
              aria-label="Close poster"
            >
              <X size={18} />
            </button>

            <img src={posterSrc} alt={posterAlt} className="w-full h-[90vh] object-contain bg-transparent rounded-lg" />
          </div>
        </div>
      )}

      {/* Registration Form Modal */}
      {showRegisterModal && selectedEvent?.form_id && (
        <RegistrationFormModal
          formId={selectedEvent.form_id}
          eventId={selectedEvent.id}
          onClose={() => {
            setShowRegisterModal(false);
            setSelectedEvent(null);
          }}
          courseName={selectedEvent.title || ''}
        />
      )}
    </div>
  );
}
