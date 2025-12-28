import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image, Video, Save, X, GripVertical, Eye, EyeOff, Upload } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import ImageUpload from '../../../components/ImageUpload';

interface GalleryItem {
  id: string;
  collection_id: string;
  title: string;
  description: string;
  type: 'image' | 'video';
  url: string;
  thumbnail_url: string;
  width: number;
  height: number;
  display_order: number;
  is_published: boolean;
}

interface GalleryCollection {
  id: string;
  title: string;
  description: string;
  category: string;
  display_order: number;
  is_published: boolean;
  items?: GalleryItem[];
}

export default function GalleryManager() {
  const [collections, setCollections] = useState<GalleryCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<GalleryCollection | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isEditingCollection, setIsEditingCollection] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Partial<GalleryCollection>>({});
  const [editingItem, setEditingItem] = useState<Partial<GalleryItem>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      fetchItems(selectedCollection.id);
    }
  }, [selectedCollection]);

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_collections')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async (collectionId: string) => {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('collection_id', collectionId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      setUploadProgress(30);

      const { error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setUploadProgress(70);

      const { data: { publicUrl } } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(filePath);

      setUploadProgress(100);

      setEditingItem({
        ...editingItem,
        url: publicUrl,
        thumbnail_url: editingItem.type === 'video' ? editingItem.thumbnail_url : publicUrl
      });

      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSaveCollection = async () => {
    try {
      if (editingCollection.id) {
        const { error } = await supabase
          .from('gallery_collections')
          .update(editingCollection)
          .eq('id', editingCollection.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('gallery_collections')
          .insert([{
            ...editingCollection,
            display_order: collections.length,
          }]);
        if (error) throw error;
      }

      await fetchCollections();
      setIsEditingCollection(false);
      setEditingCollection({});
    } catch (error) {
      console.error('Error saving collection:', error);
      alert('Failed to save collection');
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!confirm('Delete this collection and all its items?')) return;

    try {
      const { error } = await supabase
        .from('gallery_collections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchCollections();
      if (selectedCollection?.id === id) {
        setSelectedCollection(null);
        setItems([]);
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Failed to delete collection');
    }
  };

  const handleSaveItem = async () => {
    if (!selectedCollection) return;

    if (!editingItem.url?.trim()) {
      alert('Please upload an image or enter a URL');
      return;
    }

    if (!editingItem.type) {
      alert('Please select a type (Image or Video)');
      return;
    }

    if (!editingItem.width || !editingItem.height) {
      alert('Please enter width and height dimensions');
      return;
    }

    try {
      const itemData = {
        ...editingItem,
        title: editingItem.title?.trim() || null,
        description: editingItem.description?.trim() || '',
        thumbnail_url: editingItem.thumbnail_url?.trim() || '',
      };

      if (editingItem.id) {
        const { error } = await supabase
          .from('gallery_items')
          .update(itemData)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('gallery_items')
          .insert([{
            ...itemData,
            collection_id: selectedCollection.id,
            display_order: items.length,
          }]);
        if (error) throw error;
      }

      await fetchItems(selectedCollection.id);
      setIsEditingItem(false);
      setEditingItem({});
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return;

    try {
      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      if (selectedCollection) {
        await fetchItems(selectedCollection.id);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const togglePublishCollection = async (collection: GalleryCollection) => {
    try {
      const { error } = await supabase
        .from('gallery_collections')
        .update({ is_published: !collection.is_published })
        .eq('id', collection.id);

      if (error) throw error;
      await fetchCollections();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const togglePublishItem = async (item: GalleryItem) => {
    try {
      const { error } = await supabase
        .from('gallery_items')
        .update({ is_published: !item.is_published })
        .eq('id', item.id);

      if (error) throw error;
      if (selectedCollection) {
        await fetchItems(selectedCollection.id);
      }
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gallery Manager</h2>
        <button
          onClick={() => {
            setEditingCollection({ category: 'event', is_published: true });
            setIsEditingCollection(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <Plus size={20} />
          New Collection
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collections List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Collections</h3>
          <div className="space-y-3">
            {collections.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No collections yet</p>
            ) : (
              collections.map((collection) => (
                <div
                  key={collection.id}
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    selectedCollection?.id === collection.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                  onClick={() => setSelectedCollection(collection)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GripVertical size={16} className="text-gray-400" />
                      <h4 className="font-semibold text-gray-800">{collection.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePublishCollection(collection);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {collection.is_published ? (
                          <Eye size={16} className="text-primary-600" />
                        ) : (
                          <EyeOff size={16} className="text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCollection(collection);
                          setIsEditingCollection(true);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Edit2 size={16} className="text-blue-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCollection(collection.id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{collection.description}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {collection.category}
                    </span>
                    <span className={`px-2 py-1 rounded ${
                      collection.is_published
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {collection.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Items List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {selectedCollection ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Items in {selectedCollection.title}</h3>
                <button
                  onClick={() => {
                    setEditingItem({ type: 'image', is_published: true, width: 400, height: 300 });
                    setIsEditingItem(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
                >
                  <Plus size={16} />
                  Add Item
                </button>
              </div>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {items.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No items yet</p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-3 hover:border-primary-300 transition"
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded overflow-hidden">
                          {item.type === 'image' ? (
                            <img src={item.url} alt={item.title || 'Gallery image'} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                              <Video className="text-white" size={24} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold text-gray-800 text-sm truncate">
                              {item.title || `Untitled ${item.type}`}
                            </h4>
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={() => togglePublishItem(item)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                {item.is_published ? (
                                  <Eye size={14} className="text-primary-600" />
                                ) : (
                                  <EyeOff size={14} className="text-gray-400" />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingItem(item);
                                  setIsEditingItem(true);
                                }}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Edit2 size={14} className="text-blue-600" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Trash2 size={14} className="text-red-600" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs flex items-center gap-1">
                              {item.type === 'image' ? <Image size={12} /> : <Video size={12} />}
                              {item.type}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                              {item.width}x{item.height}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              item.is_published
                                ? 'bg-primary-100 text-primary-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {item.is_published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <Image size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Select a collection to view its items</p>
            </div>
          )}
        </div>
      </div>

      {/* Collection Edit Modal */}
      {isEditingCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingCollection.id ? 'Edit Collection' : 'New Collection'}
              </h3>
              <button
                onClick={() => {
                  setIsEditingCollection(false);
                  setEditingCollection({});
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editingCollection.title || ''}
                  onChange={(e) => setEditingCollection({ ...editingCollection, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Event name or program title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingCollection.description || ''}
                  onChange={(e) => setEditingCollection({ ...editingCollection, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Brief description of this collection"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={editingCollection.category || 'event'}
                  onChange={(e) => setEditingCollection({ ...editingCollection, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="event">Event</option>
                  <option value="program">Program</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="publish-collection"
                  checked={editingCollection.is_published ?? true}
                  onChange={(e) => setEditingCollection({ ...editingCollection, is_published: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="publish-collection" className="text-sm font-medium text-gray-700">
                  Publish immediately
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveCollection}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  <Save size={20} />
                  Save Collection
                </button>
                <button
                  onClick={() => {
                    setIsEditingCollection(false);
                    setEditingCollection({});
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Edit Modal */}
      {isEditingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingItem.id ? 'Edit Item' : 'New Item'}
              </h3>
              <button
                onClick={() => {
                  setIsEditingItem(false);
                  setEditingItem({});
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="image"
                      checked={editingItem.type === 'image'}
                      onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as 'image' | 'video' })}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <Image size={20} />
                    <span>Image</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="video"
                      checked={editingItem.type === 'video'}
                      onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as 'image' | 'video' })}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <Video size={20} />
                    <span>Video</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title (Optional)</label>
                <input
                  type="text"
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Leave blank if not needed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Optional description"
                />
              </div>

              {editingItem.type === 'image' ? (
                <ImageUpload
                  label="Image"
                  value={editingItem.url || ''}
                  onChange={(url) => setEditingItem({ ...editingItem, url })}
                  bucketName="gallery-images"
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                  <input
                    type="url"
                    value={editingItem.url || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://drive.google.com/file/d/..."
                  />
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-semibold text-blue-800 mb-1">For Google Drive videos:</p>
                    <ol className="text-xs text-blue-700 space-y-1 ml-4 list-decimal">
                      <li>Right-click the video file in Google Drive</li>
                      <li>Click "Share" and set to "Anyone with the link can view"</li>
                      <li>Click "Copy link" and paste it here</li>
                    </ol>
                    <p className="text-xs text-blue-600 mt-2">YouTube links are also supported!</p>
                  </div>
                </div>
              )}

              {editingItem.type === 'video' && (
                <ImageUpload
                  label="Thumbnail (Optional)"
                  value={editingItem.thumbnail_url || ''}
                  onChange={(url) => setEditingItem({ ...editingItem, thumbnail_url: url })}
                  bucketName="gallery-images"
                />
              )}

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Width (px)</label>
                  <input
                    type="number"
                    value={editingItem.width || 400}
                    onChange={(e) => setEditingItem({ ...editingItem, width: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="400"
                    min="100"
                    step="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height (px)</label>
                  <input
                    type="number"
                    value={editingItem.height || 300}
                    onChange={(e) => setEditingItem({ ...editingItem, height: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="300"
                    min="100"
                    step="50"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Set custom dimensions for how this image displays in the gallery
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="publish-item"
                  checked={editingItem.is_published ?? true}
                  onChange={(e) => setEditingItem({ ...editingItem, is_published: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="publish-item" className="text-sm font-medium text-gray-700">
                  Publish immediately
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveItem}
                  disabled={uploading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={20} />
                  Save Item
                </button>
                <button
                  onClick={() => {
                    setIsEditingItem(false);
                    setEditingItem({});
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
