import { useState, useEffect } from 'react';
import { Image, Video, Grid3x3, ChevronRight, X, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { convertGoogleDriveLink, isExternalVideoUrl } from '../utils/videoHelpers';
import { loadPageSettings, PageSettings, createGetSetting } from '../utils/pageSettings';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video';
  url: string;
  thumbnail_url: string;
  width: number;
  height: number;
  display_order: number;
}

interface GalleryCollection {
  id: string;
  title: string;
  description: string;
  category: string;
  display_order: number;
  items: GalleryItem[];
}

export default function Gallery() {
  const { currentLanguage, translateList } = useLanguage();
  const [collections, setCollections] = useState<GalleryCollection[]>([]);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [selectedCollection, setSelectedCollection] = useState<GalleryCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PageSettings>({});

  useEffect(() => {
    fetchGallery();
    loadSettings();
  }, [currentLanguage]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('gallery_collections')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true });

      if (collectionsError) throw collectionsError;

      const collectionsWithItems = await Promise.all(
        (collectionsData || []).map(async (collection) => {
          const { data: items, error: itemsError } = await supabase
            .from('gallery_items')
            .select('*')
            .eq('collection_id', collection.id)
            .eq('is_published', true)
            .order('display_order', { ascending: true });

          if (itemsError) throw itemsError;

          const translatedItems = await translateList(items || [], ['title', 'description']);

          return {
            ...collection,
            items: translatedItems,
          };
        })
      );

      const translatedCollections = await translateList(collectionsWithItems, ['title', 'description', 'category']);
      setCollections(translatedCollections);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    const data = await loadPageSettings('gallery');
    setSettings(data);
  };

  const getSetting = createGetSetting(settings);

  const filterItems = (items: GalleryItem[]) => {
    if (filter === 'all') return items;
    return items.filter(item => item.type === filter);
  };

  const getPreviewItems = (items: GalleryItem[]) => {
    const filtered = filterItems(items);
    return filtered.slice(0, 3);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{getSetting('loading_message', 'Loading gallery...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">{getSetting('page_heading', 'Gallery')}</h1>
          <p className="text-xl text-primary-50 max-w-3xl mx-auto">
            {getSetting('page_subheading', 'Explore our collection of memorable moments from events, programs, and activities')}
          </p>
        </div>
      </section>

      {/* Filter Buttons */}
      <section className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setFilter('all')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Grid3x3 size={20} />
              {getSetting('all_media_button', 'All Media')}
            </button>
            <button
              onClick={() => setFilter('image')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                filter === 'image'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Image size={20} />
              {getSetting('images_only_button', 'Images Only')}
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                filter === 'video'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Video size={20} />
              {getSetting('videos_only_button', 'Videos Only')}
            </button>
          </div>
        </div>
      </section>

      {/* Gallery Collections */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {collections.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <Image className="text-gray-400" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{getSetting('no_items_heading', 'No Gallery Items Yet')}</h3>
              <p className="text-gray-600">{getSetting('no_items_message', 'Check back soon for photos and videos!')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {collections.map((collection) => {
                const previewItems = getPreviewItems(collection.items);
                const totalFiltered = filterItems(collection.items).length;

                if (previewItems.length === 0) return null;

                return (
                  <div key={collection.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Collection Header */}
                    <div className="bg-gradient-to-r from-primary-50 to-primary-50 p-8 border-b">
                      <h2 className="text-3xl font-bold text-gray-800 mb-2">{collection.title}</h2>
                      {collection.description && (
                        <p className="text-gray-600 text-lg">{collection.description}</p>
                      )}
                      <div className="mt-4 inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                        {totalFiltered} {filter === 'all' ? getSetting('label_items', 'items') : filter === 'image' ? getSetting('label_images', 'images') : getSetting('label_videos', 'videos')}
                      </div>
                    </div>

                    {/* Preview Grid */}
                    <div className="p-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {previewItems.map((item) => {
                          const videoData = item.type === 'video' ? convertGoogleDriveLink(item.url) : null;
                          const thumbnailSrc = item.type === 'video'
                            ? (item.thumbnail_url || videoData?.thumbnailUrl || item.url)
                            : item.url;

                          return (
                            <div
                              key={item.id}
                              className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer"
                              style={{
                                aspectRatio: item.width && item.height ? `${item.width} / ${item.height}` : '16 / 9',
                              }}
                              onClick={() => setSelectedCollection(collection)}
                            >
                              {item.type === 'image' ? (
                                <img
                                  src={item.url}
                                  alt={item.title || 'Gallery image'}
                                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                />
                              ) : (
                                <div className="relative w-full h-full bg-gray-900">
                                  <img
                                    src={thumbnailSrc}
                                    alt={item.title || 'Video thumbnail'}
                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23374151" width="400" height="300"/%3E%3Ctext fill="%23fff" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EVideo%3C/text%3E%3C/svg%3E';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                                      <Play className="text-primary-600 ml-1" size={32} fill="currentColor" />
                                    </div>
                                  </div>
                                </div>
                              )}
                              {item.title && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition">
                                  <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <p className="text-white font-semibold">{item.title}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* View More Button */}
                      {totalFiltered > 3 && (
                        <div className="mt-8 text-center">
                          <button
                            onClick={() => setSelectedCollection(collection)}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
                          >
                            View All {totalFiltered} {filter === 'all' ? 'Items' : filter === 'image' ? 'Images' : 'Videos'}
                            <ChevronRight size={20} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Full Collection Modal */}
      {selectedCollection && (
        <FullGalleryModal
          collection={selectedCollection}
          filter={filter}
          onClose={() => setSelectedCollection(null)}
          settings={settings}
        />
      )}
    </div>
  );
}

interface FullGalleryModalProps {
  collection: GalleryCollection;
  filter: 'all' | 'image' | 'video';
  onClose: () => void;
  settings: PageSettings;
}

function FullGalleryModal({ collection, filter, onClose, settings }: FullGalleryModalProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const getSetting = createGetSetting(settings);

  const filteredItems = filter === 'all'
    ? collection.items
    : collection.items.filter(item => item.type === filter);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-y-auto">
      <div className="min-h-screen p-4 sm:p-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-2">{collection.title}</h2>
            <p className="text-gray-300">{filteredItems.length} {filter === 'all' ? getSetting('label_items', 'items') : filter === 'image' ? getSetting('label_images', 'images') : getSetting('label_videos', 'videos')}</p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition"
          >
            <X className="text-white" size={24} />
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const videoData = item.type === 'video' ? convertGoogleDriveLink(item.url) : null;
              const thumbnailSrc = item.type === 'video'
                ? (item.thumbnail_url || videoData?.thumbnailUrl || item.url)
                : item.url;

              return (
                <div
                  key={item.id}
                  className="group relative rounded-xl overflow-hidden cursor-pointer"
                  style={{
                    aspectRatio: item.width && item.height ? `${item.width} / ${item.height}` : '16 / 9',
                  }}
                  onClick={() => setSelectedItem(item)}
                >
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.title || 'Gallery image'}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                  ) : (
                    <div className="relative w-full h-full bg-gray-900">
                      <img
                        src={thumbnailSrc}
                        alt={item.title || 'Video thumbnail'}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23374151" width="400" height="300"/%3E%3Ctext fill="%23fff" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EVideo%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                          <Play className="text-primary-600 ml-1" size={32} fill="currentColor" />
                        </div>
                      </div>
                    </div>
                  )}
                  {(item.title || item.description) && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        {item.title && <p className="text-white font-semibold">{item.title}</p>}
                        {item.description && (
                          <p className="text-gray-300 text-sm mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

interface ItemDetailModalProps {
  item: GalleryItem;
  onClose: () => void;
}

function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
  const videoData = item.type === 'video' ? convertGoogleDriveLink(item.url) : null;
  const isExternalVideo = item.type === 'video' && isExternalVideoUrl(item.url);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition"
          >
            <X className="text-white" size={24} />
          </button>
        </div>

        {/* Media */}
        <div className="bg-black rounded-xl overflow-hidden">
          {item.type === 'image' ? (
            <img
              src={item.url}
              alt={item.title || 'Gallery image'}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          ) : videoData ? (
            <div
              className="relative w-full bg-black"
              style={{
                aspectRatio: item.width && item.height ? `${item.width} / ${item.height}` : '16 / 9',
                maxHeight: '80vh'
              }}
            >
              <iframe
                src={videoData.embedUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <video
              src={item.url}
              controls
              className="w-full h-auto max-h-[80vh]"
              autoPlay
            />
          )}
        </div>

        {/* Details */}
        {(item.title || item.description) && (
          <div className="mt-4 text-white">
            {item.title && <h3 className="text-2xl font-bold mb-2">{item.title}</h3>}
            {item.description && (
              <p className="text-gray-300">{item.description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
